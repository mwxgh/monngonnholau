import { StringFieldOptional } from '@repo/nest-decorators'

export class UpdateProfileDto {
  @StringFieldOptional()
  name?: string

  @StringFieldOptional()
  phone?: string
}
