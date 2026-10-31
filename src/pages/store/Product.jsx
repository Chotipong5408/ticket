import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { productsRepo, storesRepo } from '../../repositories'
import { saveProduct } from '../../services/storeService'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Package, Save, Coins, Store } from 'lucide-react'

export default function StoreProduct() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)
  const product = productsRepo.byStore(user.storeId)[0]
  const [form, setForm] = useState({
    name: product?.name || '',
    priceToken: product?.priceToken || 0,
    description: product?.description || '',
    isActive: product?.isActive !== false,
  })

  function save() {
    try {
      saveProduct(user, store.id, form)
      toast.push('บันทึกข้อมูลสินค้าเรียบร้อยแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  if (!store) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center max-w-md mx-auto my-12">
        <Store className="mx-auto h-12 w-12 text-slate-300 mb-3" />
        <h2 className="text-base font-bold text-slate-800">ยังไม่ได้รับการมอบหมายร้านค้า</h2>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <PageHeader
        title={`สินค้าของร้าน (${store.name})`}
        subtitle="กำหนดชื่อสินค้า ราคา Token และรายละเอียดสำหรับแสดงผลบน QR รับชำระเงิน"
        icon={Package}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm space-y-4">
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
            ชื่อสินค้า / เมนู
          </label>
          <input
            className="input text-xs"
            placeholder="เช่น ข้าวหมูกรอบ, ชานมไข่มุก"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
            ราคาขายต่อหน่วย (Token)
          </label>
          <div className="relative max-w-xs">
            <input
              className="input pr-16 text-xs font-bold text-brand-700"
              type="number"
              min="1"
              value={form.priceToken}
              onChange={(e) => setForm({ ...form, priceToken: e.target.value })}
              required
            />
            <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">Token</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1">
            รายละเอียดสินค้า
          </label>
          <textarea
            className="input text-xs"
            rows={3}
            placeholder="คำอธิบายเพิ่มเติม เช่น ร้อน/เย็น, พิเศษ/ธรรมดา"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>

        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer pt-2">
          <input
            type="checkbox"
            className="rounded text-brand-600"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          <span>เปิดจำหน่ายสินค้านี้ในร้าน</span>
        </label>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button className="btn-primary text-xs px-6 py-2.5 font-bold gap-2" type="button" onClick={save}>
            <Save className="h-4 w-4" /> บันทึกการเปลี่ยนแปลง
          </button>
        </div>
      </div>
    </div>
  )
}
