import { QRCodeCanvas } from 'qrcode.react'

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
    <div className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-white p-4">
      <QRCodeCanvas id={id} value={value} size={size} includeMargin />
      {label ? <p className="text-sm font-medium">{label}</p> : null}
      {caption ? <p className="text-center text-xs text-slate-500">{caption}</p> : null}
      <button type="button" className="btn-secondary" onClick={download}>บันทึกภาพ QR</button>
    </div>
  )
}
