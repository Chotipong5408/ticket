import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { DataTable } from '../../components/ui/DataTable'
import { PAYMENT_LABELS } from '../../data/labels'
import { formatTHB } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { ordersRepo, paymentsRepo, slipsRepo } from '../../repositories'
import { cancelUnpaidOrder } from '../../services/orderService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { ShoppingCart, CreditCard, XCircle, ArrowRight, FileText } from 'lucide-react'

export default function Orders() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const rows = ordersRepo.byBuyer(user.id).map((o) => ({
    ...o,
    payment: paymentsRepo.findByOrder(o.id),
    slips: slipsRepo.byPayment(o.paymentId).length,
  }))

  const handleCancel = (orderId) => {
    try {
      cancelUnpaidOrder(user, orderId)
      toast.push('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติคำสั่งซื้อของฉัน"
        subtitle="ตรวจสอบสถานะการชำระเงิน แนบสลิปโอนเงิน หรือยกเลิกคำสั่งซื้อที่ยังไม่ได้ชำระ"
        icon={ShoppingCart}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={['id', 'status']}
          columns={[
            {
              key: 'id',
              header: 'Order ID',
              render: (r) => <span className="font-mono text-xs font-bold text-slate-800">{r.id}</span>,
            },
            {
              key: 'totalAmount',
              header: 'ยอดเงิน',
              render: (r) => <span className="font-bold text-slate-900">{formatTHB(r.totalAmount)}</span>,
            },
            {
              key: 'status',
              header: 'สถานะ',
              render: (r) => <StatusBadge status={r.status} label={PAYMENT_LABELS[r.status]} />,
            },
            {
              key: 'createdAt',
              header: 'วันที่สั่งซื้อ',
              render: (r) => <span className="text-xs text-slate-500">{formatDateTime(r.createdAt)}</span>,
            },
            {
              key: 'slips',
              header: 'สลิป',
              render: (r) => (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                  <FileText className="h-3 w-3" /> {r.slips} ใบ
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'จัดการ',
              render: (r) => (
                <div className="flex items-center gap-2">
                  <Link
                    to={`/payment/${r.paymentId}`}
                    className="btn-secondary text-xs py-1.5 px-3 gap-1"
                  >
                    <CreditCard className="h-3.5 w-3.5" /> ชำระเงิน/ดูสลิป
                  </Link>
                  {r.status === 'awaiting_payment' && (
                    <button
                      className="btn-danger text-xs py-1.5 px-2.5"
                      type="button"
                      onClick={() => handleCancel(r.id)}
                    >
                      ยกเลิก
                    </button>
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
