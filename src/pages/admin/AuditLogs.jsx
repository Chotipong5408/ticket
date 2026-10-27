import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { auditRepo } from '../../repositories'
import { formatDateTime } from '../../lib/dates'
import { usersRepo } from '../../repositories'
import { useLiveData } from '../../hooks/useLiveData'

export default function AuditLogs() {
  useLiveData()
  const rows = auditRepo.all().map((l) => ({ ...l, actor: usersRepo.findById(l.actorId)?.fullName || l.actorId }))
  return (
    <div>
      <PageHeader title="Audit Logs" subtitle="ห้ามแก้ไข Log ผ่าน UI · LocalStorage ป้องกันการแก้จาก DevTools ไม่ได้" />
      <DataTable
        rows={rows}
        searchKeys={['action', 'actor', 'resourceType', 'resourceId', 'result']}
        columns={[
          { key: 'createdAt', header: 'เวลา', render: (r) => formatDateTime(r.createdAt) },
          { key: 'actor', header: 'ผู้กระทำ' },
          { key: 'actorRole', header: 'บทบาท' },
          { key: 'action', header: 'Action' },
          { key: 'resourceType', header: 'Resource' },
          { key: 'resourceId', header: 'ID' },
          { key: 'result', header: 'ผล' },
        ]}
      />
    </div>
  )
}
