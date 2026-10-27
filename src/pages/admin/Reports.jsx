import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { ordersRepo, paymentsRepo, ticketsRepo, tokensRepo, storesRepo, requestsRepo, checkinsRepo, usersRepo } from '../../repositories'
import { exportGenericCsv, exportMerchandiseCsv } from '../../services/reportService'
import { formatTHB } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminReports() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('tickets')
  const ticketData = useMemo(() => {
    const map = {}
    ticketsRepo.all().filter((t) => t.status === 'issued' || t.status === 'used').forEach((t) => {
      map[t.name] = (map[t.name] || 0) + t.price
    })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [])
  const storeData = storesRepo.all().map((s) => ({
    name: s.name,
    value: requestsRepo.byStore(s.id).filter((r) => r.status === 'paid').reduce((sum, r) => sum + r.amountToken, 0),
  }))
  function dump(name, rows, type) {
    try { exportGenericCsv(user, name, rows, type) } catch (e) { toast.push(e.message, 'error') }
  }
  return (
    <div>
      <PageHeader title="รายงาน" subtitle="รายได้ธนาคารแยกจากยอด Token ในร้าน" />
      <div className="mb-4 flex flex-wrap gap-2">
        {['tickets', 'payments', 'tokens', 'stores', 'checkin'].map((t) => (
          <button key={t} className={tab === t ? 'btn-primary' : 'btn-secondary'} type="button" onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      <div className="card h-72">
        <ResponsiveContainer>
          <BarChart data={tab === 'stores' ? storeData : ticketData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#2563eb" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-secondary" type="button" onClick={() => dump('ticket-sales.csv', ticketsRepo.all().map((t) => ({ Ticket: t.id, ประเภท: t.name, สถานะ: t.status, ราคา: t.price })), 'ticket')}>CSV บัตร</button>
        <button className="btn-secondary" type="button" onClick={() => dump('payments.csv', paymentsRepo.all().map((p) => ({ Payment: p.id, Order: p.orderId, สถานะ: p.status, ยอด: p.amount })), 'payment')}>CSV ชำระเงิน</button>
        <button className="btn-secondary" type="button" onClick={() => dump('pending.csv', paymentsRepo.all().filter((p) => p.status === 'pending_verification').map((p) => ({ Order: p.orderId, ยอด: p.amount })), 'payment')}>CSV รอตรวจสอบ</button>
        <button className="btn-secondary" type="button" onClick={() => dump('rejected.csv', paymentsRepo.all().filter((p) => p.status === 'rejected').map((p) => ({ Order: p.orderId, เหตุผล: p.rejectionReason })), 'payment')}>CSV ปฏิเสธ</button>
        <button className="btn-secondary" type="button" onClick={() => { try { exportMerchandiseCsv(user) } catch (e) { toast.push(e.message, 'error') } }}>CSV เสื้อ</button>
        <button className="btn-secondary" type="button" onClick={() => dump('tokens.csv', tokensRepo.all().map((t) => ({ id: t.id, user: t.userId, type: t.type, amount: t.amount })), 'token')}>CSV Token</button>
        <button className="btn-secondary" type="button" onClick={() => dump('stores.csv', storeData, 'store')}>CSV ร้าน</button>
        <button className="btn-secondary" type="button" onClick={() => dump('checkins.csv', checkinsRepo.all(), 'checkin')}>CSV เข้างาน</button>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold">การชำระเงิน</h2>
          {['awaiting_payment', 'pending_verification', 'approved', 'rejected'].map((s) => (
            <p key={s}>{s}: {paymentsRepo.all().filter((p) => p.status === s).length} รายการ / {formatTHB(paymentsRepo.all().filter((p) => p.status === s).reduce((a, p) => a + p.amount, 0))}</p>
          ))}
        </div>
        <div className="card">
          <h2 className="font-semibold">เข้างาน</h2>
          <p>สแกนทั้งหมด {checkinsRepo.all().length}</p>
          <p>ผู้ใช้ในระบบ {usersRepo.all().length}</p>
          <p>คำสั่งซื้อ {ordersRepo.all().length}</p>
        </div>
      </div>
    </div>
  )
}
