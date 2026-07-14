import { ShippingPayer } from '@prisma/client'
import { BooleanFieldOptional, EnumFieldOptional } from '@repo/nest-decorators'
import { CreateQuickOrderDto } from './create-quick-order.dto'

export class CreateAdminOrderDto extends CreateQuickOrderDto {
  @BooleanFieldOptional()
  isPrepaid?: boolean

  @EnumFieldOptional(() => ShippingPayer)
  shippingPayer?: ShippingPayer
}
