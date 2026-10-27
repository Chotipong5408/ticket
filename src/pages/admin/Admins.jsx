import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { usersRepo, storesRepo } from '../../repositories'
import { setUserRole } from '../../services/authService'
import { ROLE_LABELS } from '../../data/permissions'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminAdmins() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [role, setRole] = useState('token_admin')
  const [storeId, setStoreId] = useState('')
  const people = usersRepo.all()
  function assign(id) {
    try {
      setUserRole(user, id, role, storeId || null)
      toast.push('อัปเดตบทบาทแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="จัดการผู้ดูแล" />
      <div className="mb-4 flex gap-2">
        <select className="input" value={role} onChange={(e) => setRole(e.target.value)}>
          {Object.entries(ROLE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select className="input" value={storeId} onChange={(e) => setStoreId(e.target.value)}>
          <option value="">ร้าน (ถ้าเป็น Store Admin)</option>
          {storesRepo.all().map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>
      <div className="space-y-2">
        {people.map((p) => (
          <div key={p.id} className="card flex items-center justify-between">
            <div>
              <p className="font-medium">{p.fullName}</p>
              <p className="text-sm text-slate-500">{p.email} · {ROLE_LABELS[p.role]}</p>
            </div>
            <button className="btn-secondary" type="button" onClick={() => assign(p.id)}>กำหนดบทบาทที่เลือก</button>
          </div>
        ))}
      </div>
    </div>
  )
}
