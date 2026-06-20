import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class UpsertAddressDto {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsOptional()
  @IsString()
  email?: string

  // new mode (v2 API – 2-level: tỉnh → xã)
  @IsOptional()
  @IsString()
  province?: string

  @IsOptional()
  @IsString()
  ward?: string

  // old mode (v1 API – 3-level: tỉnh → huyện → xã)
  @IsOptional()
  @IsString()
  oldProvince?: string

  @IsOptional()
  @IsString()
  oldDistrict?: string

  @IsOptional()
  @IsString()
  oldWard?: string

  @IsOptional()
  @IsString()
  street?: string

  @IsString()
  @IsNotEmpty()
  detail: string

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean
}
