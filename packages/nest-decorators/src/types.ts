export interface IFieldOptions {
  each?: boolean
  swagger?: boolean
  nullable?: boolean
}

export type IStringFieldOptions = IFieldOptions & {
  minLength?: number
  maxLength?: number
}

export type INumberFieldOptions = IFieldOptions & {
  min?: number
  max?: number
  int?: boolean
}

export type IClassFieldOptions = IFieldOptions & {
  minSize?: number
  maxSize?: number
}
