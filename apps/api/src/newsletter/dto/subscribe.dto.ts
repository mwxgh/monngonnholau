import { EmailField } from '@repo/nest-decorators'

export class SubscribeDto {
  @EmailField()
  email!: string
}
