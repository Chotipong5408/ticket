import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { QrScanner } from '../../components/QrScanner'
import { scanTicket } from '../../services/checkinService'
import { CHECKIN_LABELS } from '../../data/labels'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { formatDateTime } from '../../lib/dates'
import { usersRepo, settingsRepo } from '../../repositories'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { ScanLine, CheckCircle2, XCircle, AlertCircle, Ticket, User, Clock, ShieldCheck, RefreshCw } from 'lucide-react'

export default function AdminCheckin() {
  const { user } = useAuth()
  const toast = useToast()
  const [code, setCode] = useState('')
  const [result, setResult] = useState(null)

  function run(raw, force = false) {
    if (!raw?.trim()) return
    try {
      const r = scanTicket(user, raw.trim(), { forceReentry: force })
      setResult(r)
      if (r.result !== 'valid') toast.push(r.message, 'error')
      else toast.push('เช็คอินเข้างานสำเร็จ ยินดีต้อนรับสู่สัมมนา!', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const buyer = result?.ticket ? usersRepo.findById(result.ticket.buyerId) : null
  const policy = settingsRepo.get().reentryPolicy

  return (
    <div className="space-y-6">
      <PageHeader
        title="จุดสแกน Check-in เข้างาน"
        subtitle={`สแกน QR Ticket ของผู้เข้าร่วมงาน ณ ซุ้มลงทะเบียนหน้างาน (นโยบายเข้าซ้ำ: ${
          policy === 'deny' ? 'ไม่อนุญาตเข้าซ้ำ' : 'Super Admin อนุมัติเข้าซ้ำเป็นรายกรณี'
        })`}
        icon={ScanLine}
      />

      <div className="grid gap-6 md:grid-cols-2 items-start">
        {/* Scanner Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <ScanLine className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">กล้องสแกน QR Ticket</h3>
          </div>

          <QrScanner onResult={(t) => run(t)} />

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-500 block mb-1.5">
              หรือกรอก Ticket ID / Token Code ด้วยตนเอง
            </label>
            <div className="flex gap-2">
              <input
                className="input text-xs"
                placeholder="เช่น TIK-... หรือโค้ดจาก QR"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <button
                className="btn-primary text-xs px-5"
                type="button"
                onClick={() => run(code)}
              >
                ตรวจบัตร
              </button>
            </div>
          </div>
        </div>

        {/* Scan Result Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-3 mb-4 border-b border-slate-100">
            <Ticket className="h-4 w-4 text-brand-600" />
            <h3 className="font-bold text-sm text-slate-800">ผลการตรวจสอบสิทธิ์</h3>
          </div>

          {!result ? (
            <div className="py-14 text-center text-slate-400 space-y-2">
              <Ticket className="mx-auto h-12 w-12 text-slate-300 stroke-[1.5]" />
              <p className="text-xs font-medium">รอการสแกน QR Ticket</p>
              <p className="text-[11px] text-slate-400">นำ QR Ticket ของผู้เข้าร่วมงานมาส่องที่หน้ากล้องเพื่อตรวจสอบ</p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              {/* Status Header */}
              <div className={`rounded-2xl p-4 border flex items-center gap-3 ${
                result.result === 'valid'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : result.result === 'already_used'
                    ? 'bg-amber-50 border-amber-200 text-amber-800'
                    : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {result.result === 'valid' ? (
                  <CheckCircle2 className="h-7 w-7 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-7 w-7 shrink-0 text-current" />
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={result.result} label={CHECKIN_LABELS[result.result] || result.result} />
                  </div>
                  <p className="text-xs font-bold mt-1">{result.message}</p>
                </div>
              </div>

              {/* Ticket & Buyer details */}
              {result.ticket && (
                <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-4 space-y-3 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[11px] text-slate-400">ประเภทบัตร</span>
                      <p className="font-bold text-slate-800 text-sm">{result.ticket.name}</p>
                    </div>
                    <span className="font-mono text-[11px] bg-white border border-slate-200 rounded px-2 py-0.5 text-slate-600">
                      {result.ticket.id}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[11px] text-slate-400">ผู้ถือสิทธิ์ / ผู้สั่งซื้อ</span>
                    <p className="font-semibold text-slate-800">{buyer?.fullName || 'ไม่ระบุชื่อ'}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{buyer?.email}</p>
                    {buyer?.faculty && (
                      <p className="text-[11px] text-slate-500">คณะ: {buyer.faculty} ({buyer.major}) รุ่น พ.ศ. {buyer.enrollmentYearBE}</p>
                    )}
                  </div>

                  {result.ticket.checkedInAt && (
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      <span>เวลาเข้างานครั้งแรก: <strong>{formatDateTime(result.ticket.checkedInAt)}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Re-entry Action button */}
              {result.result === 'already_used' && user.role === 'super_admin' && policy === 'allow_admin' && (
                <div className="pt-2">
                  <button
                    className="btn-warning w-full py-2.5 text-xs font-bold gap-2"
                    type="button"
                    onClick={() => run(result.ticket.id, true)}
                  >
                    <RefreshCw className="h-4 w-4" /> อนุมัติ Re-entry (เข้างานซ้ำโดย Admin)
                  </button>
                  <p className="text-[11px] text-slate-400 text-center mt-1.5">
                    สำหรับกรณีผู้เข้าร่วมงานออกไปภายนอกแล้วกลับเข้ามาใหม่
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
