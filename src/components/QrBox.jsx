import { QRCodeCanvas } from 'qrcode.react'
import { Download } from 'lucide-react'

export function QrBox({ value, label, caption, size = 180, downloadName = 'qr.png' }) {
  const id = `qr-${label || 'code'}`
  function download() {
    const canvas = document.getElementById(id)
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = downloadName
    a.click()
  }
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="rounded-xl bg-white p-3 shadow-inner ring-1 ring-slate-100">
        <QRCodeCanvas id={id} value={value} size={size} includeMargin />
      </div>
      {label ? <p className="text-sm font-semibold text-slate-800">{label}</p> : null}
      {caption ? <p className="text-center text-xs text-slate-500 leading-relaxed">{caption}</p> : null}
      <button type="button" className="btn-secondary text-xs" onClick={download}>
        <Download className="h-3.5 w-3.5" /> บันทึกภาพ QR
      </button>
    </div>
  )
}
