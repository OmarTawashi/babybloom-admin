import { AlertTriangle, Info } from 'lucide-react'

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, danger = false, confirmLabel, cancelLabel }) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/50 glass" onClick={onCancel} />
      <div className="relative bg-surface rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <div className="flex items-start gap-3 mb-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            danger ? 'bg-red-500/10' : 'bg-sky/10'
          }`}>
            {danger ? (
              <AlertTriangle size={20} className="text-red-500" />
            ) : (
              <Info size={20} className="text-sky" />
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg">{title}</h3>
            <div className="text-sm text-text-secondary mt-1 leading-relaxed">{message}</div>
          </div>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-cream transition-colors"
          >
            {cancelLabel || 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-semibold rounded-xl text-white transition-colors ${
              danger ? 'bg-red-500 hover:bg-red-600' : 'bg-coral hover:bg-coral-dark'
            }`}
          >
            {confirmLabel || (danger ? 'Delete' : 'Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}