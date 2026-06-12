import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generate_id(): string {
  return crypto.randomUUID()
}

export function format_date(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function format_time(date: Date): string {
  return date.toTimeString().slice(0, 5)
}

export function format_datetime(iso: string): string {
  const d = new Date(iso)
  return `${format_date(d)} ${format_time(d)}`
}
