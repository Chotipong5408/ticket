import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { ordersRepo, usersRepo } from '../../repositories'
import { PAYMENT_LABELS } from '../../data/labels'
import { formatTHB } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminOrders() {
  useLiveData()
  const rows = ordersRepo.all().map((o) => ({ ...o, buyer: usersRepo.findById(o.buyerId)?.fullName }))
  return (
    <div>
      <PageHeader title="คำสั่งซื้อทั้งหมด" />
      <DataTable
        rows={rows}
        searchKeys={['id', 'buyer', 'status']}
        columns={[
          { key: 'id', header: 'Order ID' },
          { key: 'buyer', header: 'ผู้ซื้อ' },
          { key: 'totalAmount', header: 'ยอด', render: (r) => formatTHB(r.totalAmount) },
          { key: 'status', header: 'สถานะ', render: (r) => <StatusBadge status={r.status} label={PAYMENT_LABELS[r.status]} /> },
          { key: 'createdAt', header: 'วันที่', render: (r) => formatDateTime(r.createdAt) },
          { key: 'a', header: '', render: (r) => <Link className="btn-secondary" to={`/admin/payment-verification?order=${r.id}`}>ตรวจสอบ</Link> },
        ]}
      />
    </div>
  )
}
