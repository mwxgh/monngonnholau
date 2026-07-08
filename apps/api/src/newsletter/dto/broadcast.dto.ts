import { StringField } from '@repo/nest-decorators'
import { ArrayMinSize, IsArray, IsInt } from 'class-validator'

export class BroadcastDto {
  @StringField({ maxLength: 200 })
  subject!: string

  @StringField({ maxLength: 20000 })
  content!: string

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  subscriberIds!: number[]
}
