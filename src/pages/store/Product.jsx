import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { productsRepo, storesRepo } from '../../repositories'
import { saveProduct } from '../../services/storeService'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function StoreProduct() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)
  const product = productsRepo.byStore(user.storeId)[0]
  const [form, setForm] = useState({ name: product?.name || '', priceToken: product?.priceToken || 0, description: product?.description || '', isActive: product?.isActive !== false })
  function save() {
    try {
      saveProduct(user, store.id, form)
      toast.push('บันทึกราคาแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div>
      <PageHeader title="สินค้าของร้าน" subtitle="Demo รองรับสินค้าหลัก 1 รายการต่อร้าน แต่แยก Store/Product แล้ว" />
      <div className="card max-w-lg space-y-3">
        <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input" type="number" value={form.priceToken} onChange={(e) => setForm({ ...form, priceToken: e.target.value })} />
        <textarea className="input" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <label className="flex gap-2 text-sm"><input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} /> เปิดขาย</label>
        <button className="btn-primary" type="button" onClick={save}>บันทึก</button>
      </div>
    </div>
  )
}
