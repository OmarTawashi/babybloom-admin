import { useEffect, useState, useCallback } from 'react'
import { CreditCard, Search, RefreshCw, MoreVertical, Pencil, Clock, XCircle } from 'lucide-react'
import {
  getSubscriptions, updateSubscription, cancelSubscription, extendGrace,
  TIERS, STATUSES, tierLabel, statusLabel,
} from '../api/subscriptions'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const planColors = {
  free: 'bg-gray-100 text-gray-500',
  plus: 'bg-coral/10 text-coral',
  premium: 'bg-plum/10 text-plum',
  family: 'bg-sky/10 text-sky',
}

const statusColors = {
  free: 'bg-gray-100 text-gray-500',
  active: 'bg-emerald-500/10 text-emerald-600',
  trialing: 'bg-sky/10 text-sky',
  grace: 'bg-amber-500/10 text-amber-600',
  cancelled: 'bg-red-500/10 text-red-400',
  expired: 'bg-gray-200 text-gray-400',
}

export default function Subscriptions() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [menuFor, setMenuFor] = useState(null)
  const [editSub, setEditSub] = useState(null)
  const [graceSub, setGraceSub] = useState(null)
  const [cancelSub, setCancelSub] = useState(null)
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

  const replaceSub = (updated) => {
    setSubs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  const handleCancel = async () => {
    const sub = cancelSub
    setCancelSub(null)
    try {
      const res = await cancelSubscription(sub.id)
      replaceSub(res.data.subscription)
      toast({ type: 'success', title: 'Subscription cancelled', message: sub.user?.name })
    } catch (err) {
      toast({ type: 'error', title: 'Failed to cancel', message: err.response?.data?.message })
    }
  }

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
          {TIERS.map((t) => <option key={t} value={t}>{tierLabel(t)}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none cursor-pointer">
          <option value="">All Status</option>
          {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
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
                      <th className="px-3 py-3" />
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
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${planColors[sub.plan] || planColors.free}`}>{tierLabel(sub.plan)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[sub.status] || ''}`}>{sub.status ? statusLabel(sub.status) : '—'}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-text-secondary capitalize">{sub.provider || '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{sub.starts_at ? new Date(sub.starts_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</td>
                        <td className="px-6 py-4 text-sm text-text-secondary">{sub.ends_at ? new Date(sub.ends_at).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '—'}</td>
                        <td className="px-3 py-4 relative">
                          <button
                            onClick={() => setMenuFor(menuFor === sub.id ? null : sub.id)}
                            className="p-1.5 rounded-lg hover:bg-cream transition-colors"
                          >
                            <MoreVertical size={16} className="text-text-secondary" />
                          </button>
                          {menuFor === sub.id && (
                            <>
                              <div className="fixed inset-0 z-10" onClick={() => setMenuFor(null)} />
                              <div className="absolute right-3 top-full -mt-1 w-44 bg-surface rounded-xl border border-border shadow-xl z-20 py-1.5 animate-fade-in-down">
                                <MenuItem icon={Pencil} label="Edit" onClick={() => { setMenuFor(null); setEditSub(sub) }} />
                                <MenuItem icon={Clock} label="Extend grace" onClick={() => { setMenuFor(null); setGraceSub(sub) }} />
                                <MenuItem icon={XCircle} label="Cancel subscription" danger onClick={() => { setMenuFor(null); setCancelSub(sub) }} />
                              </div>
                            </>
                          )}
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

      {editSub && (
        <EditModal
          sub={editSub}
          onClose={() => setEditSub(null)}
          onSaved={(updated) => { replaceSub(updated); setEditSub(null); toast({ type: 'success', title: 'Subscription updated' }) }}
          onError={(msg) => toast({ type: 'error', title: 'Failed to update', message: msg })}
        />
      )}

      {graceSub && (
        <GraceModal
          sub={graceSub}
          onClose={() => setGraceSub(null)}
          onSaved={(updated, days) => { replaceSub(updated); setGraceSub(null); toast({ type: 'success', title: `Grace extended by ${days} days` }) }}
          onError={(msg) => toast({ type: 'error', title: 'Failed to extend grace', message: msg })}
        />
      )}

      <ConfirmDialog
        open={!!cancelSub}
        danger
        title="Cancel subscription?"
        message={<>This will cancel <strong>{cancelSub?.user?.name}</strong>'s {tierLabel(cancelSub?.plan)} subscription. If it has already ended, the user drops to Free immediately.</>}
        confirmLabel="Cancel subscription"
        cancelLabel="Keep it"
        onConfirm={handleCancel}
        onCancel={() => setCancelSub(null)}
      />
    </div>
  )
}

function MenuItem({ icon: Icon, label, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-sm transition-colors hover:bg-cream ${danger ? 'text-red-500' : ''}`}
    >
      <Icon size={15} className={danger ? 'text-red-500' : 'text-text-secondary'} />
      {label}
    </button>
  )
}

function ModalShell({ title, subtitle, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div className="fixed inset-0 bg-black/50 glass" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl animate-scale-in">
        <h3 className="font-semibold text-lg">{title}</h3>
        {subtitle && <p className="text-sm text-text-secondary mt-0.5 mb-4">{subtitle}</p>}
        {children}
      </div>
    </div>
  )
}

function EditModal({ sub, onClose, onSaved, onError }) {
  const [plan, setPlan] = useState(sub.plan || 'free')
  const [status, setStatus] = useState(sub.status || 'free')
  const [endsAt, setEndsAt] = useState(sub.ends_at ? sub.ends_at.slice(0, 10) : '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await updateSubscription(sub.id, { plan, status, ends_at: endsAt || null })
      onSaved(res.data.subscription)
    } catch (err) {
      onError(err.response?.data?.message)
      setSaving(false)
    }
  }

  return (
    <ModalShell title="Edit subscription" subtitle={`${sub.user?.name || 'Unknown'} · ${sub.user?.email || ''}`} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Plan</span>
          <select value={plan} onChange={(e) => setPlan(e.target.value)} className="mt-1 w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none cursor-pointer">
            {TIERS.map((t) => <option key={t} value={t}>{tierLabel(t)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Status</span>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="mt-1 w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none cursor-pointer">
            {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Ends at</span>
          <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1 w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none" />
        </label>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-cream transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-coral hover:bg-coral-dark disabled:opacity-50 transition-colors">
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </div>
    </ModalShell>
  )
}

function GraceModal({ sub, onClose, onSaved, onError }) {
  const [days, setDays] = useState(7)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await extendGrace(sub.id, days, note.trim() || undefined)
      onSaved(res.data.subscription, days)
    } catch (err) {
      onError(err.response?.data?.message)
      setSaving(false)
    }
  }

  return (
    <ModalShell title="Extend grace period" subtitle={`${sub.user?.name || 'Unknown'} keeps access while billing is resolved`} onClose={onClose}>
      <div className="space-y-3">
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Days (1–90)</span>
          <input
            type="number" min={1} max={90} value={days}
            onChange={(e) => setDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
            className="mt-1 w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Note (optional)</span>
          <input
            type="text" value={note} maxLength={255}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Reason for extension..."
            className="mt-1 w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
          />
        </label>
      </div>
      <div className="flex justify-end gap-3 mt-5">
        <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-border hover:bg-cream transition-colors">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="px-4 py-2 text-sm font-semibold rounded-xl text-white bg-coral hover:bg-coral-dark disabled:opacity-50 transition-colors">
          {saving ? 'Extending...' : `Extend ${days} days`}
        </button>
      </div>
    </ModalShell>
  )
}
