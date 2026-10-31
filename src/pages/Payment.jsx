import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { StatusBadge } from '../components/ui/StatusBadge'
import { QrBox } from '../components/QrBox'
import { PAYMENT_LABELS } from '../data/labels'
import { formatTHB } from '../lib/money'
import { formatDateTime as fmt } from '../lib/dates'
import { paymentsRepo, ordersRepo, slipsRepo } from '../repositories'
import { submitSlip, getSlipBlobUrl, makePlaceholderSlipDataUrl } from '../services/paymentService'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLiveData } from '../hooks/useLiveData'
import {
  CreditCard,
  QrCode,
  Upload,
  FileCheck2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Info,
  ChevronLeft,
  X,
  FileText
} from 'lucide-react'

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
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    let alive = true
    async function load() {
      const map = {}
      for (const s of slips) {
        if (s.demoPlaceholder) map[s.id] = makePlaceholderSlipDataUrl(s.fileName, payment?.amount || 0)
        else {
          const url = await getSlipBlobUrl(s.storageKey)
          if (url) map[s.id] = url
        }
      }
      if (alive) setSlipUrls(map)
    }
    load()
    return () => {
      alive = false
      Object.values(slipUrls).forEach((u) => u?.startsWith('blob:') && URL.revokeObjectURL(u))
    }
  }, [tick, paymentId, slips.length])

  if (!payment || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">ไม่พบรายการชำระเงิน</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">รหัสการชำระเงินไม่ถูกต้อง หรือรายการอาจถูกลบไปแล้ว</p>
          <Link to="/account/orders" className="btn-primary text-xs">กลับไปหน้ารายการสั่งซื้อ</Link>
        </div>
      </div>
    )
  }

  if (order.buyerId !== user.id && user.role !== 'super_admin') {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="rounded-3xl border border-slate-200 bg-white p-8">
          <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-3" />
          <h2 className="text-lg font-bold text-slate-800">ไม่มีสิทธิ์ดูรายการนี้</h2>
          <p className="text-xs text-slate-500 mt-1 mb-6">รายการสั่งซื้อนี้เป็นของบัญชีผู้ใช้อื่น</p>
          <Link to="/account" className="btn-secondary text-xs">กลับหน้าหลัก</Link>
        </div>
      </div>
    )
  }

  function onFile(e) {
    const f = e.target.files?.[0]
    setFile(f || null)
    setPreview(f ? URL.createObjectURL(f) : '')
  }

  async function send() {
    if (!confirmPay) {
      toast.push('กรุณาทำเครื่องหมายยืนยันการชำระเงินก่อนส่งหลักฐาน', 'error')
      return
    }
    setIsSubmitting(true)
    try {
      await submitSlip(user, payment.id, file, confirmPay)
      toast.push('ส่งหลักฐานแล้ว รอ Super Admin ตรวจสอบ', 'success')
      setFile(null)
      setPreview('')
      setConfirmPay(false)
    } catch (e) {
      toast.push(e.message, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const canSubmit =
    ['awaiting_payment', 'rejected', 'pending_verification'].includes(payment.status) &&
    payment.status !== 'approved'

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12 space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/account/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
        >
          <ChevronLeft className="h-4 w-4" /> ดูประวัติคำสั่งซื้อ
        </Link>
        <StatusBadge status={payment.status} label={PAYMENT_LABELS[payment.status]} />
      </div>

      <PageHeader
        title="ชำระเงินและแจ้งโอน"
        subtitle="สแกน Thai QR เพื่อชำระเงิน จากนั้นแนบภาพสลิปโอนเงินเพื่อรอเจ้าหน้าที่ตรวจสอบและออกบัตร"
        icon={CreditCard}
      />

      {/* Rejection alert */}
      {payment.rejectionReason && (
        <div className="rounded-2xl bg-red-50 border border-red-200/80 p-4 text-xs text-red-800 flex items-start gap-3">
          <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <div>
            <strong className="font-bold">รายการนี้ถูกปฏิเสธ:</strong> {payment.rejectionReason}
            <p className="mt-1 text-red-600">กรุณาตรวจสอบยอดเงินและแนบสลิปที่ถูกต้องอีกครั้ง</p>
          </div>
        </div>
      )}

      {/* Approved alert */}
      {payment.status === 'approved' && (
        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-4 text-xs text-emerald-800 flex items-start gap-3">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
          <div>
            <strong className="font-bold">ชำระเงินเรียบร้อยแล้ว:</strong> รายการนี้ได้รับการอนุมัติแล้ว คุณสามารถเปิดดูและดาวน์โหลด QR Ticket ได้ทันที
            <div className="mt-2">
              <Link to="/account/tickets" className="btn-primary text-xs py-1.5 px-3">
                ดู QR Ticket ของฉัน →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Order Info & Summary Banner */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100">
          <div>
            <p className="text-xs text-slate-400">Order ID</p>
            <p className="font-mono text-xs font-bold text-slate-800 mt-0.5">{order.id}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">วันที่ทำรายการ</p>
            <p className="text-xs font-semibold text-slate-700 mt-0.5">{fmt(order.createdAt)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">ยอดที่ต้องชำระ</p>
            <p className="text-xl font-extrabold text-brand-700 mt-0.5">{formatTHB(payment.amount)}</p>
          </div>
        </div>

        {/* Item List */}
        <div className="pt-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">รายการในคำสั่งซื้อนี้:</p>
          <div className="space-y-1.5 text-xs text-slate-600">
            {order.items.map((l, i) => (
              <div key={i} className="flex justify-between py-1 border-b border-slate-50 last:border-0">
                <span>
                  {l.kind === 'ticket' ? `🎟️ บัตร ${l.name}` : `👕 เสื้อ ${l.name} (ไซส์ ${l.size || '-'})`} × {l.quantity}
                </span>
                <span className="font-semibold text-slate-800">
                  {formatTHB((l.unitPrice || l.price) * l.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment methods */}
      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Left: Thai QR PromptPay */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200/60 px-3 py-1 text-xs font-semibold text-blue-700 mb-4">
            <QrCode className="h-3.5 w-3.5" />
            <span>Thai QR PromptPay</span>
          </div>

          <div className="mb-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 px-3 py-2 text-[11px] text-amber-800 flex items-center justify-center gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 text-amber-600" />
            <span>ระบบ Demo: จำลอง Thai QR สำหรับการทดสอบ</span>
          </div>

          <div className="flex justify-center my-2">
            <QrBox
              value={payment.reference}
              label="PromptPay QR"
              caption={`ยอดชำระ: ${formatTHB(payment.amount)}`}
              downloadName={`${order.id}-thai-qr.png`}
            />
          </div>
        </div>

        {/* Right: Credit Card Placeholder */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-800">บัตรเครดิต / เดบิต (Mastercard / Visa)</p>
              <p className="text-[11px] text-slate-400">ชำระผ่าน Payment Gateway</p>
            </div>
          </div>

          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center bg-slate-50/50 space-y-2">
            <p className="text-xs font-semibold text-slate-500">Coming Soon</p>
            <p className="text-[11px] text-slate-400">ระบบ Payment Gateway กำลังอยู่ระหว่างการเชื่อมต่อ กรุณาใช้ Thai QR สแกนโอนเงิน</p>
            <button type="button" className="btn-secondary w-full text-xs" disabled>
              ยังไม่เปิดให้บริการ
            </button>
          </div>

          <div className="rounded-xl bg-slate-100 p-3 text-[11px] text-slate-500 flex items-start gap-2">
            <Info className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
            <span>คำเตือน: ห้ามกรอกหมายเลขบัตรเครดิตจริงลงในระบบ Demo ทุกกรณี</span>
          </div>
        </div>
      </div>

      {/* Slip Upload Section */}
      {canSubmit && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">แนบสลิปหลักฐานการโอนเงิน</h3>
              <p className="text-xs text-slate-400">รองรับไฟล์ภาพ JPG, PNG, WEBP</p>
            </div>
          </div>

          <div className="space-y-4">
            <input
              className="input text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              onChange={onFile}
            />

            {preview && (
              <div className="relative inline-block rounded-2xl overflow-hidden border border-slate-200 shadow-sm p-1 bg-slate-50">
                <img src={preview} alt="Slip preview" className="max-h-72 rounded-xl object-contain" />
                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setPreview('')
                  }}
                  className="absolute top-3 right-3 rounded-full bg-slate-900/80 p-1.5 text-white hover:bg-slate-900 transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            <label className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80 text-xs text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                className="mt-0.5 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                checked={confirmPay}
                onChange={(e) => setConfirmPay(e.target.checked)}
              />
              <span>
                ข้าพเจ้ายืนยันว่าได้ชำระเงินตามยอด <strong>{formatTHB(payment.amount)}</strong> ถูกต้องครบถ้วนแล้ว และเข้าใจว่าสลิปนี้จะต้องผ่านการตรวจสอบโดย Super Admin ก่อนที่ QR Ticket จะออกอย่างสมบูรณ์
              </span>
            </label>

            <button
              className="btn-primary w-full sm:w-auto px-8 py-3 text-xs font-bold gap-2"
              type="button"
              disabled={isSubmitting}
              onClick={send}
            >
              <FileCheck2 className="h-4 w-4" /> {isSubmitting ? 'กำลังส่งหลักฐาน...' : 'ส่งหลักฐานการชำระเงิน'}
            </button>
          </div>
        </div>
      )}

      {/* Slip History */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2">
          <FileText className="h-4 w-4 text-slate-500" />
          <span>ประวัติสลิปที่แนบในรายการนี้ ({slips.length})</span>
        </h3>

        {slips.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีประวัติการส่งสลิปในรายการนี้</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {slips.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-slate-800">{s.fileName || 'slip.jpg'}</p>
                    <p className="text-slate-400 text-[11px] mt-0.5">{fmt(s.submittedAt)}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    s.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                    s.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {s.status}
                  </span>
                </div>

                {s.rejectionReason && (
                  <p className="text-red-600 bg-red-50 p-2 rounded-lg text-[11px]">
                    เหตุผล: {s.rejectionReason}
                  </p>
                )}

                {slipUrls[s.id] ? (
                  <div className="rounded-xl overflow-hidden border border-slate-200 mt-2 bg-white">
                    <img src={slipUrls[s.id]} alt="Slip" className="max-h-56 w-full object-contain p-1" />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-slate-400 text-[11px]">
                    ภาพจัดเก็บใน Local IndexedDB ของเบราว์เซอร์นี้
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
