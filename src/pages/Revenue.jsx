import { useEffect, useState } from 'react'
import { DollarSign, TrendingUp, Percent, CreditCard, RefreshCw } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getRevenue, tierLabel, statusLabel } from '../api/subscriptions'
import StatCard from '../components/StatCard'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const money = (v) => `$${Number(v || 0).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export default function Revenue() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()

  const fetchRevenue = async () => {
    setLoading(true)
    try {
      const res = await getRevenue()
      setData(res.data)
    } catch {
      toast({ type: 'error', title: 'Failed to load revenue data' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRevenue() }, [])

  if (loading) return <LoadingSpinner />
  if (!data) return <EmptyState icon={DollarSign} title="No revenue data" description="Revenue metrics will appear here" />

  const byTier = data.mrr_by_tier || {}
  const monthly = (data.monthly_revenue || []).map((m) => ({
    month: String(m.month).slice(0, 7),
    revenue: Number(m.revenue || 0),
  }))
  const transactions = data.transactions || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Revenue</h1>
          <p className="text-text-secondary text-sm mt-1">Recurring revenue and subscription economics</p>
        </div>
        <button onClick={fetchRevenue} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
          <RefreshCw size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Monthly Recurring Revenue" value={money(data.mrr)} icon={DollarSign} color="bg-gradient-to-br from-coral to-coral-dark" />
        <StatCard label="Glow Plus MRR" value={money(byTier.plus ?? byTier.premium)} icon={TrendingUp} color="bg-gradient-to-br from-plum to-plum/70" />
        <StatCard label="Glow Family MRR" value={money(byTier.family)} icon={TrendingUp} color="bg-gradient-to-br from-sky to-sky/70" />
        <StatCard label="Trial Conversion (30d)" value={`${Number(data.trial_conversion_30d || 0).toFixed(1)}%`} icon={Percent} color="bg-gradient-to-br from-mango to-mango/70" />
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-surface rounded-2xl border border-border p-5 animate-fade-in-up">
        <h2 className="font-semibold mb-4">Revenue by month (last 6 months)</h2>
        {monthly.length === 0 ? (
          <p className="text-sm text-text-secondary py-8 text-center">No paid subscriptions yet</p>
        ) : (
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
                <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => [money(v), 'Revenue']}
                  contentStyle={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 12, fontSize: 12 }}
                />
                <Bar dataKey="revenue" fill="#FF7A6B" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Recent transactions */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold">Recent subscriptions</h2>
        </div>
        {transactions.length === 0 ? (
          <EmptyState icon={CreditCard} title="No subscriptions yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-cream/30">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Plan</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-border table-row-hover">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gradient-to-br from-coral/20 to-plum/20 rounded-full flex items-center justify-center text-sm font-bold text-coral">
                          {t.user?.name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{t.user?.name || 'Unknown'}</div>
                          <div className="text-xs text-text-secondary">{t.user?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-coral/10 text-coral">{tierLabel(t.plan)}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-text-secondary">{statusLabel(t.status)}</td>
                    <td className="px-6 py-4 text-sm text-text-secondary">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
