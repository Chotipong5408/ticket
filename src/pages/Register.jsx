import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { UserPlus } from 'lucide-react'

export default function Register() {
  const { register, user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [form, setForm] = useState({ fullName: '', enrollmentYearBE: '', faculty: '', major: '', email: '', phone: '', password: '' })
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState('')
  const [loading, setLoading] = useState(false)

  if (user) { nav('/account', { replace: true }); return null }

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
        err.issues.forEach((i) => { map[i.path[0]] = i.message })
        setErrors(map)
      } else {
        setGlobalError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'fullName', label: 'ชื่อ-นามสกุล', type: 'text', placeholder: 'สมชาย ใจดี' },
    { key: 'enrollmentYearBE', label: 'พ.ศ. ที่เข้าเรียน', type: 'number', placeholder: '2545' },
    { key: 'faculty', label: 'คณะ', type: 'text', placeholder: 'วิศวกรรมศาสตร์' },
    { key: 'major', label: 'สาขา', type: 'text', placeholder: 'วิศวกรรมคอมพิวเตอร์' },
    { key: 'email', label: 'อีเมล', type: 'email', placeholder: 'example@gmail.com' },
    { key: 'phone', label: 'เบอร์โทรศัพท์', type: 'tel', placeholder: '0812345678' },
    { key: 'password', label: 'รหัสผ่าน', type: 'password', placeholder: 'อย่างน้อย 6 ตัวอักษร' },
  ]

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <div className="card">
        <div className="text-center mb-6">
          <UserPlus className="mx-auto h-10 w-10 text-brand-600 mb-2" />
          <h1 className="text-xl font-bold text-slate-800">ลงทะเบียนเข้าร่วมงาน</h1>
          <p className="text-sm text-slate-500">กรอกข้อมูลเพื่อสร้างบัญชีใหม่</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((f) => (
            <div key={f.key}>
              <label className="label">{f.label} <span className="text-red-500">*</span></label>
              <input type={f.type} className={`input ${errors[f.key] ? 'border-red-400 ring-red-300' : ''}`} value={form[f.key]} onChange={set(f.key)} placeholder={f.placeholder} required />
              {errors[f.key] && <p className="mt-1 text-xs text-red-600">{errors[f.key]}</p>}
            </div>
          ))}
          {globalError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{globalError}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'กำลังลงทะเบียน...' : 'ลงทะเบียน'}</button>
        </form>
        <p className="mt-4 text-center text-sm text-slate-500">
          มีบัญชีแล้ว? <Link to="/login" className="text-brand-600 font-medium hover:underline">เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
