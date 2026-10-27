import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../data/permissions'
import {
  GraduationCap, LayoutDashboard, Users, Ticket, ShoppingCart, CreditCard,
  ShieldCheck, Store, Coins, ScanLine, BarChart3, FileText, Settings,
  User, Wallet, History, Shirt, QrCode, LogOut, Menu, X, ChevronDown,
  Package, BadgeCheck, CircleDollarSign
} from 'lucide-react'

const NAV = {
  user: [
    { label: 'หน้าหลัก', to: '/account', icon: User },
    { label: 'ข้อมูลส่วนตัว', to: '/account/profile', icon: User },
    { label: 'คำสั่งซื้อ', to: '/account/orders', icon: ShoppingCart },
    { label: 'บัตรของฉัน', to: '/account/tickets', icon: Ticket },
    { label: 'Wallet', to: '/account/wallet', icon: Wallet },
    { label: 'ประวัติ Token', to: '/account/transactions', icon: History },
    { label: 'เสื้อของฉัน', to: '/account/merchandise', icon: Shirt },
  ],
  super_admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'ผู้ใช้', to: '/admin/users', icon: Users },
    { label: 'ประเภทบัตร', to: '/admin/tickets', icon: Ticket },
    { label: 'คำสั่งซื้อ', to: '/admin/orders', icon: ShoppingCart },
    { label: 'ตรวจสอบชำระเงิน', to: '/admin/payment-verification', icon: ShieldCheck },
    { label: 'รายการชำระเงิน', to: '/admin/payments', icon: CreditCard },
    { label: 'เสื้อ/สินค้า', to: '/admin/merchandise', icon: Shirt },
    { label: 'ร้านค้า', to: '/admin/stores', icon: Store },
    { label: 'จัดการ Admin', to: '/admin/admins', icon: Users },
    { label: 'สิทธิ์', to: '/admin/permissions', icon: BadgeCheck },
    { label: 'ตั้งค่า Token', to: '/admin/token-settings', icon: Coins },
    { label: 'Check-in', to: '/admin/checkin', icon: ScanLine },
    { label: 'รายงาน', to: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Log', to: '/admin/audit-logs', icon: FileText },
    { label: 'ตั้งค่าระบบ', to: '/admin/settings', icon: Settings },
  ],
  token_admin: [
    { label: 'Dashboard', to: '/token-admin/dashboard', icon: LayoutDashboard },
    { label: 'เติม Token', to: '/token-admin/topup', icon: CircleDollarSign },
    { label: 'ประวัติธุรกรรม', to: '/token-admin/transactions', icon: History },
    { label: 'สแกน QR', to: '/token-admin/scan', icon: ScanLine },
  ],
  store_admin: [
    { label: 'Dashboard', to: '/store/dashboard', icon: LayoutDashboard },
    { label: 'สินค้า', to: '/store/product', icon: Package },
    { label: 'สร้าง QR ขาย', to: '/store/payment-requests', icon: QrCode },
    { label: 'สแกนชำระ', to: '/store/scan-payment', icon: ScanLine },
    { label: 'ธุรกรรม', to: '/store/transactions', icon: History },
    { label: 'รายงาน', to: '/store/reports', icon: BarChart3 },
  ],
}

function SidebarLinks({ items, pathname, onClick }) {
  return items.map((item) => {
    const Icon = item.icon
    const active = pathname === item.to
    return (
      <Link
        key={item.to}
        to={item.to}
        onClick={onClick}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          active
            ? 'bg-brand-600 text-white shadow-sm'
            : 'text-slate-600 hover:bg-slate-100 hover:text-brand-700'
        }`}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {item.label}
      </Link>
    )
  })
}

export default function AppLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const nav = useNavigate()
  const [open, setOpen] = useState(false)

  const role = user?.role || 'user'
  const roleItems = NAV[role] || []
  const accountItems = role !== 'user' ? NAV.user : []

  const handleLogout = () => {
    logout()
    nav('/login')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar overlay mobile */}
      {open && <div className="fixed inset-0 z-40 bg-black/30 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white border-r border-slate-200 transition-transform lg:relative lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-4">
            <GraduationCap className="h-6 w-6 text-brand-600" />
            <span className="font-bold text-brand-800">เลี้ยงรุ่น 2026</span>
            <button className="ml-auto lg:hidden" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
            {role !== 'user' && (
              <>
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase">{ROLE_LABELS[role]}</p>
                <SidebarLinks items={roleItems} pathname={location.pathname} onClick={() => setOpen(false)} />
                <hr className="my-3 border-slate-200" />
                <p className="px-3 pt-2 pb-1 text-xs font-semibold text-slate-400 uppercase">บัญชีของฉัน</p>
                <SidebarLinks items={accountItems} pathname={location.pathname} onClick={() => setOpen(false)} />
              </>
            )}
            {role === 'user' && (
              <SidebarLinks items={NAV.user} pathname={location.pathname} onClick={() => setOpen(false)} />
            )}
          </nav>
          <div className="border-t border-slate-200 p-3">
            <Link to="/tickets" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition">
              <Ticket className="h-4 w-4" /> ซื้อบัตร
            </Link>
            <Link to="/merchandise" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 transition">
              <Shirt className="h-4 w-4" /> เสื้อที่ระลึก
            </Link>
            <button onClick={handleLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition">
              <LogOut className="h-4 w-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200 bg-white/80 backdrop-blur px-4 py-3">
          <button className="lg:hidden" onClick={() => setOpen(true)}><Menu className="h-5 w-5" /></button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <User className="h-4 w-4" />
            <span className="font-medium">{user?.fullName}</span>
            <span className="rounded bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{ROLE_LABELS[role]}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
        <footer className="border-t border-slate-200 bg-white px-4 py-3 text-center text-xs text-slate-400">
          ระบบ Demo — ข้อมูลจัดเก็บใน Browser เท่านั้น
        </footer>
      </div>
    </div>
  )
}
