import { seedIfNeeded, getSeedData } from '../data/seed'
import { KEYS } from '../data/keys'
import { writeJson, clearReunionStorage, exportDemoBundle, importDemoBundle } from '../lib/storage'
import { idbClear } from '../lib/indexeddb'
import { notifyData } from '../lib/events'

export function bootstrapDemo() {
  seedIfNeeded()
}

export async function resetDemoData() {
  clearReunionStorage()
  await idbClear()
  const data = getSeedData()
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'qrSamples') return
    writeJson(key, value)
  })
  notifyData()
}

export function exportAll() {
  const blob = new Blob([JSON.stringify(exportDemoBundle(), null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'reunion-demo-data.json'
  a.click()
  URL.revokeObjectURL(url)
}

export async function importAll(file) {
  const text = await file.text()
  const json = JSON.parse(text)
  importDemoBundle(json)
  notifyData()
}

export { KEYS }
