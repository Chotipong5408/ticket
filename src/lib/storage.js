const PREFIX = 'reunion_'

export function storageKey(name) {
  return name.startsWith(PREFIX) ? name : `${PREFIX}${name}`
}

export function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(storageKey(key))
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    console.error('อ่าน LocalStorage ไม่สำเร็จ:', key)
    return fallback
  }
}

export function writeJson(key, value) {
  localStorage.setItem(storageKey(key), JSON.stringify(value))
}

export function removeKey(key) {
  localStorage.removeItem(storageKey(key))
}

export function listReunionKeys() {
  const keys = []
  for (let i = 0; i < localStorage.length; i += 1) {
    const k = localStorage.key(i)
    if (k && k.startsWith(PREFIX)) keys.push(k)
  }
  return keys
}

export function clearReunionStorage() {
  listReunionKeys().forEach((k) => localStorage.removeItem(k))
}

export function exportDemoBundle() {
  const data = {}
  listReunionKeys().forEach((k) => {
    data[k] = readJson(k.replace(PREFIX, ''), null)
  })
  return data
}

export function importDemoBundle(bundle) {
  if (!bundle || typeof bundle !== 'object') throw new Error('ไฟล์ไม่ถูกต้อง')
  Object.entries(bundle).forEach(([k, v]) => {
    if (!k.startsWith(PREFIX)) return
    localStorage.setItem(k, JSON.stringify(v))
  })
}
