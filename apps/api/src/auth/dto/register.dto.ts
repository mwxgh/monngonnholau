import {
  EmailField,
  StringField,
  StringFieldOptional
} from '@repo/nest-decorators'

export class RegisterDto {
  @EmailField()
  email!: string

  @StringField({ minLength: 6 })
  password!: string

  @StringFieldOptional()
  name?: string

  @StringField()
  phone!: string
}
