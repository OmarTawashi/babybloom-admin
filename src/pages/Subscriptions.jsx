import { useEffect, useState, useCallback } from 'react'
import { CreditCard, TrendingUp, Users, DollarSign, Search, RefreshCw, Calendar, Clock, AlertTriangle } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts'
import {
  getSubscriptions, updateSubscription, cancelSubscription, getRevenue, extendGrace,
  TIERS, STATUSES, tierLabel, statusLabel, ENTITLED_STATUSES,
} from '../api/subscriptions'
import { grantPremium } from '../api/users'
import StatCard from '../components/StatCard'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const TIER_COLORS = {
  plus: '#FF7A78',
  premium: '#FF7A78', // legacy
  family: '#6D5DF6',
  free: '#E5E2DF',
}

const STATUS_STYLES = {
  active:    'bg-emerald-100 text-emerald-600',
  trialing:  'bg-sky-100 text-sky-600',
  grace:     'bg-amber-100 text-amber-600',
  cancelled: 'bg-red-500/10 text-red-400',
  canceled:  'bg-red-500/10 text-red-400', // legacy
  expired:   'bg-cream text-ink/60',
  free:      'bg-cream text-ink/60',
}

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function normalizeTier(plan) {
  return plan === 'premium' ? 'plus' : (plan || 'free')
}

