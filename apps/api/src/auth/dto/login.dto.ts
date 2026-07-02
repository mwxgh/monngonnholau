import { StringField } from '@repo/nest-decorators'

export class LoginDto {
  @StringField()
  identifier!: string // email hoặc số điện thoại

  @StringField()
  password!: string
}
