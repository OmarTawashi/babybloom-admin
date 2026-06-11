import { useEffect, useState, useCallback } from 'react'
import { ShieldCheck, RefreshCw } from 'lucide-react'
import { getSubscriptionAudits } from '../api/audits'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const ACTION_STYLES = {
  grant: 'bg-mint/15 text-mint-dark',
  update: 'bg-sky/15 text-sky-dark',
  cancel: 'bg-coral/15 text-coral',
  extend_grace: 'bg-mango/15 text-mango-dark',
}

const ACTION_LABELS = {
  grant: 'Granted',
  update: 'Updated',
  cancel: 'Cancelled',
  extend_grace: 'Grace extended',
}

const summarize = (audit) => {
  const before = audit.before || {}
  const after = audit.after || {}
  const parts = []
  if (before.plan !== after.plan && (before.plan || after.plan)) {
    parts.push(`plan ${before.plan ?? '—'} → ${after.plan ?? '—'}`)
  }
  if (before.status !== after.status && (before.status || after.status)) {
    parts.push(`status ${before.status ?? '—'} → ${after.status ?? '—'}`)
  }
  if (before.ends_at !== after.ends_at && (before.ends_at || after.ends_at)) {
    const fmt = (v) => (v ? new Date(v).toLocaleDateString() : '—')
    parts.push(`ends ${fmt(before.ends_at)} → ${fmt(after.ends_at)}`)
  }
  return parts.join(' · ')
}

export default function AuditLog() {
  const [audits, setAudits] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [action, setAction] = useState('')
  const toast = useToast()

  const fetchAudits = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getSubscriptionAudits({ page, per_page: 20, ...(action ? { action } : {}) })
      const m = res.data.audits
      setAudits(m?.data || [])
      setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total, from: m.from, to: m.to } : { current_page: 1, last_page: 1, total: 0 })
    } catch {
      toast({ type: 'error', title: 'Failed to load audit log' })
    } finally {
      setLoading(false)
    }
  }, [page, action])

  useEffect(() => { fetchAudits() }, [fetchAudits])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} subscription changes by admins</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={action}
            onChange={(e) => { setAction(e.target.value); setPage(1) }}
            className="px-4 py-2.5 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-coral/20"
          >
            <option value="">All actions</option>
            <option value="grant">Granted</option>
            <option value="update">Updated</option>
            <option value="cancel">Cancelled</option>
            <option value="extend_grace">Grace extended</option>
          </select>
          <button onClick={fetchAudits} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
            <RefreshCw size={16} className="text-text-secondary" />
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : (
        audits.length === 0 ? (
          <EmptyState icon={ShieldCheck} title="No audit entries" description="Admin subscription changes will appear here" />
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
            <div className="divide-y divide-border">
              {audits.map((a) => (
                <div key={a.id} className="px-6 py-4 table-row-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${ACTION_STYLES[a.action] || 'bg-cream text-text-secondary'}`}>
                          {ACTION_LABELS[a.action] || a.action}
                        </span>
                        <span className="font-medium text-sm">{a.user?.name || `User #${a.user_id}`}</span>
                        <span className="text-xs text-text-secondary">{a.user?.email}</span>
                      </div>
                      {summarize(a) && (
                        <div className="text-sm text-text-secondary mt-1">{summarize(a)}</div>
                      )}
                      {a.note && (
                        <div className="text-xs text-text-secondary/80 mt-0.5 italic">{a.note}</div>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-text-secondary">
                        {a.created_at ? new Date(a.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
                      </div>
                      {a.admin?.name && (
                        <div className="text-[11px] text-text-secondary/70 mt-0.5">by {a.admin.name}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )
      )}
    </div>
  )
}
