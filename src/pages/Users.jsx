import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Mail, Ban, Eye, Trash2, Crown, Users as UsersIcon } from 'lucide-react'
import { getUsers, banUser, deleteUser, grantPremium } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const planColors = {
  free: 'bg-cream text-ink/60',
  plus: 'bg-coral/10 text-coral',
  premium: 'bg-coral/10 text-coral',
  family: 'bg-plum/10 text-plum',
}

const statusColors = {
  active: 'bg-emerald-500/10 text-emerald-600',
  inactive: 'bg-gray-100 text-gray-500',
  banned: 'bg-red-500/10 text-red-400',
}

export default function Users() {
  const navigate = useNavigate()
  const toast = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [search, setSearch] = useState('')
  const [planFilter, setPlanFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)
  const [confirm, setConfirm] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

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
        from: res.data.users.from,
        to: res.data.users.to,
      })
    } catch {
      toast({ type: 'error', title: 'Failed to load users' })
    } finally {
      setLoading(false)
    }
  }, [page, search, planFilter, statusFilter])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleBan = async (user) => {
    setActionLoading(user.id)
    try {
      await banUser(user.id)
      toast({ type: 'success', title: user.banned_at ? 'User unbanned' : 'User banned', message: user.name })
      fetchUsers()
    } catch {
      toast({ type: 'error', title: 'Action failed' })
    }
    setConfirm(null)
    setActionLoading(null)
  }

  const handleDelete = async (user) => {
    setActionLoading(user.id)
    try {
      await deleteUser(user.id)
      toast({ type: 'success', title: 'User deleted', message: user.name })
      fetchUsers()
    } catch {
      toast({ type: 'error', title: 'Delete failed' })
    }
    setConfirm(null)
    setActionLoading(null)
  }

  const handleGrantPremium = async (user) => {
    setActionLoading(user.id)
    try {
      await grantPremium(user.id)
      toast({ type: 'success', title: 'Premium granted', message: user.name })
      fetchUsers()
    } catch {
      toast({ type: 'error', title: 'Failed to grant premium' })
    }
    setActionLoading(null)
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap items-center">
        <form onSubmit={handleSearch} className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20 transition-shadow"
          />
        </form>
        <select
          value={planFilter}
          onChange={(e) => { setPlanFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20 cursor-pointer"
        >
          <option value="">All Plans</option>
          <option value="free">Free</option>
          <option value="premium">Premium</option>
          <option value="plus">Plus</option>
          <option value="family">Family</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="px-4 py-2.5 bg-surface rounded-xl text-sm border border-border outline-none focus:ring-2 focus:ring-coral/20 cursor-pointer"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="banned">Banned</option>
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <>
          {users.length === 0 ? (
            <EmptyState
              icon={UsersIcon}
              title="No users found"
              description={search || planFilter || statusFilter ? 'Try adjusting your filters' : 'Users will appear here once they sign up'}
            />
          ) : (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-cream/30">
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
                      const isLoading = actionLoading === user.id
                      return (
                        <tr key={user.id} className="border-b border-border table-row-hover">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-gradient-to-br from-coral/20 to-plum/20 rounded-full flex items-center justify-center text-sm font-bold text-coral">
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
                          <td className="px-6 py-4 text-sm font-medium">{user.babies?.length || 0}</td>
                          <td className="px-6 py-4 text-sm text-text-secondary">
                            {new Date(user.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[status]}`}>
                              {status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-0.5">
                              <button onClick={() => navigate(`/users/${user.id}`)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="View"><Eye size={14} className="text-text-secondary" /></button>
                              <button onClick={() => window.open(`mailto:${user.email}`)} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="Email"><Mail size={14} className="text-text-secondary" /></button>
                              {plan === 'free' && (
                                <button onClick={() => handleGrantPremium(user)} disabled={isLoading} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title="Grant Premium"><Crown size={14} className="text-plum" /></button>
                              )}
                              <button onClick={() => setConfirm({ type: status === 'banned' ? 'unban' : 'ban', user })} disabled={isLoading} className="p-1.5 rounded-lg hover:bg-cream transition-colors" title={status === 'banned' ? 'Unban' : 'Ban'}>
                                <Ban size={14} className={status === 'banned' ? 'text-emerald-500' : 'text-text-secondary'} />
                              </button>
                              <button onClick={() => setConfirm({ type: 'delete', user })} disabled={isLoading} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="Delete">
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
              <Pagination meta={meta} onPageChange={setPage} />
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.type === 'delete' ? 'Delete User' :
          confirm?.type === 'ban' ? 'Ban User' :
          'Unban User'
        }
        message={
          confirm?.type === 'delete' ? `Permanently delete ${confirm?.user?.name}? This cannot be undone.`
          : confirm?.type === 'ban' ? `Ban ${confirm?.user?.name}? They will lose access immediately.`
          : `Restore access for ${confirm?.user?.name}?`
        }
        danger={confirm?.type === 'delete' || confirm?.type === 'ban'}
        confirmLabel={confirm?.type === 'delete' ? 'Delete' : confirm?.type === 'ban' ? 'Ban' : 'Unban'}
        onConfirm={() => confirm?.type === 'delete' ? handleDelete(confirm.user) : handleBan(confirm.user)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}