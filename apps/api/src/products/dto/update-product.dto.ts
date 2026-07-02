import { OmitType, PartialType } from '@nestjs/swagger'
import { ClassFieldOptional, NumberFieldOptional } from '@repo/nest-decorators'
import { CreateProductDto, CreateVariantDto } from './create-product.dto'

export class SyncVariantDto extends CreateVariantDto {
  @NumberFieldOptional({ int: true })
  id?: number
}

export class UpdateProductDto extends PartialType(
  OmitType(CreateProductDto, ['variants'] as const)
) {
  @ClassFieldOptional(() => SyncVariantDto, { each: true, minSize: 1 })
  variants?: SyncVariantDto[]
}
