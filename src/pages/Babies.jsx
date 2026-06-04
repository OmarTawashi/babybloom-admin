import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Baby, Eye } from 'lucide-react'
import { getBabies, getBaby, deleteBaby } from '../api/babies'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Babies() {
  const navigate = useNavigate()
  const [babies, setBabies] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedBaby, setSelectedBaby] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const fetchBabies = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (search) params.search = search
      if (genderFilter) params.gender = genderFilter
      const res = await getBabies(params)
      setBabies(res.data.babies.data)
      setMeta({
        current_page: res.data.babies.current_page,
        last_page: res.data.babies.last_page,
        total: res.data.babies.total,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, genderFilter])

  useEffect(() => { fetchBabies() }, [fetchBabies])

  const handleView = async (baby) => {
    const res = await getBaby(baby.id)
    setSelectedBaby(res.data)
  }

  const handleDelete = async (baby) => {
    await deleteBaby(baby.id)
    setConfirm(null)
    setSelectedBaby(null)
    fetchBabies()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Babies</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total babies</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchBabies() }} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by baby or parent name..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none"
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Baby</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Parent</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Gender</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Birth Date</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Created</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {babies.map((baby) => (
                  <tr key={baby.id} className="border-b border-black/3 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-mint/10 rounded-full flex items-center justify-center">
                          <Baby size={16} className="text-mint" />
                        </div>
                        <span className="font-medium text-sm">{baby.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{baby.user?.name || 'Unknown'}</td>
                    <td className="px-6 py-4 text-sm capitalize">{baby.gender || '—'}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(baby.birth_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {new Date(baby.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleView(baby)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="View">
                          <Eye size={14} className="text-text-secondary" />
                        </button>
                        <button onClick={() => setConfirm(baby)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                          <Trash2 size={14} className="text-red-300" />
                        </button>
                      </div>
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

      {/* Baby Detail Slide-over */}
      {selectedBaby && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/30" onClick={() => setSelectedBaby(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-xl overflow-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{selectedBaby.baby.name}</h2>
                <button onClick={() => setSelectedBaby(null)} className="text-text-secondary hover:text-ink text-xl">&times;</button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-text-secondary">Parent</span><p className="font-medium">{selectedBaby.baby.user?.name}</p></div>
                  <div><span className="text-text-secondary">Gender</span><p className="font-medium capitalize">{selectedBaby.baby.gender || '—'}</p></div>
                  <div><span className="text-text-secondary">Birth Date</span><p className="font-medium">{new Date(selectedBaby.baby.birth_date).toLocaleDateString()}</p></div>
                  <div><span className="text-text-secondary">Total Logs</span><p className="font-medium">{selectedBaby.stats?.total_logs || 0}</p></div>
                </div>
                {selectedBaby.stats?.logs_by_type && Object.keys(selectedBaby.stats.logs_by_type).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Logs by Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedBaby.stats.logs_by_type).map(([type, count]) => (
                        <span key={type} className="px-3 py-1 bg-cream rounded-full text-xs font-medium capitalize">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {selectedBaby.stats?.recent_logs?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Recent Logs</h4>
                    <div className="space-y-2">
                      {selectedBaby.stats.recent_logs.map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                          <span className="text-xs font-medium capitalize">{log.type}</span>
                          <span className="text-xs text-text-secondary">{new Date(log.logged_at).toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete Baby"
        message={`Delete ${confirm?.name} and all associated logs? This cannot be undone.`}
        danger
        onConfirm={() => handleDelete(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
