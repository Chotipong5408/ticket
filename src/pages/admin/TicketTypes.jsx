import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { ticketTypesRepo } from '../../repositories'
import { saveTicketType } from '../../services/catalogService'
import { formatTHB, formatToken } from '../../lib/money'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'
import { Ticket, Plus, Coins, Edit3, CheckCircle2, XCircle } from 'lucide-react'

export default function AdminTicketTypes() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const types = ticketTypesRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    price: 0,
    bonusToken: 0,
    description: '',
    isActive: true,
    stockLimit: '',
  })
  const [id, setId] = useState(null)

  function edit(t) {
    setId(t?.id || null)
    setForm(
      t
        ? { ...t, stockLimit: t.stockLimit ?? '' }
        : { name: '', price: 0, bonusToken: 0, description: '', isActive: true, stockLimit: '' }
    )
    setOpen(true)
  }

  function save() {
    try {
      saveTicketType(user, form, id)
      toast.push('บันทึกประเภทบัตรเรียบร้อยแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการประเภทบัตรเข้างาน"
        subtitle="กำหนดราคา บัตรโควตา (Stock) และจำนวน Token โบนัสที่ผู้ซื้อจะได้รับ"
        icon={Ticket}
        actions={
          <button className="btn-primary text-xs gap-1.5" onClick={() => edit(null)}>
            <Plus className="h-4 w-4" /> เพิ่มประเภทบัตรใหม่
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {types.map((t) => {
          const remaining = t.stockLimit ? t.stockLimit - (t.soldCount || 0) : null

          return (
            <div
              key={t.id}
              className={`rounded-3xl border bg-white p-6 shadow-sm transition-all flex flex-col justify-between ${
                t.isActive ? 'border-slate-200 hover:border-brand-300 hover:shadow-md' : 'border-slate-200 bg-slate-50/60 opacity-80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                    <Ticket className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    t.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {t.isActive ? 'เปิดขาย' : 'ปิดการขาย'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-800">{t.name}</h2>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>

                <div className="my-4 pt-3 border-t border-slate-100 space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400">ราคา:</span>
                    <span className="text-xl font-black text-brand-700">{formatTHB(t.price)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">โบนัส Token:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5" /> +{formatToken(t.bonusToken)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">จำหน่ายแล้ว:</span>
                    <span className="font-semibold text-slate-700">{t.soldCount || 0} {t.stockLimit ? `/ ${t.stockLimit}` : 'ใบ'}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-secondary w-full text-xs py-2 gap-1.5"
                type="button"
                onClick={() => edit(t)}
              >
                <Edit3 className="h-3.5 w-3.5" /> แก้ไขข้อมูล
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={open}
        title={id ? 'แก้ไขประเภทบัตร' : 'เพิ่มประเภทบัตรใหม่'}
        onClose={() => setOpen(false)}
        footer={
          <button className="btn-primary text-xs px-6 py-2" onClick={save}>
            บันทึกประเภทบัตร
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="label">ชื่อประเภทบัตร</label>
            <input
              className="input"
              placeholder="เช่น บัตรทั่วไป, บัตร VIP"
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">ราคา (บาท)</label>
              <input
                className="input"
                type="number"
                value={form.price ?? ''}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="label">โบนัส Token (แถมฟรี)</label>
              <input
                className="input"
                type="number"
                value={form.bonusToken ?? ''}
                onChange={(e) => setForm({ ...form, bonusToken: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="label">คำอธิบาย</label>
            <textarea
              className="input"
              rows={2}
              placeholder="รายละเอียดสิทธิประโยชน์ของบัตร"
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">จำกัดจำนวน (Stock Limit / ว่างไว้หากไม่จำกัด)</label>
            <input
              className="input"
              type="number"
              placeholder="เช่น 100"
              value={form.stockLimit ?? ''}
              onChange={(e) => setForm({ ...form, stockLimit: e.target.value ? Number(e.target.value) : '' })}
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              className="rounded text-brand-600"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>เปิดจำหน่ายบัตรนี้บนหน้าเว็บไซต์</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
