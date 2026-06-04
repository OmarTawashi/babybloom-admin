import { useEffect, useState } from 'react'
import { Brain, Activity, Baby, FileText, Users, CheckCircle, AlertTriangle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { getDashboard, getDashboardCharts } from '../api/dashboard'
import StatCard from '../components/StatCard'
import LoadingSpinner from '../components/LoadingSpinner'

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

  const dailyByType = charts?.daily_logs_by_type || []
  const pivoted = {}
  dailyByType.forEach((d) => {
    const day = new Date(d.day).toLocaleDateString('en', { weekday: 'short' })
    if (!pivoted[day]) pivoted[day] = { day }
    pivoted[day][d.type] = Number(d.count)
  })
  const dailyChartData = Object.values(pivoted)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-text-secondary text-sm mt-1">Platform analytics and usage patterns</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={(stats?.total_users || 0).toLocaleString()} icon={Users} color="bg-coral" />
        <StatCard label="Active Users (30d)" value={(stats?.active_users || 0).toLocaleString()} icon={Activity} color="bg-plum" />
        <StatCard label="Total Babies" value={(stats?.total_babies || 0).toLocaleString()} icon={Baby} color="bg-mint" />
        <StatCard label="Total Logs" value={(stats?.total_logs || 0).toLocaleString()} icon={FileText} color="bg-sky" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Log Types (Today)</h3>
          {logTypeData.length > 0 ? (
            <div className="space-y-4">
              {logTypeData.map((item, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium capitalize">{item.type}</span>
                    <span className="text-sm font-bold">{item.count.toLocaleString()}</span>
                  </div>
                  <div className="w-full h-2 bg-cream rounded-full overflow-hidden">
                    <div
                      className="h-full bg-coral rounded-full"
                      style={{ width: `${Math.min(100, (item.count / Math.max(...logTypeData.map((d) => d.count))) * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary text-center py-8">No logs today</p>
          )}
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-border">
          <h3 className="font-semibold mb-4">Daily Logs by Type</h3>
          {dailyChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={dailyChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="#ccc" />
                <YAxis tick={{ fontSize: 11 }} stroke="#ccc" />
                <Tooltip />
                <Bar dataKey="feed" fill="#FF7A78" radius={[3, 3, 0, 0]} />
                <Bar dataKey="diaper" fill="#77DDB8" radius={[3, 3, 0, 0]} />
                <Bar dataKey="sleep" fill="#7DC8FF" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-text-secondary text-center py-16">No data yet</p>
          )}
        </div>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border">
        <h3 className="font-semibold mb-4">Platform Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-cream/50 rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Plan Distribution</div>
            {stats?.plan_distribution && Object.entries(stats.plan_distribution).map(([plan, count]) => (
              <div key={plan} className="text-sm font-medium capitalize">{plan}: {count}</div>
            ))}
          </div>
          <div className="p-4 bg-cream/50 rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Logs Today</div>
            <div className="text-2xl font-bold">{stats?.logs_today || 0}</div>
          </div>
          <div className="p-4 bg-cream/50 rounded-xl">
            <div className="text-xs text-text-secondary mb-1">New Users Today</div>
            <div className="text-2xl font-bold">{stats?.new_users_today || 0}</div>
          </div>
          <div className="p-4 bg-cream/50 rounded-xl">
            <div className="text-xs text-text-secondary mb-1">Monthly Revenue</div>
            <div className="text-2xl font-bold">${(stats?.revenue_monthly || 0).toFixed(2)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
