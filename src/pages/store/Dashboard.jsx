import { PageHeader } from '../../components/ui/PageHeader'
import { useAuth } from '../../context/AuthContext'
import { storesRepo } from '../../repositories'
import { storeReport } from '../../services/reportService'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'

export default function StoreDashboard() {
  useLiveData()
  const { user } = useAuth()
  const store = storesRepo.findById(user.storeId)
  const report = store ? storeReport(store.id) : { paid: 0, tokens: 0, requests: 0 }
  if (!store) return <p>บัญชียังไม่ถูกมอบหมายร้าน</p>
  return (
    <div>
      <PageHeader title={store.name} subtitle={store.category} />
      <div className="grid gap-3 md:grid-cols-3">
        <div className="card">คำขอชำระ {report.requests}</div>
        <div className="card">ขายสำเร็จ {report.paid}</div>
        <div className="card">Token ที่รับ {formatToken(report.tokens)}</div>
      </div>
    </div>
  )
}
