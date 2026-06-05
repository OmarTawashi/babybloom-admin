import { useEffect, useState } from 'react'
import { Brain, Activity, Baby, FileText, Users, CheckCircle, AlertTriangle, TrendingUp, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { getDashboard, getDashboardCharts } from '../api/dashboard'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const PIE_COLORS = ['#FF7A78', '#6D5DF6', '#77DDB8', '#7DC8FF', '#FFC857', '#E55654']

export default function Insights() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboard(), getDashboardCharts()])
      .then(([statsRes, chartsRes]) => {
        setStats(statsRes.data)
        setCharts(chartsRes.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const logTypeData = stats?.log_type_distribution
    ? Object.entries(stats.log_type_distribution).map(([type, count]) => ({
        type: type.replace('_', ' '),
        count: Number(count),
      }))
    : []

  const planData = stats?.plan_distribution
    ? Object.entries(stats.plan_distribution).map(([plan, count]) => ({
        plan: plan.charAt(0).toUpperCase() + plan.slice(1),
        count: Number(count),
      }))
    : []

  const insightCards = [
    {
      icon: Users,
      label: 'Total Users',
      value: (stats?.total_users || 0).toLocaleString(),
      color: 'bg-coral',
      detail: `${stats?.new_users_today || 0} new today`,
    },
    {
      icon: Baby,
      label: 'Total Babies',
      value: (stats?.total_babies || 0).toLocaleString(),
      color: 'bg-mint',
      detail: 'Across all users',
    },
    {
      icon: FileText,
      label: 'Total Logs',
      value: (stats?.total_logs || 0).toLocaleString(),
      color: 'bg-sky',
      detail: `${stats?.logs_today || 0} today`,
    },
    {
      icon: TrendingUp,
      label: 'MRR',
      value: `$${(stats?.revenue_monthly || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      color: 'bg-plum',
      detail: 'Monthly recurring revenue',
    },
  ]

  const avgLogsPerUser = stats?.total_users > 0
    ? ((stats?.total_logs || 0) / stats.total_users).toFixed(1)
    : '0'

  const avgBabiesPerUser = stats?.total_users > 0
    ? ((stats?.total_babies || 0) / stats.total_users).toFixed(1)
    : '0'

  const premiumCount = (stats?.plan_distribution?.premium || 0) + (stats?.plan_distribution?.family || 0) + (stats?.plan_distribution?.plus || 0)
  const conversionRate = stats?.total_users > 0
    ? ((premiumCount / stats.total_users) * 100).toFixed(1)
    : '0'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          Insights
          <Zap size={18} className="text-mango" />
        </h1>
        <p className="text-text-secondary text-sm mt-1">Deep analytics and usage patterns</p>
      </div>

      {/* Insight Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {insightCards.map((card, i) => (
          <StatCard key={i} {...card} />
        ))}
      </div>

      {/* Quick Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
        {[
          { label: 'Avg Logs/User', value: avgLogsPerUser, icon: Activity, color: 'text-sky' },
          { label: 'Avg Babies/User', value: avgBabiesPerUser, icon: Baby, color: 'text-mint' },
          { label: 'Conversion Rate', value: `${conversionRate}%`, icon: CheckCircle, color: 'text-emerald-500' },
          { label: 'Banned Users', value: stats?.banned_users || 0, icon: AlertTriangle, color: 'text-red-400' },
        ].map((metric, i) => (
          <div key={i} className="bg-surface rounded-2xl p-4 border border-border card-hover">
            <div className="flex items-center gap-2 mb-2">
              <metric.icon size={14} className={metric.color} />
              <span className="text-xs text-text-secondary font-medium">{metric.label}</span>
            </div>
            <span className="text-xl font-bold">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Log Type Distribution */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Brain size={16} className="text-plum" />
              Log Type Distribution
            </h3>
          </div>
          {logTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={logTypeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
                <YAxis dataKey="type" type="category" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" width={80} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-border)',
                    borderRadius: '12px',
                    fontSize: '13px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                />
                <Bar dataKey="count" fill="#6D5DF6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No log data yet</div>
          )}
        </div>

        {/* Plan Distribution */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Plan Distribution</h3>
          </div>
          {planData.length > 0 ? (
            <div className="flex items-center gap-6">
              <div className="w-48 h-48 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {planData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-surface)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '12px',
                        fontSize: '13px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3 flex-1">
                {planData.map((item, i) => (
                  <div key={item.plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm font-medium">{item.plan}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">{item.count.toLocaleString()}</span>
                      {stats?.total_users > 0 && (
                        <span className="text-xs text-text-secondary">
                          ({((item.count / stats.total_users) * 100).toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-text-secondary text-sm">No plan data yet</div>
          )}
        </div>
      </div>

      {/* User Growth Chart */}
      {charts?.user_growth?.length > 0 && (
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">User Growth Trend</h3>
            <span className="text-xs text-text-secondary bg-cream px-2.5 py-1 rounded-full">Weekly</span>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.user_growth.map((d) => ({
              week: d.week,
              users: Number(d.count),
            }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
              <YAxis tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '12px',
                  fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar dataKey="users" fill="#FF7A78" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}