import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, LogIn, UserPlus, Ticket, Shirt } from 'lucide-react'

export default function PublicLayout() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-lg shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3">
          <Link to="/" className="flex items-center gap-2.5 text-brand-700 font-bold text-lg group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm group-hover:bg-brand-700 transition-colors">
              <GraduationCap className="h-5 w-5" />
            </div>
            <span className="hidden sm:inline tracking-tight">งานเลี้ยงรุ่น 2026</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/tickets" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium">
              <Ticket className="h-4 w-4" /> ซื้อบัตร
            </Link>
            <Link to="/merchandise" className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-600 hover:bg-brand-50 hover:text-brand-700 transition-colors font-medium">
              <Shirt className="h-4 w-4" /> เสื้อที่ระลึก
            </Link>
            {user ? (
              <button onClick={() => nav('/account')} className="btn-primary ml-2">บัญชีของฉัน</button>
            ) : (
              <>
                <Link to="/login" className="btn-secondary ml-2"><LogIn className="h-4 w-4" /> เข้าสู่ระบบ</Link>
                <Link to="/register" className="btn-primary"><UserPlus className="h-4 w-4" /> ลงทะเบียน</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-400">
        <p>ระบบ Demo — ข้อมูลจัดเก็บใน Browser (LocalStorage/IndexedDB) เท่านั้น</p>
        <p className="mt-1.5 text-slate-300">© 2026 Alumni Reunion Management System</p>
      </footer>
    </div>
  )
}
