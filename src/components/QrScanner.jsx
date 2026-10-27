import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export function QrScanner({ onResult }) {
  const boxId = useRef(`scan-${Math.random().toString(36).slice(2)}`).current
  const inst = useRef(null)
  const [cameras, setCameras] = useState([])
  const [cam, setCam] = useState('')
  const [running, setRunning] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    Html5Qrcode.getCameras()
      .then((list) => {
        setCameras(list)
        setCam(list[0]?.id || '')
      })
      .catch(() => setErr('ไม่สามารถเข้าถึงกล้องได้'))
    return () => {
      stop()
    }
  }, [])

  async function start() {
    setErr('')
    try {
      inst.current = new Html5Qrcode(boxId)
      await inst.current.start(
        cam ? { deviceId: { exact: cam } } : { facingMode: 'environment' },
        { fps: 8, qrbox: 220 },
        (text) => onResult(text),
      )
      setRunning(true)
    } catch (e) {
      setErr(e.message || 'เปิดกล้องไม่สำเร็จ')
    }
  }

  async function stop() {
    if (inst.current) {
      try {
        if (inst.current.isScanning) await inst.current.stop()
        await inst.current.clear()
      } catch {
        /* ignore */
      }
      inst.current = null
    }
    setRunning(false)
  }

  return (
    <div className="space-y-3">
      <div id={boxId} className="overflow-hidden rounded-xl bg-black" />
      {err ? <p className="text-sm text-red-600">{err}</p> : null}
      <div className="flex flex-wrap gap-2">
        {cameras.length > 1 ? (
          <select className="input max-w-xs" value={cam} onChange={(e) => setCam(e.target.value)} disabled={running}>
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>{c.label || c.id}</option>
            ))}
          </select>
        ) : null}
        {running ? (
          <button type="button" className="btn-secondary" onClick={stop}>ปิดกล้อง</button>
        ) : (
          <button type="button" className="btn-primary" onClick={start}>เปิดกล้องสแกน</button>
        )}
      </div>
    </div>
  )
}
