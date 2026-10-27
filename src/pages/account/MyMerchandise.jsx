import { PageHeader } from '../../components/ui/PageHeader'
import { merchOrdersRepo, paymentsRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { formatTHB } from '../../lib/money'
import { PAYMENT_LABELS } from '../../data/labels'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useLiveData } from '../../hooks/useLiveData'

export default function MyMerchandise() {
  useLiveData()
  const { user } = useAuth()
  const rows = merchOrdersRepo.all().filter((m) => m.userId === user.id)
  return (
    <div>
      <PageHeader title="เสื้อของฉัน" />
      <div className="space-y-3">
        {rows.map((m) => {
          const pay = paymentsRepo.findByOrder(m.orderId)
          return (
            <div key={m.id} className="card text-sm">
              <div className="flex justify-between"><span>Order {m.orderId}</span><StatusBadge status={pay?.status} label={PAYMENT_LABELS[pay?.status]} /></div>
              {m.items.map((i, idx) => <p key={idx}>{i.name} {i.size} × {i.quantity} = {formatTHB(i.unitPrice * i.quantity)}</p>)}
              <p>วิธีรับ: {m.shippingMethod === 'delivery' ? 'จัดส่ง' : 'รับภายในงาน'}</p>
              <p>ผู้รับ {m.recipientName} {m.phone} {m.address} {m.province} {m.postalCode}</p>
              <p>สถานะจัดส่ง: {m.fulfillmentStatus}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
