import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseNumber(value: string | number | undefined, defaultValue: number = 0): number {
  if (value === undefined || value === null) return defaultValue
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  return isNaN(num) ? defaultValue : num
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function sanitizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}
