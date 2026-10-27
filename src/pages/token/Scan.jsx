import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { QrScanner } from '../../components/QrScanner'
import { decodeQr } from '../../lib/qr'
import { usersRepo, ticketsRepo } from '../../repositories'
import { walletSummary } from '../../services/tokenService'
import { formatToken } from '../../lib/money'

export default function TokenScan() {
  const [user, setUser] = useState(null)
  function resolve(raw) {
    const d = decodeQr(raw)
    if (d?.type === 'user') setUser(usersRepo.findById(d.token))
    else if (d?.type === 'ticket') {
      const t = ticketsRepo.findByQr(d.token)
      setUser(t ? usersRepo.findById(t.buyerId) : null)
    } else setUser(usersRepo.findById(raw))
  }
  const w = user ? walletSummary(user.id) : null
  return (
    <div>
      <PageHeader title="สแกนผู้ใช้" />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card"><QrScanner onResult={resolve} /></div>
        <div className="card">{user ? <p>{user.fullName} · {formatToken(w.balance)}</p> : <p>รอสแกน QR ผู้ใช้หรือ QR Ticket ที่อนุญาต</p>}</div>
      </div>
    </div>
  )
}
