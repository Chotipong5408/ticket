import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { usersRepo } from '../../repositories'
import { PERMS, ROLE_PERMISSIONS, hasPermission } from '../../data/permissions'
import { setUserPermissions } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { BadgeCheck, ShieldAlert, CheckCircle2, User, Key } from 'lucide-react'

export default function AdminPermissions() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [selected, setSelected] = useState(usersRepo.all()[0]?.id)
  const target = usersRepo.findById(selected)

  function toggle(perm) {
    if (!target) return
    const grants = new Set(target.permissionGrants || [])
    const revokes = new Set(target.permissionRevokes || [])
    const currently = hasPermission(target, perm)
    if (currently) {
      grants.delete(perm)
      revokes.add(perm)
    } else {
      revokes.delete(perm)
      if (!(ROLE_PERMISSIONS[target.role] || []).includes(perm) && target.role !== 'super_admin') {
        grants.add(perm)
      }
    }
    try {
      setUserPermissions(user, target.id, [...grants], [...revokes])
      toast.push(`อัปเดตสิทธิ์ ${perm} สำเร็จแล้ว`, 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการสิทธิ์ระบบ (Granular Permissions)"
        subtitle="กำหนดสิทธิ์เฉพาะบุคคล (Grant / Revoke) นอกเหนือจากสิทธิ์ตามบทบาทเริ่มต้น"
        icon={BadgeCheck}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          เลือกผู้ใช้งานที่ต้องการกำหนดสิทธิ์:
        </label>
        <select
          className="input max-w-md text-xs font-medium"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          {usersRepo.all().map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName} ({u.email}) — บทบาท: {u.role}
            </option>
          ))}
        </select>
      </div>

      {target && (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">รายการสิทธิ์สำหรับ {target.fullName}</h3>
              <p className="text-xs text-slate-400">บทบาทปัจจุบัน: <span className="font-semibold text-brand-600">{target.role}</span></p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {Object.values(PERMS).map((p) => {
              const active = hasPermission(target, p)
              return (
                <label
                  key={p}
                  className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-medium cursor-pointer transition-all ${
                    active
                      ? 'border-brand-500 bg-brand-50/40 text-slate-900 shadow-sm'
                      : 'border-slate-200 bg-slate-50/40 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Key className={`h-4 w-4 ${active ? 'text-brand-600' : 'text-slate-400'}`} />
                    <span className="font-mono">{p}</span>
                  </div>
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded text-brand-600 focus:ring-brand-500"
                    checked={active}
                    onChange={() => toggle(p)}
                  />
                </label>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-amber-50/80 border border-amber-200/80 p-4 text-xs text-amber-800 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <span>
          <strong>ข้อควรระวัง:</strong> ในระบบจริง (Production) การตรวจสอบสิทธิ์ต้องกระทำที่เซิร์ฟเวอร์ (Backend Authorization Guard) ทุกครั้งที่เรียก API
        </span>
      </div>
    </div>
  )
}
