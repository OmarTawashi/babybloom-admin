import { useEffect, useState } from 'react'
import { TrendingUp, Users, CreditCard, Activity, Baby, FileText, UserX, ArrowRight, Clock, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getDashboard, getDashboardCharts, getDashboardActivity } from '../api/dashboard'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

const activityIcons = {
  new_user: '👤',
  subscription: '💳',
  new_baby: '👶',
  log_created: '📝',
}

const activityColors = {
  new_user: 'bg-coral/10',
  subscription: 'bg-plum/10',
  new_baby: 'bg-mint/10',
  log_created: 'bg-sky/10',
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [charts, setCharts] = useState(null)
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([getDashboard(), getDashboardCharts(), getDashboardActivity()])
      .then(([statsRes, chartsRes, activityRes]) => {
        setStats(statsRes.data)
        setCharts(chartsRes.data)
        setActivity(activityRes.data.activities || [])
      })
      .catch((err) => setError(err.response?.data?.message || 'Failed to load dashboard'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />
  if (error) return (
    <div className="bg-red-500/10 text-red-500 p-6 rounded-2xl border border-red-500/20 animate-fade-in">
      <p className="font-medium">Failed to load dashboard</p>
      <p className="text-sm opacity-80 mt-1">{error}</p>
    </div>
  )

  const statCards = stats ? [
    { label: 'Total Users', value: (stats.total_users || 0).toLocaleString(), icon: Users, color: 'bg-coral', change: stats.new_users_this_week ? `+${stats.new_users_this_week} this week` : null },
    { label: 'Active Subscriptions', value: ((stats.plan_distribution?.premium || 0) + (stats.plan_distribution?.family || 0) + (stats.plan_distribution?.plus || 0)).toLocaleString(), icon: CreditCard, color: 'bg-plum', change: null },
    { label: 'Daily Logs', value: (stats.logs_today || 0).toLocaleString(), icon: Activity, color: 'bg-mint', change: null },
    { label: 'MRR', value: `$${(stats.revenue_monthly || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-sky', change: null },
  ] : []

  const secondaryStats = stats ? [
    { label: 'Total Babies', value: stats.total_babies || 0, icon: Baby, color: 'text-mint' },
    { label: 'Total Logs', value: stats.total_logs || 0, icon: FileText, color: 'text-sky' },
    { label: 'New Today', value: stats.new_users_today || 0, icon: Users, color: 'text-coral' },
    { label: 'Banned', value: stats.banned_users || 0, icon: UserX, color: 'text-red-400' },
  ] : []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Dashboard
            <Sparkles size={18} className="text-mango" />
          </h1>
          <p className="text-text-secondary text-sm mt-1">Welcome back. Here's your BabyGlow overview.</p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-xs text-text-secondary bg-surface px-3 py-2 rounded-xl border border-border">
          <Clock size={14} />
          {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </div>

      {/* Primary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {/* Secondary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {secondaryStats.map((stat, i) => (
            <div key={i} className="bg-surface rounded-2xl p-4 border border-border card-hover">
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-xs text-text-secondary font-medium">{stat.label}</span>
              </div>
              <span className="text-xl font-bold">{stat.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">User Growth</h3>
            <span className="text-xs text-text-secondary bg-cream px-2.5 py-1 rounded-full">Weekly</span>
          </div>
          {charts?.user_growth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={charts.user_growth.map((d) => ({
                week: d.week,
                users: Number(d.count),
              }))}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF7A78" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#FF7A78" stopOpacity={0} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="users" stroke="#FF7A78" fill="url(#colorUsers)" strokeWidth={2.5} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-text-secondary text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold">Daily Logs</h3>
            <span className="text-xs text-text-secondary bg-cream px-2.5 py-1 rounded-full">This week</span>
          </div>
          {charts?.daily_logs?.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={charts.daily_logs.map((d) => ({
                day: new Date(d.day).toLocaleDateString('en', { weekday: 'short' }),
                logs: Number(d.count),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="var(--color-text-secondary)" />
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
                <Bar dataKey="logs" fill="#77DDB8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-text-secondary text-sm">No data yet</div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-surface rounded-2xl border border-border">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-semibold">Recent Activity</h3>
          <Link to="/logs" className="flex items-center gap-1 text-xs text-coral font-medium hover:text-coral-dark transition-colors">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {activity.length > 0 ? (
          <div className="divide-y divide-border">
            {activity.slice(0, 8).map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-6 py-3.5 hover:bg-cream/30 transition-colors">
                <div className={`w-9 h-9 ${activityColors[item.type] || 'bg-cream'} rounded-full flex items-center justify-center text-base shrink-0`}>
                  {activityIcons[item.type] || '📋'}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-text-secondary text-sm">
                    {item.type === 'new_user' ? ' joined BabyGlow' : ` subscribed to ${item.extra}`}
                  </span>
                </div>
                <span className="text-xs text-text-secondary whitespace-nowrap">
                  {new Date(item.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-text-secondary text-sm">No recent activity</div>
        )}
      </div>
    </div>
  )
}