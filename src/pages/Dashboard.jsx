import { useEffect, useState } from 'react'
import { TrendingUp, Users, CreditCard, Activity, Baby, FileText, UserX } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { getDashboard, getDashboardCharts, getDashboardActivity } from '../api/dashboard'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

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
  if (error) return <div className="bg-red-500/10 text-red-500 p-4 rounded-xl">{error}</div>

  const statCards = stats ? [
    { label: 'Total Users', value: (stats.total_users || 0).toLocaleString(), icon: Users, color: 'bg-coral', change: stats.new_users_this_week ? `+${stats.new_users_this_week} this week` : null },
    { label: 'Active Subscriptions', value: ((stats.plan_distribution?.premium || 0) + (stats.plan_distribution?.family || 0)).toLocaleString(), icon: CreditCard, color: 'bg-plum', change: null },
    { label: 'Daily Logs', value: (stats.logs_today || 0).toLocaleString(), icon: Activity, color: 'bg-mint', change: null },
    { label: 'MRR', value: `$${(stats.revenue_monthly || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'bg-sky', change: null },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-text-secondary text-sm mt-1">Welcome back. Here's your BabyGlow overview.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard key={i} {...stat} />
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Baby size={14} className="text-mint" />
              <span className="text-xs text-text-secondary">Total Babies</span>
            </div>
            <span className="text-lg font-bold">{(stats.total_babies || 0).toLocaleString()}</span>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-sky" />
              <span className="text-xs text-text-secondary">Total Logs</span>
            </div>
            <span className="text-lg font-bold">{(stats.total_logs || 0).toLocaleString()}</span>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Users size={14} className="text-coral" />
              <span className="text-xs text-text-secondary">New Today</span>
            </div>
            <span className="text-lg font-bold">{stats.new_users_today || 0}</span>
          </div>
          <div className="bg-surface rounded-2xl p-4 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <UserX size={14} className="text-red-400" />
              <span className="text-xs text-text-secondary">Banned Users</span>
            </div>
            <span className="text-lg font-bold">{stats.banned_users || 0}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-4">User Growth</h3>
          {charts?.user_growth?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={240}>
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="#ccc" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#ccc" />
                  <Tooltip />
                  <Area type="monotone" dataKey="users" stroke="#FF7A78" fill="url(#colorUsers)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </>
          ) : (
            <div className="h-60 flex items-center justify-center text-text-secondary text-sm">No data yet</div>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Daily Logs</h3>
          {charts?.daily_logs?.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={charts.daily_logs.map((d) => ({
                day: new Date(d.day).toLocaleDateString('en', { weekday: 'short' }),
                logs: Number(d.count),
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#ccc" />
                <YAxis tick={{ fontSize: 11 }} stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="logs" fill="#77DDB8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-text-secondary text-sm">No data yet</div>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="font-semibold mb-4">Recent Activity</h3>
        {activity.length > 0 ? (
          <div className="space-y-3">
            {activity.map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-9 h-9 bg-cream rounded-full flex items-center justify-center text-base">
                  {item.type === 'new_user' ? '👤' : '💳'}
                </div>
                <div className="flex-1">
                  <span className="font-medium text-sm">{item.name}</span>
                  <span className="text-text-secondary text-sm">
                    {item.type === 'new_user' ? ' joined BabyGlow' : ` subscribed to ${item.extra}`}
                  </span>
                </div>
                <span className="text-xs text-text-secondary">
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary text-center py-8">No recent activity</p>
        )}
      </div>
    </div>
  )
}
