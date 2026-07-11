import {
  ConflictException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import type { Response } from 'express'
import { OAuthProvider } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { UsersService } from '../users/users.service.js'
import { LoginDto } from './dto/login.dto.js'
import { RegisterDto } from './dto/register.dto.js'
import type { FacebookProfile } from './strategies/facebook.strategy.js'
import type { GoogleProfile } from './strategies/google.strategy.js'

interface TokenUser {
  id: number
  email: string
  role: string
  password?: string | null
  [key: string]: unknown
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const [existingEmail, existingPhone] = await Promise.all([
      this.usersService.findByEmail(dto.email),
      this.usersService.findByPhone(dto.phone)
    ])
    if (existingEmail) throw new ConflictException('Email đã được sử dụng')
    if (existingPhone)
      throw new ConflictException('Số điện thoại đã được sử dụng')

    const hashed = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      omit: { password: true }
    })

    await this.syncGuestOrders(user.id, { email: dto.email, phone: dto.phone })

    return user
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmailOrPhone(dto.identifier)
    if (!user?.password)
      throw new UnauthorizedException('Thông tin đăng nhập không đúng')

    const valid = await bcrypt.compare(dto.password, user.password)
    if (!valid)
      throw new UnauthorizedException('Thông tin đăng nhập không đúng')

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa')

    return this.issueTokens(user, res)
  }

  async handleOAuthLogin(
    profile: GoogleProfile | FacebookProfile,
    provider: OAuthProvider,
    res: Response
  ) {
    let user = await this.usersService.findByEmail(profile.email)

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          oauthAccounts: {
            create: { provider, providerId: profile.providerId }
          }
        }
      })
      await this.syncGuestOrders(user.id, { email: profile.email })
    } else {
      const linked = await this.prisma.oAuthAccount.findUnique({
        where: {
          provider_providerId: { provider, providerId: profile.providerId }
        }
      })
      if (!linked) {
        await this.prisma.oAuthAccount.create({
          data: { provider, providerId: profile.providerId, userId: user.id }
        })
      }
    }

    const { accessToken } = this.issueTokens(user, res)
    const clientUrl = this.config.get<string>('CLIENT_URL')
    res.redirect(`${clientUrl}/auth/callback?token=${accessToken}`)
  }

  refresh(user: unknown, res: Response) {
    return this.issueTokens(user as TokenUser, res)
  }

  logout(res: Response) {
    res.clearCookie('refresh_token')
    return { message: 'Đăng xuất thành công' }
  }

  /**
   * Links guest checkout data (Address/Order/Payment rows created before the
   * customer had an account, so their userId is null) to the account they
   * just registered, matching by phone or email from the order's address.
   */
  private async syncGuestOrders(
    userId: number,
    match: { email: string; phone?: string }
  ) {
    const addresses = await this.prisma.address.findMany({
      where: {
        userId: null,
        OR: [
          { email: match.email },
          ...(match.phone ? [{ phone: match.phone }] : [])
        ]
      },
      select: { id: true }
    })
    if (addresses.length === 0) return

    const addressIds = addresses.map((a) => a.id)

    const orders = await this.prisma.order.findMany({
      where: { addressId: { in: addressIds }, userId: null },
      select: { id: true, paymentId: true }
    })
    const orderIds = orders.map((o) => o.id)
    const paymentIds = orders
      .map((o) => o.paymentId)
      .filter((id): id is number => id != null)

    await this.prisma.$transaction([
      this.prisma.address.updateMany({
        where: { id: { in: addressIds } },
        data: { userId }
      }),
      ...(orderIds.length > 0
        ? [
            this.prisma.order.updateMany({
              where: { id: { in: orderIds } },
              data: { userId }
            })
          ]
        : []),
      ...(paymentIds.length > 0
        ? [
            this.prisma.payment.updateMany({
              where: { id: { in: paymentIds } },
              data: { userId }
            })
          ]
        : [])
    ])
  }

  private issueTokens(user: TokenUser, res: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role }

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN')
    })

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN')
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 ngày
    })

    const { password: _pw, ...safeUser } = user
    return { accessToken, user: safeUser }
  }
}
