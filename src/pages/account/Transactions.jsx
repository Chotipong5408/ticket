import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { useAuth } from '../../context/AuthContext'
import { walletSummary } from '../../services/tokenService'
import { formatDateTime } from '../../lib/dates'
import { storesRepo, requestsRepo } from '../../repositories'
import { useLiveData } from '../../hooks/useLiveData'
import { formatToken } from '../../lib/money'
import { History, ArrowUpRight, ArrowDownLeft, Gift, Coins } from 'lucide-react'

export default function Transactions() {
  useLiveData()
  const { user } = useAuth()
  const rows = walletSummary(user.id).txs.map((t) => {
    const req = t.referenceType === 'store_payment' ? requestsRepo.findById(t.referenceId) : null
    const store = req ? storesRepo.findById(req.storeId) : null
    return { ...t, storeName: store?.name || '-' }
  })

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติธุรกรรม Token"
        subtitle="บันทึกรายการรับโบนัส เติมเงิน และการใช้จ่าย Token ทั้งหมดอย่างโปร่งใส"
        icon={History}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={['id', 'type', 'note', 'storeName']}
          columns={[
            {
              key: 'id',
              header: 'Tx ID',
              render: (r) => <span className="font-mono text-xs text-slate-400">{r.id}</span>,
            },
            {
              key: 'type',
              header: 'ประเภทรายการ',
              render: (r) => {
                const isBonus = r.type === 'bonus'
                const isTopup = r.type === 'topup'
                const isSpend = r.type === 'spend' || r.type === 'payment'
                return (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    isBonus ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    isTopup ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                    'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}>
                    {isBonus ? <Gift className="h-3 w-3" /> : isTopup ? <ArrowDownLeft className="h-3 w-3" /> : <Coins className="h-3 w-3" />}
                    {r.type === 'bonus' ? 'โบนัสบัตร' : r.type === 'topup' ? 'เติม Token' : r.type === 'spend' ? 'จ่ายร้านค้า' : r.type}
                  </span>
                )
              },
            },
            {
              key: 'amount',
              header: 'จำนวน Token',
              render: (r) => {
                const isPositive = r.type === 'bonus' || r.type === 'topup'
                return (
                  <span className={`font-black text-sm ${isPositive ? 'text-emerald-600' : 'text-slate-800'}`}>
                    {isPositive ? `+${formatToken(r.amount)}` : `-${formatToken(r.amount)}`}
                  </span>
                )
              },
            },
            {
              key: 'balanceAfter',
              header: 'คงเหลือหลังทำรายการ',
              render: (r) => <span className="font-semibold text-slate-600 text-xs">{formatToken(r.balanceAfter)}</span>,
            },
            {
              key: 'storeName',
              header: 'ร้านค้า',
              render: (r) => <span className="text-xs font-medium text-slate-700">{r.storeName}</span>,
            },
            {
              key: 'note',
              header: 'หมายเหตุ',
              render: (r) => <span className="text-xs text-slate-500">{r.note || '-'}</span>,
            },
            {
              key: 'createdAt',
              header: 'วันเวลา',
              render: (r) => <span className="text-xs text-slate-400">{formatDateTime(r.createdAt)}</span>,
            },
          ]}
        />
      </div>
    </div>
  )
}
