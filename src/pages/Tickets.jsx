import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { listActiveTicketTypes } from '../services/catalogService'
import { addTicketToCart, quoteCart } from '../services/orderService'
import { useLiveData } from '../hooks/useLiveData'
import { formatTHB, formatToken } from '../lib/money'
import { Ticket, ShoppingCart, Coins, Sparkles, Check, AlertCircle, ArrowRight, Plus, Minus } from 'lucide-react'
import { useState } from 'react'

export default function Tickets() {
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  useLiveData()
  const types = listActiveTicketTypes()
  const [quantities, setQuantities] = useState({})

  const cartCount = user ? quoteCart(user.id).items.length : 0

  const setQty = (id, val) => {
    const num = Math.max(1, Math.min(20, Number(val) || 1))
    setQuantities({ ...quantities, [id]: num })
  }

  const incQty = (id) => {
    const current = quantities[id] || 1
    setQty(id, current + 1)
  }

  const decQty = (id) => {
    const current = quantities[id] || 1
    setQty(id, Math.max(1, current - 1))
  }

  const handleAdd = (type) => {
    if (!user) return nav('/login')
    try {
      addTicketToCart(user.id, type.id, quantities[type.id] || 1)
      toast.push(`เพิ่ม ${type.name} (${quantities[type.id] || 1} ใบ) ลงตะกร้าแล้ว`, 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 border border-brand-200/60 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-3">
          <Ticket className="h-3.5 w-3.5" />
          <span>จำหน่ายบัตรเข้างานล่วงหน้า</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">เลือกประเภทบัตรเข้างาน</h1>
        <p className="text-sm text-slate-500 mt-2 leading-relaxed">
          บัตรทุกประเภทจะได้รับ QR Ticket หลังการตรวจสอบชำระเงิน และรับ Token โบนัสเข้ากระเป๋าสำหรับใช้จ่ายภายในงานทันที
        </p>

        {/* Dual Switcher: Tickets <-> Shirts */}
        <div className="mt-6 inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-brand-700 shadow-sm"
          >
            <Ticket className="h-4 w-4 text-brand-600" />
            <span>1. เลือกซื้อบัตรเข้างาน</span>
          </button>
          <button
            type="button"
            onClick={() => nav('/merchandise')}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <Shirt className="h-4 w-4 text-slate-400" />
            <span>2. สั่งซื้อเสื้อที่ระลึก →</span>
          </button>
        </div>
      </div>

      {types.length === 0 && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">ยังไม่มีบัตรเปิดขายในขณะนี้</p>
          <p className="text-xs text-slate-400 mt-1">โปรดติดตามประกาศจากคณะกรรมการจัดงาน</p>
        </div>
      )}

      {/* Ticket Cards Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {types.map((type, idx) => {
          const qty = quantities[type.id] || 1
          const remaining = type.stockLimit ? type.stockLimit - (type.soldCount || 0) : null
          const isFeatured = idx === 0 // highlight first ticket

          return (
            <div
              key={type.id}
              className={`relative rounded-3xl bg-white border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                isFeatured
                  ? 'border-brand-500 ring-4 ring-brand-500/10 shadow-xl'
                  : 'border-slate-200/80 hover:border-brand-300 shadow-sm hover:shadow-lg'
              }`}
            >
              {isFeatured && (
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white text-[11px] font-bold text-center py-1.5 tracking-wide uppercase">
                  ⭐ ยอดนิยม / แนะนำ
                </div>
              )}

              <div className="p-6 flex-1">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-600 shrink-0">
                    <Ticket className="h-5 w-5" />
                  </div>
                  {remaining !== null && (
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold border ${
                      remaining <= 10
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}>
                      เหลือ {remaining} ใบ
                    </span>
                  )}
                </div>

                <h2 className="text-lg font-bold text-slate-800 mb-1.5">{type.name}</h2>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed min-h-[36px]">{type.description}</p>

                {/* Price Display */}
                <div className="rounded-2xl bg-slate-50 border border-slate-100 p-4 mb-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900">{formatTHB(type.price)}</span>
                    <span className="text-xs text-slate-400 font-medium">/ ท่าน</span>
                  </div>

                  {/* Bonus Token Pill */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 rounded-xl px-2.5 py-1.5">
                    <Coins className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>รับโบนัสฟรี {formatToken(type.bonusToken)} Token</span>
                  </div>
                </div>
              </div>

              {/* Action Section */}
              <div className="p-6 pt-0 border-t border-slate-100 bg-slate-50/40">
                <div className="flex items-center justify-between gap-3 my-4">
                  <span className="text-xs font-medium text-slate-600">จำนวนที่ต้องการ:</span>
                  <div className="flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                    <button
                      type="button"
                      onClick={() => decQty(type.id)}
                      className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                      aria-label="ลดจำนวน"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={qty}
                      onChange={(e) => setQty(type.id, e.target.value)}
                      className="w-12 text-center text-sm font-bold text-slate-800 border-0 focus:ring-0 p-0"
                    />
                    <button
                      type="button"
                      onClick={() => incQty(type.id)}
                      className="p-2 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition"
                      aria-label="เพิ่มจำนวน"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAdd(type)}
                  className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-sm ${
                    isFeatured
                      ? 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <ShoppingCart className="h-4 w-4" /> เพิ่มลงตะกร้า
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Floating or fixed Checkout Banner */}
      {user && cartCount > 0 && (
        <div className="mt-10 rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-5 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md">
              <ShoppingCart className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-sm">มีสินค้าในตะกร้าเรียบร้อยแล้ว ({cartCount} รายการ)</p>
              <p className="text-xs text-white/80">ตรวจสอบรายการและชำระเงินเพื่อรอออกบัตร</p>
            </div>
          </div>
          <button
            onClick={() => nav('/checkout')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-white text-brand-700 font-bold px-6 py-2.5 text-xs hover:bg-brand-50 transition shadow"
          >
            ไปที่ตะกร้า / ชำระเงิน <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Terms & Notice */}
      <div className="mt-10 rounded-2xl bg-amber-50/80 border border-amber-200/80 p-5 text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
        <div className="space-y-1">
          <strong className="block font-semibold">ข้อกำหนดและเงื่อนไขการซื้อบัตร:</strong>
          <p>
            บัตรที่ซื้อแล้วไม่สามารถยกเลิก ขอคืนเงิน หรือแลกเปลี่ยนเป็นเงินสดได้ในทุกกรณี หากท่านซื้อบัตรให้เพื่อนหรือคนสนิท ท่านสามารถบันทึกภาพ QR Ticket หลังจากได้รับการอนุมัติแล้วส่งต่อให้เพื่อนเพื่อใช้สแกนเข้างานด้วยตนเอง
          </p>
        </div>
      </div>
    </div>
  )
}
