import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

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
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="ค้นหา..."
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1) }}
          />
        </div>
        {filters}
      </div>
      <div className="table-wrap">
        <table className="min-w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80">
              {columns.map((c) => (
                <th key={c.key} className="px-4 py-3.5 text-xs font-semibold uppercase tracking-wider text-slate-500">{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {slice.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-slate-400" colSpan={columns.length}>
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-8 w-8 text-slate-300" />
                    <p className="font-medium">ไม่พบข้อมูล</p>
                    {q && <p className="text-xs">ลองค้นหาด้วยคำค้นอื่น</p>}
                  </div>
                </td>
              </tr>
            ) : (
              slice.map((row) => (
                <tr key={row.id || JSON.stringify(row)} className="hover:bg-slate-50/70 transition-colors">
                  {columns.map((c) => (
                    <td key={c.key} className="px-4 py-3.5 align-top text-slate-700">{c.render ? c.render(row) : row[c.key]}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-500">
          แสดง <span className="font-medium text-slate-700">{slice.length}</span> จาก <span className="font-medium text-slate-700">{filtered.length}</span> รายการ
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="px-3 py-1.5 text-sm font-medium text-slate-700">
            {current} / {pages}
          </span>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            disabled={current >= pages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
