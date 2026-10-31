import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { paymentsRepo, ordersRepo, usersRepo, slipsRepo, reviewsRepo } from '../../repositories'
import { PAYMENT_LABELS } from '../../data/labels'
import { formatTHB } from '../../lib/money'
import { formatDateTime, inDateRange } from '../../lib/dates'
import { approvePayment, rejectPayment, getSlipBlobUrl, makePlaceholderSlipDataUrl } from '../../services/paymentService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { ShieldCheck, Search, Calendar, Filter, CheckCircle2, XCircle, FileText, AlertCircle, Eye } from 'lucide-react'

export default function PaymentVerification() {
  const tick = useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [params] = useSearchParams()
  const [status, setStatus] = useState('pending_verification')
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [q, setQ] = useState(params.get('order') || '')
  const [current, setCurrent] = useState(null)
  const [reason, setReason] = useState('')
  const [confirm, setConfirm] = useState(false)
  const [urls, setUrls] = useState({})

  const rows = useMemo(() => {
    return paymentsRepo
      .all()
      .map((p) => {
        const order = ordersRepo.findById(p.orderId)
        const buyer = usersRepo.findById(order?.buyerId)
        return { ...p, order, buyerName: buyer?.fullName, email: buyer?.email }
      })
      .filter((r) => {
        if (status && r.status !== status) return false
        if (!inDateRange(r.createdAt, from, to)) return false
        const query = q.trim().toLowerCase()
        if (!query) return true
        return [r.id, r.orderId, r.buyerName, r.email].some((x) =>
          String(x || '')
            .toLowerCase()
            .includes(query)
        )
      })
  }, [tick, status, from, to, q])

  useEffect(() => {
    if (!current) return
    const slips = slipsRepo.byPayment(current.id)
    Promise.all(
      slips.map(async (s) => {
        if (s.demoPlaceholder) return [s.id, makePlaceholderSlipDataUrl(s.fileName, current.amount)]
        return [s.id, await getSlipBlobUrl(s.storageKey)]
      })
    ).then((pairs) => setUrls(Object.fromEntries(pairs.filter((x) => x[1]))))
  }, [current, tick])

  async function doApprove() {
    try {
      await approvePayment(user, current.id, 'ตรวจสอบยอด วันเวลา และยืนยันเงินเข้าด้วยตนเองแล้ว')
      toast.push('อนุมัติเรียบร้อยแล้ว ออก QR Ticket และโอน Token โบนัสแล้ว', 'success')
      setConfirm(false)
      setCurrent(null)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  function doReject() {
    if (!reason.trim()) {
      toast.push('กรุณาระบุเหตุผลในการปฏิเสธ', 'error')
      return
    }
    try {
      rejectPayment(user, current.id, reason)
      toast.push('ปฏิเสธหลักฐานการชำระเงินแล้ว', 'success')
      setCurrent(null)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ตรวจสอบและอนุมัติการชำระเงิน"
        subtitle="ตรวจสอบภาพสลิปโอนเงิน ยอดเงิน วันเวลา และยืนยันการรับเงินเพื่อออก QR Ticket และแจก Token โบนัส"
        icon={ShieldCheck}
      />

      {/* Filter Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="ค้นหา Order ID / ชื่อ / อีเมล..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <select
            className="input text-xs"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">ทุกสถานะการชำระเงิน</option>
            {Object.entries(PAYMENT_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>

          <div className="relative">
            <input
              className="input text-xs"
              type="date"
              title="ตั้งแต่วันที่"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
            />
          </div>

          <div className="relative">
            <input
              className="input text-xs"
              type="date"
              title="ถึงวันที่"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={[]}
          columns={[
            {
              key: 'orderId',
              header: 'Order ID',
              render: (r) => <span className="font-mono text-xs font-bold text-slate-800">{r.orderId}</span>,
            },
            {
              key: 'buyerName',
              header: 'ผู้สั่งซื้อ',
              render: (r) => (
                <div>
                  <p className="font-bold text-slate-800 text-xs">{r.buyerName || '-'}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                </div>
              ),
            },
            {
              key: 'amount',
              header: 'ยอดเงิน',
              render: (r) => <span className="font-extrabold text-slate-900 text-sm">{formatTHB(r.amount)}</span>,
            },
            {
              key: 'status',
              header: 'สถานะ',
              render: (r) => <StatusBadge status={r.status} label={PAYMENT_LABELS[r.status]} />,
            },
            {
              key: 'createdAt',
              header: 'วันที่ทำรายการ',
              render: (r) => <span className="text-xs text-slate-500">{formatDateTime(r.createdAt)}</span>,
            },
            {
              key: 'actions',
              header: 'การจัดการ',
              render: (r) => (
                <button
                  className="btn-primary text-xs py-1.5 px-3 gap-1"
                  type="button"
                  onClick={() => {
                    setCurrent(r)
                    setReason('')
                  }}
                >
                  <Eye className="h-3.5 w-3.5" /> ตรวจสอบ
                </button>
              ),
            },
          ]}
        />
      </div>

      {/* Verification Modal */}
      <Modal open={!!current} title="ตรวจสอบหลักฐานการชำระเงิน" onClose={() => setCurrent(null)}>
        {current ? (
          <div className="space-y-4 text-xs text-slate-700">
            {/* Header pill */}
            <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[11px] text-slate-400">Order ID</span>
                  <p className="font-mono font-bold text-sm text-slate-800">{current.orderId}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400">ยอดที่ต้องชำระ</span>
                  <p className="text-xl font-black text-brand-700">{formatTHB(current.amount)}</p>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200/60 flex justify-between">
                <span>ผู้ซื้อ: <strong>{current.buyerName}</strong> ({current.email})</span>
                <StatusBadge status={current.status} label={PAYMENT_LABELS[current.status]} />
              </div>
            </div>

            {/* Items */}
            <div className="rounded-2xl border border-slate-200/80 p-4 space-y-1.5">
              <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500 mb-1">รายการสินค้าใน Order:</p>
              {(current.order?.items || []).map((i, n) => (
                <div key={n} className="flex justify-between py-0.5 border-b border-slate-100 last:border-0">
                  <span>{i.kind === 'ticket' ? '🎟️ บัตร' : '👕 เสื้อ'} {i.name} {i.size ? `(${i.size})` : ''}</span>
                  <span className="font-semibold text-slate-800">× {i.quantity}</span>
                </div>
              ))}
            </div>

            {/* Slip Previews */}
            <div className="space-y-3">
              <p className="font-bold uppercase tracking-wider text-[11px] text-slate-500">ภาพสลิปที่แนบ:</p>
              {slipsRepo.byPayment(current.id).length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-slate-400">
                  ผู้ซื้อยังไม่ได้แนบสลิป
                </div>
              ) : (
                slipsRepo.byPayment(current.id).map((s) => (
                  <div key={s.id} className="rounded-2xl border border-slate-200 p-3 bg-slate-50/50 space-y-2">
                    <div className="flex justify-between text-[11px] text-slate-500">
                      <span>{s.fileName}</span>
                      <span>{formatDateTime(s.submittedAt)}</span>
                    </div>
                    {urls[s.id] ? (
                      <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                        <img src={urls[s.id]} alt="Slip" className="max-h-80 w-full object-contain p-2" />
                      </div>
                    ) : (
                      <p className="text-center py-4 text-slate-400 text-[11px]">ภาพถูกบันทึกใน Local Browser</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Reviews history */}
            {reviewsRepo.all().filter((r) => r.paymentId === current.id).length > 0 && (
              <div className="rounded-xl bg-slate-50 p-3 text-[11px] space-y-1">
                <p className="font-bold text-slate-600">ประวัติการพิจารณา:</p>
                {reviewsRepo.all().filter((r) => r.paymentId === current.id).map((r) => (
                  <p key={r.id} className="text-slate-500">
                    • <strong>{r.action}</strong> โดย {r.adminId} เมื่อ {formatDateTime(r.createdAt)} ({r.reason || 'ไม่มีเหตุผลระบุ'})
                  </p>
                ))}
              </div>
            )}

            {/* Action buttons */}
            {current.status !== 'approved' && current.status !== 'cancelled' && (
              <div className="pt-3 border-t border-slate-100 space-y-3">
                <textarea
                  className="input text-xs"
                  rows={2}
                  placeholder="เหตุผลเมื่อต้องการปฏิเสธ เช่น สลิปไม่ชัดเจน, ยอดเงินไม่ตรง (จำเป็นต้องกรอกเมื่อปฏิเสธ)"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />

                <div className="flex items-center justify-end gap-2">
                  <button
                    className="btn-danger text-xs px-4 py-2"
                    type="button"
                    onClick={doReject}
                  >
                    <XCircle className="h-4 w-4" /> ปฏิเสธสลิป (Reject)
                  </button>
                  <button
                    className="btn-success text-xs px-5 py-2 font-bold"
                    type="button"
                    onClick={() => setConfirm(true)}
                  >
                    <CheckCircle2 className="h-4 w-4" /> อนุมัติการชำระเงิน (Approve)
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirm}
        title="ยืนยันการอนุมัติการชำระเงิน"
        message="คุณได้ตรวจสอบยอดเงิน วันเวลา และยืนยันว่าเงินโอนเข้าบัญชีจริงแล้วใช่หรือไม่? ระบบจะออก QR Ticket ให้ผู้ใช้และแจก Token โบนัสเข้า Wallet ทันที"
        confirmLabel="ยืนยันอนุมัติและออกบัตร"
        onClose={() => setConfirm(false)}
        onConfirm={doApprove}
      />
    </div>
  )
}
