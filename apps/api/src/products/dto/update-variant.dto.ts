import { NumberFieldOptional, StringFieldOptional } from '@repo/nest-decorators'

export class UpdateVariantDto {
  @StringFieldOptional()
  sku?: string

  @StringFieldOptional()
  name?: string

  @NumberFieldOptional({ min: 0 })
  price?: number

  @NumberFieldOptional({ min: 0 })
  comparePrice?: number

  @NumberFieldOptional({ min: 0, int: true })
  quantity?: number

  @NumberFieldOptional({ min: 0 })
  weight?: number

  @NumberFieldOptional({ min: 0 })
  length?: number

  @NumberFieldOptional({ min: 0 })
  width?: number

  @NumberFieldOptional({ min: 0 })
  height?: number
}
