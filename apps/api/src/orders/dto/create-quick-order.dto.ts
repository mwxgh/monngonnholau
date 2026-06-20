import { Type } from 'class-transformer'
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested
} from 'class-validator'

export class QuickOrderItemDto {
  @IsString()
  @IsNotEmpty()
  sku: string

  @IsInt()
  @Min(1)
  qty: number
}

export class CreateQuickOrderDto {
  @IsString()
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsOptional()
  email?: string

  @IsString()
  @IsNotEmpty()
  province: string

  @IsString()
  @IsOptional()
  district?: string

  @IsString()
  @IsNotEmpty()
  ward: string

  @IsString()
  @IsNotEmpty()
  street: string

  @IsString()
  @IsOptional()
  note?: string

  @IsIn(['online', 'cod'])
  @IsOptional()
  paymentMethod?: 'online' | 'cod'

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuickOrderItemDto)
  items: QuickOrderItemDto[]
}
