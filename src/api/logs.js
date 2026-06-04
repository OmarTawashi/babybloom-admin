import client from './client'

export const getLogs = (params = {}) =>
  client.get('/admin/logs', { params })

export const getLog = (id) =>
  client.get(`/admin/logs/${id}`)

export const deleteLog = (id) =>
  client.delete(`/admin/logs/${id}`)
