import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { GraduationCap, LogIn, UserPlus } from 'lucide-react'

export default function PublicLayout() {
  const { user } = useAuth()
  const nav = useNavigate()

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="flex items-center gap-2 text-brand-700 font-bold text-lg">
            <GraduationCap className="h-6 w-6" />
            <span className="hidden sm:inline">งานเลี้ยงรุ่น 2026</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link to="/tickets" className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-brand-700 transition">ซื้อบัตร</Link>
            <Link to="/merchandise" className="px-3 py-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-brand-700 transition">เสื้อที่ระลึก</Link>
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
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <p>ระบบ Demo — ข้อมูลจัดเก็บใน Browser (LocalStorage/IndexedDB) เท่านั้น</p>
        <p className="mt-1">© 2026 Alumni Reunion Management System</p>
      </footer>
    </div>
  )
}
