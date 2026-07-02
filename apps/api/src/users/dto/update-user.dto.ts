import { Role } from '@prisma/client'
import { EnumFieldOptional, StringFieldOptional } from '@repo/nest-decorators'

export class UpdateUserDto {
  @StringFieldOptional()
  name?: string

  @StringFieldOptional()
  phone?: string

  @StringFieldOptional()
  avatar?: string

  @EnumFieldOptional(() => Role)
  role?: Role
}
