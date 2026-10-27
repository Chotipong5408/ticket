import { PageHeader } from '../../components/ui/PageHeader'
import { dashboardStats } from '../../services/reportService'
import { formatTHB, formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminDashboard() {
  useLiveData()
  const s = dashboardStats()
  const cards = [
    ['ผู้ลงทะเบียน', s.registeredUsers],
    ['บัตรที่ขาย (รวมรอชำระ)', s.ticketsSold],
    ['บัตรที่อนุมัติแล้ว', s.ticketsApproved],
    ['รอตรวจสอบ', s.pendingVerification],
    ['ถูกปฏิเสธ', s.rejected],
    ['รายได้บัตร (ธนาคาร)', formatTHB(s.ticketRevenue)],
    ['รายได้เสื้อ (ธนาคาร)', formatTHB(s.merchRevenue)],
    ['รายได้รวมผ่านธนาคาร', formatTHB(s.bankRevenue)],
    ['Token โบนัสที่แจก', formatToken(s.bonus)],
    ['Token ที่เติมเพิ่ม', formatToken(s.topup)],
    ['Token ที่ใช้ไป', formatToken(s.spent)],
    ['จำนวนร้านค้า', s.stores],
    ['ยอดขายร้าน (Token ไม่นับเป็นรายได้ธนาคาร)', formatToken(s.storeSales)],
    ['ผู้เข้างาน', s.checkedIn],
    ['บัตรที่ยังไม่ใช้', s.unused],
  ]
  return (
    <div>
      <PageHeader title="Super Admin Dashboard" subtitle="ตัวเลขคำนวณจาก LocalStorage จริง แยกรายได้ธนาคารออกจากยอด Token ในร้าน" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(([k, v]) => (
          <div key={k} className="card">
            <p className="text-sm text-slate-500">{k}</p>
            <p className="mt-1 text-xl font-semibold">{v}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
