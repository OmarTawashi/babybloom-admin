import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Ban, Trash2, Crown, Shield, Calendar, Clock, Baby } from 'lucide-react'
import { getUser, banUser, deleteUser, grantPremium, updateUser } from '../api/users'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const planColors = {
  free: 'bg-cream text-ink/60',
  premium: 'bg-coral/10 text-coral',
  family: 'bg-plum/10 text-plum',
}

export default function UserDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [confirm, setConfirm] = useState(null)
  const [editingRole, setEditingRole] = useState(false)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    getUser(id)
      .then((res) => setData(res.data))
      .catch(() => navigate('/users'))
      .finally(() => setLoading(false))
  }, [id, navigate])

  if (loading) return <LoadingSpinner />
  if (!data) return null

  const { user, stats } = data
  const plan = user.subscription?.plan || user.plan || 'free'

  const handleBan = async () => {
    await banUser(user.id)
    const res = await getUser(id)
    setData(res.data)
    setConfirm(null)
  }

  const handleDelete = async () => {
    await deleteUser(user.id)
    navigate('/users')
  }

  const handleGrantPremium = async (p) => {
    await grantPremium(user.id, p)
    const res = await getUser(id)
    setData(res.data)
  }

  const handleRoleChange = async () => {
    await updateUser(user.id, { role: newRole })
    const res = await getUser(id)
    setData(res.data)
    setEditingRole(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/users')} className="p-2 rounded-xl hover:bg-cream transition-colors">
          <ArrowLeft size={18} className="text-text-secondary" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-text-secondary text-sm mt-0.5">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Profile */}
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <h3 className="font-semibold mb-4">Profile</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-text-secondary">Name</span>
                <p className="font-medium">{user.name}</p>
              </div>
              <div>
                <span className="text-text-secondary">Email</span>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <span className="text-text-secondary">Role</span>
                <div className="flex items-center gap-2">
                  <p className="font-medium capitalize">{user.role}</p>
                  <button onClick={() => { setEditingRole(true); setNewRole(user.role) }} className="text-xs text-coral hover:underline">Edit</button>
                </div>
                {editingRole && (
                  <div className="flex items-center gap-2 mt-2">
                    <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="px-3 py-1.5 bg-cream rounded-lg text-sm border-0">
                      <option value="parent">Parent</option>
                      <option value="admin">Admin</option>
                      <option value="caregiver">Caregiver</option>
                    </select>
                    <button onClick={handleRoleChange} className="px-3 py-1.5 bg-coral text-white rounded-lg text-xs font-medium">Save</button>
                    <button onClick={() => setEditingRole(false)} className="px-3 py-1.5 text-xs text-text-secondary">Cancel</button>
                  </div>
                )}
              </div>
              <div>
                <span className="text-text-secondary">Status</span>
                <p className={`font-medium ${user.banned_at ? 'text-red-500' : 'text-emerald-500'}`}>
                  {user.banned_at ? 'Banned' : 'Active'}
                </p>
              </div>
              <div>
                <span className="text-text-secondary flex items-center gap-1"><Calendar size={12} /> Joined</span>
                <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-text-secondary flex items-center gap-1"><Clock size={12} /> Last Active</span>
                <p className="font-medium">{user.last_active_at ? new Date(user.last_active_at).toLocaleDateString() : 'Never'}</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-surface rounded-2xl p-4 border border-border text-center">
              <div className="text-xl font-bold">{stats.total_babies}</div>
              <div className="text-xs text-text-secondary">Babies</div>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border text-center">
              <div className="text-xl font-bold">{stats.total_logs.toLocaleString()}</div>
              <div className="text-xs text-text-secondary">Total Logs</div>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border text-center">
              <div className="text-xl font-bold">{stats.logs_today}</div>
              <div className="text-xs text-text-secondary">Logs Today</div>
            </div>
            <div className="bg-surface rounded-2xl p-4 border border-border text-center">
              <div className="text-xl font-bold">{stats.logs_this_week}</div>
              <div className="text-xs text-text-secondary">This Week</div>
            </div>
          </div>

          {/* Babies */}
          {user.babies?.length > 0 && (
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><Baby size={16} /> Babies</h3>
              <div className="space-y-2">
                {user.babies.map((baby) => (
                  <div key={baby.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                    <div>
                      <span className="font-medium text-sm">{baby.name}</span>
                      <span className="text-xs text-text-secondary ml-2">
                        {baby.gender ? `(${baby.gender})` : ''} · Born {new Date(baby.birth_date).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">{baby.logs?.length || 0} logs</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Logs */}
          {stats.recent_logs?.length > 0 && (
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="font-semibold mb-4">Recent Logs</h3>
              <div className="space-y-2">
                {stats.recent_logs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-cream/50 rounded-xl">
                    <div>
                      <span className="px-2 py-0.5 bg-white rounded text-xs font-medium capitalize">{log.type}</span>
                      <span className="text-xs text-text-secondary ml-2">
                        {log.baby?.name || 'Unknown baby'}
                      </span>
                    </div>
                    <span className="text-xs text-text-secondary">{new Date(log.logged_at || log.created_at).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Subscription */}
          <div className="bg-surface rounded-2xl p-6 border border-border">
            <h3 className="font-semibold mb-4">Subscription</h3>
            <div className="flex items-center gap-2 mb-4">
              <span className={`px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${planColors[plan] || planColors.free}`}>
                {plan}
              </span>
              <span className={`text-xs ${user.subscription?.status === 'active' ? 'text-emerald-500' : 'text-text-secondary'}`}>
                {user.subscription?.status || 'No subscription'}
              </span>
            </div>
            {plan === 'free' && (
              <div className="space-y-2">
                <button onClick={() => handleGrantPremium('premium')} className="w-full py-2 bg-coral text-white rounded-xl text-sm font-medium hover:bg-coral-dark transition-colors">
                  Grant Premium
                </button>
                <button onClick={() => handleGrantPremium('family')} className="w-full py-2 bg-plum text-white rounded-xl text-sm font-medium hover:bg-plum/80 transition-colors">
                  Grant Family
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-surface rounded-2xl p-6 border border-border space-y-3">
            <h3 className="font-semibold mb-2">Actions</h3>
            <button
              onClick={() => window.open(`mailto:${user.email}`)}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-cream rounded-xl text-sm font-medium hover:bg-cream/70 transition-colors"
            >
              <Mail size={16} className="text-text-secondary" /> Send Email
            </button>
            <button
              onClick={() => setConfirm({ type: 'ban' })}
              className={`w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                user.banned_at ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' : 'bg-mango/10 text-mango hover:bg-mango/20'
              }`}
            >
              <Ban size={16} /> {user.banned_at ? 'Unban User' : 'Ban User'}
            </button>
            <button
              onClick={() => setConfirm({ type: 'delete' })}
              className="w-full flex items-center gap-2 px-4 py-2.5 bg-red-500/10 text-red-500 rounded-xl text-sm font-medium hover:bg-red-100 transition-colors"
            >
              <Trash2 size={16} /> Delete User
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.type === 'delete' ? 'Delete User' : confirm?.type === 'ban' ? (user.banned_at ? 'Unban User' : 'Ban User') : 'Confirm'}
        message={
          confirm?.type === 'delete'
            ? `Permanently delete ${user.name}? This cannot be undone.`
            : confirm?.type === 'ban'
            ? user.banned_at ? `Unban ${user.name} and restore access?` : `Ban ${user.name}? They will lose access immediately.`
            : ''
        }
        danger={confirm?.type === 'delete'}
        onConfirm={() => confirm?.type === 'delete' ? handleDelete() : confirm?.type === 'ban' ? handleBan() : setConfirm(null)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
