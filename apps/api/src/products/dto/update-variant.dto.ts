import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateVariantDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  comparePrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;
}
