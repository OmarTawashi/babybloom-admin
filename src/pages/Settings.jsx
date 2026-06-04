import { Save, Globe, Bell, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getNotifications, createNotification } from '../api/notifications'
import { getSettings, updateSettings } from '../api/settings'

export default function Settings() {
  const [notifications, setNotifications] = useState([])
  const [form, setForm] = useState({ title: '', body: '' })
  const [sending, setSending] = useState(false)

  const [settings, setSettings] = useState({
    app_name: '',
    support_email: '',
    session_timeout: '',
  })
  const [savingSettings, setSavingSettings] = useState(false)
  const [savedSettings, setSavedSettings] = useState(false)

  useEffect(() => {
    getNotifications().then((res) => setNotifications(res.data.notifications?.data || [])).catch(() => {})
    getSettings()
      .then((res) => {
        const s = res.data.settings || {}
        setSettings({
          app_name: s.app_name ?? '',
          support_email: s.support_email ?? '',
          session_timeout: s.session_timeout ?? '',
        })
      })
      .catch(() => {})
  }, [])

  const handleSaveSettings = async (e) => {
    e.preventDefault()
    setSavingSettings(true)
    setSavedSettings(false)
    try {
      const res = await updateSettings({
        app_name: settings.app_name,
        support_email: settings.support_email,
        session_timeout: Number(settings.session_timeout) || 30,
      })
      const s = res.data.settings || {}
      setSettings({
        app_name: s.app_name ?? '',
        support_email: s.support_email ?? '',
        session_timeout: s.session_timeout ?? '',
      })
      setSavedSettings(true)
      setTimeout(() => setSavedSettings(false), 2500)
    } catch {
      // ignore
    } finally {
      setSavingSettings(false)
    }
  }

  const handleSendNotification = async (e) => {
    e.preventDefault()
    setSending(true)
    try {
      await createNotification(form)
      setForm({ title: '', body: '' })
      const res = await getNotifications()
      setNotifications(res.data.notifications?.data || [])
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-text-secondary text-sm mt-1">App configuration and notifications</p>
      </div>

      <form onSubmit={handleSaveSettings} className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-5">
          <Globe size={18} className="text-text-secondary" />
          <h3 className="font-semibold">General</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">App Name</label>
            <input
              type="text"
              value={settings.app_name}
              onChange={(e) => setSettings({ ...settings, app_name: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Support Email</label>
            <input
              type="email"
              value={settings.support_email}
              onChange={(e) => setSettings({ ...settings, support_email: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={savingSettings}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark disabled:opacity-50"
            >
              <Save size={16} />
              {savingSettings ? 'Saving...' : 'Save Settings'}
            </button>
            {savedSettings && <span className="text-sm text-mint font-medium">Saved!</span>}
          </div>
        </div>
      </form>

      <div className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-5">
          <Bell size={18} className="text-text-secondary" />
          <h3 className="font-semibold">Send Notification</h3>
        </div>
        <form onSubmit={handleSendNotification} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
              placeholder="Notification title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Message</label>
            <textarea
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              rows={3}
              className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 resize-y"
              placeholder="Notification message"
              required
            />
          </div>
          <button type="submit" disabled={sending} className="px-6 py-2.5 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark disabled:opacity-50">
            {sending ? 'Sending...' : 'Send to All Users'}
          </button>
        </form>
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Sent Notifications</h3>
          <span className="text-xs text-text-secondary">{notifications.length} sent</span>
        </div>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((n, i) => (
              <div key={i} className="p-4 bg-cream/50 rounded-xl">
                <div className="font-medium text-sm">{n.title}</div>
                <p className="text-xs text-text-secondary mt-1">{n.body}</p>
                <p className="text-xs text-text-secondary mt-2">{new Date(n.sent_at || n.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary text-center py-6">No notifications sent yet</p>
        )}
      </div>

      <div className="bg-surface rounded-2xl p-6 border border-border">
        <div className="flex items-center gap-2 mb-5">
          <Shield size={18} className="text-text-secondary" />
          <h3 className="font-semibold">Security</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5">Session Timeout (minutes)</label>
            <input
              type="number"
              min={1}
              max={1440}
              value={settings.session_timeout}
              onChange={(e) => setSettings({ ...settings, session_timeout: e.target.value })}
              className="w-32 px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
            />
          </div>
          <p className="text-xs text-text-secondary">Saved with the General settings above.</p>
        </div>
      </div>
    </div>
  )
}
