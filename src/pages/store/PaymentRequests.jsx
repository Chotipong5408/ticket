import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { Modal } from '../../components/ui/Modal'
import { QrBox } from '../../components/QrBox'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { storesRepo, productsRepo, requestsRepo, usersRepo } from '../../repositories'
import { createPaymentRequest } from '../../services/storeService'
import { formatToken } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { encodeQr } from '../../lib/qr'
import { useLiveData } from '../../hooks/useLiveData'
import { PlusCircle, QrCode, CheckCircle, Clock } from 'lucide-react'

export default function StorePaymentRequests() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)
  const products = store ? productsRepo.byStore(store.id).filter((p) => p.isActive !== false) : []

  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '')
  const [quantity, setQuantity] = useState(1)
  const [activeRequest, setActiveRequest] = useState(null)
  const [qrModalOpen, setQrModalOpen] = useState(false)

  if (!store) {
    return (
      <div className="card">
        <p className="text-slate-600">บัญชีนี้ยังไม่ได้รับการผูกกับร้านค้า กรุณาติดต่อผู้ดูแลระบบ</p>
      </div>
    )
  }

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0]
  const totalTokens = selectedProduct ? selectedProduct.priceToken * quantity : 0

  function handleCreateRequest(e) {
    e.preventDefault()
    if (!selectedProduct) {
      toast.push('กรุณาเลือกสินค้าหรือสร้างสินค้าของร้านก่อน', 'error')
      return
    }
    try {
      const req = createPaymentRequest(user, {
        storeId: store.id,
        productId: selectedProduct.id,
        quantity: Number(quantity),
      })
      setActiveRequest(req)
      setQrModalOpen(true)
      toast.push('สร้างคำขอชำระเงินเรียบร้อยแล้ว', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  const requests = requestsRepo.byStore(store.id).slice().reverse().map((r) => {
    const payer = r.paidBy ? usersRepo.findById(r.paidBy) : null
    return {
      ...r,
      payerName: payer ? payer.fullName : '-',
    }
  })

  // Current request status check if modal is open
  const currentReqInDb = activeRequest ? requestsRepo.findById(activeRequest.id) : null

  return (
    <div className="space-y-6">
      <PageHeader
        title="คำขอชำระเงินร้านค้า (Payment Requests)"
        subtitle={`ร้าน ${store.name} · สร้างคำขอและ QR Code เพื่อรับชำระ Token จากลูกค้า`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Create Request Form */}
        <div className="card lg:col-span-1">
          <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-slate-800">
            <PlusCircle className="h-5 w-5 text-brand-600" />
            สร้างคำขอรับ Token
          </h3>

          {products.length === 0 ? (
            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
              ยังไม่มีสินค้าเปิดขายในร้าน กรุณาไปที่เมนู <strong>&quot;สินค้าของร้าน&quot;</strong> เพื่อตั้งค่าสินค้าก่อน
            </div>
          ) : (
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div>
                <label className="label">เลือกสินค้า</label>
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

              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ราคาต่อหน่วย</span>
                  <span>{formatToken(selectedProduct?.priceToken || 0)}</span>
                </div>
                <div className="mt-2 flex items-baseline justify-between border-t border-blue-200/50 pt-2">
                  <span className="font-medium text-slate-800">ยอดที่ต้องชำระ</span>
                  <span className="text-xl font-bold text-brand-700">{formatToken(totalTokens)}</span>
                </div>
              </div>

              <button type="submit" className="btn-primary w-full py-2.5">
                <QrCode className="h-4 w-4" />
                สร้าง QR รับชำระเงิน
              </button>
            </form>
          )}
        </div>

        {/* Recent Payment Requests Table */}
        <div className="card lg:col-span-2">
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            รายการคำขอชำระเงินล่าสุด ({requests.length})
          </h3>

          <DataTable
            rows={requests}
            searchKeys={['id', 'productName', 'payerName']}
            columns={[
              { key: 'id', header: 'รหัสคำขอ' },
              {
                key: 'productName',
                header: 'สินค้า',
                render: (r) => (
                  <div>
                    <span className="font-medium">{r.productName}</span>
                    <span className="text-xs text-slate-500"> × {r.quantity}</span>
                  </div>
                ),
              },
              {
                key: 'amountToken',
                header: 'ยอด Token',
                render: (r) => <span className="font-semibold text-brand-700">{formatToken(r.amountToken)}</span>,
              },
              {
                key: 'status',
                header: 'สถานะ',
                render: (r) => {
                  const labelMap = { open: 'รอชำระ', paid: 'ชำระแล้ว', expired: 'หมดอายุ' }
                  return <StatusBadge status={r.status} label={labelMap[r.status] || r.status} />
                },
              },
              { key: 'payerName', header: 'ผู้ชำระ' },
              {
                key: 'createdAt',
                header: 'เวลา',
                render: (r) => formatDateTime(r.createdAt),
              },
              {
                key: 'actions',
                header: 'จัดการ',
                render: (r) => (
                  <button
                    type="button"
                    className="btn-secondary py-1 text-xs"
                    onClick={() => {
                      setActiveRequest(r)
                      setQrModalOpen(true)
                    }}
                  >
                    ดู QR
                  </button>
                ),
              },
            ]}
          />
        </div>
      </div>

      {/* QR Code Presentation Modal */}
      <Modal
        open={qrModalOpen}
        title={
          currentReqInDb?.status === 'paid'
            ? 'ชำระเงินสำเร็จแล้ว!'
            : `QR รับชำระ: ${currentReqInDb?.productName} × ${currentReqInDb?.quantity}`
        }
        onClose={() => setQrModalOpen(false)}
      >
        {currentReqInDb && (
          <div className="flex flex-col items-center space-y-4 py-2">
            {currentReqInDb.status === 'paid' ? (
              <div className="flex flex-col items-center py-6 text-center">
                <CheckCircle className="h-16 w-16 text-emerald-500" />
                <h4 className="mt-3 text-xl font-bold text-slate-800">รับชำระเงินสำเร็จแล้ว</h4>
                <p className="mt-1 text-sm text-slate-600">
                  ได้รับ <strong>{formatToken(currentReqInDb.amountToken)}</strong> จากผู้ใช้
                </p>
                <div className="mt-4 rounded-lg bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-700">
                  รหัสคำขอ: {currentReqInDb.id} · บันทึกลงระบบแล้ว
                </div>
              </div>
            ) : (
              <>
                <div className="text-center">
                  <p className="text-sm text-slate-500">ให้ลูกค้าเปิดสแกน QR ผ่านเมนู &quot;สแกนจ่ายร้านค้า&quot;</p>
                  <p className="text-2xl font-bold text-brand-700">{formatToken(currentReqInDb.amountToken)}</p>
                </div>

                <QrBox
                  value={encodeQr('store', currentReqInDb.qrToken)}
                  label={`QR ร้าน ${store.name}`}
                  caption={`รหัส: ${currentReqInDb.qrToken} (หมดอายุใน 15 นาที)`}
                  size={200}
                  downloadName={`store-qr-${currentReqInDb.id}.png`}
                />

                <div className="flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs text-amber-700">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                  กำลังรอการสแกนและยืนยันชำระเงิน...
                </div>
              </>
            )}

            <button
              type="button"
              className="btn-secondary w-full"
              onClick={() => setQrModalOpen(false)}
            >
              ปิดหน้าต่าง
            </button>
          </div>
        )}
      </Modal>
    </div>
  )
}
