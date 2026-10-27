import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { QrBox } from '../components/QrBox'
import { PAYMENT_LABELS } from '../data/labels'
import { formatTHB } from '../lib/money'
import { formatDateTime as fmt } from '../lib/dates'
import { paymentsRepo, ordersRepo, slipsRepo, usersRepo } from '../repositories'
import { submitSlip, getSlipBlobUrl, makePlaceholderSlipDataUrl } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLiveData } from '../hooks/useLiveData'

export default function Payment() {
  const tick = useLiveData()
  const { paymentId } = useParams()
  const { user } = useAuth()
  const toast = useToast()
  const payment = paymentsRepo.findById(paymentId)
  const order = payment ? ordersRepo.findById(payment.orderId) : null
  const slips = payment ? slipsRepo.byPayment(payment.id) : []
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState('')
  const [confirmPay, setConfirmPay] = useState(false)
  const [slipUrls, setSlipUrls] = useState({})

  useEffect(() => {
    let alive = true
    async function load() {
      const map = {}
      for (const s of slips) {
        if (s.demoPlaceholder) map[s.id] = makePlaceholderSlipDataUrl(s.fileName, payment.amount)
        else {
          const url = await getSlipBlobUrl(s.storageKey)
          if (url) map[s.id] = url
        }
      }
      if (alive) setSlipUrls(map)
    }
    load()
    return () => { alive = false; Object.values(slipUrls).forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u)) }
  }, [tick, paymentId])

  if (!payment || !order) return <p>ไม่พบรายการชำระเงิน</p>
  if (order.buyerId !== user.id && user.role !== 'super_admin') return <p>ไม่มีสิทธิ์ดูรายการนี้</p>

  function onFile(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  async function send() {
    try {
      await submitSlip(user, payment.id, file, confirmPay)
      toast.push('ส่งหลักฐานแล้ว รอ Super Admin ตรวจสอบ', 'success')
      setFile(null)
      setPreview('')
      setConfirmPay(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const canSubmit = ['awaiting_payment', 'rejected', 'pending_verification'].includes(payment.status) && payment.status !== 'approved'
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <PageHeader title="ชำระเงินด้วย Thai QR" subtitle="ระบบจะไม่อนุมัติอัตโนมัติจากการแนบสลิป QR Ticket จะออกหลัง Super Admin อนุมัติเท่านั้น" />
      <div className="card space-y-2">
        <div className="flex justify-between"><span>Order ID</span><span className="font-mono text-sm">{order.id}</span></div>
        <div className="flex justify-between"><span>ยอดรวม</span><span className="font-semibold">{formatTHB(payment.amount)}</span></div>
        <div className="flex justify-between"><span>สถานะ</span><StatusBadge status={payment.status} label={PAYMENT_LABELS[payment.status]} /></div>
        {payment.rejectionReason ? <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">เหตุผลที่ถูกปฏิเสธ: {payment.rejectionReason}</p> : null}
      </div>
      <div className="card">
        <h2 className="mb-2 font-semibold">รายการ</h2>
        {order.items.map((l, i) => (
          <p key={i} className="text-sm">{l.kind === 'ticket' ? `บัตร ${l.name} × ${l.quantity}` : `เสื้อ ${l.name} ${l.size || ''} × ${l.quantity}`}</p>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <div className="mb-2 rounded-lg bg-orange-50 px-3 py-2 text-xs text-orange-800">QR นี้เป็นตัวอย่างสำหรับ Demo เท่านั้น ไม่ใช่ QR พร้อมเพย์รับเงินจริง</div>
          <QrBox value={payment.reference} label="Thai QR (Demo)" caption={`ยอด ${formatTHB(payment.amount)}`} downloadName={`${order.id}-thai-qr.png`} />
        </div>
        <div className="card space-y-3">
          <p className="text-sm font-medium">บัตรเครดิต / Mastercard</p>
          <button type="button" className="btn-secondary w-full" disabled>Coming Soon — ยังไม่มี Payment Gateway</button>
          <p className="text-xs text-slate-500">ห้ามกรอกข้อมูลบัตรเครดิตในระบบ Demo</p>
        </div>
      </div>
      {canSubmit ? (
        <div className="card space-y-3">
          <h2 className="font-semibold">แนบสลิป</h2>
          <input className="input" type="file" accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp" onChange={onFile} />
          {preview ? (
            <div>
              <img src={preview} alt="preview" className="max-h-64 rounded-lg border" />
              <button type="button" className="btn-secondary mt-2" onClick={() => { setFile(null); setPreview('') }}>ลบสลิป</button>
            </div>
          ) : null}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={confirmPay} onChange={(e) => setConfirmPay(e.target.checked)} />
            ข้าพเจ้ายืนยันว่าได้ชำระเงินตามยอดนี้แล้ว และเข้าใจว่าสลิปยังไม่ใช่การอนุมัติอัตโนมัติ
          </label>
          <button className="btn-primary" type="button" onClick={send}>ส่งหลักฐาน</button>
        </div>
      ) : null}
      <div className="card">
        <h2 className="mb-3 font-semibold">ประวัติสลิป</h2>
        {slips.length === 0 ? <p className="text-sm text-slate-500">ยังไม่มีสลิป</p> : slips.map((s) => (
          <div key={s.id} className="mb-3 rounded-lg border p-3 text-sm">
            <p>{s.fileName} · {fmt(s.submittedAt)}</p>
            <p>สถานะ {s.status} {s.rejectionReason ? `· ${s.rejectionReason}` : ''}</p>
            {slipUrls[s.id] ? <img src={slipUrls[s.id]} alt="" className="mt-2 max-h-48 rounded" /> : <p className="text-xs text-slate-400">ภาพจัดเก็บใน IndexedDB ของเบราว์เซอร์นี้</p>}
          </div>
        ))}
      </div>
    </div>
  )
}
