export const QR_PREFIX = 'AR1'

export function encodeQr(type, token) {
  return `${QR_PREFIX}:${type}:${token}`
}

export function decodeQr(raw) {
  if (!raw || typeof raw !== 'string') return null
  const parts = raw.trim().split(':')
  if (parts.length < 3 || parts[0] !== QR_PREFIX) return null
  return { type: parts[1], token: parts.slice(2).join(':') }
}
