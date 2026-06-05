import { useEffect, useState, useCallback } from 'react'
import { Search, ScrollText, RefreshCw } from 'lucide-react'
import { getLogs } from '../api/logs'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const typeColors = {
  feeding: 'bg-coral/10 text-coral',
  sleep: 'bg-plum/10 text-plum',
  diaper: 'bg-mint/10 text-emerald-600',
  growth: 'bg-sky/10 text-sky',
  milestone: 'bg-mango/10 text-amber-600',
  health: 'bg-red-500/10 text-red-400',
  pumping: 'bg-coral/10 text-coral-dark',
  temperature: 'bg-sky/10 text-sky',
  medication: 'bg-plum/10 text-plum',
}

const typeEmoji = {
  feeding: '🍼',
  sleep: '😴',
  diaper: '🧷',
  growth: '📏',
  milestone: '⭐',
  health: '❤️',
  pumping: '🫙',
  temperature: '🌡️',
  medication: '💊',
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const toast = useToast()

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 25 }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      const res = await getLogs(params)
      setLogs(res.data.logs?.data || [])
      const m = res.data.logs
      setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total, from: m.from, to: m.to } : { current_page: 1, last_page: 1, total: 0 })
    } catch {
      toast({ type: 'error', title: 'Failed to load logs' })
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const logTypes = ['feeding', 'sleep', 'diaper', 'growth', 'milestone', 'health', 'pumping', 'temperature', 'medication']

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total log entries</p>
        </div>
        <button onClick={fetchLogs} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
          <RefreshCw size={16} className="text-text-secondary" />
        </button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1) }} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none cursor-pointer"
        >
          <option value="">All Types</option>
          {logTypes.map((type) => (
            <option key={type} value={type}>{typeEmoji[type]} {type.charAt(0).toUpperCase() + type.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {logs.length === 0 ? (
            <EmptyState icon={ScrollText} title="No logs found" description={search || typeFilter ? 'Try adjusting your filters' : 'Logs will appear here as parents track activities'} />
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream/30">
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Baby</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Parent</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Notes</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Logged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id} className="border-b border-border table-row-hover">
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[log.type] || 'bg-cream text-text-secondary'}`}>
                            <span>{typeEmoji[log.type] || '📋'}</span>
                            {log.type}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-mint/10 rounded-full flex items-center justify-center text-xs">👶</div>
                            <span className="font-medium text-sm">{log.baby?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{log.user?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">{log.notes || log.data?.notes || '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary whitespace-nowrap">
                          {new Date(log.logged_at || log.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}
    </div>
  )
}