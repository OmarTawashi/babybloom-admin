import { useEffect, useState, useCallback } from 'react'
import { Bell, Send, RefreshCw, Megaphone } from 'lucide-react'
import { getNotifications, createNotification } from '../api/notifications'
import Pagination from '../components/Pagination'
import EmptyState from '../components/EmptyState'
import LoadingSpinner from '../components/LoadingSpinner'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'

const audienceLabel = (plan) =>
  ({ free: 'Free plan users', plus: 'Plus subscribers', family: 'Family subscribers' })[plan] || plan

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [targetPlan, setTargetPlan] = useState('')
  const [sending, setSending] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const toast = useToast()

  const fetchNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getNotifications({ page, per_page: 20 })
      const m = res.data.notifications
      setNotifications(m?.data || [])
      setMeta(m ? { current_page: m.current_page, last_page: m.last_page, total: m.total, from: m.from, to: m.to } : { current_page: 1, last_page: 1, total: 0 })
    } catch {
      toast({ type: 'error', title: 'Failed to load notifications' })
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { fetchNotifications() }, [fetchNotifications])

  const handleSend = async () => {
    setConfirmOpen(false)
    setSending(true)
    try {
      await createNotification({
        title: title.trim(),
        body: body.trim(),
        ...(targetPlan ? { target_plan: targetPlan } : {}),
      })
      toast({
        type: 'success',
        title: 'Notification sent',
        message: targetPlan ? `Delivered to ${audienceLabel(targetPlan)}` : 'Delivered to all users',
      })
      setTitle('')
      setBody('')
      setTargetPlan('')
      setPage(1)
      fetchNotifications()
    } catch (err) {
      toast({ type: 'error', title: 'Failed to send', message: err.response?.data?.message })
    } finally {
      setSending(false)
    }
  }

  const canSend = title.trim() && body.trim() && !sending

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total.toLocaleString()} sent</p>
        </div>
        <button onClick={fetchNotifications} className="p-2.5 rounded-xl hover:bg-cream transition-colors" title="Refresh">
          <RefreshCw size={16} className="text-text-secondary" />
        </button>
      </div>

      {/* Compose */}
      <div className="bg-surface rounded-2xl border border-border p-5 animate-fade-in-up">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-coral to-coral-dark rounded-xl flex items-center justify-center shadow-sm">
            <Megaphone size={18} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold">Broadcast a notification</h2>
            <p className="text-xs text-text-secondary">Push notification delivered to the selected audience's devices</p>
          </div>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={255}
            placeholder="Notification title"
            className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Message body..."
            className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            <select
              value={targetPlan}
              onChange={(e) => setTargetPlan(e.target.value)}
              className="px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
            >
              <option value="">All users</option>
              <option value="free">Free plan only</option>
              <option value="plus">Plus subscribers</option>
              <option value="family">Family subscribers</option>
            </select>
            <button
              onClick={() => setConfirmOpen(true)}
              disabled={!canSend}
              className="flex items-center gap-2 px-5 py-2.5 bg-coral hover:bg-coral-dark disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors"
            >
              <Send size={15} />
              {sending ? 'Sending...' : targetPlan ? `Send to ${audienceLabel(targetPlan)}` : 'Send to everyone'}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      {loading ? <LoadingSpinner /> : (
        notifications.length === 0 ? (
          <EmptyState icon={Bell} title="No notifications yet" description="Broadcasts you send will appear here" />
        ) : (
          <div className="bg-surface rounded-2xl border border-border overflow-hidden animate-fade-in-up">
            <div className="divide-y divide-border">
              {notifications.map((n) => (
                <div key={n.id} className="px-6 py-4 table-row-hover">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-sm">{n.title}</div>
                        {n.target_plan && (
                          <span className="text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-coral/10 text-coral">
                            {audienceLabel(n.target_plan)}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary mt-0.5 line-clamp-2">{n.body}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-text-secondary">
                        {n.sent_at ? new Date(n.sent_at).toLocaleString('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—'}
                      </div>
                      {n.creator?.name && (
                        <div className="text-[11px] text-text-secondary/70 mt-0.5">by {n.creator.name}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Pagination meta={meta} onPageChange={setPage} />
          </div>
        )
      )}

      <ConfirmDialog
        open={confirmOpen}
        title={targetPlan ? `Send to ${audienceLabel(targetPlan)}?` : 'Send to all users?'}
        message={<>This will push <strong>"{title}"</strong> to {targetPlan ? audienceLabel(targetPlan) : 'every registered user'}. This can't be undone.</>}
        confirmLabel="Send broadcast"
        onConfirm={handleSend}
        onCancel={() => setConfirmOpen(false)}
      />
    </div>
  )
}
