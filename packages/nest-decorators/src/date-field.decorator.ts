import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsNotEmpty, IsOptional } from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IFieldOptions } from './types'

export const DateField = (
  options: ApiPropertyOptions & IFieldOptions = {}
): PropertyDecorator => {
  const decorators = [Type(() => Date), IsDate({ each: options.each })]

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
      ApiProperty({ type: Date, ...options, isArray: options.each })
    )
  }

  return applyDecorators(...decorators)
}

export const DateFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    DateField({ required: false, nullable: true, ...options })
  )
}
