import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { storesRepo, productsRepo, usersRepo } from '../../repositories'
import { saveStore, saveProduct } from '../../services/storeService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Modal } from '../../components/ui/Modal'
import { Store, Plus, Edit3, Coins, User, Tag, ShoppingBag } from 'lucide-react'

export default function AdminStores() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const stores = storesRepo.all()
  const admins = usersRepo.all()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    name: '',
    description: '',
    category: '',
    assignedAdminId: '',
    isActive: true,
    priceToken: 10,
  })

  function save() {
    try {
      const store = saveStore(user, form, form.id)
      const product = productsRepo.byStore(store.id)[0]
      if (form.priceToken) {
        saveProduct(user, store.id, {
          name: product?.name || form.name,
          priceToken: Number(form.priceToken),
          description: form.description,
          isActive: form.isActive,
        })
      }
      toast.push('บันทึกข้อมูลร้านค้าเรียบร้อยแล้ว', 'success')
      setOpen(false)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการร้านค้าในงาน"
        subtitle="เพิ่มร้านค้า อาหาร เครื่องดื่ม พร้อมกำหนดผู้ดูแลร้าน (Store Admin) และราคาสินค้าเริ่มต้น"
        icon={Store}
        actions={
          <button
            className="btn-primary text-xs gap-1.5"
            onClick={() => {
              setForm({
                name: '',
                description: '',
                category: 'อาหาร',
                assignedAdminId: '',
                isActive: true,
                priceToken: 10,
              })
              setOpen(true)
            }}
          >
            <Plus className="h-4 w-4" /> เพิ่มร้านค้าใหม่
          </button>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        {stores.map((s) => {
          const p = productsRepo.byStore(s.id)[0]
          const admin = usersRepo.findById(s.assignedAdminId)

          return (
            <div
              key={s.id}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Store className="h-5 w-5" />
                  </div>
                  <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                    s.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                  }`}>
                    {s.isActive ? 'เปิดให้บริการ' : 'ปิดร้าน'}
                  </span>
                </div>

                <h2 className="text-base font-bold text-slate-800">{s.name}</h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                  <Tag className="h-3.5 w-3.5" />
                  <span>หมวด: {s.category || 'ทั่วไป'}</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{s.description || 'ไม่มีคำอธิบาย'}</p>

                <div className="my-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">สินค้าหลัก:</span>
                    <span className="font-semibold text-slate-700">{p?.name || '-'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ราคา:</span>
                    <span className="font-bold text-amber-700 flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-amber-500" />
                      {p?.priceToken || 0} Token
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">ผู้ดูแลร้าน:</span>
                    <span className="font-medium text-slate-800">{admin?.fullName || 'ยังไม่ได้มอบหมาย'}</span>
                  </div>
                </div>
              </div>

              <button
                className="btn-secondary w-full text-xs py-2 gap-1.5"
                type="button"
                onClick={() => {
                  setForm({ ...s, priceToken: p?.priceToken || 10 })
                  setOpen(true)
                }}
              >
                <Edit3 className="h-3.5 w-3.5" /> แก้ไขข้อมูลร้าน
              </button>
            </div>
          )
        })}
      </div>

      <Modal
        open={open}
        title={form.id ? 'แก้ไขข้อมูลร้านค้า' : 'เพิ่มร้านค้าใหม่'}
        onClose={() => setOpen(false)}
        footer={
          <button className="btn-primary text-xs px-6 py-2" onClick={save}>
            บันทึกข้อมูลร้าน
          </button>
        }
      >
        <div className="space-y-3 text-xs">
          <div>
            <label className="label">ชื่อร้านค้า</label>
            <input
              className="input"
              placeholder="เช่น ซุ้มเครื่องดื่มเย็นชื่นใจ"
              value={form.name ?? ''}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">หมวดหมู่</label>
              <input
                className="input"
                placeholder="เช่น อาหาร, เครื่องดื่ม, ของว่าง"
                value={form.category ?? ''}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div>
              <label className="label">ราคาเริ่มต้น (Token)</label>
              <input
                className="input"
                type="number"
                placeholder="10"
                value={form.priceToken ?? ''}
                onChange={(e) => setForm({ ...form, priceToken: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">คำอธิบายร้านค้า</label>
            <textarea
              className="input"
              rows={2}
              placeholder="รายละเอียดเมนู หรือสถานที่ตั้งซุ้ม"
              value={form.description ?? ''}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">มอบหมาย Store Admin (ผู้ดูแลร้าน)</label>
            <select
              className="input"
              value={form.assignedAdminId || ''}
              onChange={(e) => setForm({ ...form, assignedAdminId: e.target.value })}
            >
              <option value="">- เลือกผู้ดูแลร้าน -</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.fullName} ({a.email})
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
            <input
              type="checkbox"
              className="rounded text-brand-600"
              checked={form.isActive !== false}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
            />
            <span>เปิดให้บริการร้านค้านี้ในระบบ</span>
          </label>
        </div>
      </Modal>
    </div>
  )
}
