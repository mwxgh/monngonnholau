import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import * as bcrypt from 'bcrypt'
import { Role } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { UpdateProfileDto } from './dto/update-profile.dto.js'
import { UpsertAddressDto } from './dto/upsert-address.dto.js'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      omit: { password: true },
      orderBy: { createdAt: 'desc' }
    })
  }

  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true }
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({ where: { phone } })
  }

  findByEmailOrPhone(identifier: string) {
    const isEmail = identifier.includes('@')
    return isEmail ? this.findByEmail(identifier) : this.findByPhone(identifier)
  }

  async update(id: number, dto: UpdateUserDto) {
    await this.findById(id)
    return this.prisma.user.update({
      where: { id },
      data: dto,
      omit: { password: true }
    })
  }

  async remove(id: number) {
    await this.findById(id)
    return this.prisma.user.delete({ where: { id } })
  }

  // ── Profile (self) ──────────────────────────────────────────

  async getProfile(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      omit: { password: true },
      include: {
        addresses: {
          orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
        }
      }
    })
    if (!user) throw new NotFoundException('User not found')
    return user
  }

  async updateProfile(id: number, dto: UpdateProfileDto) {
    await this.findById(id)
    return this.prisma.user.update({
      where: { id },
      data: dto,
      omit: { password: true }
    })
  }

  async changePassword(id: number, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user?.password)
      throw new BadRequestException('Tài khoản không có mật khẩu')
    const valid = await bcrypt.compare(oldPassword, user.password)
    if (!valid) throw new BadRequestException('Mật khẩu cũ không đúng')
    const hashed = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({
      where: { id },
      data: { password: hashed }
    })
    return { message: 'Đổi mật khẩu thành công' }
  }

  // ── Addresses ───────────────────────────────────────────────

  /** Recipient phone/email must not belong to an ADMIN/STAFF account. */
  async assertNotStaffContact(phone: string, email?: string) {
    const [byPhone, byEmail] = await Promise.all([
      this.prisma.user.findUnique({ where: { phone }, select: { role: true } }),
      email
        ? this.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            select: { role: true }
          })
        : Promise.resolve(null)
    ])
    const isStaff = (u: { role: Role } | null) =>
      !!u && (u.role === Role.ADMIN || u.role === Role.STAFF)

    if (isStaff(byPhone)) {
      throw new BadRequestException(
        'Số điện thoại này không thể dùng làm thông tin nhận hàng'
      )
    }
    if (isStaff(byEmail)) {
      throw new BadRequestException(
        'Email này không thể dùng làm thông tin nhận hàng'
      )
    }
  }

  getAddresses(userId: number) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }]
    })
  }

  async addAddress(userId: number, dto: UpsertAddressDto) {
    await this.assertNotStaffContact(dto.phone, dto.email)
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }
    return this.prisma.address.create({ data: { ...dto, userId } })
  }

  async updateAddress(
    userId: number,
    addressId: number,
    dto: UpsertAddressDto
  ) {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId }
    })
    if (!existing) throw new NotFoundException('Địa chỉ không tồn tại')
    await this.assertNotStaffContact(dto.phone, dto.email)
    if (dto.isDefault) {
      await this.prisma.address.updateMany({
        where: { userId },
        data: { isDefault: false }
      })
    }
    return this.prisma.address.update({ where: { id: addressId }, data: dto })
  }

  async deleteAddress(userId: number, addressId: number) {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId }
    })
    if (!existing) throw new NotFoundException('Địa chỉ không tồn tại')
    return this.prisma.address.delete({ where: { id: addressId } })
  }

  async setDefaultAddress(userId: number, addressId: number) {
    const existing = await this.prisma.address.findFirst({
      where: { id: addressId, userId }
    })
    if (!existing) throw new NotFoundException('Địa chỉ không tồn tại')
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false }
    })
    return this.prisma.address.update({
      where: { id: addressId },
      data: { isDefault: true }
    })
  }
}
