import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ShirtArt } from '../components/ShirtArt'
import { merchRepo } from '../repositories'
import { addMerchToCart, quoteCart } from '../services/orderService'
import { formatTHB } from '../lib/money'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { useLiveData } from '../hooks/useLiveData'
import { Shirt, ShoppingCart, ArrowRight, Check, Package, Sparkles, Ticket } from 'lucide-react'

export default function Merchandise() {
  useLiveData()
  const products = merchRepo.all().filter((p) => p.isActive)
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const [size, setSize] = useState({})
  const [qty, setQty] = useState({})

  const cartCount = user ? quoteCart(user.id).items.length : 0

  function add(p) {
    if (!user) return nav('/login')
    const selectedSize = size[p.id] || p.sizes?.[0] || 'L'
    const selectedQty = qty[p.id] || 1
    try {
      addMerchToCart(user.id, p.id, selectedSize, selectedQty)
      toast.push(`เพิ่ม ${p.name} (ไซส์ ${selectedSize}) x${selectedQty} ในตะกร้าแล้ว`, 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <PageHeader
        title="เสื้อที่ระลึกงานเลี้ยงรุ่น 2026"
        subtitle="ผ้าคอตตอนคุณภาพพรีเมียม ใส่สบาย พร้อมสกรีนลายพิเศษศิษย์เก่า 2026"
        icon={Shirt}
        actions={
          <button
            className="btn-primary gap-2"
            onClick={() => nav('/checkout')}
          >
            <ShoppingCart className="h-4 w-4" /> ตะกร้าสินค้า ({cartCount})
          </button>
        }
      />

      {/* Dual Switcher: Tickets <-> Shirts */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex p-1.5 rounded-2xl bg-slate-100 border border-slate-200/80 shadow-inner">
          <button
            type="button"
            onClick={() => nav('/tickets')}
            className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition"
          >
            <Ticket className="h-4 w-4 text-slate-400" />
            <span>← 1. ซื้อบัตรเข้างาน</span>
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-xs font-extrabold text-brand-700 shadow-sm"
          >
            <Shirt className="h-4 w-4 text-brand-600" />
            <span>2. สั่งซื้อเสื้อที่ระลึก</span>
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Shirt className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <p className="font-medium text-slate-700">ยังไม่มีสินค้าเปิดจำหน่ายในขณะนี้</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {products.map((p) => {
            const currentSize = size[p.id] || p.sizes?.[0] || 'L'
            const currentQty = qty[p.id] || 1

            return (
              <div
                key={p.id}
                className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <ShirtArt kind={p.imageKind} />

                  <div className="mt-5">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-xl font-bold text-slate-800">{p.name}</h2>
                      <span className="text-2xl font-extrabold text-brand-700">{formatTHB(p.price)}</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">{p.description}</p>
                  </div>

                  {/* Size selection */}
                  <div className="mt-6 space-y-3">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
                      เลือกขนาดเสื้อ (Size)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {p.sizes.map((s) => {
                        const isSelected = currentSize === s
                        const stock = p.stockEnabled ? p.stockBySize?.[s] || 0 : null
                        const isOutOfStock = p.stockEnabled && stock <= 0

                        return (
                          <button
                            key={s}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => setSize({ ...size, [p.id]: s })}
                            className={`min-w-[48px] rounded-xl px-3 py-2 text-xs font-bold transition-all border ${
                              isSelected
                                ? 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-500/20'
                                : isOutOfStock
                                  ? 'bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-brand-300 hover:bg-brand-50/50'
                            }`}
                          >
                            <div>{s}</div>
                            {stock !== null && (
                              <div className="text-[10px] font-normal opacity-75">({stock})</div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quantity selector */}
                  <div className="mt-4">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
                      จำนวน
                    </label>
                    <input
                      className="input w-28 text-center font-bold"
                      type="number"
                      min="1"
                      max="50"
                      value={currentQty}
                      onChange={(e) => setQty({ ...qty, [p.id]: Math.max(1, Number(e.target.value) || 1) })}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    className="btn-primary w-full py-3 text-xs font-bold gap-2"
                    type="button"
                    onClick={() => add(p)}
                  >
                    <ShoppingCart className="h-4 w-4" /> เพิ่มเสื้อลงตะกร้า ({formatTHB(p.price * currentQty)})
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Sizing Guide Helper Card */}
      <div className="mt-8 rounded-2xl bg-slate-50 border border-slate-200/80 p-5 text-xs text-slate-600">
        <h4 className="font-bold text-slate-800 mb-1">ตารางขนาดรอบอกโดยประมาณ (นิ้ว)</h4>
        <p className="text-slate-500">S: 36" | M: 38" | L: 40" | XL: 42" | 2XL: 44" | 3XL: 46"</p>
        <p className="text-slate-400 mt-1">สามารถเลือกจัดส่งถึงที่อยู่ หรือติดต่อรับภายในงานได้ในขั้นตอน Checkout</p>
      </div>
    </div>
  )
}
