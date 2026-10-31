import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { formatDateTime } from '../../lib/dates'
import { User, Check, ShieldCheck, Mail, Calendar, School, Phone } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    fullName: user.fullName || '',
    phone: user.phone || '',
    faculty: user.faculty || '',
    major: user.major || '',
    enrollmentYearBE: user.enrollmentYearBE || '',
  })
  const [saving, setSaving] = useState(false)

  function save(e) {
    e.preventDefault()
    setSaving(true)
    try {
      updateProfile(user.id, form)
      toast.push('บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader
        title="ข้อมูลส่วนตัวของฉัน"
        subtitle={`ลงทะเบียนเข้าสู่ระบบเมื่อ ${formatDateTime(user.createdAt)}`}
        icon={User}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
        {/* User Card Header */}
        <div className="flex items-center gap-4 pb-6 mb-6 border-b border-slate-100">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white text-2xl font-bold shadow-md shadow-brand-500/20">
            {user.fullName?.charAt(0) || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">{user.fullName}</h2>
            <p className="text-xs text-slate-400 font-mono">{user.email}</p>
            <span className="inline-block mt-1.5 rounded-full bg-brand-50 border border-brand-200/60 px-2.5 py-0.5 text-[10px] font-bold text-brand-700">
              สถานะ: บัญชีศิษย์เก่าที่ยืนยันแล้ว
            </span>
          </div>
        </div>

        <form className="space-y-4" onSubmit={save}>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
              ชื่อ - นามสกุล
            </label>
            <input
              className="input"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                พ.ศ. ที่เข้าเรียน
              </label>
              <input
                className="input"
                type="number"
                value={form.enrollmentYearBE}
                onChange={(e) => setForm({ ...form, enrollmentYearBE: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                เบอร์โทรศัพท์
              </label>
              <input
                className="input"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                คณะ
              </label>
              <input
                className="input"
                value={form.faculty}
                onChange={(e) => setForm({ ...form, faculty: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
                สาขาวิชา
              </label>
              <input
                className="input"
                value={form.major}
                onChange={(e) => setForm({ ...form, major: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">
              อีเมลบัญชี (ไม่สามารถแก้ไขได้)
            </label>
            <input className="input bg-slate-50 text-slate-500 cursor-not-allowed" value={user.email} disabled />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button className="btn-primary px-8 py-3 text-xs font-bold" type="submit" disabled={saving}>
              {saving ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
