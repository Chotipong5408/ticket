import { PageHeader } from '../../components/ui/PageHeader'
import { merchOrdersRepo, paymentsRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { formatTHB } from '../../lib/money'
import { PAYMENT_LABELS } from '../../data/labels'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { useLiveData } from '../../hooks/useLiveData'
import { Shirt, Package, Truck, MapPin, User, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyMerchandise() {
  useLiveData()
  const { user } = useAuth()
  const rows = merchOrdersRepo.all().filter((m) => m.userId === user.id)

  return (
    <div className="space-y-6">
      <PageHeader
        title="เสื้อที่ระลึกของฉัน"
        subtitle="ตรวจสอบรายการเสื้อ ไซส์ และสถานะการจัดส่งพัสดุ"
        icon={Shirt}
        actions={
          <Link to="/merchandise" className="btn-primary text-xs gap-1.5">
            <Shirt className="h-4 w-4" /> สั่งซื้อเสื้อเพิ่ม
          </Link>
        }
      />

      {rows.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Shirt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700">ยังไม่มีรายการสั่งซื้อเสื้อ</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">สั่งซื้อเสื้อที่ระลึกงานเลี้ยงรุ่น 2026 มีให้เลือกหลากหลายไซส์</p>
          <Link to="/merchandise" className="btn-primary text-xs">
            เลือกดูเสื้อที่ระลึก
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {rows.map((m) => {
            const pay = paymentsRepo.findByOrder(m.orderId)
            const isDelivery = m.shippingMethod === 'delivery'

            return (
              <div
                key={m.id}
                className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-xs text-slate-400 font-mono">Order: {m.orderId}</span>
                    </div>
                    <StatusBadge status={pay?.status} label={PAYMENT_LABELS[pay?.status]} />
                  </div>

                  <div className="mt-3 space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">รายการเสื้อ:</p>
                    {m.items.map((i, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{i.name}</span>
                          <span className="ml-2 rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700">
                            ไซส์ {i.size}
                          </span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {i.quantity} ตัว · {formatTHB(i.unitPrice * i.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery / Pickup Info */}
                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      {isDelivery ? <Truck className="h-4 w-4 text-brand-600" /> : <Package className="h-4 w-4 text-brand-600" />}
                      <span>วิธีรับสินค้า: {isDelivery ? 'จัดส่งพัสดุด่วนตามที่อยู่' : 'รับเสื้อภายในงาน'}</span>
                    </div>

                    {isDelivery && (
                      <div className="rounded-xl bg-slate-50 p-3 text-slate-600 space-y-1 text-[11px]">
                        <p className="font-semibold text-slate-800">ผู้รับ: {m.recipientName} ({m.phone})</p>
                        <p>{m.address} {m.province} {m.postalCode}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400">สถานะจัดส่ง:</span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 font-bold text-slate-700">
                    {m.fulfillmentStatus || 'รอจัดเตรียม'}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
