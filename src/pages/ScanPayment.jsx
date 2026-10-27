import { useState } from 'react'
import { PageHeader } from '../components/ui/PageHeader'
import { QrScanner } from '../components/QrScanner'
import { decodeQr } from '../lib/qr'
import { requestsRepo, storesRepo } from '../repositories'
import { payStoreRequest } from '../services/storeService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatToken } from '../lib/money'

export default function ScanPayment() {
  const { user } = useAuth()
  const toast = useToast()
  const [manual, setManual] = useState('')
  const [req, setReq] = useState(null)
  function resolve(raw) {
    const decoded = decodeQr(raw)
    const token = decoded?.type === 'store' ? decoded.token : raw
    const found = requestsRepo.findByQr(token) || requestsRepo.findById(raw)
    if (!found) {
      toast.push('ไม่พบ QR ร้านค้า', 'error')
      return
    }
    setReq(found)
  }
  function pay() {
    try {
      payStoreRequest(user, req.id)
      toast.push('ชำระด้วย Token สำเร็จ', 'success')
      setReq(requestsRepo.findById(req.id))
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  const store = req ? storesRepo.findById(req.storeId) : null
  return (
    <div>
      <PageHeader title="สแกนจ่ายร้านค้า" subtitle="QR ร้านค้าแยกจาก QR Ticket และ QR ธนาคาร" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <QrScanner onResult={resolve} />
          <div className="mt-3 flex gap-2">
            <input className="input" placeholder="วางรหัส QR หรือ Request ID" value={manual} onChange={(e) => setManual(e.target.value)} />
            <button className="btn-secondary" type="button" onClick={() => resolve(manual)}>ตรวจ</button>
          </div>
        </div>
        <div className="card">
          {!req ? <p className="text-sm text-slate-500">ยังไม่มีรายการ</p> : (
            <div className="space-y-2">
              <p>ร้าน: {store?.name}</p>
              <p>สินค้า: {req.productName} × {req.quantity}</p>
              <p className="text-lg font-semibold">{formatToken(req.amountToken)}</p>
              <p>สถานะ: {req.status}</p>
              {req.status === 'open' ? <button className="btn-primary" type="button" onClick={pay}>ยืนยันหัก Token</button> : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
