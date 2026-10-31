export function PageHeader({ title, subtitle, actions, icon: Icon }) {
  return (
    <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between animate-fade-in">
      <div className="min-w-0">
        <div className="flex items-center gap-3">
          {Icon ? (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{title}</h1>
        </div>
        {subtitle ? <p className="mt-2 text-sm text-slate-500 leading-relaxed max-w-2xl">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2 shrink-0">{actions}</div> : null}
    </div>
  )
}
