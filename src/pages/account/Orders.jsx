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

export default function Orders() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const rows = ordersRepo.byBuyer(user.id).map((o) => ({ ...o, payment: paymentsRepo.findByOrder(o.id), slips: slipsRepo.byPayment(o.paymentId).length }))
  return (
    <div>
      <PageHeader title="คำสั่งซื้อของฉัน" />
      <DataTable
        rows={rows}
        searchKeys={['id', 'status']}
        columns={[
          { key: 'id', header: 'Order ID' },
          { key: 'totalAmount', header: 'ยอด', render: (r) => formatTHB(r.totalAmount) },
          { key: 'status', header: 'สถานะ', render: (r) => <StatusBadge status={r.status} label={PAYMENT_LABELS[r.status]} /> },
          { key: 'createdAt', header: 'วันที่', render: (r) => formatDateTime(r.createdAt) },
          { key: 'slips', header: 'สลิป' },
          { key: 'a', header: '', render: (r) => (
            <div className="flex gap-2">
              <Link className="btn-secondary" to={`/payment/${r.paymentId}`}>ชำระเงิน</Link>
              {r.status === 'awaiting_payment' ? (
                <button className="btn-danger" type="button" onClick={() => { try { cancelUnpaidOrder(user, r.id); toast.push('ยกเลิกแล้ว', 'success') } catch (e) { toast.push(e.message, 'error') } }}>ยกเลิก</button>
              ) : null}
            </div>
          ) },
        ]}
      />
    </div>
  )
}
