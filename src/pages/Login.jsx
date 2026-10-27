import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { DEMO_PASSWORD } from '../data/seed'
import { ROLE_LABELS } from '../data/permissions'
import { LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react'

const quickLogins = [
  { label: 'User', email: 'user@demo.com' },
  { label: 'Super Admin', email: 'superadmin@demo.com' },
  { label: 'Token Admin', email: 'tokenadmin@demo.com' },
  { label: 'Store Admin', email: 'store1@demo.com' },
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
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="card">
        <div className="text-center mb-6">
          <LogIn className="mx-auto h-10 w-10 text-brand-600 mb-2" />
          <h1 className="text-xl font-bold text-slate-800">เข้าสู่ระบบ</h1>
          <p className="text-sm text-slate-500">งานเลี้ยงรุ่นศิษย์เก่า 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">อีเมล</label>
            <input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" required />
          </div>
          <div>
            <label className="label">รหัสผ่าน</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} className="input pr-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••" required />
              <button type="button" className="absolute right-2 top-2 text-slate-400 hover:text-slate-600" onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}</button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          ยังไม่มีบัญชี? <Link to="/register" className="text-brand-600 font-medium hover:underline">ลงทะเบียน</Link>
        </p>
      </div>

      {/* Quick Demo Login */}
      <div className="mt-6 card">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-700">Demo Login (เข้าสู่ระบบทดลอง)</h2>
        </div>
        <p className="text-xs text-slate-500 mb-3">รหัสผ่าน: <code className="bg-slate-100 px-1 rounded">{DEMO_PASSWORD}</code></p>
        <div className="grid grid-cols-2 gap-2">
          {quickLogins.map((q) => (
            <button key={q.email} onClick={() => quickLogin(q.email)} className="btn-secondary text-xs py-2">
              {q.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
