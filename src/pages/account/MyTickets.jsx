import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { QrBox } from '../../components/QrBox'
import { TICKET_LABELS } from '../../data/labels'
import { ticketsRepo, emailRepo } from '../../repositories'
import { encodeQr } from '../../lib/qr'
import { formatDateTime } from '../../lib/dates'
import { useAuth } from '../../context/AuthContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function MyTickets() {
  useLiveData()
  const { user } = useAuth()
  const tickets = ticketsRepo.byBuyer(user.id)
  const emails = emailRepo.all().filter((e) => e.to === user.email)
  return (
    <div>
      <PageHeader title="QR Ticket ของฉัน" subtitle="QR ถูกสร้างหลังอนุมัติการชำระเงินเท่านั้น หากซื้อให้เพื่อน ให้บันทึกภาพแล้วส่งต่อเอง" />
      <div className="grid gap-4 md:grid-cols-2">
        {tickets.map((t) => (
          <div key={t.id} className="card">
            <div className="mb-2 flex justify-between">
              <div>
                <p className="font-medium">{t.name}</p>
                <p className="font-mono text-xs text-slate-500">{t.id}</p>
              </div>
              <StatusBadge status={t.status} label={TICKET_LABELS[t.status]} />
            </div>
            {t.qrToken && (t.status === 'issued' || t.status === 'used') ? (
              <QrBox value={encodeQr('ticket', t.qrToken)} label={t.id} caption="อย่าแชร์ QR ในที่สาธารณะ" downloadName={`${t.id}.png`} />
            ) : (
              <p className="rounded-lg bg-orange-50 p-3 text-sm text-orange-800">ยังไม่ออก QR — รอ Super Admin อนุมัติการชำระเงิน</p>
            )}
            {t.checkedInAt ? <p className="mt-2 text-xs text-slate-500">เข้างานเมื่อ {formatDateTime(t.checkedInAt)}</p> : null}
          </div>
        ))}
      </div>
      <div className="card mt-6">
        <h2 className="mb-2 font-semibold">Email Preview / Outbox</h2>
        <p className="mb-3 text-xs text-slate-500">Demo ไม่ได้ส่ง Gmail จริง เพียงบันทึกตัวอย่างหลังอนุมัติ</p>
        {emails.map((e) => (
          <pre key={e.id} className="mb-3 whitespace-pre-wrap rounded bg-slate-50 p-3 text-xs">{e.subject}\n\n{e.body}</pre>
        ))}
      </div>
    </div>
  )
}
