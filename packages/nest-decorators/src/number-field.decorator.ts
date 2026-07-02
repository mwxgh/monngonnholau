import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsInt, IsNotEmpty, IsNumber, Max, Min } from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { INumberFieldOptions } from './types'

export const NumberField = (
  options: ApiPropertyOptions & INumberFieldOptions = {}
): PropertyDecorator => {
  const decorators = [Type(() => Number)]

  if (options.nullable) {
    decorators.push(IsNullable({ each: options.each }))
  } else {
    decorators.push(IsNotEmpty({ each: options.each }))
  }

  if (options.swagger !== false) {
    decorators.push(ApiProperty({ type: Number, ...options }))
  }

  if (options.int) {
    decorators.push(IsInt({ each: options.each }))
  } else {
    decorators.push(IsNumber({}, { each: options.each }))
  }

  if (typeof options.min === 'number') {
    decorators.push(Min(options.min, { each: options.each }))
  }

  if (typeof options.max === 'number') {
    decorators.push(Max(options.max, { each: options.each }))
  }

  return applyDecorators(...decorators)
}

export const NumberFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    INumberFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    NumberField({ required: false, nullable: true, ...options })
  )
}
