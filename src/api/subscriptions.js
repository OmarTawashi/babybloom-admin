import client from './client'

export const getSubscriptions = (params = {}) =>
  client.get('/admin/subscriptions', { params })

export const updateSubscription = (id, data) =>
  client.put(`/admin/subscriptions/${id}`, data)

export const cancelSubscription = (id) =>
  client.post(`/admin/subscriptions/${id}/cancel`)

export const extendGrace = (id, days, note) =>
  client.post(`/admin/subscriptions/${id}/extend-grace`, { days, note })

export const getRevenue = () =>
  client.get('/admin/revenue')

// ── Canonical tier / status vocabularies mirrored from backend ───────────
export const TIERS = ['free', 'plus', 'family']
export const STATUSES = ['free', 'trialing', 'active', 'grace', 'cancelled', 'expired']

export const tierLabel = (tier) => ({
  free: 'Glow Free',
  plus: 'Glow Plus',
  premium: 'Glow Plus', // legacy alias
  family: 'Glow Family',
}[tier] || tier)

export const statusLabel = (status) => ({
  free: 'Free',
  trialing: 'Trial',
  active: 'Active',
  grace: 'Billing issue',
  cancelled: 'Cancelled',
  expired: 'Expired',
}[status] || status)

export const ENTITLED_STATUSES = new Set(['trialing', 'active', 'grace', 'cancelled'])
