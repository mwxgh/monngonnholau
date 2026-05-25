import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { OAuthProvider } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from '../users/users.service.js';
import { LoginDto } from './dto/login.dto.js';
import { RegisterDto } from './dto/register.dto.js';
import type { FacebookProfile } from './strategies/facebook.strategy.js';
import type { GoogleProfile } from './strategies/google.strategy.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email đã được sử dụng');

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { ...dto, password: hashed },
      omit: { password: true },
    });
    return user;
  }

  async login(dto: LoginDto, res: Response) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.password) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

    if (!user.isActive) throw new UnauthorizedException('Tài khoản đã bị khóa');

    return this.issueTokens(user, res);
  }

  async handleOAuthLogin(
    profile: GoogleProfile | FacebookProfile,
    provider: OAuthProvider,
    res: Response,
  ) {
    let user = await this.usersService.findByEmail(profile.email);

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar,
          oauthAccounts: {
            create: { provider, providerId: profile.providerId },
          },
        },
      });
    } else {
      const linked = await this.prisma.oAuthAccount.findUnique({
        where: { provider_providerId: { provider, providerId: profile.providerId } },
      });
      if (!linked) {
        await this.prisma.oAuthAccount.create({
          data: { provider, providerId: profile.providerId, userId: user.id },
        });
      }
    }

    return this.issueTokens(user, res);
  }

  refresh(user: any, res: Response) {
    return this.issueTokens(user, res);
  }

  logout(res: Response) {
    res.clearCookie('refresh_token');
    return { message: 'Đăng xuất thành công' };
  }

  private issueTokens(user: any, res: Response) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_SECRET'),
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: this.config.get('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 ngày
    });

    const { password: _, ...safeUser } = user;
    return { accessToken, user: safeUser };
  }
}
