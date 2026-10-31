import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ROLE_LABELS } from '../../data/permissions'
import {
  GraduationCap, LayoutDashboard, Users, Ticket, ShoppingCart, CreditCard,
  ShieldCheck, Store, Coins, ScanLine, BarChart3, FileText, Settings,
  User, Wallet, History, Shirt, QrCode, LogOut, Menu, X, ChevronRight,
  Package, BadgeCheck, CircleDollarSign, ArrowUpRight, Sparkles
} from 'lucide-react'

const NAV = {
  user: [
    { label: 'ภาพรวมบัญชี', to: '/account', icon: LayoutDashboard },
    { label: 'ซื้อบัตรเข้างาน', to: '/tickets', icon: Ticket, highlight: true, badge: 'สำคัญ' },
    { label: 'สั่งซื้อเสื้อที่ระลึก', to: '/merchandise', icon: Shirt, highlight: true, badge: 'รุ่น 2026' },
    { label: 'บัตรของฉัน (QR)', to: '/account/tickets', icon: QrCode },
    { label: 'คำสั่งซื้อ', to: '/account/orders', icon: ShoppingCart },
    { label: 'Token Wallet', to: '/account/wallet', icon: Wallet },
    { label: 'ประวัติ Token', to: '/account/transactions', icon: History },
    { label: 'เสื้อที่สั่งซื้อ', to: '/account/merchandise', icon: Package },
    { label: 'ข้อมูลส่วนตัว', to: '/account/profile', icon: User },
  ],
  super_admin: [
    { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'ผู้ใช้ทั้งหมด', to: '/admin/users', icon: Users },
    { label: 'ประเภทบัตร', to: '/admin/tickets', icon: Ticket },
    { label: 'คำสั่งซื้อ', to: '/admin/orders', icon: ShoppingCart },
    { label: 'ตรวจสอบชำระเงิน', to: '/admin/payment-verification', icon: ShieldCheck },
    { label: 'รายการชำระเงิน', to: '/admin/payments', icon: CreditCard },
    { label: 'เสื้อ / สินค้า', to: '/admin/merchandise', icon: Shirt },
    { label: 'ร้านค้าในงาน', to: '/admin/stores', icon: Store },
    { label: 'จัดการ Admin', to: '/admin/admins', icon: Users },
    { label: 'สิทธิ์ระบบ', to: '/admin/permissions', icon: BadgeCheck },
    { label: 'ตั้งค่า Token', to: '/admin/token-settings', icon: Coins },
    { label: 'Check-in หน้างาน', to: '/admin/checkin', icon: ScanLine },
    { label: 'รายงานยอดขาย', to: '/admin/reports', icon: BarChart3 },
    { label: 'Audit Logs', to: '/admin/audit-logs', icon: FileText },
    { label: 'ตั้งค่าระบบ', to: '/admin/settings', icon: Settings },
  ],
  token_admin: [
    { label: 'Dashboard', to: '/token-admin/dashboard', icon: LayoutDashboard },
    { label: 'เติม Token', to: '/token-admin/topup', icon: CircleDollarSign },
    { label: 'ประวัติธุรกรรม', to: '/token-admin/transactions', icon: History },
    { label: 'สแกน QR ผู้ใช้', to: '/token-admin/scan', icon: ScanLine },
  ],
  store_admin: [
    { label: 'Dashboard', to: '/store/dashboard', icon: LayoutDashboard },
    { label: 'จัดการสินค้า', to: '/store/product', icon: Package },
    { label: 'สร้าง QR ขาย', to: '/store/payment-requests', icon: QrCode },
    { label: 'สแกนรับชำระ', to: '/store/scan-payment', icon: ScanLine },
    { label: 'ประวัติธุรกรรม', to: '/store/transactions', icon: History },
    { label: 'รายงานร้านค้า', to: '/store/reports', icon: BarChart3 },
  ],
}

