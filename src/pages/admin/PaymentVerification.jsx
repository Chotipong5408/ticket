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
    return paymentsRepo.all().map((p) => {
      const order = ordersRepo.findById(p.orderId)
      const buyer = usersRepo.findById(order?.buyerId)
      return { ...p, order, buyerName: buyer?.fullName, email: buyer?.email }
    }).filter((r) => {
      if (status && r.status !== status) return false
      if (!inDateRange(r.createdAt, from, to)) return false
      const query = q.trim().toLowerCase()
      if (!query) return true
      return [r.id, r.orderId, r.buyerName, r.email].some((x) => String(x || '').toLowerCase().includes(query))
    })
  }, [tick, status, from, to, q])

  useEffect(() => {
    if (!current) return
    const slips = slipsRepo.byPayment(current.id)
    Promise.all(slips.map(async (s) => {
      if (s.demoPlaceholder) return [s.id, makePlaceholderSlipDataUrl(s.fileName, current.amount)]
      return [s.id, await getSlipBlobUrl(s.storageKey)]
    })).then((pairs) => setUrls(Object.fromEntries(pairs.filter((x) => x[1]))))
  }, [current, tick])

  async function doApprove() {
    try {
      await approvePayment(user, current.id, 'ตรวจสอบยอด วันเวลา และยืนยันเงินเข้าด้วยตนเองแล้ว')
      toast.push('อนุมัติแล้ว ออก Ticket และ Token โบนัสแล้ว', 'success')
      setConfirm(false)
      setCurrent(null)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  function doReject() {
    try {
      rejectPayment(user, current.id, reason)
      toast.push('ปฏิเสธหลักฐานแล้ว', 'success')
      setCurrent(null)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div>
      <PageHeader title="ตรวจสอบการชำระเงิน" subtitle="ภาพสลิปไม่ถือว่าเงินเข้าแล้ว ต้องอนุมัติด้วยตนเองหลังตรวจบัญชีจริง" />
      <div className="mb-3 grid gap-2 md:grid-cols-4">
        <input className="input" placeholder="Order / ชื่อ / อีเมล" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">ทุกสถานะ</option>
          {Object.entries(PAYMENT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input className="input" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className="input" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      </div>
      <DataTable
        rows={rows}
        searchKeys={[]}
        columns={[
          { key: 'orderId', header: 'Order' },
          { key: 'buyerName', header: 'ผู้ซื้อ' },
          { key: 'email', header: 'อีเมล' },
          { key: 'amount', header: 'ยอด', render: (r) => formatTHB(r.amount) },
          { key: 'status', header: 'สถานะ', render: (r) => <StatusBadge status={r.status} label={PAYMENT_LABELS[r.status]} /> },
          { key: 'createdAt', header: 'วันที่', render: (r) => formatDateTime(r.createdAt) },
          { key: 'a', header: '', render: (r) => <button className="btn-primary" type="button" onClick={() => { setCurrent(r); setReason('') }}>เปิด</button> },
        ]}
      />
      <Modal open={!!current} title="รายละเอียดการชำระเงิน" onClose={() => setCurrent(null)}>
        {current ? (
          <div className="space-y-3 text-sm">
            <p>Order {current.orderId} · {formatTHB(current.amount)}</p>
            <p>{current.buyerName} · {current.email}</p>
            <div>
              {(current.order?.items || []).map((i, n) => <p key={n}>{i.name} {i.size || ''} × {i.quantity}</p>)}
            </div>
            {slipsRepo.byPayment(current.id).map((s) => (
              <div key={s.id}>
                <p>สลิป {s.fileName} · {formatDateTime(s.submittedAt)}</p>
                {urls[s.id] ? <img src={urls[s.id]} alt="slip" className="max-h-80 rounded border" /> : <p>ไม่มีภาพในเบราว์เซอร์นี้ (สลิป seed เป็นตัวอย่าง)</p>}
              </div>
            ))}
            <div>
              {reviewsRepo.all().filter((r) => r.paymentId === current.id).map((r) => (
                <p key={r.id}>{r.action} โดย {r.adminId} · {r.reason}</p>
              ))}
            </div>
            {current.status !== 'approved' && current.status !== 'cancelled' ? (
              <>
                <textarea className="input" rows={3} placeholder="เหตุผลเมื่อปฏิเสธ" value={reason} onChange={(e) => setReason(e.target.value)} />
                <div className="flex gap-2">
                  <button className="btn-success" type="button" onClick={() => setConfirm(true)}>Approve Payment</button>
                  <button className="btn-danger" type="button" onClick={doReject}>Reject Payment</button>
                </div>
              </>
            ) : null}
          </div>
        ) : null}
      </Modal>
      <ConfirmDialog
        open={confirm}
        title="ยืนยันการอนุมัติ"
        message="คุณได้ตรวจสอบยอดเงิน วันเวลา และยืนยันว่าเงินเข้าบัญชีจริงแล้วหรือไม่ ระบบจะออก QR Ticket และเพิ่ม Token โบนัสทันที"
        confirmLabel="อนุมัติและออกบัตร"
        onClose={() => setConfirm(false)}
        onConfirm={doApprove}
      />
    </div>
  )
}
