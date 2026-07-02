import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IFieldOptions } from './types'

export const BooleanField = (
  options: ApiPropertyOptions & IFieldOptions = {}
): PropertyDecorator => {
  const decorators = [Type(() => Boolean), IsBoolean({ each: options.each })]

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
      ApiProperty({ type: Boolean, ...options, isArray: options.each })
    )
  }

  return applyDecorators(...decorators)
}

export const BooleanFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    BooleanField({ required: false, nullable: true, ...options })
  )
}
