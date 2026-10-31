import { PageHeader } from '../../components/ui/PageHeader'
import { dashboardStats } from '../../services/reportService'
import { formatTHB, formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Ticket,
  Coins,
  Store,
  ScanLine,
  ShieldCheck,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowRight,
  TrendingUp,
  Shirt,
  Sparkles
} from 'lucide-react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  useLiveData()
  const s = dashboardStats()

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Super Admin Dashboard"
          subtitle="ศูนย์ควบคุมและรายงานสถิติแบบ Real-time คำนวณจากข้อมูลจริงในระบบ"
          icon={LayoutDashboard}
        />
        <div className="flex items-center gap-2">
          <Link to="/admin/payment-verification" className="btn-primary text-xs gap-1.5 shadow-sm">
            <ShieldCheck className="h-4 w-4" /> ตรวจสอบสลิป ({s.pendingVerification})
          </Link>
          <Link to="/admin/checkin" className="btn-secondary text-xs gap-1.5">
            <ScanLine className="h-4 w-4" /> สแกน Check-in
          </Link>
        </div>
      </div>

      {/* Top Level Highlight KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Bank Revenue */}
        <div className="rounded-3xl border border-brand-200 bg-gradient-to-br from-brand-600 to-indigo-700 p-6 text-white shadow-lg shadow-brand-500/15">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-100">รายได้รวมผ่านธนาคาร</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
          </div>
          <p className="text-3xl font-black tracking-tight">{formatTHB(s.bankRevenue)}</p>
          <p className="text-[11px] text-brand-200 mt-2">ยอดเงินโอนจริงที่ผ่านการอนุมัติแล้ว</p>
        </div>

        {/* Pending Verification */}
        <Link
          to="/admin/payment-verification"
          className="group rounded-3xl border border-amber-200 bg-amber-50/70 p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">รอตรวจสอบสลิป</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 group-hover:scale-105 transition-transform">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-amber-900">{s.pendingVerification} <span className="text-sm font-normal text-amber-700">รายการ</span></p>
            <p className="text-[11px] text-amber-700 font-semibold mt-2 flex items-center gap-1">
              เปิดตรวจสอบและอนุมัติ <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>

        {/* Approved Tickets */}
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">บัตรที่อนุมัติแล้ว</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-emerald-900">{s.ticketsApproved} <span className="text-sm font-normal text-emerald-700">ใบ</span></p>
            <p className="text-[11px] text-emerald-700 mt-2">จากที่สั่งซื้อทั้งหมด {s.ticketsSold} ใบ</p>
          </div>
        </div>

        {/* Checked In */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">ผู้เข้างาน (Check-in)</span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <ScanLine className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900">{s.checkedIn} <span className="text-sm font-normal text-slate-400">ท่าน</span></p>
            <p className="text-[11px] text-slate-400 mt-2">ยังไม่เข้างาน {s.unused} ใบ</p>
          </div>
        </div>
      </div>

      {/* Section 1: Financial & Revenue Breakdown */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <CreditCard className="h-4 w-4 text-brand-600" />
          <span>โครงสร้างรายได้เงินสด (ผ่านธนาคาร)</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">รายได้ค่าบัตรเข้างาน</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{formatTHB(s.ticketRevenue)}</p>
            <p className="text-[11px] text-slate-400 mt-1">ยอดสุทธิหลังอนุมัติ</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">รายได้ค่าเสื้อที่ระลึก</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{formatTHB(s.merchRevenue)}</p>
            <p className="text-[11px] text-slate-400 mt-1">รวมค่าสินค้าและการจัดส่ง</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">สลิปที่ถูกปฏิเสธ</p>
            <p className="text-2xl font-black text-red-600 mt-1">{s.rejected} <span className="text-xs font-normal text-slate-400">รายการ</span></p>
            <p className="text-[11px] text-slate-400 mt-1">สลิปไม่ตรงยอดหรือไม่ถูกต้อง</p>
          </div>
        </div>
      </div>

      {/* Section 2: Tokens & Stores */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Coins className="h-4 w-4 text-amber-500" />
          <span>ระบบ Token หมุนเวียน & ร้านค้าในงาน</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Token โบนัสที่แจก</p>
            <p className="text-xl font-bold text-emerald-700 mt-1">{formatToken(s.bonus)}</p>
            <p className="text-[11px] text-slate-400 mt-1">แถมพร้อมบัตรเข้างาน</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Token ที่เติมเพิ่มหน้างาน</p>
            <p className="text-xl font-bold text-blue-700 mt-1">{formatToken(s.topup)}</p>
            <p className="text-[11px] text-slate-400 mt-1">ผู้ใช้เติมเงินสด</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">Token ที่ใช้จ่ายแล้ว</p>
            <p className="text-xl font-bold text-amber-700 mt-1">{formatToken(s.spent)}</p>
            <p className="text-[11px] text-slate-400 mt-1">ยอดใช้จริงในร้านค้า</p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">ยอดขายร้านค้า ({s.stores} ร้าน)</p>
            <p className="text-xl font-bold text-slate-800 mt-1">{formatToken(s.storeSales)}</p>
            <p className="text-[11px] text-slate-400 mt-1">Token หมุนเวียนในงาน</p>
          </div>
        </div>
      </div>

      {/* Section 3: Users & Registration */}
      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Users className="h-4 w-4 text-brand-600" />
          <span>ข้อมูลผู้เข้าร่วมและการลงทะเบียน</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">ผู้ลงทะเบียนทั้งหมด</p>
            <p className="text-2xl font-black text-slate-800 mt-1">{s.registeredUsers} <span className="text-xs font-normal text-slate-400">ท่าน</span></p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">บัตรที่ยังไม่นำมาใช้</p>
            <p className="text-2xl font-black text-indigo-600 mt-1">{s.unused} <span className="text-xs font-normal text-slate-400">ใบ</span></p>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs text-slate-400 font-medium">อัตราการเข้างาน (Attendance)</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {s.ticketsApproved > 0 ? `${Math.round((s.checkedIn / s.ticketsApproved) * 100)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
