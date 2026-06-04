import client from './client'

export const getBabies = (params = {}) =>
  client.get('/admin/babies', { params })

export const getBaby = (id) =>
  client.get(`/admin/babies/${id}`)

export const deleteBaby = (id) =>
  client.delete(`/admin/babies/${id}`)
