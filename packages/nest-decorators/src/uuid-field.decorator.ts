import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IFieldOptions } from './types'

export const UUIDField = (
  options: ApiPropertyOptions & IFieldOptions = {}
): PropertyDecorator => {
  const decorators = [Type(() => String), IsUUID('4', { each: options.each })]

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
        type: String,
        format: 'uuid',
        ...options,
        isArray: options.each
      })
    )
  }

  return applyDecorators(...decorators)
}

export const UUIDFieldOptional = (
  options: Omit<ApiPropertyOptions, 'type' | 'required'> & IFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    UUIDField({ required: false, nullable: true, ...options })
  )
}
