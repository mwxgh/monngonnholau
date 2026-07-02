import { PaymentMethod } from '@prisma/client'
import {
  ClassField,
  EmailFieldOptional,
  EnumFieldOptional,
  NumberField,
  StringField,
  StringFieldOptional
} from '@repo/nest-decorators'

export class QuickOrderItemDto {
  @StringField()
  sku!: string

  @NumberField({ int: true, min: 1 })
  qty!: number
}

export class CreateQuickOrderDto {
  @StringField()
  name!: string

  @StringField()
  phone!: string

  @EmailFieldOptional()
  email?: string

  @StringField()
  province!: string

  @StringFieldOptional()
  district?: string

  @StringField()
  ward!: string

  @StringField()
  street!: string

  @StringFieldOptional()
  note?: string

  @EnumFieldOptional(() => PaymentMethod)
  paymentMethod?: PaymentMethod

  @ClassField(() => QuickOrderItemDto, { each: true, minSize: 1 })
  items!: QuickOrderItemDto[]
}