function SidebarLinks({ items, pathname, onClick }) {
  return (
    <div className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon
        const active = pathname === item.to
        const isHighlight = item.highlight

        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onClick}
            className={`group flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
              active
                ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm shadow-brand-500/20'
                : isHighlight
                  ? 'bg-brand-50/80 text-brand-900 border border-brand-200/80 hover:bg-brand-100 hover:text-brand-950 font-bold'
                  : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <Icon
                className={`h-4 w-4 shrink-0 transition-transform ${
                  active
                    ? 'text-white'
                    : isHighlight
                      ? 'text-brand-600 scale-110'
                      : 'text-slate-400 group-hover:text-brand-600'
                }`}
              />
              <span className="truncate">{item.label}</span>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {item.badge && !active && (
                <span className="rounded-full bg-brand-600 text-white px-2 py-0.5 text-[10px] font-bold shadow-xs">
                  {item.badge}
                </span>
              )}
              {active && <ChevronRight className="h-3.5 w-3.5 text-white/70 shrink-0" />}
            </div>
          </Link>
        )
      })}
    </div>
  )
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
    <div className="flex min-h-screen bg-slate-50/80">
      {/* Sidebar overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform bg-white border-r border-slate-200/80 shadow-xl lg:shadow-none transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo / Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-sm group-hover:scale-105 transition">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold text-slate-800 leading-tight block">เลี้ยงรุ่น 2026</span>
                <span className="text-[11px] text-slate-400 font-medium">ระบบลงทะเบียน & บัตร</span>
              </div>
            </Link>
            <button
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              onClick={() => setOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Prominent Featured CTA Card at Top of Sidebar */}
          <div className="px-4 pt-4 pb-2">
            <div className="rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-700 p-3.5 text-white shadow-md shadow-brand-500/20">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-brand-200 mb-2">
                <Sparkles className="h-3.5 w-3.5 text-amber-300" />
                <span>เปิดจองแล้ว</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/tickets"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center rounded-xl bg-white text-slate-900 p-2 text-center shadow-sm hover:bg-brand-50 transition group"
                >
                  <Ticket className="h-4 w-4 text-brand-600 group-hover:scale-110 transition-transform mb-1" />
                  <span className="font-extrabold text-[11px] leading-tight text-slate-800">ซื้อบัตร</span>
                  <span className="text-[9px] text-brand-600 font-semibold">เข้างาน</span>
                </Link>
                <Link
                  to="/merchandise"
                  onClick={() => setOpen(false)}
                  className="flex flex-col items-center justify-center rounded-xl bg-white/15 hover:bg-white/25 text-white p-2 text-center border border-white/20 backdrop-blur-sm transition group"
                >
                  <Shirt className="h-4 w-4 text-amber-300 group-hover:scale-110 transition-transform mb-1" />
                  <span className="font-extrabold text-[11px] leading-tight text-white">ซื้อเสื้อ</span>
                  <span className="text-[9px] text-brand-200 font-semibold">ที่ระลึก</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-4">
            {role !== 'user' && (
              <div>
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  {ROLE_LABELS[role]}
                </div>
                <SidebarLinks items={roleItems} pathname={location.pathname} onClick={() => setOpen(false)} />
                <div className="my-4 border-t border-slate-100" />
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  บัญชีผู้ใช้งาน
                </div>
                <SidebarLinks items={accountItems} pathname={location.pathname} onClick={() => setOpen(false)} />
              </div>
            )}
            {role === 'user' && (
              <div>
                <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  เมนูหลัก
                </div>
                <SidebarLinks items={NAV.user} pathname={location.pathname} onClick={() => setOpen(false)} />
              </div>
            )}
          </nav>

          {/* Bottom Logout Link */}
          <div className="border-t border-slate-100 p-4 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
            >
              <LogOut className="h-4 w-4" /> ออกจากระบบ
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header with Prominent Ticket & Merchandise Action Buttons */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/85 backdrop-blur-md px-4 md:px-8 py-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              onClick={() => setOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
              งานเลี้ยงรุ่นศิษย์เก่า 2026
            </span>
          </div>

          {/* Quick Header Call-to-Actions for Tickets & Merchandise */}
          <div className="flex items-center gap-2.5">
            <Link
              to="/tickets"
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-xs font-bold px-3.5 py-2 shadow-sm shadow-brand-500/20 hover:from-brand-700 hover:to-indigo-700 transition duration-150 hover:scale-[1.02]"
            >
              <Ticket className="h-3.5 w-3.5" />
              <span>ซื้อบัตรเข้างาน</span>
            </Link>

            <Link
              to="/merchandise"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold px-3 py-2 shadow-xs transition duration-150"
            >
              <Shirt className="h-3.5 w-3.5 text-brand-600" />
              <span className="hidden sm:inline">สั่งเสื้อที่ระลึก</span>
              <span className="sm:hidden">เสื้อ</span>
            </Link>

            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 pl-1">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-brand-600 to-indigo-500 text-white text-xs font-bold shadow-sm">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.fullName}</p>
                <p className="text-[10px] text-slate-400 leading-tight font-mono">{user?.email}</p>
              </div>
              <span className="rounded-full bg-brand-50 border border-brand-200/60 px-2 py-0.5 text-[10px] font-bold text-brand-700 hidden sm:inline-block">
                {ROLE_LABELS[role]}
              </span>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/60 bg-white/50 px-6 py-4 text-center text-xs text-slate-400">
          ระบบ Demo — บันทึกข้อมูลและประมวลผลภายใน Browser (LocalStorage & IndexedDB)
        </footer>
      </div>
    </div>
  )
}
