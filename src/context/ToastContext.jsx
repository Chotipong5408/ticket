import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const push = useCallback((message, type = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((list) => [...list, { id, message, type }])
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4000)
  }, [])

  const remove = (id) => setToasts((list) => list.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed right-4 top-4 z-[80] space-y-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const isError = t.type === 'error'
          const isSuccess = t.type === 'success'
          const Icon = isError ? AlertCircle : isSuccess ? CheckCircle2 : Info

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 rounded-xl p-3.5 shadow-lg border backdrop-blur-md transition-all duration-300 animate-slide-up ${
                isError
                  ? 'bg-red-600/95 border-red-700 text-white shadow-red-500/20'
                  : isSuccess
                    ? 'bg-emerald-600/95 border-emerald-700 text-white shadow-emerald-500/20'
                    : 'bg-slate-900/95 border-slate-800 text-white shadow-slate-900/25'
              }`}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1 text-sm font-medium leading-snug">{t.message}</div>
              <button
                type="button"
                onClick={() => remove(t.id)}
                className="text-white/70 hover:text-white p-0.5 rounded transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  return useContext(ToastContext)
}
