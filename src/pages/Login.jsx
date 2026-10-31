import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DEMO_PASSWORD } from '../data/seed'
import { ROLE_LABELS } from '../data/permissions'
import { LogIn, Eye, EyeOff, ShieldCheck, GraduationCap, ArrowRight, UserCheck } from 'lucide-react'

const quickLogins = [
  { label: 'ผู้ใช้ทั่วไป (User)', email: 'user@demo.com', role: 'user', icon: '👤' },
  { label: 'Super Admin', email: 'superadmin@demo.com', role: 'super_admin', icon: '🛡️' },
  { label: 'Token Admin', email: 'tokenadmin@demo.com', role: 'token_admin', icon: '🪙' },
  { label: 'Store Admin', email: 'store1@demo.com', role: 'store_admin', icon: '🏪' },
]

const roleHome = {
  user: '/account',
  super_admin: '/admin/dashboard',
  token_admin: '/token-admin/dashboard',
  store_admin: '/store/dashboard',
}

export default function Login() {
  const { login, user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    nav(roleHome[user.role] || '/account', { replace: true })
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const u = login(email, password)
      toast.push(`ยินดีต้อนรับ ${u.fullName}`, 'success')
      nav(roleHome[u.role] || '/account')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const quickLogin = (em) => {
    setEmail(em)
    setPassword(DEMO_PASSWORD)
    try {
      const u = login(em, DEMO_PASSWORD)
      toast.push(`เข้าสู่ระบบเป็น ${u.fullName} (${ROLE_LABELS[u.role]})`, 'success')
      nav(roleHome[u.role] || '/account')
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
            <GraduationCap className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-xs text-slate-400 mt-1">งานเลี้ยงรุ่นศิษย์เก่า 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              อีเมล
            </label>
            <input
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              รหัสผ่าน
            </label>
            <div className="relative">
              <input
                type={showPw ? 'text' : 'password'}
                className="input pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 transition"
                onClick={() => setShowPw(!showPw)}
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200/80 px-3.5 py-2.5 text-xs text-red-700 font-medium">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 font-bold text-xs shadow-md shadow-brand-500/20"
          >
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          ยังไม่มีบัญชีศิษย์เก่า?{' '}
          <Link to="/register" className="text-brand-600 font-bold hover:underline">
            ลงทะเบียนที่นี่
          </Link>
        </p>
      </div>

      {/* Quick Demo Login Box */}
      <div className="mt-6 rounded-3xl border border-slate-200/90 bg-slate-50/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-brand-600" />
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              คลิกเพื่อเข้าสู่ระบบทดลอง (Demo)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">PW: {DEMO_PASSWORD}</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {quickLogins.map((q) => (
            <button
              key={q.email}
              type="button"
              onClick={() => quickLogin(q.email)}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-700 hover:border-brand-500 hover:text-brand-600 hover:shadow-sm transition"
            >
              <span>{q.icon}</span>
              <div className="min-w-0">
                <p className="truncate font-bold text-[11px]">{q.label}</p>
                <p className="truncate text-[10px] text-slate-400 font-mono">{q.email}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
