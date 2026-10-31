import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { tokensRepo, usersRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../lib/dates'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'
import { History, Coins, ArrowDownLeft } from 'lucide-react'

export default function TokenTransactions() {
  useLiveData()
  const { user } = useAuth()
  const rows = tokensRepo
    .all()
    .filter((t) => t.type === 'topup' && t.actorId === user.id)
    .map((t) => ({
      ...t,
      userName: usersRepo.findById(t.userId)?.fullName || 'ไม่ระบุชื่อ',
    }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="ประวัติการเติม Token ของฉัน"
        subtitle={`รวมทั้งสิ้น ${rows.length} รายการที่ดำเนินการเติมผ่านบัญชี ${user.fullName}`}
        icon={History}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={['id', 'userName', 'note']}
          columns={[
            {
              key: 'id',
              header: 'Tx ID',
              render: (r) => <span className="font-mono text-xs text-slate-400">{r.id}</span>,
            },
            {
              key: 'userName',
              header: 'ผู้รับ Token',
              render: (r) => <span className="font-bold text-xs text-slate-800">{r.userName}</span>,
            },
            {
              key: 'amount',
              header: 'จำนวนที่เติม',
              render: (r) => (
                <span className="font-black text-sm text-emerald-600 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  +{formatToken(r.amount)} Token
                </span>
              ),
            },
            {
              key: 'note',
              header: 'รายละเอียดการรับเงิน',
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
