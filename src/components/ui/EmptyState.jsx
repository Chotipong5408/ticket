import { Inbox } from 'lucide-react'

export function EmptyState({ title, hint, icon: Icon = Inbox }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 px-6 py-16 text-center animate-fade-in">
      <Icon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
      <p className="font-semibold text-slate-600">{title}</p>
      {hint ? <p className="mt-1.5 text-sm text-slate-400">{hint}</p> : null}
    </div>
  )
}
