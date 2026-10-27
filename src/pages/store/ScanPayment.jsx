import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { QrScanner } from '../../components/QrScanner'
import { decodeQr } from '../../lib/qr'
import { usersRepo, ticketsRepo, storesRepo, productsRepo } from '../../repositories'
import { createPaymentRequest, payStoreRequest } from '../../services/storeService'
import { walletSummary } from '../../services/tokenService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import { UserCheck, ShoppingBag, CreditCard, AlertCircle } from 'lucide-react'

export default function StoreScanPayment() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)
  const products = store ? productsRepo.byStore(store.id).filter((p) => p.isActive !== false) : []

  const [customer, setCustomer] = useState(null)
  const [manualInput, setManualInput] = useState('')
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [processing, setProcessing] = useState(false)

  if (!store) {
    return (
      <div className="card">
        <p className="text-slate-600">บัญชีนี้ยังไม่ได้รับการผูกกับร้านค้า กรุณาติดต่อผู้ดูแลระบบ</p>
      </div>
    )
  }

  function resolveCustomer(raw) {
    if (!raw) return
    const decoded = decodeQr(raw)
    let foundUser = null

    if (decoded?.type === 'user') {
      foundUser = usersRepo.findById(decoded.token)
    } else if (decoded?.type === 'ticket') {
      const ticket = ticketsRepo.findByQr(decoded.token)
      if (ticket) foundUser = usersRepo.findById(ticket.buyerId)
    } else {
      // Try ID, phone, or email match
      foundUser =
        usersRepo.findById(raw.trim()) ||
        usersRepo.findByEmail(raw.trim()) ||
        usersRepo.all().find((u) => u.phone === raw.trim())
    }

    if (!foundUser) {
      toast.push('ไม่พบข้อมูลผู้ใช้จาก QR หรือข้อมูลที่ระบุ', 'error')
      return
    }

    setCustomer(foundUser)
    toast.push(`พบผู้ใช้: ${foundUser.fullName}`, 'success')
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]
  const totalTokens = selectedProduct ? selectedProduct.priceToken * quantity : 0
  const customerWallet = customer ? walletSummary(customer.id) : null
  const hasEnoughTokens = customerWallet ? customerWallet.balance >= totalTokens : false

  function handleDirectCharge() {
    if (!customer) {
      toast.push('กรุณาสแกนหรือระบุลูกค้าก่อน', 'error')
      return
    }
    if (!selectedProduct) {
      toast.push('กรุณาเลือกสินค้า', 'error')
      return
    }
    if (!hasEnoughTokens) {
      toast.push(`Token ของลูกค้าไม่เพียงพอ (ต้องการ ${formatToken(totalTokens)} แต่มี ${formatToken(customerWallet.balance)})`, 'error')
      return
    }

    setProcessing(true)
    try {
      // 1. Create payment request
      const req = createPaymentRequest(user, {
        storeId: store.id,
        productId: selectedProduct.id,
        quantity: Number(quantity),
      })
      // 2. Customer pays
      payStoreRequest(customer, req.id)
      toast.push(`หัก Token สำเร็จ! รับชำระ ${formatToken(totalTokens)} จาก ${customer.fullName}`, 'success')
      // Refresh customer data
      setCustomer(usersRepo.findById(customer.id))
      setQuantity(1)
    } catch (err) {
      toast.push(err.message, 'error')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="สแกนรับชำระ Token หน้าเคาน์เตอร์"
        subtitle={`ร้าน ${store.name} · สแกน QR บัตรหรือ QR กระเป๋าเงินของลูกค้าเพื่อตัด Token โดยตรง`}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: QR Scanner & Manual Input */}
        <div className="card space-y-4">
          <h3 className="text-base font-semibold text-slate-800">สแกน QR ลูกค้า</h3>
          <p className="text-xs text-slate-500">
            สามารถสแกนได้ทั้ง <strong>QR Ticket</strong> และ <strong>QR กระเป๋าเงิน</strong> ของลูกค้า
          </p>

          <QrScanner onResult={resolveCustomer} />

          <div className="pt-2">
            <label className="label">หรือระบุเบอร์โทร / อีเมล / User ID ของลูกค้า</label>
            <div className="flex gap-2">
              <input
                className="input"
                placeholder="เช่น 0812345678 หรือ user ID"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') resolveCustomer(manualInput)
                }}
              />
              <button
                type="button"
                className="btn-secondary whitespace-nowrap"
                onClick={() => resolveCustomer(manualInput)}
              >
                ค้นหา
              </button>
            </div>
          </div>
        </div>

        {/* Right: Customer Info & Charge Action */}
        <div className="card space-y-5">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <UserCheck className="h-5 w-5 text-brand-600" />
            ข้อมูลลูกค้า & การตัดยอด Token
          </h3>

          {!customer ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 py-12 text-center">
              <AlertCircle className="h-10 w-10 text-slate-400" />
              <p className="mt-2 text-sm font-medium text-slate-600">ยังไม่ได้ระบุลูกค้า</p>
              <p className="text-xs text-slate-400">กรุณาสแกน QR หรือค้นหาลูกค้าจากฝั่งซ้าย</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Customer summary card */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-slate-900">{customer.fullName}</h4>
                    <p className="text-xs text-slate-500">
                      รุ่นปี พ.ศ. {customer.enrollmentYearBE || '-'} · {customer.phone || customer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-500">ยอดคงเหลือ</span>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatToken(customerWallet?.balance || 0)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Order creation form */}
              <div className="space-y-4">
                <div>
                  <label className="label">สินค้า</label>
                  <select
                    className="input"
                    value={selectedProductId || selectedProduct?.id}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({formatToken(p.priceToken)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="label">จำนวน</label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="btn-secondary h-10 w-10 text-lg font-bold"
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      className="input text-center font-bold"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    />
                    <button
                      type="button"
                      className="btn-secondary h-10 w-10 text-lg font-bold"
                      onClick={() => setQuantity((q) => q + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Total amount */}
                <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-700">ยอดชำระทั้งสิ้น</span>
                    <span className="text-2xl font-bold text-brand-700">{formatToken(totalTokens)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
                    <span>ยอดคงเหลือหลังหัก</span>
                    <span className={hasEnoughTokens ? 'font-medium text-slate-700' : 'font-bold text-red-600'}>
                      {hasEnoughTokens
                        ? formatToken((customerWallet?.balance || 0) - totalTokens)
                        : 'Token ไม่เพียงพอ'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={!hasEnoughTokens || processing || products.length === 0}
                    className="btn-primary flex-1 py-3 text-base"
                    onClick={handleDirectCharge}
                  >
                    <CreditCard className="h-5 w-5" />
                    {processing ? 'กำลังบันทึก...' : `ยืนยันหัก ${formatToken(totalTokens)}`}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setCustomer(null)
                      setManualInput('')
                    }}
                  >
                    เปลี่ยนลูกค้า
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
