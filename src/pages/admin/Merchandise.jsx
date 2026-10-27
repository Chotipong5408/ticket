import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { merchRepo } from '../../repositories'
import { saveMerchandise } from '../../services/catalogService'
import { exportMerchandiseCsv } from '../../services/reportService'
import { formatTHB } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'

export default function AdminMerchandise() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const items = merchRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({})
  function save() {
    try {
      saveMerchandise(user, form, form.id)
      toast.push('บันทึกแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader
        title="จัดการเสื้อ"
        actions={
          <>
            <button className="btn-secondary" type="button" onClick={() => { try { exportMerchandiseCsv(user) } catch (e) { toast.push(e.message, 'error') } }}>Export CSV</button>
            <button className="btn-primary" type="button" onClick={() => { setForm({ name: '', description: '', price: 0, isActive: true, stockEnabled: false }); setOpen(true) }}>เพิ่มสินค้า</button>
          </>
        }
      />
      <div className="grid gap-3 md:grid-cols-2">
        {items.map((p) => (
          <div key={p.id} className="card">
            <h2 className="font-semibold">{p.name}</h2>
            <p>{formatTHB(p.price)} · {p.isActive ? 'เปิดขาย' : 'ปิดขาย'}</p>
            <button className="btn-secondary mt-3" type="button" onClick={() => { setForm(p); setOpen(true) }}>แก้ไข</button>
          </div>
        ))}
      </div>
      <Modal open={open} title="เสื้อ" onClose={() => setOpen(false)} footer={<button className="btn-primary" onClick={save}>บันทึก</button>}>
        {['name', 'description', 'price'].map((k) => (
          <div key={k} className="mb-2">
            <label className="label">{k}</label>
            <input className="input" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> เปิดขาย</label>
      </Modal>
    </div>
  )
}
