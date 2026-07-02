import { StringField } from '@repo/nest-decorators'

export class ChangePasswordDto {
  @StringField()
  oldPassword!: string

  @StringField({ minLength: 6 })
  newPassword!: string
}
