import { PageHeader } from '../../components/ui/PageHeader'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { QrBox } from '../../components/QrBox'
import { TICKET_LABELS } from '../../data/labels'
import { ticketsRepo, emailRepo } from '../../repositories'
import { encodeQr } from '../../lib/qr'
import { formatDateTime } from '../../lib/dates'
import { useAuth } from '../../context/AuthContext'
import { useLiveData } from '../../hooks/useLiveData'
import { Ticket, Mail, Clock, CheckCircle2, AlertCircle, Share2, Download } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function MyTickets() {
  useLiveData()
  const { user } = useAuth()
  const tickets = ticketsRepo.byBuyer(user.id)
  const emails = emailRepo.all().filter((e) => e.to === user.email)

  return (
    <div className="space-y-8">
      <PageHeader
        title="QR Ticket ของฉัน"
        subtitle="บัตรเข้างานดิจิทัล แสดง QR Code นี้ต่อเจ้าหน้าที่ ณ จุดลงทะเบียนเข้างาน หรือดาวน์โหลดเพื่อส่งต่อให้เพื่อน"
        icon={Ticket}
        actions={
          <Link to="/tickets" className="btn-primary text-xs gap-1.5">
            <Ticket className="h-4 w-4" /> ซื้อบัตรเพิ่ม
          </Link>
        }
      />

      {tickets.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-12 text-center text-slate-500 max-w-md mx-auto">
          <Ticket className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="font-bold text-slate-700">คุณยังไม่มีบัตรเข้างาน</h3>
          <p className="text-xs text-slate-400 mt-1 mb-6">เลือกซื้อบัตรเข้างานเลี้ยงรุ่นเพื่อรับ QR Ticket</p>
          <Link to="/tickets" className="btn-primary text-xs">
            เลือกซื้อบัตรเข้างานเลย
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {tickets.map((t) => {
            const isReady = t.qrToken && (t.status === 'issued' || t.status === 'used')
            const isUsed = t.status === 'used'

            return (
              <div
                key={t.id}
                className={`relative rounded-3xl border transition-all overflow-hidden flex flex-col justify-between ${
                  isUsed
                    ? 'border-slate-300 bg-slate-50/80 shadow-sm opacity-90'
                    : isReady
                      ? 'border-brand-300 bg-white shadow-lg ring-2 ring-brand-500/10'
                      : 'border-amber-200 bg-amber-50/40 shadow-sm'
                }`}
              >
                {/* Ticket Top Header Bar */}
                <div className={`px-6 py-4 flex items-center justify-between border-b ${
                  isUsed ? 'bg-slate-100 border-slate-200' : isReady ? 'bg-gradient-to-r from-brand-600 to-indigo-600 text-white' : 'bg-amber-100/60 border-amber-200'
                }`}>
                  <div className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    <span className="font-bold text-xs uppercase tracking-wider">
                      งานเลี้ยงรุ่นศิษย์เก่า 2026
                    </span>
                  </div>
                  <StatusBadge status={t.status} label={TICKET_LABELS[t.status]} />
                </div>

                {/* Ticket Body */}
                <div className="p-6 flex-1 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-extrabold text-slate-800">{t.name}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">Ticket ID: {t.id}</p>
                    </div>
                  </div>

                  {/* QR Code Presentation */}
                  {isReady ? (
                    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm flex flex-col items-center justify-center">
                      <QrBox
                        value={encodeQr('ticket', t.qrToken)}
                        label={t.id}
                        caption="สแกนที่จุด Check-in หน้างาน"
                        downloadName={`${t.id}.png`}
                      />
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center text-xs text-amber-800 space-y-2">
                      <Clock className="mx-auto h-8 w-8 text-amber-600" />
                      <p className="font-bold">รอการอนุมัติการชำระเงิน</p>
                      <p className="text-amber-700/80 text-[11px]">
                        เมื่อ Super Admin ตรวจสอบสลิปโอนเงินแล้ว QR Ticket จะแสดงที่นี่โดยอัตโนมัติ
                      </p>
                      <Link to={`/payment/${t.paymentId || ''}`} className="btn-secondary text-[11px] py-1.5 px-3 inline-block mt-2">
                        ตรวจดูสถานะสลิป
                      </Link>
                    </div>
                  )}

                  {t.checkedInAt && (
                    <div className="rounded-xl bg-slate-100 p-3 text-xs text-slate-600 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      <span>เข้างานแล้วเมื่อ: <strong>{formatDateTime(t.checkedInAt)}</strong></span>
                    </div>
                  )}
                </div>

                {/* Perforated ticket edge illusion */}
                <div className="relative border-t-2 border-dashed border-slate-200 px-6 py-3 bg-slate-50/60 text-[11px] text-slate-400 flex items-center justify-between">
                  <span>ผู้ซื้อ: {user.fullName}</span>
                  <span>บันทึกภาพหน้าจอเพื่อนำไปใช้งาน</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Email Inbox / Outbox Preview */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-2">
          <Mail className="h-5 w-5 text-brand-600" />
          <h2 className="font-bold text-slate-800 text-base">กล่องข้อความ / Email จำลอง ({emails.length})</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4 leading-relaxed">
          ระบบ Demo จำลองการส่งอีเมลยืนยันการอนุมัติและแจ้งข้อมูลบัตรเข้างาน (บันทึกในเบราว์เซอร์ ไม่ได้ส่งออกผ่าน SMTP จริง)
        </p>

        {emails.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">ยังไม่มีอีเมลแจ้งเตือน</p>
        ) : (
          <div className="space-y-3">
            {emails.map((e) => (
              <div key={e.id} className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4 text-xs space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                  <strong className="text-slate-800 text-sm">{e.subject}</strong>
                  <span className="text-slate-400 text-[10px]">{formatDateTime(e.sentAt)}</span>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-slate-600 text-xs leading-relaxed">
                  {e.body}
                </pre>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
