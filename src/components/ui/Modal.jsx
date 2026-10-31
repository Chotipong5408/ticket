import { X } from 'lucide-react'

export function Modal({ open, title, children, onClose, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white shadow-2xl animate-scale-in">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">{title}</h2>
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-slate-100 bg-slate-50/50 px-6 py-4 flex justify-end gap-2 rounded-b-2xl">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}
