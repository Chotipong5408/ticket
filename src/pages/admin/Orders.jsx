import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ordersRepo, usersRepo } from '../../repositories'
import { PAYMENT_LABELS } from '../../data/labels'
import { formatTHB } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { useLiveData } from '../../hooks/useLiveData'
import { ShoppingCart, Eye, CreditCard } from 'lucide-react'

export default function AdminOrders() {
  useLiveData()
  const rows = ordersRepo.all().map((o) => {
    const buyer = usersRepo.findById(o.buyerId)
    return {
      ...o,
      buyerName: buyer?.fullName || 'ไม่ระบุชื่อ',
      email: buyer?.email || '',
    }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำสั่งซื้อทั้งหมดในระบบ"
        subtitle={`รวมทั้งสิ้น ${rows.length} รายการ สามารถตรวจสอบยอดเงิน แนบสลิป และพิจารณาอนุมัติ`}
        icon={ShoppingCart}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={['id', 'buyerName', 'email', 'status']}
          columns={[
            {
              key: 'id',
              header: 'Order ID',
              render: (r) => <span className="font-mono text-xs font-bold text-slate-800">{r.id}</span>,
            },
            {
              key: 'buyerName',
              header: 'ผู้สั่งซื้อ',
              render: (r) => (
                <div>
                  <p className="font-bold text-slate-800 text-xs">{r.buyerName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                </div>
              ),
            },
            {
              key: 'totalAmount',
              header: 'ยอดเงินรวม',
              render: (r) => <span className="font-extrabold text-slate-900 text-sm">{formatTHB(r.totalAmount)}</span>,
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
              key: 'actions',
              header: 'จัดการ',
              render: (r) => (
                <Link
                  className="btn-secondary text-xs py-1.5 px-3 gap-1"
                  to={`/admin/payment-verification?order=${r.id}`}
                >
                  <Eye className="h-3.5 w-3.5" /> ตรวจสอบสลิป
                </Link>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
