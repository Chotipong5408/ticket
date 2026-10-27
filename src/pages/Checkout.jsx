import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { quoteCart, updateCart, checkout } from '../services/orderService'
import { formatTHB, formatToken } from '../lib/money'
import { useLiveData } from '../hooks/useLiveData'

export default function Checkout() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()
  const quote = quoteCart(user.id)
  const [ship, setShip] = useState(quote.cart.shipping || { recipientName: user.fullName, phone: user.phone, address: '', province: '', postalCode: '' })
  function setMethod(method) {
    updateCart(user.id, { ...quote.cart, shippingMethod: method, shipping: ship })
  }
  function saveShip(e) {
    const next = { ...ship, [e.target.name]: e.target.value }
    setShip(next)
    updateCart(user.id, { ...quote.cart, shipping: next })
  }
  function place() {
    try {
      if (quote.shippingMethod === 'delivery') updateCart(user.id, { ...quote.cart, shipping: ship })
      const { payment } = checkout(user)
      toast.push('สร้างคำสั่งซื้อแล้ว กรุณาชำระเงิน', 'success')
      nav(`/payment/${payment.id}`)
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageHeader title="สรุปรายการก่อนชำระเงิน" subtitle="ยอดเงินคำนวณจากราคาที่บันทึกในระบบ ณ เวลาซื้อ" />
      {quote.items.length === 0 ? <p>ตะกร้าว่าง</p> : (
        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-semibold">รายการบัตร</h2>
            {quote.ticketLines.length === 0 ? <p className="text-sm text-slate-500">ไม่มีบัตร</p> : quote.ticketLines.map((l) => (
              <div key={l.ticketTypeId} className="flex justify-between py-1 text-sm">
                <span>{l.name} × {l.quantity}</span>
                <span>{formatTHB(l.lineTotal)} · โบนัส {formatToken(l.bonusTotal)}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <h2 className="mb-3 font-semibold">รายการเสื้อ</h2>
            {quote.merchLines.length === 0 ? <p className="text-sm text-slate-500">ไม่มีเสื้อ</p> : quote.merchLines.map((l) => (
              <div key={l.productId + l.size} className="flex justify-between py-1 text-sm">
                <span>{l.name} ({l.size}) × {l.quantity}</span>
                <span>{formatTHB(l.lineTotal)}</span>
              </div>
            ))}
            {quote.merchLines.length > 0 ? (
              <div className="mt-4 space-y-3">
                <label className="flex gap-2 text-sm"><input type="radio" checked={quote.shippingMethod === 'pickup'} onChange={() => setMethod('pickup')} /> รับเสื้อภายในงาน</label>
                <label className="flex gap-2 text-sm"><input type="radio" checked={quote.shippingMethod === 'delivery'} onChange={() => setMethod('delivery')} /> จัดส่งตามที่อยู่</label>
                {quote.shippingMethod === 'delivery' ? (
                  <div className="grid gap-2">
                    {[['recipientName', 'ชื่อผู้รับ'], ['phone', 'เบอร์โทร'], ['address', 'ที่อยู่'], ['province', 'จังหวัด'], ['postalCode', 'รหัสไปรษณีย์']].map(([n, l]) => (
                      <input key={n} className="input" name={n} placeholder={l} value={ship[n] || ''} onChange={saveShip} />
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="card space-y-1 text-sm">
            <div className="flex justify-between"><span>บัตร</span><span>{formatTHB(quote.subtotalTickets)}</span></div>
            <div className="flex justify-between"><span>เสื้อ</span><span>{formatTHB(quote.subtotalMerchandise)}</span></div>
            <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>{formatTHB(quote.shippingFee)}</span></div>
            <div className="flex justify-between font-semibold text-base"><span>ยอดที่ต้องชำระ</span><span>{formatTHB(quote.totalAmount)}</span></div>
            <p className="text-emerald-700">Token โบนัสที่คาดว่าจะได้รับหลังอนุมัติ: {formatToken(quote.expectedBonusToken)}</p>
          </div>
          <button className="btn-primary w-full" type="button" onClick={place}>ยืนยันและไปชำระเงิน</button>
        </div>
      )}
    </div>
  )
}
