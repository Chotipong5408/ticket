import { useState } from 'react'
import { PageHeader } from '../../components/ui/PageHeader'
import { DataTable } from '../../components/ui/DataTable'
import { searchUsers, exportGenericCsv } from '../../services/reportService'
import { setUserActive } from '../../services/authService'
import { ROLE_LABELS } from '../../data/permissions'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { useLiveData } from '../../hooks/useLiveData'
import { formatToken } from '../../lib/money'
import { Users, Download, Search, Calendar, Shield, Coins, UserCheck, UserX } from 'lucide-react'

export default function AdminUsers() {
  useLiveData()
  const { user } = useAuth()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [year, setYear] = useState('')
  const rows = searchUsers({ q, year })

  const handleExport = () => {
    try {
      exportGenericCsv(
        user,
        'users.csv',
        rows.map((u) => ({
          ชื่อ: u.fullName,
          อีเมล: u.email,
          พศ: u.enrollmentYearBE,
          คณะ: u.faculty,
          สาขา: u.major,
          บทบาท: u.role,
          Token: u.tokenBalance,
          สถานะ: u.isActive ? 'เปิดใช้งาน' : 'ปิดใช้งาน',
        })),
        'user'
      )
      toast.push('ส่งออกข้อมูลผู้ใช้เป็น CSV สำเร็จ', 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  const handleToggleActive = (targetUser) => {
    try {
      setUserActive(user, targetUser.id, !targetUser.isActive)
      toast.push(`${targetUser.isActive ? 'ระงับ' : 'เปิด'} การใช้งานบัญชี ${targetUser.fullName} แล้ว`, 'success')
    } catch (e) {
      toast.push(e.message, 'error')
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการรายชื่อผู้ใช้ทั้งหมด"
        subtitle={`ผู้ใช้งานในระบบทั้งหมด ${rows.length} รายการ สามารถค้นหาตามชื่อ อีเมล หรือปี พ.ศ. ที่เข้าเรียน`}
        icon={Users}
        actions={
          <button
            className="btn-secondary text-xs gap-1.5"
            type="button"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" /> ส่งออก CSV
          </button>
        }
      />

      {/* Search Filter Toolbar */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-12">
          <div className="relative sm:col-span-8">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="ค้นหาด้วยชื่อ, อีเมล, Ticket ID หรือ Order ID..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="relative sm:col-span-4">
            <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              className="input pl-9 text-xs"
              placeholder="พ.ศ. เข้าเรียน เช่น 2545"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <DataTable
          rows={rows}
          searchKeys={[]}
          columns={[
            {
              key: 'fullName',
              header: 'ชื่อ - นามสกุล',
              render: (r) => (
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-700 text-xs">
                    {r.fullName?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 text-xs">{r.fullName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{r.email}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'enrollmentYearBE',
              header: 'รุ่น พ.ศ.',
              render: (r) => <span className="font-mono text-xs text-slate-600">{r.enrollmentYearBE || '-'}</span>,
            },
            {
              key: 'faculty',
              header: 'คณะ / สาขา',
              render: (r) => (
                <div className="text-xs">
                  <p className="text-slate-800">{r.faculty || '-'}</p>
                  <p className="text-[10px] text-slate-400">{r.major || '-'}</p>
                </div>
              ),
            },
            {
              key: 'role',
              header: 'บทบาท',
              render: (r) => (
                <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                  r.role === 'super_admin' ? 'bg-purple-100 text-purple-800' :
                  r.role === 'token_admin' ? 'bg-amber-100 text-amber-800' :
                  r.role === 'store_admin' ? 'bg-blue-100 text-blue-800' :
                  'bg-slate-100 text-slate-700'
                }`}>
                  {ROLE_LABELS[r.role] || r.role}
                </span>
              ),
            },
            {
              key: 'tokenBalance',
              header: 'Token คงเหลือ',
              render: (r) => (
                <span className="font-mono font-bold text-xs text-amber-700 flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5 text-amber-500" />
                  {formatToken(r.tokenBalance)}
                </span>
              ),
            },
            {
              key: 'actions',
              header: 'สถานะ / จัดการ',
              render: (r) => (
                <div className="flex items-center gap-2">
                  <span className={`inline-block h-2 w-2 rounded-full ${r.isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />
                  <button
                    className={`text-xs py-1 px-2.5 rounded-lg font-medium transition ${
                      r.isActive
                        ? 'border border-red-200 text-red-600 hover:bg-red-50'
                        : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                    }`}
                    type="button"
                    onClick={() => handleToggleActive(r)}
                  >
                    {r.isActive ? 'ระงับบัญชี' : 'เปิดใช้งาน'}
                  </button>
                </div>
              ),
            },
          ]}
        />
      </div>
    </div>
  )
}
