import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Mail, Ban, Eye, Trash2, Crown } from 'lucide-react'
import { getUsers, banUser, deleteUser, grantPremium } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const planColors = {
  free: 'bg-cream text-ink/60',
  premium: 'bg-coral/10 text-coral',
  family: 'bg-plum/10 text-plum',
}

const statusColors = {
  active: 'bg-emerald-100 text-emerald-600',
  inactive: 'bg-gray-100 text-gray-500',
  banned: 'bg-red-500/10 text-red-400',
}

export default function Users() {
  const navigate = useNavigate()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (search) params.search = search
      if (planFilter) params.plan = planFilter
      if (statusFilter) params.status = statusFilter
      const res = await getUsers(params)
      setUsers(res.data.users.data)
      setMeta({
        current_page: res.data.users.current_page,
        last_page: res.data.users.last_page,
        total: res.data.users.total,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, search, planFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleBan = async (user) => {
    try {
      await banUser(user.id)
      fetchUsers()
    } catch {
      // ignore
    }
    setConfirm(null)
  }

  const handleDelete = async (user) => {
    try {
      await deleteUser(user.id)
      fetchUsers()
    } catch {
      // ignore
    }
    setConfirm(null)
  }

  const handleGrantPremium = async (user) => {
    try {
      await grantPremium(user.id)
      fetchUsers()
    } catch {
      // ignore
    }
  }

  const getStatus = (user) => {
    if (user.banned_at) return 'banned'
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    if (user.last_active_at && new Date(user.last_active_at) >= thirtyDaysAgo) return 'active'
    return 'inactive'
  }

  const getPlan = (user) => {
    const sub = user.subscription
    if (sub) return sub.plan
    return user.plan || 'free'
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    fetchUsers()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total users</p>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20"
          />
        </form>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="family">Family</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">User</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Plan</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Role</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Babies</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Joined</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const status = getStatus(user)
                  const plan = getPlan(user)
                  return (
                    <tr key={user.id} className="border-b border-black/3 hover:bg-cream/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-cream rounded-full flex items-center justify-center text-sm font-bold">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{user.name}</div>
                            <div className="text-xs text-text-secondary">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${planColors[plan] || planColors.free}`}>
                          {plan}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm capitalize text-text-secondary">{user.role}</td>
                      <td className="px-6 py-4 text-sm">{user.babies?.length || 0}</td>
                      <td className="px-6 py-4 text-sm text-text-secondary">
                        {new Date(user.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status]}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/users/${user.id}`)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="View"><Eye size={14} className="text-text-secondary" /></button>
                          <button onClick={() => window.open(`mailto:${user.email}`)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="Email"><Mail size={14} className="text-text-secondary" /></button>
                          {plan === 'free' && (
                            <button onClick={() => handleGrantPremium(user)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="Grant Premium"><Crown size={14} className="text-plum" /></button>
                          )}
                          <button onClick={() => handleBan(user)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title={status === 'banned' ? 'Unban' : 'Ban'}>
                            <Ban size={14} className={status === 'banned' ? 'text-emerald-500' : 'text-text-secondary'} />
                          </button>
                          <button onClick={() => setConfirm({ type: 'delete', user })} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
                            <Trash2 size={14} className="text-red-300" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-text-secondary">
              Page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-cream transition-colors disabled:opacity-30"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(Math.min(meta.last_page, page + 1))}
                disabled={page >= meta.last_page}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-text-secondary hover:bg-cream transition-colors disabled:opacity-30"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === 'delete' ? 'Delete User' : 'Confirm Action'}
        message={confirm?.type === 'delete' ? `Are you sure you want to permanently delete ${confirm?.user?.name}? This cannot be undone.` : 'Are you sure?'}
        danger={confirm?.type === 'delete'}
        onConfirm={() => confirm?.type === 'delete' ? handleDelete(confirm.user) : setConfirm(null)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
