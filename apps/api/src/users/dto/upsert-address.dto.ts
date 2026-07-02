import {
  BooleanFieldOptional,
  EmailFieldOptional,
  StringField,
  StringFieldOptional
} from '@repo/nest-decorators'

export class UpsertAddressDto {
  @StringField()
  fullName!: string

  @StringField()
  phone!: string

  @EmailFieldOptional()
  email?: string

  // new mode (v2 API – 2-level: tỉnh → xã)
  @StringFieldOptional()
  province?: string

  @StringFieldOptional()
  ward?: string

  // old mode (v1 API – 3-level: tỉnh → huyện → xã)
  @StringFieldOptional()
  oldProvince?: string

  @StringFieldOptional()
  oldDistrict?: string

  @StringFieldOptional()
  oldWard?: string

  @StringFieldOptional()
  street?: string

  @StringField()
  detail!: string

  @BooleanFieldOptional()
  isDefault?: boolean
}