function daysUntil(iso) {
  if (!iso) return null
  const diff = new Date(iso).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

export default function Subscriptions() {
  const [data, setData] = useState(null)
  const [revenueData, setRevenueData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null) // { type: 'cancel'|'grant'|'grace', sub, tier?, days? }
  const [grantTier, setGrantTier] = useState('plus')
  const [graceDays, setGraceDays] = useState(7)
  const [actionLoading, setActionLoading] = useState(null)

  const debouncedSearch = useDebounce(search)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page }
      if (planFilter) params.plan = planFilter
      if (statusFilter) params.status = statusFilter
      if (debouncedSearch) params.search = debouncedSearch
      const [subRes, revRes] = await Promise.all([getSubscriptions(params), getRevenue()])
      setData(subRes.data)
      setRevenueData(revRes.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [planFilter, statusFilter, debouncedSearch, page])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setPage(1) }, [planFilter, statusFilter, debouncedSearch])

  const handleChangePlan = async (sub, plan) => {
    setActionLoading(sub.id)
    try {
      await updateSubscription(sub.id, { plan })
      fetchData()
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (sub) => {
    setActionLoading(sub.id)
    try {
      await cancelSubscription(sub.id)
      setConfirm(null)
      fetchData()
    } finally {
      setActionLoading(null)
    }
  }

  const handleGrantPremium = async (sub, tier) => {
    if (!sub.user) return
    setActionLoading(sub.id)
    try {
      await grantPremium(sub.user.id, tier)
      setConfirm(null)
      fetchData()
    } finally {
      setActionLoading(null)
    }
  }

  const handleExtendGrace = async (sub, days) => {
    setActionLoading(sub.id)
    try {
      await extendGrace(sub.id, days)
      setConfirm(null)
      fetchData()
    } finally {
      setActionLoading(null)
    }
  }

  if (loading && !data) return <LoadingSpinner />

  const planDistribution = data?.plan_distribution
    ? Object.entries(data.plan_distribution).map(([name, value]) => ({
        name: tierLabel(name),
        value: Number(value),
        color: TIER_COLORS[name] || '#E5E2DF',
      }))
    : []

  const subscriptions = data?.subscriptions?.data || []
  const subMeta = {
    current_page: data?.subscriptions?.current_page ?? 1,
    last_page: data?.subscriptions?.last_page ?? 1,
    total: data?.subscriptions?.total ?? 0,
    from: data?.subscriptions?.from ?? 0,
    to: data?.subscriptions?.to ?? 0,
  }

  const mrr = revenueData?.mrr || 0
  const arr = mrr * 12
  const mrrByTier = revenueData?.mrr_by_tier || {}
  const trialConversion = revenueData?.trial_conversion_30d ?? 0
  const monthlyRevenue = revenueData?.monthly_revenue || []

  const active = data?.active || 0
  const trialing = data?.trialing || 0
  const grace = data?.grace || 0
  const cancelled = data?.cancelled || data?.canceled || 0
  const expired = data?.expired || 0
  const totalChurned = cancelled + expired
  const churnRate = active + totalChurned > 0
    ? ((totalChurned / (active + totalChurned)) * 100).toFixed(1)
    : '0.0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Subscriptions</h1>
          <p className="text-text-secondary text-sm mt-1">Revenue and subscription management</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-surface border border-border rounded-xl text-sm font-medium hover:bg-cream transition-colors"
        >
          <RefreshCw size={14} />
          Refresh
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="MRR" value={`$${Number(mrr).toFixed(2)}`} icon={DollarSign} color="bg-coral" />
        <StatCard label="ARR" value={`$${Number(arr).toFixed(0)}`} icon={TrendingUp} color="bg-mint" />
        <StatCard label="Active Subs" value={(active + trialing).toLocaleString()} icon={CreditCard} color="bg-plum" />
        <StatCard label="Churn Rate" value={`${churnRate}%`} icon={Users} color="bg-mango" />
      </div>

      {/* Secondary status row — surfaces unified-state-machine breakdown */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
        <StatusPill label="Active" value={active} tone="emerald" />
        <StatusPill label="Trialing" value={trialing} tone="sky" icon={Clock} />
        <StatusPill label="Grace" value={grace} tone="amber" icon={AlertTriangle} />
        <StatusPill label="Cancelled" value={cancelled} tone="red" />
        <StatusPill label="Expired" value={expired} tone="zinc" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Revenue Trend (MRR)</h3>
            <div className="flex gap-3 text-xs text-text-secondary">
              <span>Plus: <strong>${Number(mrrByTier.plus || mrrByTier.premium || 0).toFixed(2)}</strong></span>
              <span>Family: <strong>${Number(mrrByTier.family || 0).toFixed(2)}</strong></span>
              <span>Trial→Active 30d: <strong>{trialConversion}%</strong></span>
            </div>
          </div>
          {monthlyRevenue.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyRevenue.map((d) => ({
                month: new Date(d.month).toLocaleDateString('en', { month: 'short', year: '2-digit' }),
                revenue: Number(d.revenue),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#ccc" />
                <YAxis tick={{ fontSize: 12 }} stroke="#ccc" tickFormatter={(v) => `$${v}`} />
                <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#FF7A78" strokeWidth={2.5} dot={{ fill: '#FF7A78', r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-text-secondary gap-2">
              <DollarSign size={32} className="opacity-20" />
              <span className="text-sm">No revenue data yet</span>
            </div>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Plan Distribution</h3>
          {planDistribution.some(p => p.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={planDistribution} cx="50%" cy="50%" innerRadius={48} outerRadius={76} paddingAngle={3} dataKey="value">
                    {planDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value.toLocaleString(), name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {planDistribution.map((plan, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: plan.color }} />
                      {plan.name}
                    </span>
                    <span className="font-semibold">{plan.value.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-text-secondary text-sm">No active subscriptions</div>
          )}
        </div>
      </div>

      {/* Subscription List */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex flex-col sm:flex-row sm:items-center gap-3">
          <h3 className="font-semibold flex-1">
            Subscriptions
            {subMeta.total > 0 && (
              <span className="ml-2 text-xs font-normal text-text-secondary">({subMeta.total.toLocaleString()} total)</span>
            )}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search user…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-cream rounded-lg text-sm border-0 w-44 focus:outline-none focus:ring-2 focus:ring-coral/30"
              />
            </div>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="px-3 py-1.5 bg-cream rounded-lg text-sm border-0 focus:outline-none"
            >
              <option value="">All Tiers</option>
              {TIERS.map((t) => <option key={t} value={t}>{tierLabel(t)}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-cream rounded-lg text-sm border-0 focus:outline-none"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-cream/30">
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">User</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Tier</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Trial</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Started</th>
                <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Expires</th>
                <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-text-secondary text-sm">
                    {search || planFilter || statusFilter ? 'No subscriptions match your filters.' : 'No subscriptions yet.'}
                  </td>
                </tr>
              ) : subscriptions.map((sub) => {
                const isLoading = actionLoading === sub.id
                const tier = normalizeTier(sub.plan)
                const status = sub.status || 'free'
                const entitled = ENTITLED_STATUSES.has(status)
                const expiresIn = daysUntil(sub.ends_at)
                const trialIn = daysUntil(sub.trial_ends_at)
                const rcId = sub.rc_customer_id || sub.stripe_id
                const isExpiringSoon = entitled && expiresIn !== null && expiresIn <= 7

                return (
                  <tr key={sub.id} className="border-b border-black/3 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="font-medium text-sm">{sub.user?.name || 'Unknown'}</div>
                      <div className="text-xs text-text-secondary">{sub.user?.email}</div>
                      {rcId && (
                        <div className="text-xs text-text-secondary font-mono mt-0.5 truncate max-w-[160px]" title={rcId}>
                          RC: {rcId}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        tier === 'plus' ? 'bg-coral/10 text-coral'
                          : tier === 'family' ? 'bg-plum/10 text-plum'
                          : 'bg-cream text-ink/60'
                      }`}>
                        {tierLabel(tier)}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        STATUS_STYLES[status] || 'bg-cream text-ink/60'
                      }`}>
                        {statusLabel(status)}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-sm whitespace-nowrap">
                      {sub.trial_ends_at ? (
                        <span className={`flex items-center gap-1 ${trialIn !== null && trialIn <= 3 ? 'text-amber-500 font-semibold' : 'text-text-secondary'}`}>
                          <Clock size={12} />
                          {trialIn !== null && trialIn >= 0 ? `${trialIn}d left` : 'ended'}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary whitespace-nowrap">
                      {sub.starts_at ? new Date(sub.starts_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="px-6 py-3 text-sm whitespace-nowrap">
                      {sub.ends_at ? (
                        <span className={`flex items-center gap-1 ${isExpiringSoon ? 'text-amber-500 font-semibold' : 'text-text-secondary'}`}>
                          {isExpiringSoon && <Calendar size={12} />}
                          {new Date(sub.ends_at).toLocaleDateString()}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 flex-wrap">
                        {isLoading ? (
                          <span className="text-xs text-text-secondary">…</span>
                        ) : (
                          <>
                            {(!entitled || tier === 'free') && (
                              <button
                                onClick={() => { setGrantTier('plus'); setConfirm({ type: 'grant', sub }) }}
                                className="px-2 py-1 text-xs bg-coral/10 text-coral rounded-lg hover:bg-coral/20 transition-colors"
                              >
                                Grant
                              </button>
                            )}
                            {tier === 'plus' && (
                              <button
                                onClick={() => handleChangePlan(sub, 'family')}
                                className="px-2 py-1 text-xs bg-plum/10 text-plum rounded-lg hover:bg-plum/20 transition-colors"
                              >
                                → Family
                              </button>
                            )}
                            {status === 'grace' && (
                              <button
                                onClick={() => { setGraceDays(7); setConfirm({ type: 'grace', sub }) }}
                                className="px-2 py-1 text-xs bg-amber-100 text-amber-600 rounded-lg hover:bg-amber-200 transition-colors"
                              >
                                Extend grace
                              </button>
                            )}
                            {entitled && tier !== 'free' && status !== 'cancelled' && (
                              <button
                                onClick={() => setConfirm({ type: 'cancel', sub })}
                                className="px-2 py-1 text-xs bg-red-500/10 text-red-400 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Cancel
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {subMeta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-border flex items-center justify-between text-sm text-text-secondary">
            <span>{subMeta.from}–{subMeta.to} of {subMeta.total.toLocaleString()}</span>
            <div className="flex gap-2">
              <button
                disabled={subMeta.current_page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >← Prev</button>
              <span className="px-3 py-1.5">{subMeta.current_page} / {subMeta.last_page}</span>
              <button
                disabled={subMeta.current_page >= subMeta.last_page}
                onClick={() => setPage((p) => Math.min(subMeta.last_page, p + 1))}
                className="px-3 py-1.5 rounded-lg border border-border hover:bg-cream disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >Next →</button>
            </div>
          </div>
        )}
      </div>

      {/* Cancel confirm */}
      <ConfirmDialog
        open={confirm?.type === 'cancel'}
        title="Cancel Subscription"
        message={`Cancel ${confirm?.sub?.user?.name}'s ${tierLabel(normalizeTier(confirm?.sub?.plan))} subscription? Access keeps until the period ends; the user is then downgraded to Free.`}
        danger
        onConfirm={() => handleCancel(confirm.sub)}
        onCancel={() => setConfirm(null)}
      />

      {/* Grant confirm with tier picker */}
      <ConfirmDialog
        open={confirm?.type === 'grant'}
        title="Grant Subscription"
        message={
          <div className="space-y-3">
            <p>Grant <strong>{confirm?.sub?.user?.name}</strong> ({confirm?.sub?.user?.email}) a paid subscription.</p>
            <div className="flex gap-2">
              {['plus', 'family'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGrantTier(t)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    grantTier === t ? 'bg-coral text-white' : 'bg-cream text-ink/70 hover:bg-cream/70'
                  }`}
                >{tierLabel(t)}</button>
              ))}
            </div>
          </div>
        }
        onConfirm={() => handleGrantPremium(confirm.sub, grantTier)}
        onCancel={() => setConfirm(null)}
      />

      {/* Extend grace confirm */}
      <ConfirmDialog
        open={confirm?.type === 'grace'}
        title="Extend grace period"
        message={
          <div className="space-y-3">
            <p>Extend access for <strong>{confirm?.sub?.user?.name}</strong> while the billing issue is resolved.</p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={90}
                value={graceDays}
                onChange={(e) => setGraceDays(Math.max(1, Math.min(90, Number(e.target.value) || 1)))}
                className="w-20 px-3 py-2 bg-cream rounded-lg text-sm border-0 focus:outline-none"
              />
              <span className="text-sm text-text-secondary">days</span>
            </div>
          </div>
        }
        onConfirm={() => handleExtendGrace(confirm.sub, graceDays)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}

function StatusPill({ label, value, tone, icon: Icon }) {
  const toneClass = {
    emerald: 'bg-emerald-100 text-emerald-700',
    sky:     'bg-sky-100 text-sky-700',
    amber:   'bg-amber-100 text-amber-700',
    red:     'bg-red-100 text-red-700',
    zinc:    'bg-cream text-ink/60',
  }[tone] || 'bg-cream text-ink/60'

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-xl ${toneClass}`}>
      <span className="flex items-center gap-1.5 font-medium text-xs uppercase tracking-wider">
        {Icon && <Icon size={12} />}
        {label}
      </span>
      <span className="font-bold">{Number(value).toLocaleString()}</span>
    </div>
  )
}
