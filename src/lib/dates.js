import { format, parseISO, isWithinInterval } from 'date-fns'
import { th } from 'date-fns/locale'

export function nowIso() {
  return new Date().toISOString()
}

export function formatDateTime(value) {
  if (!value) return '-'
  try {
    return format(typeof value === 'string' ? parseISO(value) : value, 'd MMM yyyy HH:mm', { locale: th })
  } catch {
    return String(value)
  }
}

export function formatDate(value) {
  if (!value) return '-'
  try {
    return format(typeof value === 'string' ? parseISO(value) : value, 'd MMM yyyy', { locale: th })
  } catch {
    return String(value)
  }
}

export function inDateRange(iso, from, to) {
  if (!from && !to) return true
  const date = new Date(iso)
  if (from && to) {
    return isWithinInterval(date, { start: new Date(from), end: new Date(`${to}T23:59:59`) })
  }
  if (from) return date >= new Date(from)
  if (to) return date <= new Date(`${to}T23:59:59`)
  return true
}
