import { IsArray, IsEnum, IsInt, IsOptional, IsString } from 'class-validator'
import { ProductStatus } from '@prisma/client'

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsInt()
  categoryId?: number

  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]
}
