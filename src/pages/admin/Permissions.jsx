import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { usersRepo } from '../../repositories'
import { PERMS, ROLE_PERMISSIONS, hasPermission } from '../../data/permissions'
import { setUserPermissions } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminPermissions() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [selected, setSelected] = useState(usersRepo.all()[0]?.id)
  const target = usersRepo.findById(selected)
  function toggle(perm) {
    const grants = new Set(target.permissionGrants || [])
    const revokes = new Set(target.permissionRevokes || [])
    const currently = hasPermission(target, perm)
    if (currently) {
      grants.delete(perm)
      revokes.add(perm)
    } else {
      revokes.delete(perm)
      if (!(ROLE_PERMISSIONS[target.role] || []).includes(perm) && target.role !== 'super_admin') grants.add(perm)
    }
    try {
      setUserPermissions(user, target.id, [...grants], [...revokes])
      toast.push('อัปเดตสิทธิ์แล้ว (ตรวจที่ Action ไม่ใช่แค่ซ่อนปุ่ม)', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="Permission" subtitle="Frontend Demo เท่านั้น Production ต้องตรวจสิทธิ์ที่เซิร์ฟเวอร์" />
      <select className="input mb-4 max-w-md" value={selected} onChange={(e) => setSelected(e.target.value)}>
        {usersRepo.all().map((u) => <option key={u.id} value={u.id}>{u.fullName} ({u.role})</option>)}
      </select>
      <div className="grid gap-2 md:grid-cols-2">
        {Object.values(PERMS).map((p) => (
          <label key={p} className="card flex items-center justify-between text-sm">
            <span>{p}</span>
            <input type="checkbox" checked={hasPermission(target, p)} onChange={() => toggle(p)} />
          </label>
        ))}
      </div>
    </div>
  )
}
