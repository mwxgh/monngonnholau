import {
  Transform,
  TransformFnParams,
  TransformOptions
} from 'class-transformer'
import { CountryCode, parsePhoneNumberWithError } from 'libphonenumber-js'

const DATE_FORMAT_WITHOUT_TIME =
  /^(?:\d{4}(-|\/)\d{2}(-|\/)\d{2}|\d{2}(-|\/)\d{2}(-|\/)\d{4})$/
const ESCAPE_STRING = /[\\_&%]/g

const trimString = (value: string): string =>
  value.trim().replace(/\s\s+/g, ' ')

export const Trim: PropertyDecorator = Transform(
  ({ value }: TransformFnParams): unknown => {
    const raw: unknown = value

    if (Array.isArray(raw)) {
      return raw.map((v: unknown) =>
        typeof v === 'string' ? trimString(v) : v
      )
    }

    return typeof raw === 'string' ? trimString(raw) : raw
  }
)

export const ToBoolean = (options?: TransformOptions): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams) => {
      switch (value) {
        case 'true':
        case 1:
          return true
        case 'false':
        case 0:
          return false
        default:
          return false
      }
    },
    { toClassOnly: true, ...options }
  )

export const ToTime = (options?: TransformOptions): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams) =>
      typeof value === 'string' ? value.slice(0, -3) : undefined,
    { ...options }
  )

export const ToInt: PropertyDecorator = Transform(
  ({ value }: TransformFnParams): unknown => {
    const raw: unknown = value

    if (typeof raw === 'number') return raw
    if (typeof raw === 'string') return Number.parseInt(raw, 10)
    return raw
  },
  { toClassOnly: true }
)

export const ToArray = (): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams): unknown[] => {
      const raw: unknown = value

      if (raw === null || raw === undefined) return []
      return Array.isArray(raw) ? raw : [raw]
    },
    { toClassOnly: true }
  )

export const ToLowerCase = (): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams) => {
      if (!value) return undefined
      if (typeof value === 'string') return value.toLowerCase()
      if (Array.isArray(value)) {
        return value.map((v) =>
          typeof v === 'string' ? v.toLowerCase() : String(v)
        )
      }
      return undefined
    },
    { toClassOnly: true }
  )

export const ToUpperCase = (): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams) => {
      if (!value) return undefined
      if (typeof value === 'string') return value.toUpperCase()
      if (Array.isArray(value)) {
        return value.map((v) =>
          typeof v === 'string' ? v.toUpperCase() : String(v)
        )
      }
      return undefined
    },
    { toClassOnly: true }
  )

export const ToPhoneNumberSerializer = (
  defaultCountry: CountryCode = 'VN'
): PropertyDecorator =>
  Transform(
    ({ value }: TransformFnParams) =>
      parsePhoneNumberWithError(value as string, defaultCountry).number
  )

export const ToDateFormat = (): PropertyDecorator =>
  Transform(({ value }: TransformFnParams) => {
    if (!value || !(typeof value === 'string' || value instanceof Date)) {
      return undefined
    }

    const dateString =
      typeof value === 'string' && DATE_FORMAT_WITHOUT_TIME.test(value)
        ? value
        : value instanceof Date
          ? value.toISOString()
          : undefined

    return dateString ? dateString.split('-').join('/') : undefined
  })

export const ToEscapeString = (): PropertyDecorator =>
  Transform(({ value }: TransformFnParams): string | undefined => {
    if (typeof value === 'string') {
      return value.replace(ESCAPE_STRING, '\\$&')
    }
    return undefined
  })

export const NullToDefault = (defaultValue = 0): PropertyDecorator =>
  Transform(({ value }: TransformFnParams) => {
    if (typeof value === 'string') return Number.parseInt(value, 10)
    if (typeof value === 'number' && !Number.isNaN(value)) return value
    return defaultValue
  })
