import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { tokensRepo, usersRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { formatDateTime } from '../../lib/dates'
import { useLiveData } from '../../hooks/useLiveData'

export default function TokenTransactions() {
  useLiveData()
  const { user } = useAuth()
  const rows = tokensRepo.all().filter((t) => t.type === 'topup' && t.actorId === user.id).map((t) => ({ ...t, name: usersRepo.findById(t.userId)?.fullName }))
  return (
    <div>
      <PageHeader title="ประวัติการเติมของฉัน" />
      <DataTable rows={rows} searchKeys={['id', 'name', 'note']} columns={[
        { key: 'id', header: 'Tx' },
        { key: 'name', header: 'ผู้ใช้' },
        { key: 'amount', header: 'Token' },
        { key: 'note', header: 'หมายเหตุ' },
        { key: 'createdAt', header: 'เวลา', render: (r) => formatDateTime(r.createdAt) },
      ]} />
    </div>
  )
}
