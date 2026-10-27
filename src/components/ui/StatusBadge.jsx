import { STATUS_TONE } from '../../data/labels'
import { cn } from '../../lib/cn'

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  orange: 'bg-orange-50 text-orange-700 ring-orange-200',
  red: 'bg-red-50 text-red-700 ring-red-200',
  blue: 'bg-blue-50 text-blue-700 ring-blue-200',
  slate: 'bg-slate-100 text-slate-600 ring-slate-200',
}

export function StatusBadge({ status, label }) {
  const tone = tones[STATUS_TONE[status] || 'slate']
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', tone)}>{label || status}</span>
}
