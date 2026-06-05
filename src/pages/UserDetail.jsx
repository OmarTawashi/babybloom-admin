import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Ban, Trash2, Calendar, Clock, Baby, Activity, Shield, Crown } from 'lucide-react'
import { getUser, banUser, deleteUser, grantPremium, updateUser } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

const planColors = {
  free: 'bg-cream text-ink/60',
  plus: 'bg-coral/10 text-coral',
  premium: 'bg-coral/10 text-coral',
  family: 'bg-plum/10 text-plum',
}

const statusStyles = {
  active: 'bg-emerald-500/10 text-emerald-600',
  banned: 'bg-red-500/10 text-red-400',
}

const genderEmoji = { male: '👦', female: '👧', other: '👶' }

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [editingRole, setEditingRole] = useState(false)
  const [newRole, setNewRole] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  const loadUser = async () => {
    try {
      const res = await getUser(id)
      setData(res.data)
    } catch {
      toast({ type: 'error', title: 'Failed to load user' })
      navigate('/users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUser()
  }, [id])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const { user, stats } = data
  const plan = user.subscription?.plan || user.plan || 'free'
  const isBanned = !!user.banned_at

  const handleBan = async () => {
    setActionLoading(true)
    try {
      await banUser(user.id)
      toast({ type: 'success', title: isBanned ? 'User unbanned' : 'User banned', message: user.name })
      await loadUser()
    } catch {
      toast({ type: 'error', title: 'Action failed' })
    }
    setConfirm(null)
    setActionLoading(false)
  }

  const handleDelete = async () => {
    setActionLoading(true)
    try {
      await deleteUser(user.id)
      toast({ type: 'success', title: 'User deleted', message: user.name })
      navigate('/users')
    } catch {
      toast({ type: 'error', title: 'Delete failed' })
    }
    setConfirm(null)
    setActionLoading(false)
  }

  const handleGrantPremium = async (p) => {
    setActionLoading(true)
    try {
      await grantPremium(user.id, p)
      toast({ type: 'success', title: `${p} granted`, message: user.name })
      await loadUser()
    } catch {
      toast({ type: 'error', title: 'Failed to grant premium' })
    }
    setActionLoading(false)
  }

  const handleRoleChange = async () => {
    setActionLoading(true)
    try {
      await updateUser(user.id, { role: newRole })
      toast({ type: 'success', title: 'Role updated' })
      await loadUser()
      setEditingRole(false)
    } catch {
      toast({ type: 'error', title: 'Failed to update role' })
    }
    setActionLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in-up">
        <button onClick={() => navigate('/users')} className="p-2 rounded-xl hover:bg-cream transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-12 h-12 bg-gradient-to-br from-coral/20 to-plum/20 rounded-2xl flex items-center justify-center text-lg font-bold text-coral">
            {user.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-text-secondary text-sm">{user.email}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${isBanned ? statusStyles.banned : 'bg-emerald-500/10 text-emerald-600'}`}>
                {isBanned ? 'Banned' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Card */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-border bg-cream/30">
              <h3 className="font-semibold flex items-center gap-2"><Shield size={16} className="text-plum" /> Profile</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div>
                  <span className="text-text-secondary text-xs font-medium">Name</span>
                  <p className="font-medium mt-0.5">{user.name}</p>
                </div>
                <div>
                  <span className="text-text-secondary text-xs font-medium">Email</span>
                  <p className="font-medium mt-0.5">{user.email}</p>
                </div>
                <div>
                  <span className="text-text-secondary text-xs font-medium">Role</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className="font-medium capitalize">{user.role}</p>
                    <button onClick={() => { setEditingRole(true); setNewRole(user.role) }} className="text-xs text-coral hover:underline font-medium">Edit</button>
                  </div>
                  {editingRole && (
                    <div className="flex items-center gap-2 mt-2">
                      <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-3 py-1.5 bg-cream rounded-lg text-sm border-0 outline-none">
                        <option value="parent">Parent</option>
                        <option value="admin">Admin</option>
                        <option value="caregiver">Caregiver</option>
                      </select>
                      <button onClick={handleRoleChange} disabled={actionLoading} className="px-3 py-1.5 bg-coral text-white rounded-lg text-xs font-medium disabled:opacity-50">Save</button>
                      <button onClick={() => setEditingRole(false)} className="px-3 py-1.5 text-xs text-text-secondary">Cancel</button>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-text-secondary text-xs font-medium">Status</span>
                  <p className={`font-medium mt-0.5 ${isBanned ? 'text-red-400' : 'text-emerald-500'}`}>
                    {isBanned ? 'Banned' : 'Active'}
                  </p>
                </div>
                <div>
                  <span className="text-text-secondary text-xs font-medium flex items-center gap-1"><Calendar size={12} /> Joined</span>
                  <p className="font-medium mt-0.5">{new Date(user.created_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                </div>
                <div>
                  <span className="text-text-secondary text-xs font-medium flex items-center gap-1"><Clock size={12} /> Last Active</span>
                  <p className="font-medium mt-0.5">{user.last_active_at ? new Date(user.last_active_at).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Never'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
            {[
              { label: 'Babies', value: stats.total_babies, icon: Baby, color: 'text-mint' },
              { label: 'Total Logs', value: stats.total_logs.toLocaleString(), icon: Activity, color: 'text-sky' },
              { label: 'Logs Today', value: stats.logs_today, icon: Clock, color: 'text-coral' },
              { label: 'This Week', value: stats.logs_this_week, icon: Activity, color: 'text-plum' },
            ].map((s, i) => (
              <div key={i} className="bg-surface rounded-2xl p-4 border border-border card-hover">
                <div className="flex items-center gap-2 mb-2">
                  <s.icon size={14} className={s.color} />
                  <span className="text-xs text-text-secondary font-medium">{s.label}</span>
                </div>
                <span className="text-xl font-bold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Babies */}
          {user.babies?.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-border bg-cream/30">
                <h3 className="font-semibold flex items-center gap-2"><Baby size={16} className="text-mint" /> Babies</h3>
              </div>
              <div className="p-4 space-y-2">
                {user.babies.map((baby) => (
                  <div key={baby.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-mint/10 rounded-full flex items-center justify-center text-sm">
                        {genderEmoji[baby.gender] || '👶'}
                      </div>
                      <div>
                        <span className="font-medium text-sm">{baby.name}</span>
                        <span className="text-xs text-text-secondary ml-2">
                          {baby.gender ? `(${baby.gender})` : ''} · Born {new Date(baby.birth_date).toLocaleDateString('en', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary bg-surface px-2 py-1 rounded-full">{baby.logs?.length || 0} logs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          {stats.recent_logs?.length > 0 && (
            <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
              <div className="px-6 py-4 border-b border-border bg-cream/30">
                <h3 className="font-semibold">Recent Logs</h3>
              </div>
              <div className="divide-y divide-border">
                {stats.recent_logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between px-6 py-3 hover:bg-cream/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 bg-surface rounded text-xs font-medium capitalize border border-border">{log.type}</span>
                      <span className="text-sm text-text-secondary">{log.baby?.name || 'Unknown baby'}</span>
                    </div>
                    <span className="text-xs text-text-secondary">{new Date(log.logged_at || log.created_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Subscription Card */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-border bg-cream/30">
              <h3 className="font-semibold flex items-center gap-2"><Crown size={16} className="text-coral" /> Subscription</h3>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${planColors[plan] || planColors.free}`}>
                  {plan}
                </span>
                {user.subscription?.status && (
                  <span className={`text-xs font-medium ${user.subscription.status === 'active' ? 'text-emerald-500' : 'text-text-secondary'}`}>
                    {user.subscription.status}
                  </span>
                )}
              </div>
              {plan === 'free' && (
                <div className="space-y-2">
                  <button onClick={() => handleGrantPremium('premium')} disabled={actionLoading} className="w-full py-2.5 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark transition-colors disabled:opacity-50 shadow-sm">
                    Grant Premium
                  </button>
                  <button onClick={() => handleGrantPremium('family')} disabled={actionLoading} className="w-full py-2.5 bg-plum text-white rounded-xl text-sm font-semibold hover:bg-plum-light transition-colors disabled:opacity-50 shadow-sm">
                    Grant Family
                  </button>
                </div>
              )}
              {user.subscription?.ends_at && (
                <p className="text-xs text-text-secondary mt-3">
                  Expires: {new Date(user.subscription.ends_at).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
            <div className="px-6 py-4 border-b border-border bg-cream/30">
              <h3 className="font-semibold">Actions</h3>
            </div>
            <div className="p-4 space-y-2">
              <button
                onClick={() => window.open(`mailto:${user.email}`)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-cream/50 rounded-xl text-sm font-medium hover:bg-cream transition-colors"
              >
                <Mail size={16} className="text-text-secondary" /> Send Email
              </button>
              <button
                onClick={() => setConfirm({ type: 'ban' })}
                disabled={actionLoading}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                  isBanned ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20' : 'bg-mango/10 text-amber-600 hover:bg-mango/20'
                }`}
              >
                <Ban size={16} /> {isBanned ? 'Unban User' : 'Ban User'}
              </button>
              <button
                onClick={() => setConfirm({ type: 'delete' })}
                disabled={actionLoading}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} /> Delete User
              </button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={
          confirm?.type === 'delete' ? 'Delete User' :
          isBanned ? 'Unban User' : 'Ban User'
        }
        message={
          confirm?.type === 'delete'
            ? `Permanently delete ${user.name}? This cannot be undone.`
            : isBanned
            ? `Restore access for ${user.name}?`
            : `Ban ${user.name}? They will lose access immediately.`
        }
        danger={confirm?.type === 'delete' || (!isBanned && confirm?.type === 'ban')}
        confirmLabel={confirm?.type === 'delete' ? 'Delete' : isBanned ? 'Unban' : 'Ban'}
        onConfirm={() => confirm?.type === 'delete' ? handleDelete() : handleBan()}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}