import { PageHeader } from '../../components/ui/PageHeader'
import { tokensRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { formatToken } from '../../lib/money'
import { useLiveData } from '../../hooks/useLiveData'

export default function TokenDashboard() {
  useLiveData()
  const { user } = useAuth()
  const mine = tokensRepo.all().filter((t) => t.type === 'topup' && t.actorId === user.id)
  return (
    <div>
      <PageHeader title="Token Admin" subtitle="เติม Token ได้เฉพาะบทบาทนี้ Store Admin เติมไม่ได้" />
      <div className="grid gap-3 md:grid-cols-2">
        <div className="card">จำนวนครั้งที่เติม {mine.length}</div>
        <div className="card">Token ที่เติม {formatToken(mine.reduce((s, t) => s + t.amount, 0))}</div>
      </div>
    </div>
  )
}
