import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator'
import { ToLowerCase, Trim } from './transform.decorator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IFieldOptions } from './types'

export const EmailField = (
  options: ApiPropertyOptions & IFieldOptions = {}
): PropertyDecorator => {
  const decorators = [
    Type(() => String),
    Trim,
    ToLowerCase(),
    IsEmail({}, { each: options.each })
  ]

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

  return applyDecorators(...decorators)
}

export const EmailFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    EmailField({ required: false, nullable: true, ...options })
  )
}
