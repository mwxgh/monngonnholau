import { ValidateIf, ValidationOptions } from 'class-validator'

export const IsUndefinable = (
  options?: ValidationOptions
): PropertyDecorator => {
  return ValidateIf((_, value) => value !== undefined, options)
}

export const IsNullable = (options?: ValidationOptions): PropertyDecorator => {
  return ValidateIf((_, value) => value !== null, options)
}
