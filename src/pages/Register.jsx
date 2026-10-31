import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { UserPlus, GraduationCap, ArrowRight, ShieldCheck } from 'lucide-react'

export default function Register() {
  const { register, user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [form, setForm] = useState({
    fullName: '',
    enrollmentYearBE: '',
    faculty: '',
    major: '',
    email: '',
    phone: '',
    password: '',
  })
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) {
    nav('/account', { replace: true })
    return null
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleSubmit = (e) => {
    e.preventDefault()
    setErrors({})
    setGlobalError('')
    setLoading(true)
    try {
      const u = register({ ...form, enrollmentYearBE: Number(form.enrollmentYearBE) })
      toast.push(`ลงทะเบียนสำเร็จ ยินดีต้อนรับ ${u.fullName}`, 'success')
      nav('/tickets')
    } catch (err) {
      if (err.issues) {
        const map = {}
        err.issues.forEach((i) => {
          map[i.path[0]] = i.message
        })
        setErrors(map)
      } else {
        setGlobalError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-12 md:py-16">
      <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-10 shadow-xl">
        <div className="text-center mb-8">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-md shadow-brand-500/20">
            <UserPlus className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">ลงทะเบียนศิษย์เก่า</h1>
          <p className="text-xs text-slate-400 mt-1">กรอกข้อมูลเพื่อสร้างบัญชีและดำเนินการสั่งซื้อบัตรเข้างาน 2026</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              ชื่อ - นามสกุล <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              className={`input ${errors.fullName ? 'border-red-400 ring-red-300' : ''}`}
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="เช่น นายสมชาย ใจดี"
              required
            />
            {errors.fullName && <p className="mt-1 text-xs text-red-600">{errors.fullName}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                พ.ศ. ที่เข้าเรียน <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                className={`input ${errors.enrollmentYearBE ? 'border-red-400 ring-red-300' : ''}`}
                value={form.enrollmentYearBE}
                onChange={set('enrollmentYearBE')}
                placeholder="เช่น 2545"
                required
              />
              {errors.enrollmentYearBE && <p className="mt-1 text-xs text-red-600">{errors.enrollmentYearBE}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                เบอร์โทรศัพท์ <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                className={`input ${errors.phone ? 'border-red-400 ring-red-300' : ''}`}
                value={form.phone}
                onChange={set('phone')}
                placeholder="เช่น 0812345678"
                required
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                คณะ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.faculty ? 'border-red-400 ring-red-300' : ''}`}
                value={form.faculty}
                onChange={set('faculty')}
                placeholder="เช่น วิศวกรรมศาสตร์"
                required
              />
              {errors.faculty && <p className="mt-1 text-xs text-red-600">{errors.faculty}</p>}
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                สาขาวิชา <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={`input ${errors.major ? 'border-red-400 ring-red-300' : ''}`}
                value={form.major}
                onChange={set('major')}
                placeholder="เช่น วิศวกรรมคอมพิวเตอร์"
                required
              />
              {errors.major && <p className="mt-1 text-xs text-red-600">{errors.major}</p>}
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              อีเมล <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              className={`input ${errors.email ? 'border-red-400 ring-red-300' : ''}`}
              value={form.email}
              onChange={set('email')}
              placeholder="example@alumni.com"
              required
            />
            {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              รหัสผ่าน <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              className={`input ${errors.password ? 'border-red-400 ring-red-300' : ''}`}
              value={form.password}
              onChange={set('password')}
              placeholder="อย่างน้อย 6 ตัวอักษร"
              required
            />
            {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
          </div>

          {globalError && (
            <div className="rounded-xl bg-red-50 border border-red-200/80 px-3.5 py-2.5 text-xs text-red-700 font-medium">
              {globalError}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5 font-bold text-xs shadow-md shadow-brand-500/20"
          >
            {loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียนเพื่อเข้าสู่ระบบ'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          มีบัญชีศิษย์เก่าแล้ว?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            เข้าสู่ระบบที่นี่
          </Link>
        </p>
      </div>
    </div>
  )
}
