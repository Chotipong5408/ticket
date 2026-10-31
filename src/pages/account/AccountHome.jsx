import { Link } from 'react-router-dom'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { walletSummary } from '../../services/tokenService'
import { ordersRepo, ticketsRepo } from '../../repositories'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import {
  User,
  Wallet,
  ShoppingCart,
  Ticket,
  History,
  Shirt,
  ArrowRight,
  Sparkles,
  QrCode,
  ScanLine,
  LayoutDashboard
} from 'lucide-react'

const navCards = [
  {
    to: '/account/tickets',
    title: 'QR Ticket ของฉัน',
    desc: 'ดูและดาวน์โหลดบัตรเข้างานดิจิทัลสำหรับสแกนเข้างาน',
    icon: Ticket,
    color: 'from-blue-500 to-indigo-600',
  },
  {
    to: '/account/wallet',
    title: 'Token Wallet',
    desc: 'ตรวจยอดคงเหลือ โบนัส และแสดง QR สำหรับเติมเงิน',
    icon: Wallet,
    color: 'from-amber-500 to-orange-600',
  },
  {
    to: '/account/orders',
    title: 'คำสั่งซื้อและสลิป',
    desc: 'ติดตามสถานะคำสั่งซื้อ แนบสลิป และประวัติการชำระ',
    icon: ShoppingCart,
    color: 'from-emerald-500 to-teal-600',
  },
  {
    to: '/account/merchandise',
    title: 'เสื้อที่ระลึกที่สั่งซื้อ',
    desc: 'ตรวจสอบรายการเสื้อ ไซส์ และสถานะการจัดส่งพัสดุ',
    icon: Shirt,
    color: 'from-purple-500 to-pink-600',
  },
  {
    to: '/account/transactions',
    title: 'ประวัติธุรกรรม Token',
    desc: 'ดูบันทึกการรับโบนัส เติมเงิน และการใช้จ่ายที่ร้านค้า',
    icon: History,
    color: 'from-cyan-500 to-blue-600',
  },
  {
    to: '/account/profile',
    title: 'ข้อมูลส่วนตัว',
    desc: 'ตรวจสอบและแก้ไขข้อมูลศิษย์เก่า รุ่น คณะ สาขา',
    icon: User,
    color: 'from-slate-600 to-slate-800',
  },
]

export default function AccountHome() {
  useLiveData()
  const { user } = useAuth()
  const wallet = walletSummary(user.id)
  const orders = ordersRepo.byBuyer(user.id)
  const tickets = ticketsRepo.byBuyer(user.id)
  const issuedTickets = tickets.filter((t) => t.status === 'issued' || t.status === 'used')

  return (
    <div className="space-y-8">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-md text-white text-2xl font-black border border-white/20 shadow-inner">
              {user.fullName?.charAt(0) || 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                  สวัสดี, {user.fullName}
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-brand-100/90 mt-1">
                ศิษย์เก่าเข้าเรียนปี พ.ศ. {user.enrollmentYearBE || '-'} · {user.faculty || '-'} ({user.major || '-'})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/scan-payment"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-brand-700 text-xs font-bold px-4 py-2.5 shadow hover:bg-brand-50 transition"
            >
              <ScanLine className="h-4 w-4" /> สแกนจ่ายร้านค้า
            </Link>
            <Link
              to="/tickets"
              className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold px-4 py-2.5 border border-white/20 backdrop-blur-sm transition"
            >
              <Ticket className="h-4 w-4" /> ซื้อบัตรเพิ่ม
            </Link>
          </div>
        </div>
      </div>

      <PageHeader
        title="ภาพรวมบัญชีของฉัน"
        subtitle="ตรวจสอบข้อมูล Token, บัตรเข้างาน และสถานะคำสั่งซื้อที่อัปเดตแบบ Real-time"
        icon={LayoutDashboard}
      />

      {/* KPI Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Token Card */}
        <Link
          to="/account/wallet"
          className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Token คงเหลือ</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 border border-amber-200/60 group-hover:scale-110 transition-transform">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{formatToken(wallet.balance)}</p>
            <p className="text-xs text-amber-600 font-medium mt-1 flex items-center gap-1">
              เข้าสู่ Wallet เพื่อดูรายละเอียด <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>

        {/* Orders Card */}
        <Link
          to="/account/orders"
          className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">คำสั่งซื้อทั้งหมด</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 group-hover:scale-110 transition-transform">
              <ShoppingCart className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{orders.length} <span className="text-sm font-normal text-slate-400">รายการ</span></p>
            <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1">
              ดูสถานะและแนบสลิป <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>

        {/* Tickets Card */}
        <Link
          to="/account/tickets"
          className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">บัตรที่ออกแล้ว</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/60 group-hover:scale-110 transition-transform">
              <Ticket className="h-5 w-5" />
            </div>
          </div>
          <div>
            <p className="text-3xl font-black text-slate-900 tracking-tight">{issuedTickets.length} <span className="text-sm font-normal text-slate-400">ใบ</span></p>
            <p className="text-xs text-brand-600 font-medium mt-1 flex items-center gap-1">
              เปิด QR Ticket สำหรับเข้างาน <ArrowRight className="h-3 w-3" />
            </p>
          </div>
        </Link>
      </div>

      {/* Nav Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          เมนูการจัดการบัญชี
        </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((c) => {
            const Icon = c.icon
            return (
              <Link
                key={c.to}
                to={c.to}
                className="group rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md hover:border-brand-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className={`mb-3 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr ${c.color} text-white shadow-sm group-hover:scale-105 transition-transform`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-slate-800 text-sm group-hover:text-brand-600 transition-colors">
                    {c.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    {c.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
