import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { ticketTypesRepo } from '../../repositories'
import { saveTicketType } from '../../services/catalogService'
import { formatTHB } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'

export default function AdminTicketTypes() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const types = ticketTypesRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ name: '', price: 0, bonusToken: 0, description: '', isActive: true, stockLimit: '' })
  const [id, setId] = useState(null)
  function edit(t) {
    setId(t?.id || null)
    setForm(t ? { ...t, stockLimit: t.stockLimit ?? '' } : { name: '', price: 0, bonusToken: 0, description: '', isActive: true, stockLimit: '' })
    setOpen(true)
  }
  function save() {
    try {
      saveTicketType(user, form, id)
      toast.push('บันทึกประเภทบัตรแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="จัดการประเภทบัตร" actions={<button className="btn-primary" onClick={() => edit(null)}>เพิ่มบัตร</button>} />
      <div className="grid gap-3 md:grid-cols-3">
        {types.map((t) => (
          <div key={t.id} className="card">
            <h2 className="font-semibold">{t.name}</h2>
            <p>{formatTHB(t.price)} · โบนัส {t.bonusToken}</p>
            <p className="text-sm text-slate-500">{t.isActive ? 'เปิดขาย' : 'ปิดขาย'}</p>
            <button className="btn-secondary mt-3" type="button" onClick={() => edit(t)}>แก้ไข</button>
          </div>
        ))}
      </div>
      <Modal open={open} title="ประเภทบัตร" onClose={() => setOpen(false)} footer={<button className="btn-primary" onClick={save}>บันทึก</button>}>
        {['name', 'price', 'bonusToken', 'description', 'stockLimit'].map((k) => (
          <div key={k} className="mb-2">
            <label className="label">{k}</label>
            <input className="input" value={form[k] ?? ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          </div>
        ))}
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> เปิดขาย</label>
      </Modal>
    </div>
  )
}
