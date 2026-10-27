import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { updateProfile } from '../../services/authService'
import { useToast } from '../../context/ToastContext'
import { formatDateTime } from '../../lib/dates'

export default function Profile() {
  const { user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({ fullName: user.fullName, phone: user.phone, faculty: user.faculty, major: user.major, enrollmentYearBE: user.enrollmentYearBE })
  function save(e) {
    e.preventDefault()
    try {
      updateProfile(user.id, form)
      toast.push('บันทึกข้อมูลแล้ว', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="ข้อมูลส่วนตัว" subtitle={`ลงทะเบียนเมื่อ ${formatDateTime(user.createdAt)}`} />
      <form className="card max-w-lg space-y-3" onSubmit={save}>
        {[['fullName', 'ชื่อ-นามสกุล'], ['enrollmentYearBE', 'พ.ศ. ที่เข้าเรียน'], ['faculty', 'คณะ'], ['major', 'สาขา'], ['phone', 'โทร']].map(([k, l]) => (
          <div key={k}>
            <label className="label">{l}</label>
            <input className="input" value={form[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <div>
          <label className="label">อีเมล</label>
          <input className="input bg-slate-50" value={user.email} disabled />
        </div>
        <button className="btn-primary" type="submit">บันทึก</button>
      </form>
    </div>
  )
}
