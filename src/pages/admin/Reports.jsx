import { useMemo, useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import {
  ordersRepo,
  paymentsRepo,
  ticketsRepo,
  tokensRepo,
  storesRepo,
  requestsRepo,
  checkinsRepo,
  usersRepo,
} from '../../repositories'
import { exportGenericCsv, exportMerchandiseCsv } from '../../services/reportService'
import { formatTHB, formatToken } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { BarChart3, Download, TrendingUp, CreditCard, Ticket, Store, ScanLine, Coins } from 'lucide-react'

export default function AdminReports() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [tab, setTab] = useState('tickets')

  const ticketData = useMemo(() => {
    const map = {}
    ticketsRepo
      .all()
      .filter((t) => t.status === 'issued' || t.status === 'used')
      .forEach((t) => {
        map[t.name] = (map[t.name] || 0) + t.price
      })
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }, [])

  const storeData = storesRepo.all().map((s) => ({
    name: s.name,
    value: requestsRepo
      .byStore(s.id)
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.amountToken, 0),
  }))

  function dump(name, rows, type) {
    try {
      exportGenericCsv(user, name, rows, type)
      toast.push(`ส่งออกไฟล์ ${name} สำเร็จแล้ว`, 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const tabLabels = {
    tickets: 'ยอดขายบัตร (บาท)',
    payments: 'สถานะการชำระเงิน',
    tokens: 'สถิติ Token',
    stores: 'ยอดขายร้านค้า (Token)',
    checkin: 'การเข้างาน (Check-in)',
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="รายงานสรุปและส่งออกข้อมูล (Reports & CSV)"
        subtitle="วิเคราะห์ยอดขายบัตร รายได้ธนาคาร การหมุนเวียนของ Token ในร้านค้า และการ Check-in หน้างาน"
        icon={BarChart3}
      />

      {/* Report Chart Card */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {['tickets', 'stores'].map((t) => (
              <button
                key={t}
                className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                  tab === t
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                type="button"
                onClick={() => setTab(t)}
              >
                {tabLabels[t]}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium">กราฟิกแสดงผลจำแนกตามหมวดหมู่</span>
        </div>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={tab === 'stores' ? storeData : ticketData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '1rem',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* CSV Export Button Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Download className="h-4 w-4 text-brand-600" />
          <span>ดาวน์โหลดรายงานสรุปแยกตามประเภท (Export CSV)</span>
        </h3>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() =>
              dump(
                'ticket-sales.csv',
                ticketsRepo.all().map((t) => ({ Ticket: t.id, ประเภท: t.name, สถานะ: t.status, ราคา: t.price })),
                'ticket'
              )
            }
          >
            CSV ข้อมูลบัตร
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() =>
              dump(
                'payments.csv',
                paymentsRepo.all().map((p) => ({ Payment: p.id, Order: p.orderId, สถานะ: p.status, ยอด: p.amount })),
                'payment'
              )
            }
          >
            CSV ชำระเงินทั้งหมด
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() =>
              dump(
                'pending.csv',
                paymentsRepo
                  .all()
                  .filter((p) => p.status === 'pending_verification')
                  .map((p) => ({ Order: p.orderId, ยอด: p.amount })),
                'payment'
              )
            }
          >
            CSV สลิปรอตรวจสอบ
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() =>
              dump(
                'rejected.csv',
                paymentsRepo
                  .all()
                  .filter((p) => p.status === 'rejected')
                  .map((p) => ({ Order: p.orderId, เหตุผล: p.rejectionReason })),
                'payment'
              )
            }
          >
            CSV สลิปถูกปฏิเสธ
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() => {
              try {
                exportMerchandiseCsv(user)
                toast.push('ส่งออก CSV เสื้อสำเร็จแล้ว', 'success')
              } catch (e) {
                toast.push(e.message, 'error')
              }
            }}
          >
            CSV รายการเสื้อ
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() =>
              dump(
                'tokens.csv',
                tokensRepo.all().map((t) => ({ id: t.id, user: t.userId, type: t.type, amount: t.amount })),
                'token'
              )
            }
          >
            CSV ประวัติ Token
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() => dump('stores.csv', storeData, 'store')}
          >
            CSV ยอดขายร้านค้า
          </button>
          <button
            className="btn-secondary text-xs"
            type="button"
            onClick={() => dump('checkins.csv', checkinsRepo.all(), 'checkin')}
          >
            CSV ประวัติเข้างาน
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-brand-600" />
            <span>สรุปตามสถานะการชำระเงิน</span>
          </h2>
          <div className="space-y-2 text-xs">
            {['awaiting_payment', 'pending_verification', 'approved', 'rejected'].map((s) => {
              const list = paymentsRepo.all().filter((p) => p.status === s)
              const sum = list.reduce((a, p) => a + p.amount, 0)
              return (
                <div key={s} className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-600">{s}</span>
                  <span className="font-bold text-slate-800">
                    {list.length} รายการ · {formatTHB(sum)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
          <h2 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ScanLine className="h-4 w-4 text-emerald-600" />
            <span>สถิติผู้เข้าร่วมและระบบ</span>
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">สแกน Check-in ทั้งหมด</span>
              <span className="font-bold text-slate-800">{checkinsRepo.all().length} ครั้ง</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-600">ผู้ใช้ที่ลงทะเบียนในระบบ</span>
              <span className="font-bold text-slate-800">{usersRepo.all().length} ท่าน</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-slate-600">คำสั่งซื้อในระบบทั้งหมด</span>
              <span className="font-bold text-slate-800">{ordersRepo.all().length} รายการ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
