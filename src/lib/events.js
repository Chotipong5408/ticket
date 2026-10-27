export const DATA_EVENT = 'reunion-data'

export function notifyData() {
  window.dispatchEvent(new Event(DATA_EVENT))
}

export function onData(handler) {
  window.addEventListener(DATA_EVENT, handler)
  return () => window.removeEventListener(DATA_EVENT, handler)
}
