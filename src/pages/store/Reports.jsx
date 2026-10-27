import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { storesRepo, requestsRepo, productsRepo, usersRepo } from '../../repositories'
import { storeReport } from '../../services/reportService'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { formatToken } from '../../lib/money'
import { formatDateTime } from '../../lib/dates'
import { toCsv } from '../../lib/csv'
import { useLiveData } from '../../hooks/useLiveData'
import { DollarSign, ShoppingCart, TrendingUp, CheckCircle, Download } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'

export default function StoreReports() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const store = storesRepo.findById(user.storeId)

  if (!store) {
    return (
      <div className="card">
        <p className="text-slate-600">บัญชีนี้ยังไม่ได้รับการผูกกับร้านค้า</p>
      </div>
    )
  }

  const report = storeReport(store.id)
  const paidRequests = report.items || []

  // Aggregate stats by product
  const productStatsMap = {}
  paidRequests.forEach((req) => {
    const key = req.productName || 'สินค้าทั่วไป'
    if (!productStatsMap[key]) {
      productStatsMap[key] = { name: key, quantity: 0, tokens: 0 }
    }
    productStatsMap[key].quantity += req.quantity || 1
    productStatsMap[key].tokens += req.amountToken || 0
  })
  const productStats = Object.values(productStatsMap)

  // Hourly or transaction chart data
  const chartData = paidRequests.slice(-10).map((r, idx) => ({
    name: `#${idx + 1}`,
    tokens: r.amountToken,
    product: r.productName,
  }))

  function handleExportReport() {
    try {
      const rows = paidRequests.map((r) => {
        const payer = r.paidBy ? usersRepo.findById(r.paidBy) : null
        return {
          'รหัสคำขอ': r.id,
          'สินค้า': r.productName,
          'จำนวน': r.quantity,
          'ราคาต่อหน่วย': r.unitPrice,
          'ยอด Token': r.amountToken,
          'ผู้ซื้อ': payer?.fullName || '-',
          'เวลาที่ชำระ': formatDateTime(r.paidAt || r.createdAt),
        }
      })
      toCsv(rows, `store-sales-report-${store.id}.csv`)
      toast.push('ดาวน์โหลดรายงานสำเร็จ', 'success')
    } catch (err) {
      toast.push(err.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="รายงานยอดขายและสถิติร้านค้า"
          subtitle={`ร้าน ${store.name} (${store.category})`}
        />
        <button
          type="button"
          className="btn-secondary self-start sm:self-auto"
          onClick={handleExportReport}
        >
          <Download className="h-4 w-4" />
          ส่งออกรายงาน CSV
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">ยอดขายรวม</p>
            <p className="text-xl font-bold text-slate-900">{formatToken(report.tokens)}</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">รายการขายสำเร็จ</p>
            <p className="text-xl font-bold text-slate-900">{report.paid} รายการ</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
            <ShoppingCart className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">คำขอชำระทั้งหมด</p>
            <p className="text-xl font-bold text-slate-900">{report.requests} ครั้ง</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">อัตราความสำเร็จ</p>
            <p className="text-xl font-bold text-slate-900">
              {report.requests > 0 ? Math.round((report.paid / report.requests) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Charts & Breakdown */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Sales by Item Chart */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">
            ยอด Token 10 รายการล่าสุด
          </h3>
          {chartData.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีข้อมูลการขาย</p>
          ) : (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(val) => [formatToken(val), 'Token']}
                    labelFormatter={(label) => `รายการ ${label}`}
                  />
                  <Bar dataKey="tokens" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Product Breakdown Table */}
        <div className="card">
          <h3 className="mb-4 text-base font-semibold text-slate-800">สรุปตามรายการสินค้า</h3>
          {productStats.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-400">ยังไม่มีรายการขายสินค้า</p>
          ) : (
            <div className="table-wrap">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-4 py-2.5">ชื่อสินค้า</th>
                    <th className="px-4 py-2.5 text-right">จำนวนที่ขายได้</th>
                    <th className="px-4 py-2.5 text-right">ยอด Token รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {productStats.map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                      <td className="px-4 py-3 text-right text-slate-600">{item.quantity} ชิ้น</td>
                      <td className="px-4 py-3 text-right font-semibold text-brand-700">
                        {formatToken(item.tokens)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
