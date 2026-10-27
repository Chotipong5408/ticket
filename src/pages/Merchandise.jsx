import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ShirtArt } from '../components/ShirtArt'
import { merchRepo } from '../repositories'
import { addMerchToCart } from '../services/orderService'
import { formatTHB } from '../lib/money'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLiveData } from '../hooks/useLiveData'

export default function Merchandise() {
  useLiveData()
  const products = merchRepo.all().filter((p) => p.isActive)
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [size, setSize] = useState({})
  const [qty, setQty] = useState({})
  function add(p) {
    if (!user) return nav('/login')
    try {
      addMerchToCart(user.id, p.id, size[p.id] || 'L', qty[p.id] || 1)
      toast.push('เพิ่มเสื้อในตะกร้าแล้ว', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <PageHeader title="ซื้อเสื้อที่ระลึก" subtitle="เลือกขนาดและจำนวน แล้วไป Checkout เพื่อเลือกวิธีรับสินค้า" actions={<button className="btn-primary" onClick={() => nav('/checkout')}>ไป Checkout</button>} />
      <div className="grid gap-4 md:grid-cols-2">
        {products.map((p) => (
          <div key={p.id} className="card">
            <ShirtArt kind={p.imageKind} />
            <h2 className="mt-3 font-semibold">{p.name}</h2>
            <p className="text-sm text-slate-500">{p.description}</p>
            <p className="mt-2 text-xl font-bold text-brand-700">{formatTHB(p.price)}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <label className="label">ขนาด</label>
                <select className="input" value={size[p.id] || 'L'} onChange={(e) => setSize({ ...size, [p.id]: e.target.value })}>
                  {p.sizes.map((s) => <option key={s} value={s}>{s}{p.stockEnabled ? ` (${p.stockBySize[s] || 0})` : ''}</option>)}
                </select>
              </div>
              <div>
                <label className="label">จำนวน</label>
                <input className="input" type="number" min="1" value={qty[p.id] || 1} onChange={(e) => setQty({ ...qty, [p.id]: e.target.value })} />
              </div>
            </div>
            <button className="btn-primary mt-4 w-full" type="button" onClick={() => add(p)}>เพิ่มในตะกร้า</button>
          </div>
        ))}
      </div>
    </div>
  )
}
