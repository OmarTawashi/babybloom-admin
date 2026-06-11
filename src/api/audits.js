import client from './client'

export const getSubscriptionAudits = (params = {}) =>
  client.get('/admin/subscription-audits', { params })
