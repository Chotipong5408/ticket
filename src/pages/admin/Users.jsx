import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { searchUsers, exportGenericCsv } from '../../services/reportService'
import { setUserActive } from '../../services/authService'
import { ROLE_LABELS } from '../../data/permissions'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'

export default function AdminUsers() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const rows = searchUsers({ q, year })
  return (
    <div>
      <PageHeader
        title="ผู้ใช้"
        actions={<button className="btn-secondary" type="button" onClick={() => exportGenericCsv(user, 'users.csv', rows.map((u) => ({ ชื่อ: u.fullName, อีเมล: u.email, พศ: u.enrollmentYearBE, คณะ: u.faculty, บทบาท: u.role })), 'user')}>Export CSV</button>}
      />
      <div className="mb-3 flex gap-2">
        <input className="input" placeholder="ชื่อ อีเมล Ticket ID Order ID" value={q} onChange={(e) => setQ(e.target.value)} />
        <input className="input max-w-[140px]" placeholder="พ.ศ." value={year} onChange={(e) => setYear(e.target.value)} />
      </div>
      <DataTable
        rows={rows}
        searchKeys={[]}
        columns={[
          { key: 'fullName', header: 'ชื่อ' },
          { key: 'email', header: 'อีเมล' },
          { key: 'enrollmentYearBE', header: 'พ.ศ.' },
          { key: 'faculty', header: 'คณะ' },
          { key: 'role', header: 'บทบาท', render: (r) => ROLE_LABELS[r.role] },
          { key: 'tokenBalance', header: 'Token' },
          { key: 'a', header: '', render: (r) => (
            <button className="btn-secondary" type="button" onClick={() => { setUserActive(user, r.id, !r.isActive); toast.push('อัปเดตแล้ว', 'success') }}>{r.isActive ? 'ปิดใช้' : 'เปิดใช้'}</button>
          ) },
        ]}
      />
    </div>
  )
}
