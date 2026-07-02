import { ProductStatus } from '@prisma/client'
import {
  EnumFieldOptional,
  NumberFieldOptional,
  StringFieldOptional
} from '@repo/nest-decorators'

export class UpdateProductDto {
  @StringFieldOptional()
  name?: string

  @StringFieldOptional()
  description?: string

  @NumberFieldOptional({ int: true })
  categoryId?: number

  @EnumFieldOptional(() => ProductStatus)
  status?: ProductStatus

  @StringFieldOptional({ each: true })
  images?: string[]
}
