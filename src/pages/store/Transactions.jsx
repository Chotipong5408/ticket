import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { storesRepo, requestsRepo, usersRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatToken } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { toCsv } from '../../lib/csv'
import { useLiveData } from '../../hooks/useLiveData'
import { Download, Filter } from 'lucide-react'

export default function StoreTransactions() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)
  const [statusFilter, setStatusFilter] = useState('all')

  if (!store) {
    return (
      <div className="card">
        <p className="text-slate-600">บัญชีนี้ยังไม่ได้รับการผูกกับร้านค้า</p>
      </div>
    )
  }

  const allRequests = requestsRepo.byStore(store.id).slice().reverse().map((r) => {
    const payer = r.paidBy ? usersRepo.findById(r.paidBy) : null
    return {
      ...r,
      payerName: payer ? payer.fullName : '-',
      payerPhone: payer ? payer.phone : '-',
    }
  })

  const filteredRequests = statusFilter === 'all'
    ? allRequests
    : allRequests.filter((r) => r.status === statusFilter)

  function handleExportCsv() {
    try {
      const rows = filteredRequests.map((r) => ({
        'รหัสคำขอ': r.id,
        'ชื่อสินค้า': r.productName,
        'จำนวน': r.quantity,
        'ราคาต่อหน่วย': r.unitPrice,
        'ยอด Token รวม': r.amountToken,
        'สถานะ': r.status === 'paid' ? 'ชำระแล้ว' : r.status === 'open' ? 'รอชำระ' : 'หมดอายุ',
        'ผู้ชำระ': r.payerName,
        'เบอร์โทรผู้ชำระ': r.payerPhone,
        'เวลาที่สร้าง': formatDateTime(r.createdAt),
        'เวลาที่ชำระ': r.paidAt ? formatDateTime(r.paidAt) : '-',
      }))
      toCsv(rows, `store-transactions-${store.id}.csv`)
      toast.push('ดาวน์โหลดไฟล์ CSV เรียบร้อยแล้ว', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="ประวัติรายการรับชำระเงิน"
          subtitle={`ร้าน ${store.name} · รายการคำขอและประวัติการขายทั้งหมด`}
        />
        <button
          type="button"
          className="btn-secondary self-start sm:self-auto"
          onClick={handleExportCsv}
        >
          <Download className="h-4 w-4" />
          ส่งออก CSV
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-slate-500">สถานะ:</span>
        {[
          { key: 'all', label: 'ทั้งหมด' },
          { key: 'paid', label: 'ชำระแล้ว (สำเร็จ)' },
          { key: 'open', label: 'รอชำระ' },
          { key: 'expired', label: 'หมดอายุ' },
        ].map((f) => (
          <button
            key={f.key}
            type="button"
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              statusFilter === f.key
                ? 'bg-brand-600 text-white'
                : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
            onClick={() => setStatusFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable
          rows={filteredRequests}
          searchKeys={['id', 'productName', 'payerName', 'payerPhone']}
          columns={[
            { key: 'id', header: 'รหัสคำขอ' },
            {
              key: 'productName',
              header: 'สินค้า',
              render: (r) => (
                <div>
                  <span className="font-medium text-slate-900">{r.productName}</span>
                  <span className="text-xs text-slate-500"> × {r.quantity}</span>
                </div>
              ),
            },
            {
              key: 'amountToken',
              header: 'ยอด Token',
              render: (r) => (
                <span className={`font-semibold ${r.status === 'paid' ? 'text-emerald-600' : 'text-slate-700'}`}>
                  {formatToken(r.amountToken)}
                </span>
              ),
            },
            {
              key: 'status',
              header: 'สถานะ',
              render: (r) => {
                const labelMap = { open: 'รอชำระ', paid: 'ชำระแล้ว', expired: 'หมดอายุ' }
                return <StatusBadge status={r.status} label={labelMap[r.status] || r.status} />
              },
            },
            {
              key: 'payerName',
              header: 'ผู้ชำระ',
              render: (r) => (
                <div>
                  <div className="text-slate-800">{r.payerName}</div>
                  {r.payerPhone !== '-' && <div className="text-xs text-slate-400">{r.payerPhone}</div>}
                </div>
              ),
            },
            {
              key: 'createdAt',
              header: 'เวลาที่สร้าง',
              render: (r) => formatDateTime(r.createdAt),
            },
            {
              key: 'paidAt',
              header: 'เวลาที่ชำระ',
              render: (r) => (r.paidAt ? formatDateTime(r.paidAt) : '-'),
            },
          ]}
        />
      </div>
    </div>
  )
}
