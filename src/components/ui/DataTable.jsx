import { useMemo, useState } from 'react'

export function DataTable({ columns, rows, searchKeys = [], pageSize = 8, filters }) {
  const [q, setQ] = useState('')
  const [page, setPage] = useState(1)
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase()
    let list = rows
    if (query) {
      list = list.filter((row) =>
        searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(query)),
      )
    }
    return list
  }, [rows, q, searchKeys])
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const current = Math.min(page, pages)
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize)
  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <input className="input max-w-sm" placeholder="ค้นหา..." value={q} onChange={(e) => { setQ(e.target.value); setPage(1) }} />
        {filters}
      </div>
      <div className="table-wrap">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3 font-medium">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-400" colSpan={columns.length}>ไม่พบข้อมูล</td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={row.id || JSON.stringify(row)} className="border-t border-slate-100">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3 align-top">{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-slate-500">
        <span>ทั้งหมด {filtered.length} รายการ</span>
        <div className="flex gap-2">
          <button type="button" className="btn-secondary" disabled={current <= 1} onClick={() => setPage(current - 1)}>ก่อนหน้า</button>
          <span className="px-2 py-2">{current}/{pages}</span>
          <button type="button" className="btn-secondary" disabled={current >= pages} onClick={() => setPage(current + 1)}>ถัดไป</button>
        </div>
      </div>
    </div>
  )
}
