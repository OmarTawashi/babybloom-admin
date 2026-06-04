import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, Filter } from 'lucide-react'
import { getLogs, deleteLog } from '../api/logs'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const LOG_TYPES = ['feed', 'diaper', 'sleep', 'bath', 'medicine', 'growth', 'mood', 'note', 'pump', 'tummy_time', 'milestone', 'temperature']

const typeColors = {
  feed: 'bg-coral/10 text-coral',
  diaper: 'bg-mint/10 text-mint',
  sleep: 'bg-sky/10 text-sky',
  bath: 'bg-sky/10 text-sky',
  medicine: 'bg-plum/10 text-plum',
  growth: 'bg-emerald-100 text-emerald-600',
  mood: 'bg-mango/10 text-mango',
  note: 'bg-cream text-ink/60',
  pump: 'bg-coral/10 text-coral',
  tummy_time: 'bg-mint/10 text-mint',
  milestone: 'bg-plum/10 text-plum',
  temperature: 'bg-red-500/10 text-red-400',
}

export default function Logs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)

  const fetchLogs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 30 }
      if (search) params.search = search
      if (typeFilter) params.type = typeFilter
      const res = await getLogs(params)
      setLogs(res.data.logs.data)
      setMeta({
        current_page: res.data.logs.current_page,
        last_page: res.data.logs.last_page,
        total: res.data.logs.total,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, typeFilter])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const handleDelete = async (log) => {
    await deleteLog(log.id)
    setConfirm(null)
    fetchLogs()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Logs</h1>
        <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total logs</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchLogs() }} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by note, baby, or user..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none"
        >
          <option value="">All Types</option>
          {LOG_TYPES.map((t) => (
            <option key={t} value={t} className="capitalize">{t.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Baby</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Logged At</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Duration</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Note</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-black/3 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${typeColors[log.type] || 'bg-cream text-ink/60'}`}>
                        {log.type.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm">{log.baby?.name || '—'}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">{log.user?.name || '—'}</td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {new Date(log.logged_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3 text-sm">
                      {log.duration_minutes ? `${log.duration_minutes}m` : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary max-w-xs truncate">{log.note || '—'}</td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => setConfirm(log)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                        <Trash2 size={14} className="text-red-300" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-text-secondary">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-cream disabled:opacity-30">Previous</button>
              <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page >= meta.last_page} className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-cream disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete Log"
        message={`Delete this ${confirm?.type} log? This cannot be undone.`}
        danger
        onConfirm={() => handleDelete(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
