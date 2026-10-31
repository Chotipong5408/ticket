import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Camera, CameraOff, AlertCircle } from 'lucide-react'

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
      .catch(() => setErr('ไม่สามารถเข้าถึงกล้องได้ กรุณาอนุญาตการเข้าถึงกล้องในเบราว์เซอร์'))
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
        { fps: 10, qrbox: { width: 220, height: 220 } },
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
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-slate-800 shadow-inner">
        <div id={boxId} className="w-full min-h-[260px] flex items-center justify-center text-slate-400" />
        
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 p-6 text-center text-slate-300">
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow">
              <Camera className="h-7 w-7 text-brand-400" />
            </div>
            <p className="text-sm font-medium">กดปุ่มด้านล่างเพื่อเปิดกล้องสแกน QR Code</p>
            <p className="text-xs text-slate-500 mt-1">หรือกรอกรหัสด้านล่างหากไม่สะดวกเปิดกล้อง</p>
          </div>
        )}

        {running && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="relative h-48 w-48 rounded-xl border-2 border-brand-400/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]">
              <div className="absolute -top-1 -left-1 h-4 w-4 border-t-2 border-l-2 border-white" />
              <div className="absolute -top-1 -right-1 h-4 w-4 border-t-2 border-r-2 border-white" />
              <div className="absolute -bottom-1 -left-1 h-4 w-4 border-b-2 border-l-2 border-white" />
              <div className="absolute -bottom-1 -right-1 h-4 w-4 border-b-2 border-r-2 border-white" />
              <div className="absolute inset-x-2 top-0 h-0.5 bg-gradient-to-r from-transparent via-brand-400 to-transparent animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {err ? (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200/60 p-3 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
          <span>{err}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {cameras.length > 1 ? (
          <select
            className="input max-w-xs text-xs"
            value={cam}
            onChange={(e) => setCam(e.target.value)}
            disabled={running}
          >
            {cameras.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label || `กล้อง ${c.id}`}
              </option>
            ))}
          </select>
        ) : null}

        {running ? (
          <button type="button" className="btn-secondary gap-2" onClick={stop}>
            <CameraOff className="h-4 w-4 text-red-500" /> ปิดกล้อง
          </button>
        ) : (
          <button type="button" className="btn-primary gap-2" onClick={start}>
            <Camera className="h-4 w-4" /> เปิดกล้องสแกน
          </button>
        )}
      </div>
    </div>
  )
}
