import { useEffect, useState } from 'react'
import { onData } from '../lib/events'

export function useLiveData() {
  const [tick, setTick] = useState(0)
  useEffect(() => onData(() => setTick((n) => n + 1)), [])
  return tick
}
