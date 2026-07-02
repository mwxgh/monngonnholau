import { ProductStatus } from '@prisma/client'
import {
  ClassField,
  EnumFieldOptional,
  NumberField,
  NumberFieldOptional,
  StringField,
  StringFieldOptional
} from '@repo/nest-decorators'
import { IsObject, IsOptional } from 'class-validator'

export class CreateVariantDto {
  @StringField()
  sku!: string

  @StringField()
  name!: string

  @NumberField({ min: 0 })
  price!: number

  @IsObject()
  @IsOptional()
  attributes?: Record<string, string>

  @StringFieldOptional()
  thumbnail?: string

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

export class CreateProductDto {
  @StringField()
  name!: string

  @StringFieldOptional()
  description?: string

  @NumberFieldOptional({ int: true })
  categoryId?: number

  @EnumFieldOptional(() => ProductStatus)
  status?: ProductStatus

  @StringFieldOptional({ each: true })
  images?: string[]

  @ClassField(() => CreateVariantDto, { each: true, minSize: 1 })
  variants!: CreateVariantDto[]
}
