import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Bell, Globe, Shield, Database, Mail, Save, Eye, Users, UserPlus, UserMinus } from 'lucide-react'
import { getSettings, updateSettings } from '../api/settings'
import { getAdmins, createAdmin, removeAdmin } from '../api/admins'
import { useAuth } from '../contexts/AuthContext'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'
import { useToast } from '../components/Toast'

export default function Settings() {
  const toast = useToast()
  const { user: currentUser } = useAuth()
  const [settings, setSettings] = useState({
    app_name: 'BabyGlow',
    support_email: 'support@babyglow.app',
    max_babies_per_user: 5,
    max_photos_per_log: 10,
    enable_notifications: true,
    enable_email_verification: true,
    enable_content_moderation: false,
    maintenance_mode: false,
    default_locale: 'en',
    timezone: 'UTC',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [admins, setAdmins] = useState([])
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', password: '' })
  const [addingAdmin, setAddingAdmin] = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)

  useEffect(() => {
    let cancelled = false
    const loadSettings = async () => {
      try {
        const res = await getSettings()
        if (!cancelled && res.data?.settings) {
          setSettings((prev) => ({ ...prev, ...res.data.settings }))
        }
      } catch {
        // Use defaults
      }
      if (!cancelled) setLoading(false)
    }
    const loadAdmins = async () => {
      try {
        const res = await getAdmins()
        if (!cancelled) setAdmins(res.data?.admins || [])
      } catch {
        // Section simply stays empty
      }
    }
    loadSettings()
    loadAdmins()
    return () => { cancelled = true }
  }, [])

  if (loading) return <LoadingSpinner />

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      toast({ type: 'success', title: 'Settings saved' })
    } catch {
      toast({ type: 'error', title: 'Failed to save settings' })
    }
    setSaving(false)
  }

  const updateSetting = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const handleAddAdmin = async () => {
    setAddingAdmin(true)
    try {
      const res = await createAdmin(newAdmin)
      setAdmins((prev) => [...prev, res.data.admin])
      setNewAdmin({ name: '', email: '', password: '' })
      toast({ type: 'success', title: 'Admin added', message: res.data.admin.email })
    } catch (err) {
      toast({ type: 'error', title: 'Failed to add admin', message: err.response?.data?.message })
    }
    setAddingAdmin(false)
  }

  const handleRemoveAdmin = async () => {
    const target = removeTarget
    setRemoveTarget(null)
    try {
      await removeAdmin(target.id)
      setAdmins((prev) => prev.filter((a) => a.id !== target.id))
      toast({ type: 'success', title: 'Admin access removed', message: target.email })
    } catch (err) {
      toast({ type: 'error', title: 'Failed to remove admin', message: err.response?.data?.message })
    }
  }

  const canAddAdmin = newAdmin.name.trim() && newAdmin.email.trim() && newAdmin.password.length >= 8 && !addingAdmin

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-text-secondary text-sm mt-1">Manage your app configuration</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark transition-colors disabled:opacity-50 shadow-sm"
        >
          <Save size={16} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* General */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border bg-cream/30">
          <div className="flex items-center gap-2">
            <Globe size={16} className="text-coral" />
            <h3 className="font-semibold">General</h3>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">App Name</label>
              <input
                type="text"
                value={settings.app_name}
                onChange={(e) => updateSetting('app_name', e.target.value)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Support Email</label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => updateSetting('support_email', e.target.value)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Default Language</label>
              <select
                value={settings.default_locale}
                onChange={(e) => updateSetting('default_locale', e.target.value)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none cursor-pointer"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
                <option value="fr">French</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Timezone</label>
              <select
                value={settings.timezone}
                onChange={(e) => updateSetting('timezone', e.target.value)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none cursor-pointer"
              >
                <option value="UTC">UTC</option>
                <option value="Africa/Cairo">Africa/Cairo</option>
                <option value="America/New_York">America/New_York</option>
                <option value="Europe/London">Europe/London</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Limits */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border bg-cream/30">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-mint" />
            <h3 className="font-semibold">Limits</h3>
          </div>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Babies per User</label>
              <input
                type="number"
                min="1"
                max="20"
                value={settings.max_babies_per_user}
                onChange={(e) => updateSetting('max_babies_per_user', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Max Photos per Log</label>
              <input
                type="number"
                min="1"
                max="50"
                value={settings.max_photos_per_log}
                onChange={(e) => updateSetting('max_photos_per_log', parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border bg-cream/30">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-plum" />
            <h3 className="font-semibold">Features & Security</h3>
          </div>
        </div>
        <div className="divide-y divide-border">
          <ToggleRow
            icon={<Bell size={16} className="text-coral" />}
            label="Push Notifications"
            description="Enable push notifications for users"
            value={settings.enable_notifications}
            onChange={(v) => updateSetting('enable_notifications', v)}
          />
          <ToggleRow
            icon={<Mail size={16} className="text-sky" />}
            label="Email Verification"
            description="Require email verification on sign up"
            value={settings.enable_email_verification}
            onChange={(v) => updateSetting('enable_email_verification', v)}
          />
          <ToggleRow
            icon={<Eye size={16} className="text-mint" />}
            label="Content Moderation"
            description="Auto-moderate user-generated content"
            value={settings.enable_content_moderation}
            onChange={(v) => updateSetting('enable_content_moderation', v)}
          />
          <ToggleRow
            icon={<SettingsIcon size={16} className="text-red-400" />}
            label="Maintenance Mode"
            description="Temporarily disable the app for users"
            value={settings.maintenance_mode}
            onChange={(v) => updateSetting('maintenance_mode', v)}
          />
        </div>
      </div>

      {/* Administrators */}
      <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
        <div className="px-6 py-4 border-b border-border bg-cream/30">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-sky" />
            <h3 className="font-semibold">Administrators</h3>
            <span className="ml-auto text-xs text-text-secondary">{admins.length} admin{admins.length === 1 ? '' : 's'}</span>
          </div>
        </div>
        {admins.length === 0 ? (
          <div className="px-6 py-5 text-sm text-text-secondary">No administrators found</div>
        ) : (
          <div className="divide-y divide-border">
            {admins.map((a) => (
              <div key={a.id} className="flex items-center gap-3 px-6 py-4">
                <div className="w-9 h-9 bg-gradient-to-br from-coral to-coral-dark rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {a.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-xs text-text-secondary truncate">{a.email}</div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-coral/10 text-coral uppercase tracking-wider">{a.role}</span>
                {a.id !== currentUser?.id && admins.length > 1 && (
                  <button
                    onClick={() => setRemoveTarget(a)}
                    className="p-2 rounded-lg hover:bg-cream text-text-secondary hover:text-coral transition-colors"
                    title="Remove admin access"
                  >
                    <UserMinus size={15} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add admin */}
        <div className="px-6 py-4 border-t border-border bg-cream/20">
          <div className="grid gap-2 sm:grid-cols-[1fr_1.3fr_1fr_auto]">
            <input
              type="text"
              value={newAdmin.name}
              onChange={(e) => setNewAdmin((p) => ({ ...p, name: e.target.value }))}
              placeholder="Name"
              className="px-3 py-2 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-coral/20"
            />
            <input
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin((p) => ({ ...p, email: e.target.value }))}
              placeholder="Email"
              className="px-3 py-2 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-coral/20"
            />
            <input
              type="password"
              value={newAdmin.password}
              onChange={(e) => setNewAdmin((p) => ({ ...p, password: e.target.value }))}
              placeholder="Password (min 8)"
              className="px-3 py-2 bg-surface border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-coral/20"
            />
            <button
              onClick={handleAddAdmin}
              disabled={!canAddAdmin}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-coral hover:bg-coral-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <UserPlus size={14} />
              {addingAdmin ? 'Adding…' : 'Add admin'}
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={removeTarget !== null}
        title="Remove admin access?"
        message={<>This will demote <strong>{removeTarget?.name}</strong> to a regular account and sign them out everywhere.</>}
        confirmLabel="Remove access"
        onConfirm={handleRemoveAdmin}
        onCancel={() => setRemoveTarget(null)}
      />
    </div>
  )
}

function ToggleRow({ icon, label, description, value, onChange }) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-cream rounded-xl flex items-center justify-center shrink-0">{icon}</div>
        <div>
          <div className="text-sm font-medium">{label}</div>
          <div className="text-xs text-text-secondary">{description}</div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${
          value ? 'bg-coral' : 'bg-gray-200 dark:bg-gray-700'
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200 ${
          value ? 'translate-x-5' : 'translate-x-0'
        }`} />
      </button>
    </div>
  )
}