import { applyDecorators, Type as ClassRef } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  ValidateNested
} from 'class-validator'
import { IsNullable, IsUndefinable } from './validator.decorator'
import { IClassFieldOptions } from './types'

export const ClassField = <TClass extends ClassRef>(
  getClass: () => TClass,
  options: ApiPropertyOptions & IClassFieldOptions = {}
): PropertyDecorator => {
  const classValue = getClass()
  const decorators = [
    Type(() => classValue),
    ValidateNested({ each: options.each })
  ]

  if (options.nullable) {
    decorators.push(
      IsNullable({ each: options.each }),
      IsOptional({ each: options.each })
    )
  } else {
    decorators.push(IsNotEmpty({ each: options.each }))
  }

  if (options.each) {
    decorators.push(IsArray())

    if (typeof options.minSize === 'number') {
      decorators.push(ArrayMinSize(options.minSize))
    }

    if (typeof options.maxSize === 'number') {
      decorators.push(ArrayMaxSize(options.maxSize))
    }
  }

  if (options.swagger !== false) {
    decorators.push(
      ApiProperty({ type: () => classValue, isArray: options.each, ...options })
    )
  }

  return applyDecorators(...decorators)
}

export const ClassFieldOptional = <TClass extends ClassRef>(
  getClass: () => TClass,
  options: Omit<ApiPropertyOptions, 'type' | 'required'> &
    IClassFieldOptions = {}
): PropertyDecorator => {
  return applyDecorators(
    IsUndefinable(),
    ClassField(getClass, { required: false, ...options, nullable: true })
  )
}
