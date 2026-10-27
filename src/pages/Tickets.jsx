import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listActiveTicketTypes } from '../services/catalogService'
import { addTicketToCart } from '../services/orderService'
import { useLiveData } from '../hooks/useLiveData'
import { formatTHB } from '../lib/money'
import { Ticket, ShoppingCart, Coins } from 'lucide-react'
import { useState } from 'react'

export default function Tickets() {
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  useLiveData()
  const types = listActiveTicketTypes()
  const [quantities, setQuantities] = useState({})

  const setQty = (id, val) => setQuantities({ ...quantities, [id]: Math.max(1, Math.min(20, Number(val) || 1)) })

  const handleAdd = (type) => {
    if (!user) return nav('/login')
    try {
      addTicketToCart(user.id, type.id, quantities[type.id] || 1)
      toast.push(`เพิ่ม ${type.name} x${quantities[type.id] || 1} ลงตะกร้าแล้ว`, 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="text-center mb-10">
        <Ticket className="mx-auto h-10 w-10 text-brand-600 mb-2" />
        <h1 className="text-2xl font-bold text-slate-800">ซื้อบัตรเข้างาน</h1>
        <p className="text-sm text-slate-500 mt-1">เลือกประเภทบัตรที่ต้องการ สามารถซื้อให้ตนเองหรือซื้อให้เพื่อนได้</p>
      </div>

      {types.length === 0 && (
        <div className="card text-center py-12 text-slate-500">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p>ยังไม่มีบัตรเปิดขายขณะนี้</p>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        {types.map((type) => (
          <div key={type.id} className="card hover:shadow-lg transition-all border-2 hover:border-brand-300 flex flex-col">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                  <Ticket className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-800">{type.name}</h2>
              </div>
              <p className="text-sm text-slate-600 mb-4">{type.description}</p>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-3xl font-bold text-brand-700">{formatTHB(type.price)}</span>
                <span className="text-sm text-slate-500">/ใบ</span>
              </div>
              <div className="flex items-center gap-1 text-sm text-emerald-600 mb-4">
                <Coins className="h-4 w-4" />
                <span>โบนัส {type.bonusToken} Token</span>
              </div>
              {type.stockLimit && (
                <p className="text-xs text-slate-500 mb-2">เหลือ {type.stockLimit - (type.soldCount || 0)} ใบ</p>
              )}
            </div>
            <div className="mt-auto pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2 mb-3">
                <label className="text-sm text-slate-600">จำนวน:</label>
                <input type="number" min="1" max="20" value={quantities[type.id] || 1} onChange={(e) => setQty(type.id, e.target.value)} className="input w-20 text-center" />
              </div>
              <button onClick={() => handleAdd(type)} className="btn-primary w-full">
                <ShoppingCart className="h-4 w-4" /> เพิ่มลงตะกร้า
              </button>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="text-center mt-8">
          <button onClick={() => nav('/checkout')} className="btn-primary px-8 py-3 text-base">
            <ShoppingCart className="h-5 w-5" /> ไปที่ตะกร้า / Checkout
          </button>
        </div>
      )}

      <div className="mt-10 rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
        <strong>นโยบาย:</strong> บัตรที่ซื้อแล้วไม่สามารถยกเลิก ขอคืนเงิน หรือแลกคืนได้ สามารถซื้อให้เพื่อนและส่งต่อ QR ด้วยตนเอง
      </div>
    </div>
  )
}
