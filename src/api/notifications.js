import client from './client'

export const getNotifications = (params = {}) =>
  client.get('/admin/notifications', { params })

export const createNotification = (data) =>
  client.post('/admin/notifications', data)
