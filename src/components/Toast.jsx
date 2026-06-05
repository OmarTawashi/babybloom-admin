import { useState, useCallback, useContext, createContext } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

const styles = {
  success: 'bg-emerald-500 text-white',
  error: 'bg-red-500 text-white',
  warning: 'bg-amber-500 text-white',
  info: 'bg-sky-500 text-white',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const addToast = useCallback((toast) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { ...toast, id, exiting: false }])
    setTimeout(() => {
      setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 200)
    }, toast.duration || 3500)
  }, [])

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.map((t) => t.id === id ? { ...t, exiting: true } : t))
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 200)
  }, [])

  return (
    <ToastContext.Provider value={addToast}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none" style={{ maxWidth: 380 }}>
        {toasts.map((toast) => {
          const Icon = icons[toast.type] || icons.info
          return (
            <div
              key={toast.id}
              className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl shadow-lg ${styles[toast.type] || styles.info}`}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                {toast.title && <div className="font-semibold text-sm">{toast.title}</div>}
                {toast.message && <div className="text-sm opacity-90">{toast.message}</div>}
              </div>
              <button onClick={() => removeToast(toast.id)} className="shrink-0 p-0.5 rounded hover:bg-white/20 transition-colors">
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)