import { STATUS_TONE } from '../../data/labels'
import { cn } from '../../lib/cn'

const tones = {
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  orange: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  red: 'bg-red-50 text-red-700 ring-red-600/20',
  blue: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  slate: 'bg-slate-100 text-slate-600 ring-slate-500/20',
}

const dots = {
  green: 'bg-emerald-500',
  orange: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  slate: 'bg-slate-400',
}

export function StatusBadge({ status, label }) {
  const toneKey = STATUS_TONE[status] || 'slate'
  const tone = tones[toneKey]
  const dot = dots[toneKey]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset', tone)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', dot)} />
      {label || status}
    </span>
  )
}
