import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { IsEnum, IsNotEmpty, IsOptional } from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IFieldOptions } from './types'

const getEnumName = (getEnum: () => object): string => {
  const match = /\(\)=>(.*)/.exec(getEnum.toString().replace(/\s/g, ''))
  const fullName = match?.[1] ?? ''
  const parts = fullName.split('.')

  return parts[parts.length - 1] ?? fullName
}

export const EnumField = <TEnum extends object>(
  getEnum: () => TEnum,
  options: ApiPropertyOptions & IFieldOptions = {}
): PropertyDecorator => {
  const enumValue = getEnum()
  const decorators = [IsEnum(enumValue, { each: options.each })]

  if (options.nullable) {
    decorators.push(
      IsNullable({ each: options.each }),
      IsOptional({ each: options.each })
    )
  } else {
    decorators.push(IsNotEmpty({ each: options.each }))
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({
        isArray: options.each,
        enum: enumValue as Record<string, unknown>,
        enumName: getEnumName(getEnum),
        ...options
      })
    )
  }

  return applyDecorators(...decorators)
}

export const EnumFieldOptional = <TEnum extends object>(
  getEnum: () => TEnum,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    EnumField(getEnum, { required: false, ...options, nullable: true })
  )
}
