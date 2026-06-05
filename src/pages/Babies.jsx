import { useEffect, useState, useCallback } from 'react'
import { Search, Trash2, Baby, Eye, X, Calendar, User as UserIcon } from 'lucide-react'
import { getBabies, getBaby, deleteBaby } from '../api/babies'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const genderEmoji = { male: '👦', female: '👧', other: '👶' }

export default function Babies() {
  const [babies, setBabies] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [genderFilter, setGenderFilter] = useState('')
  const [page, setPage] = useState(1)
  const [selectedBaby, setSelectedBaby] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const toast = useToast()

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
        from: res.data.babies.from,
        to: res.data.babies.to,
      })
    } catch {
      toast({ type: 'error', title: 'Failed to load babies' })
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
    try {
      await deleteBaby(baby.id)
      toast({ type: 'success', title: 'Baby deleted', message: baby.name })
      fetchBabies()
    } catch {
      toast({ type: 'error', title: 'Delete failed' })
    }
    setConfirm(null)
    setSelectedBaby(null)
  }

  const getAge = (birthDate) => {
    const diff = Date.now() - new Date(birthDate).getTime()
    const days = Math.floor(diff / 86400000)
    if (days < 30) return `${days}d old`
    if (days < 365) return `${Math.floor(days / 30)}mo old`
    return `${Math.floor(days / 365)}y old`
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Babies</h1>
        <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total babies</p>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchBabies() }} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by baby or parent name..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select
          value={genderFilter}
          onChange={(e) => { setGenderFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none cursor-pointer"
        >
          <option value="">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="other">Other</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {babies.length === 0 ? (
            <EmptyState
              icon={Baby}
              title="No babies found"
              description={search || genderFilter ? 'Try adjusting your filters' : 'Babies will appear here once parents add them'}
            />
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream/30">
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Baby</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Parent</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Gender</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Age</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Created</th>
                      <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {babies.map((baby) => (
                      <tr key={baby.id} className="border-b border-border table-row-hover">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-mint/10 rounded-full flex items-center justify-center text-base">
                              {genderEmoji[baby.gender] || '👶'}
                            </div>
                            <div>
                              <span className="font-medium text-sm">{baby.name}</span>
                              <div className="text-xs text-text-secondary">{new Date(baby.birth_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-coral/10 rounded-full flex items-center justify-center text-[10px] font-bold text-coral">
                              {baby.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="text-sm text-text-secondary">{baby.user?.name || 'Unknown'}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm capitalize">{baby.gender || '—'}</td>
                        <td className="px-6 py-4 text-sm font-medium">{baby.birth_date ? getAge(baby.birth_date) : '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">
                          {new Date(baby.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-0.5">
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
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      {/* Baby Detail Slide-over */}
      {selectedBaby && (
        <div className="fixed inset-0 z-50">
          <div className="fixed inset-0 bg-black/40 glass" onClick={() => setSelectedBaby(null)} />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface shadow-2xl overflow-auto animate-slide-in-right">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">{selectedBaby.baby.name}</h2>
                  <p className="text-sm text-text-secondary mt-0.5">{genderEmoji[selectedBaby.baby.gender] || '👶'} {selectedBaby.baby.gender || 'Unknown gender'}</p>
                </div>
                <button onClick={() => setSelectedBaby(null)} className="p-2 rounded-xl hover:bg-cream transition-colors">
                  <X size={18} className="text-text-secondary" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-cream/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <UserIcon size={14} className="text-text-secondary" />
                      <span className="text-xs text-text-secondary">Parent</span>
                    </div>
                    <p className="font-medium text-sm">{selectedBaby.baby.user?.name || 'Unknown'}</p>
                  </div>
                  <div className="bg-cream/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar size={14} className="text-text-secondary" />
                      <span className="text-xs text-text-secondary">Born</span>
                    </div>
                    <p className="font-medium text-sm">{new Date(selectedBaby.baby.birth_date).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-cream/50 rounded-xl p-4">
                    <div className="text-xs text-text-secondary mb-1">Total Logs</div>
                    <p className="font-bold text-lg">{selectedBaby.stats?.total_logs || 0}</p>
                  </div>
                  <div className="bg-cream/50 rounded-xl p-4">
                    <div className="text-xs text-text-secondary mb-1">Age</div>
                    <p className="font-bold text-lg">{getAge(selectedBaby.baby.birth_date)}</p>
                  </div>
                </div>

                {selectedBaby.stats?.logs_by_type && Object.keys(selectedBaby.stats.logs_by_type).length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Logs by Type</h4>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(selectedBaby.stats.logs_by_type).map(([type, count]) => (
                        <span key={type} className="px-3 py-1.5 bg-cream rounded-full text-xs font-medium capitalize">
                          {type}: {count}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedBaby.stats?.recent_logs?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Recent Logs</h4>
                    <div className="space-y-2">
                      {selectedBaby.stats.recent_logs.slice(0, 10).map((log) => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                          <span className="px-2 py-0.5 bg-surface rounded text-xs font-medium capitalize">{log.type}</span>
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