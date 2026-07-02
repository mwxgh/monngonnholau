import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength
} from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IStringFieldOptions } from './types'

export const StringField = (
  options: ApiPropertyOptions & IStringFieldOptions = {}
): PropertyDecorator => {
  const decorators = [Type(() => String), IsString({ each: options.each })]

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
      ApiProperty({ type: String, ...options, isArray: options.each })
    )
  }

  if (options.minLength) {
    decorators.push(MinLength(options.minLength, { each: options.each }))
  }

  if (options.maxLength) {
    decorators.push(MaxLength(options.maxLength, { each: options.each }))
  }

  return applyDecorators(...decorators)
}

export const StringFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IStringFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    StringField({ required: false, nullable: true, ...options })
  )
}
