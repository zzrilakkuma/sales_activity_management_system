import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined) {
  if (!date) return '-'
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'PPP')
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Invalid Date'
  }
}

export function formatCurrency(amount: number | string | null | undefined) {
  if (amount === null || amount === undefined) return '-'
  try {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(numAmount)
  } catch (error) {
    console.error('Error formatting currency:', error)
    return 'Invalid Amount'
  }
}
