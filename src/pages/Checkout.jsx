import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import {
  quoteCart,
  updateCart,
  checkout,
  clearCart,
  removeTicketFromCart,
  updateMerchQuantity,
  removeMerchFromCart,
} from '../services/orderService'
import { formatTHB, formatToken } from '../lib/money'
import { useLiveData } from '../hooks/useLiveData'
import {
  ShoppingCart,
  Ticket,
  Shirt,
  Truck,
  Coins,
  ArrowRight,
  ShieldCheck,
  ChevronLeft,
  Plus,
  Minus,
  Trash2,
} from 'lucide-react'

export default function Checkout() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const quote = quoteCart(user.id)
  const [confirmClearOpen, setConfirmClearOpen] = useState(false)
  const [ship, setShip] = useState(
    quote.cart.shipping || {
      recipientName: user.fullName || '',
      phone: user.phone || '',
      address: '',
      province: '',
      postalCode: '',
    }
  )

  function saveShip(e) {
    const next = { ...ship, [e.target.name]: e.target.value }
    setShip(next)
    updateCart(user.id, { ...quote.cart, shippingMethod: 'delivery', shipping: next })
  }

  const handleRemoveTicket = (ticketTypeId) => {
    try {
      removeTicketFromCart(user.id, ticketTypeId)
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  const handleUpdateMerchQty = (productId, size, nextQty) => {
    if (nextQty <= 0) {
      handleRemoveMerch(productId, size)
      return
    }
    try {
      updateMerchQuantity(user.id, productId, size, nextQty)
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  const handleRemoveMerch = (productId, size) => {
    try {
      removeMerchFromCart(user.id, productId, size)
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  const handleClearCart = () => {
    try {
      clearCart(user.id)
      setConfirmClearOpen(false)
      toast.push('ล้างรายการทั้งหมดในตะกร้าเรียบร้อยแล้ว', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  function place() {
    try {
      if (quote.merchLines.length > 0) {
        updateCart(user.id, { ...quote.cart, shippingMethod: 'delivery', shipping: ship })
      }
      const { payment } = checkout(user)
      toast.push('สร้างคำสั่งซื้อสำเร็จ กรุณาดำเนินการชำระเงิน', 'success')
      nav(`/payment/${payment.id}`)
    } catch (e) {
      if (e.issues && e.issues[0]?.message) {
        toast.push(e.issues[0].message, 'error')
      } else if (e.errors && e.errors[0]?.message) {
        toast.push(e.errors[0].message, 'error')
      } else {
        toast.push(e.message, 'error')
      }
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:py-12">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-600 transition"
        >
          <ChevronLeft className="h-4 w-4" /> เลือกซื้อบัตรหรือสินค้าเพิ่ม
        </Link>

        {quote.items.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100/80 border border-red-200/60 px-3.5 py-1.5 rounded-xl transition shadow-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>เคลียร์ตะกร้า</span>
          </button>
        )}
      </div>

      <PageHeader
        title="สรุปรายการสั่งซื้อ (Checkout)"
        subtitle="ตรวจสอบรายการบัตรและเสื้อที่ระลึก สามารถเพิ่มลดจำนวนหรือลบรายการก่อนยืนยัน"
        icon={ShoppingCart}
      />

      {quote.items.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <h3 className="text-base font-bold text-slate-700">ตะกร้าของคุณยังว่างอยู่</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">คุณยังไม่ได้เลือกบัตรเข้างานหรือเสื้อที่ระลึก</p>
          <div className="flex justify-center gap-3">
            <Link to="/tickets" className="btn-primary text-xs">
              <Ticket className="h-4 w-4" /> เลือกซื้อบัตร
            </Link>
            <Link to="/merchandise" className="btn-secondary text-xs">
              <Shirt className="h-4 w-4" /> เลือกซื้อเสื้อ
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-12 items-start">
          {/* Left Column: Cart items & shipping */}
          <div className="space-y-6 lg:col-span-7">
            {/* Tickets Section */}
            {quote.ticketLines.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between font-bold text-slate-800 text-base mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Ticket className="h-4 w-4" />
                    </div>
                    <span>รายการบัตรเข้างาน</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {quote.ticketLines.length} ประเภท
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {quote.ticketLines.map((l) => (
                    <div key={l.ticketTypeId} className="py-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800 text-sm leading-snug">{l.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">ราคาใบละ {formatTHB(l.unitPrice)} · {l.quantity} ที่นั่ง</p>
                        {l.bonusTotal > 0 && (
                          <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                            <Coins className="h-3.5 w-3.5" /> โบนัส +{formatToken(l.bonusTotal)} Token
                          </p>
                        )}
                        {/* Attendee list */}
                        {Array.isArray(l.attendees) && l.attendees.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {l.attendees.map((a, i) => (
                              <div key={i} className="flex items-center gap-1.5 text-[11px] text-slate-500">
                                <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${a.isOwner ? 'bg-brand-100 text-brand-700' : 'bg-slate-100 text-slate-600'}`}>
                                  {i + 1}
                                </span>
                                <span className="font-medium text-slate-700">{a.fullName}</span>
                                <span className="text-slate-400">({a.email})</span>
                                {!a.isOwner && <span className="rounded bg-amber-50 border border-amber-200 px-1 text-amber-700">เพื่อน</span>}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Total & Remove */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                        <div className="text-right min-w-[75px]">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {formatTHB(l.lineTotal)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveTicket(l.ticketTypeId)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title={`ลบ ${l.name}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Merchandise Section */}
            {quote.merchLines.length > 0 && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between font-bold text-slate-800 text-base mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                      <Shirt className="h-4 w-4" />
                    </div>
                    <span>รายการเสื้อที่ระลึก</span>
                  </div>
                  <span className="text-xs font-semibold text-slate-400">
                    {quote.merchLines.length} รายการ
                  </span>
                </div>

                <div className="divide-y divide-slate-100">
                  {quote.merchLines.map((l) => (
                    <div key={l.productId + l.size} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-800 text-sm leading-snug">{l.name}</p>
                          <span className="rounded-md bg-purple-50 border border-purple-200/60 px-2 py-0.5 text-[11px] font-bold text-purple-700">
                            ไซส์ {l.size}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">ราคาตัวละ {formatTHB(l.unitPrice)}</p>
                      </div>

                      {/* Quantity Adjuster & Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-50">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1">
                          <button
                            type="button"
                            onClick={() => handleUpdateMerchQty(l.productId, l.size, l.quantity - 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition"
                            title="ลดจำนวน"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold text-slate-800 select-none">
                            {l.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUpdateMerchQty(l.productId, l.size, l.quantity + 1)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-xs transition"
                            title="เพิ่มจำนวน"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="text-right min-w-[75px]">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base">
                            {formatTHB(l.lineTotal)}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveMerch(l.productId, l.size)}
                          className="flex h-8 w-8 items-center justify-center rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                          title={`ลบ ${l.name} (${l.size})`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Delivery Options */}
                <div className="mt-6 pt-4 border-t border-slate-100">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-3">
                    ที่อยู่สำหรับการจัดส่งเสื้อ
                  </label>
                  <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <Truck className="h-4 w-4 text-brand-600" />
                      <span>จัดส่งพัสดุด่วนตามที่อยู่ระบุ</span>
                    </div>

                    <div className="grid gap-2.5 pt-2">
                      <input
                        className="input text-xs"
                        name="recipientName"
                        placeholder="ชื่อ-นามสกุลผู้รับ"
                        value={ship.recipientName || ''}
                        onChange={saveShip}
                      />
                      <input
                        className="input text-xs"
                        name="phone"
                        placeholder="เบอร์โทรศัพท์ผู้รับ"
                        value={ship.phone || ''}
                        onChange={saveShip}
                      />
                      <textarea
                        className="input text-xs"
                        name="address"
                        rows={2}
                        placeholder="ที่อยู่จัดส่ง (บ้านเลขที่, ถนน, ตำบล, อำเภอ)"
                        value={ship.address || ''}
                        onChange={saveShip}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="input text-xs"
                          name="province"
                          placeholder="จังหวัด"
                          value={ship.province || ''}
                          onChange={saveShip}
                        />
                        <input
                          className="input text-xs"
                          name="postalCode"
                          placeholder="รหัสไปรษณีย์"
                          value={ship.postalCode || ''}
                          onChange={saveShip}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Order Summary Card */}
          <div className="space-y-4 lg:col-span-5">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sticky top-24">
              <h3 className="font-bold text-slate-800 text-base mb-4 pb-3 border-b border-slate-100">
                สรุปยอดเงิน
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวมบัตรเข้างาน</span>
                  <span className="font-semibold text-slate-800">{formatTHB(quote.subtotalTickets)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>ยอดรวมเสื้อที่ระลึก</span>
                  <span className="font-semibold text-slate-800">{formatTHB(quote.subtotalMerchandise)}</span>
                </div>
                {quote.merchLines.length > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>ค่าจัดส่งพัสดุ</span>
                    <span className="font-semibold text-slate-800">{formatTHB(quote.shippingFee)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-100">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-slate-800">ยอดรวมทั้งสิ้น</span>
                    <span className="text-2xl font-extrabold text-brand-700">{formatTHB(quote.totalAmount)}</span>
                  </div>
                </div>

                {quote.expectedBonusToken > 0 && (
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-200/60 p-3.5 text-xs text-emerald-800 flex items-start gap-2.5">
                    <Coins className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
                    <div>
                      <p className="font-bold">รับโบนัส {formatToken(quote.expectedBonusToken)} Token ฟรี!</p>
                      <p className="text-emerald-700/80 text-[11px] mt-0.5">ระบบจะโอนเข้า Wallet อัตโนมัติหลังสลิปผ่านการอนุมัติ</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                <button
                  className="btn-primary w-full py-3.5 text-sm font-bold shadow-lg shadow-brand-500/20"
                  type="button"
                  onClick={place}
                >
                  ยืนยันคำสั่งซื้อและไปชำระเงิน <ArrowRight className="h-4 w-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                  <ShieldCheck className="h-3.5 w-3.5 text-slate-400" />
                  <span>ระบบรองรับการชำระเงินด้วย Thai QR สแกนง่าย ปลอดภัย</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Clear Cart Dialog */}
      <ConfirmDialog
        open={confirmClearOpen}
        title="ยืนยันการเคลียร์ตะกร้าสินค้า"
        message="คุณต้องการลบรายการสินค้าทั้งหมดออกจากตะกร้าใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้"
        confirmLabel="เคลียร์ตะกร้าทั้งหมด"
        danger
        onConfirm={handleClearCart}
        onClose={() => setConfirmClearOpen(false)}
      />
    </div>
  )
}
