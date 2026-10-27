import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { QrScanner } from '../../components/QrScanner'
import { scanTicket } from '../../services/checkinService'
import { CHECKIN_LABELS } from '../../data/labels'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDateTime } from '../../lib/dates'
import { usersRepo, ticketsRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { settingsRepo } from '../../repositories'

export default function AdminCheckin() {
  const { user } = useAuth()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)
  function run(raw, force = false) {
    try {
      const r = scanTicket(user, raw, { forceReentry: force })
      setResult(r)
      if (r.result !== 'valid') toast.push(r.message, 'error')
      else toast.push('เข้างานสำเร็จ', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }
  const buyer = result?.ticket ? usersRepo.findById(result.ticket.buyerId) : null
  const policy = settingsRepo.get().reentryPolicy
  return (
    <div>
      <PageHeader title="Check-in QR Ticket" subtitle={`นโยบายเข้าซ้ำ: ${policy === 'deny' ? 'ไม่อนุญาตอัตโนมัติ' : 'Super Admin อนุมัติเป็นกรณี'}`} />
      <div className="grid gap-4 md:grid-cols-2">
        <div className="card">
          <QrScanner onResult={(t) => run(t)} />
          <div className="mt-3 flex gap-2">
            <input className="input" placeholder="Ticket ID หรือ QR" value={code} onChange={(e) => setCode(e.target.value)} />
            <button className="btn-primary" type="button" onClick={() => run(code)}>ตรวจ</button>
          </div>
        </div>
        <div className="card space-y-2">
          {!result ? <p className="text-slate-500">รอการสแกน</p> : (
            <>
              <StatusBadge status={result.result} label={CHECKIN_LABELS[result.result]} />
              <p>{result.message}</p>
              {result.ticket ? (
                <>
                  <p>บัตร {result.ticket.id} · {result.ticket.name}</p>
                  <p>ผู้ถือสิทธิ์ซื้อ: {buyer?.fullName}</p>
                  {result.ticket.checkedInAt ? <p>เวลาเข้างาน {formatDateTime(result.ticket.checkedInAt)}</p> : null}
                </>
              ) : null}
              {result.result === 'already_used' && user.role === 'super_admin' && policy === 'allow_admin' ? (
                <button className="btn-warning" type="button" onClick={() => run(result.ticket.id, true)}>อนุมัติ Re-entry</button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
