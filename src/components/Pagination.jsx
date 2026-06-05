import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function Pagination({ meta, onPageChange, className = '' }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className={`flex items-center justify-between px-6 py-4 border-t border-border ${className}`}>
      <span className="text-xs text-text-secondary">
        {meta.from && meta.to ? (
          <>{meta.from}–{meta.to} of {meta.total.toLocaleString()}</>
        ) : (
          <>Page {meta.current_page} of {meta.last_page}</>
        )}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(Math.max(1, meta.current_page - 1))}
          disabled={meta.current_page <= 1}
          className="p-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft size={14} className="text-text-secondary" />
        </button>
        
        {generatePages(meta.current_page, meta.last_page).map((page, i) =>
          page === '...' ? (
            <span key={`dots-${i}`} className="px-2 text-xs text-text-secondary">…</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`min-w-[32px] h-8 rounded-lg text-xs font-medium transition-colors ${
                page === meta.current_page
                  ? 'bg-coral text-white'
                  : 'text-text-secondary hover:bg-cream'
              }`}
            >
              {page}
            </button>
          )
        )}
        
        <button
          onClick={() => onPageChange(Math.min(meta.last_page, meta.current_page + 1))}
          disabled={meta.current_page >= meta.last_page}
          className="p-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight size={14} className="text-text-secondary" />
        </button>
      </div>
    </div>
  )
}

function generatePages(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  
  const pages = []
  pages.push(1)
  
  if (current > 3) pages.push('...')
  
  const start = Math.max(2, current - 1)
  const end = Math.min(total - 1, current + 1)
  
  for (let i = start; i <= end; i++) pages.push(i)
  
  if (current < total - 2) pages.push('...')
  
  pages.push(total)
  return pages
}