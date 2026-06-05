import { useEffect, useState, useCallback } from 'react'
import { CreditCard, Search, RefreshCw } from 'lucide-react'
import { getSubscriptions } from '../api/subscriptions'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const planColors = {
  free: 'bg-gray-100 text-gray-500',
  plus: 'bg-coral/10 text-coral',
  premium: 'bg-plum/10 text-plum',
  family: 'bg-sky/10 text-sky',
}

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-600',
  canceled: 'bg-red-500/10 text-red-400',
  past_due: 'bg-amber-500/10 text-amber-600',
  trialing: 'bg-sky/10 text-sky',
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const toast = useToast()

  const fetchSubs = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (planFilter) params.plan = planFilter
      if (statusFilter) params.status = statusFilter
      if (search) params.search = search
      const res = await getSubscriptions(params)
      setSubs(res.data.subscriptions?.data || [])
      const m = res.data.subscriptions
      setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total, from: m.from, to: m.to } : { current_page: 1, last_page: 1, total: 0 })
    } catch {
      toast({ type: 'error', title: 'Failed to load subscriptions' })
    } finally {
      setLoading(false)
    }
  }, [page, planFilter, statusFilter, search])

  useEffect(() => { fetchSubs() }, [fetchSubs])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} subscriptions</p>
        </div>
        <button onClick={fetchSubs} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
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
            placeholder="Search by user..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select value={planFilter} onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none cursor-pointer">
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="plus">Plus</option>
          <option value="premium">Premium</option>
          <option value="family">Family</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none cursor-pointer">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="canceled">Canceled</option>
          <option value="trialing">Trialing</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {subs.length === 0 ? (
            <EmptyState icon={CreditCard} title="No subscriptions found" description="Subscriptions will appear here" />
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream/30">
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">User</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Plan</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Provider</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Start</th>
                      <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">End</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subs.map((sub) => (
                      <tr key={sub.id} className="border-b border-border table-row-hover">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 bg-gradient-to-br from-coral/20 to-plum/20 rounded-full flex items-center justify-center text-sm font-bold text-coral">
                              {sub.user?.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="font-medium text-sm">{sub.user?.name || 'Unknown'}</div>
                              <div className="text-xs text-text-secondary">{sub.user?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${planColors[sub.plan] || planColors.free}`}>{sub.plan}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[sub.status] || ''}`}>{sub.status || '—'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary capitalize">{sub.provider || '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{sub.starts_at ? new Date(sub.starts_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</td>
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