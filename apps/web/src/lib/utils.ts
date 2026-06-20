import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const STORAGE_URL = process.env.NEXT_PUBLIC_STORAGE_URL ?? ''

export function staticUrl(path: string) {
  return `${STORAGE_URL}/static/${path.replace(/^\//, '')}`
}
