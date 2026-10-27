import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { useAuth } from '../../context/AuthContext'
import { walletSummary } from '../../services/tokenService'
import { formatDateTime } from '../../lib/dates'
import { storesRepo, requestsRepo } from '../../repositories'
import { useLiveData } from '../../hooks/useLiveData'

export default function Transactions() {
  useLiveData()
  const { user } = useAuth()
  const rows = walletSummary(user.id).txs.map((t) => {
    const req = t.referenceType === 'store_payment' ? requestsRepo.findById(t.referenceId) : null
    const store = req ? storesRepo.findById(req.storeId) : null
    return { ...t, storeName: store?.name || '-' }
  })
  return (
    <div>
      <PageHeader title="ประวัติ Token" />
      <DataTable
        rows={rows}
        searchKeys={['id', 'type', 'note', 'storeName']}
        columns={[
          { key: 'id', header: 'Transaction ID' },
          { key: 'type', header: 'ประเภท' },
          { key: 'amount', header: 'จำนวน' },
          { key: 'balanceAfter', header: 'คงเหลือหลังรายการ' },
          { key: 'storeName', header: 'ร้านค้า' },
          { key: 'note', header: 'รายละเอียด' },
          { key: 'createdAt', header: 'เวลา', render: (r) => formatDateTime(r.createdAt) },
        ]}
      />
    </div>
  )
}
