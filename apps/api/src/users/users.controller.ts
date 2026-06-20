import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post
} from '@nestjs/common'
import { UsersService } from './users.service.js'
import { UpdateUserDto } from './dto/update-user.dto.js'
import { UpdateProfileDto } from './dto/update-profile.dto.js'
import { ChangePasswordDto } from './dto/change-password.dto.js'
import { UpsertAddressDto } from './dto/upsert-address.dto.js'
import { CurrentUser } from '../auth/decorators/current-user.decorator.js'
import { Roles } from '../auth/decorators/roles.decorator.js'
import { Role } from '@prisma/client'

interface AuthUser {
  id: number
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ── Self routes (must come before :id routes) ─────────────────

  @Get('me')
  getProfile(@CurrentUser() user: AuthUser) {
    return this.usersService.getProfile(user.id)
  }

  @Patch('me')
  updateProfile(@CurrentUser() user: AuthUser, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto)
  }

  @Patch('me/password')
  changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto
  ) {
    return this.usersService.changePassword(
      user.id,
      dto.oldPassword,
      dto.newPassword
    )
  }

  @Get('me/addresses')
  getAddresses(@CurrentUser() user: AuthUser) {
    return this.usersService.getAddresses(user.id)
  }

  @Post('me/addresses')
  addAddress(@CurrentUser() user: AuthUser, @Body() dto: UpsertAddressDto) {
    return this.usersService.addAddress(user.id, dto)
  }

  @Patch('me/addresses/:id')
  updateAddress(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertAddressDto
  ) {
    return this.usersService.updateAddress(user.id, id, dto)
  }

  @Delete('me/addresses/:id')
  deleteAddress(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.usersService.deleteAddress(user.id, id)
  }

  @Patch('me/addresses/:id/default')
  setDefaultAddress(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number
  ) {
    return this.usersService.setDefaultAddress(user.id, id)
  }

  // ── Admin routes ─────────────────────────────────────────────

  @Get()
  @Roles(Role.ADMIN)
  findAll() {
    return this.usersService.findAll()
  }

  @Get(':id')
  @Roles(Role.ADMIN)
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id)
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.remove(id)
  }
}
