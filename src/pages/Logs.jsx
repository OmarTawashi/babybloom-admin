import { useEffect, useState, useCallback } from 'react'
import { Search, ScrollText, RefreshCw, X, Trash2, Download } from 'lucide-react'
import { getLogs, getLog, deleteLog } from '../api/logs'
import { exportLogsCsv } from '../api/exports'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

// Canonical BabyLog::TYPES from the backend
const logTypes = [
  'feed', 'diaper', 'sleep', 'bath', 'medicine', 'growth',
  'mood', 'note', 'pump', 'tummy_time', 'milestone', 'temperature',
]

const typeColors = {
  feed: 'bg-coral/10 text-coral',
  sleep: 'bg-plum/10 text-plum',
  diaper: 'bg-mint/10 text-emerald-600',
  growth: 'bg-sky/10 text-sky',
  milestone: 'bg-mango/10 text-amber-600',
  mood: 'bg-red-500/10 text-red-400',
  pump: 'bg-coral/10 text-coral-dark',
  temperature: 'bg-sky/10 text-sky',
  medicine: 'bg-plum/10 text-plum',
  bath: 'bg-sky/10 text-sky',
  note: 'bg-cream text-text-secondary',
  tummy_time: 'bg-mango/10 text-amber-600',
}

const typeEmoji = {
  feed: '🍼',
  sleep: '😴',
  diaper: '🧷',
  growth: '📏',
  milestone: '⭐',
  mood: '😊',
  pump: '🫙',
  temperature: '🌡️',
  medicine: '💊',
  bath: '🛁',
  note: '📝',
  tummy_time: '🤸',
}

const typeLabel = (type) =>
  (type || '').split('_').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [detail, setDetail] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
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

  const openDetail = async (log) => {
    setDetail(log)
    setDetailLoading(true)
    try {
      const res = await getLog(log.id)
      setDetail(res.data.log || log)
    } catch {
      toast({ type: 'error', title: 'Failed to load log detail' })
    } finally {
      setDetailLoading(false)
    }
  }

  const handleDelete = async () => {
    const target = deleteTarget
    setDeleteTarget(null)
    try {
      await deleteLog(target.id)
      setDetail(null)
      setLogs((prev) => prev.filter((l) => l.id !== target.id))
      toast({ type: 'success', title: 'Log deleted' })
    } catch (err) {
      toast({ type: 'error', title: 'Failed to delete log', message: err.response?.data?.message })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Activity Logs</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total log entries</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              try {
                await exportLogsCsv(typeFilter ? { type: typeFilter } : {})
              } catch {
                toast({ type: 'error', title: 'Export failed' })
              }
            }}
            className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border hover:bg-cream text-sm font-medium rounded-xl transition-colors"
          >
            <Download size={15} className="text-text-secondary" />
            Export CSV
          </button>
          <button onClick={fetchLogs} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
            <RefreshCw size={16} className="text-text-secondary" />
          </button>
        </div>
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
            <option key={type} value={type}>{typeEmoji[type]} {typeLabel(type)}</option>
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
                      <tr
                        key={log.id}
                        onClick={() => openDetail(log)}
                        className="border-b border-border table-row-hover cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${typeColors[log.type] || 'bg-cream text-text-secondary'}`}>
                            <span>{typeEmoji[log.type] || '📋'}</span>
                            {typeLabel(log.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 bg-mint/10 rounded-full flex items-center justify-center text-xs">👶</div>
                            <span className="font-medium text-sm">{log.baby?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{log.user?.name || 'Unknown'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary max-w-xs truncate">{log.note || log.data?.notes || '—'}</td>
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

      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
          <div className="fixed inset-0 bg-black/50 glass" onClick={() => setDetail(null)} />
          <div className="relative bg-surface rounded-2xl max-w-lg w-full mx-4 shadow-2xl animate-scale-in overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <span className="text-lg">{typeEmoji[detail.type] || '📋'}</span>
                <h3 className="font-semibold text-lg">{typeLabel(detail.type)} log</h3>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-cream transition-colors">
                <X size={16} className="text-text-secondary" />
              </button>
            </div>

            {detailLoading ? <LoadingSpinner /> : (
              <div className="px-6 py-4 space-y-3 max-h-[60vh] overflow-auto">
                <DetailRow label="Baby" value={detail.baby?.name} />
                <DetailRow label="Logged by" value={detail.user ? `${detail.user.name} (${detail.user.email})` : null} />
                <DetailRow label="Logged at" value={detail.logged_at ? new Date(detail.logged_at).toLocaleString('en', { dateStyle: 'medium', timeStyle: 'short' }) : null} />
                <DetailRow label="Duration" value={detail.duration_minutes ? `${detail.duration_minutes} min` : null} />
                <DetailRow label="Note" value={detail.note} />
                {detail.data && Object.keys(detail.data).length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-1.5">Details</div>
                    <pre className="bg-cream rounded-xl p-3 text-xs overflow-auto whitespace-pre-wrap break-words">
                      {JSON.stringify(detail.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end gap-3 px-6 py-4 border-t border-border bg-cream/30">
              <button
                onClick={() => setDeleteTarget(detail)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl text-red-500 border border-red-500/20 hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={15} />
                Delete log
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        danger
        title="Delete this log?"
        message={<>This permanently removes the {typeLabel(deleteTarget?.type)} entry for <strong>{deleteTarget?.baby?.name || 'this baby'}</strong>. The parent will lose this record.</>}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider pt-0.5">{label}</span>
      <span className="text-sm text-right">{value}</span>
    </div>
  )
}
