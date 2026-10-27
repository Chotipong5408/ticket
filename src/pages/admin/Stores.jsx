import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { storesRepo, productsRepo, usersRepo } from '../../repositories'
import { saveStore, saveProduct } from '../../services/storeService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'

export default function AdminStores() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const stores = storesRepo.all()
  const admins = usersRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', category: '', assignedAdminId: '', isActive: true })
  function save() {
    try {
      const store = saveStore(user, form, form.id)
      const product = productsRepo.byStore(store.id)[0]
      if (form.priceToken) saveProduct(user, store.id, { name: product?.name || form.name, priceToken: form.priceToken, description: form.description, isActive: form.isActive })
      toast.push('บันทึกร้านแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="ร้านค้า" actions={<button className="btn-primary" onClick={() => { setForm({ name: '', description: '', category: '', assignedAdminId: '', isActive: true, priceToken: 10 }); setOpen(true) }}>เพิ่มร้าน</button>} />
      <div className="grid gap-3 md:grid-cols-3">
        {stores.map((s) => {
          const p = productsRepo.byStore(s.id)[0]
          const admin = usersRepo.findById(s.assignedAdminId)
          return (
            <div key={s.id} className="card">
              <h2 className="font-semibold">{s.name}</h2>
              <p className="text-sm">{s.category} · {s.isActive ? 'เปิด' : 'ปิด'}</p>
              <p className="text-sm">สินค้า: {p?.name} / {p?.priceToken} Token</p>
              <p className="text-sm">Store Admin: {admin?.fullName || '-'}</p>
              <button className="btn-secondary mt-3" type="button" onClick={() => { setForm({ ...s, priceToken: p?.priceToken }); setOpen(true) }}>แก้ไข</button>
            </div>
          )
        })}
      </div>
      <Modal open={open} title="ร้านค้า" onClose={() => setOpen(false)} footer={<button className="btn-primary" onClick={save}>บันทึก</button>}>
        {['name', 'description', 'category', 'priceToken'].map((k) => (
          <div key={k} className="mb-2">
            <label className="label">{k}</label>
            <input className="input" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <label className="label">มอบหมาย Store Admin</label>
        <select className="input mb-2" value={form.assignedAdminId || ''} onChange={(e) => setForm({ ...form, assignedAdminId: e.target.value })}>
          <option value="">-</option>
          {admins.map((a) => <option key={a.id} value={a.id}>{a.fullName} ({a.email})</option>)}
        </select>
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isActive !== false} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> เปิดใช้งาน</label>
      </Modal>
    </div>
  )
}
