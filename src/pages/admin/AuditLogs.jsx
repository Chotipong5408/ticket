import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { auditRepo, usersRepo } from '../../repositories'
import { formatDateTime } from '../../lib/dates'
import { useLiveData } from '../../hooks/useLiveData'
import { FileText, ShieldAlert, CheckCircle2, XCircle } from 'lucide-react'

export default function AuditLogs() {
  useLiveData()
  const rows = auditRepo
    .all()
    .map((l) => ({ ...l, actor: usersRepo.findById(l.actorId)?.fullName || l.actorId }))

  return (
    <div className="space-y-6">
      <PageHeader
        title="บันทึกกิจกรรมระบบ (Audit Logs)"
        subtitle="ประวัติการทำรายการ การอนุมัติสลิป การสแกน Check-in และการกระทำสำคัญทั้งหมดในระบบ"
        icon={FileText}
      />

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={['action', 'actor', 'resourceType', 'resourceId', 'result']}
          columns={[
            {
              key: 'createdAt',
              header: 'วันเวลา',
              render: (r) => <span className="font-mono text-xs text-slate-500">{formatDateTime(r.createdAt)}</span>,
            },
            {
              key: 'actor',
              header: 'ผู้กระทำ (Actor)',
              render: (r) => (
                <div>
                  <p className="font-bold text-slate-800 text-xs">{r.actor}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{r.actorRole}</p>
                </div>
              ),
            },
            {
              key: 'action',
              header: 'การกระทำ (Action)',
              render: (r) => <span className="font-bold text-xs text-slate-800">{r.action}</span>,
            },
            {
              key: 'resourceType',
              header: 'ประเภท Resource',
              render: (r) => (
                <span className="rounded-lg bg-slate-100 px-2 py-0.5 text-[11px] font-mono text-slate-600">
                  {r.resourceType}
                </span>
              ),
            },
            {
              key: 'resourceId',
              header: 'Resource ID',
              render: (r) => <span className="font-mono text-[11px] text-slate-500">{r.resourceId || '-'}</span>,
            },
            {
              key: 'result',
              header: 'ผลลัพธ์',
              render: (r) => (
                <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  r.result === 'success' || r.result === 'valid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {r.result}
                </span>
              ),
            },
          ]}
        />
      </div>

      <div className="rounded-2xl bg-slate-100 p-4 text-xs text-slate-500 flex items-start gap-2.5">
        <ShieldAlert className="h-4 w-4 shrink-0 text-slate-400 mt-0.5" />
        <span>
          <strong>ความปลอดภัย:</strong> บันทึก Audit Log ในระบบนี้จัดทำเพื่อการตรวจสอบความถูกต้องของการดำเนินงาน ห้ามทำการแก้ไขหรือลบ Log ผ่าน UI
        </span>
      </div>
    </div>
  )
}
