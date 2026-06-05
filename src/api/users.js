import client from './client'

export const getUsers = (params = {}) =>
  client.get('/admin/users', { params })

export const getUser = (id) =>
  client.get(`/admin/users/${id}`)

export const updateUser = (id, data) =>
  client.put(`/admin/users/${id}`, data)

export const deleteUser = (id) =>
  client.delete(`/admin/users/${id}`)

export const banUser = (id) =>
  client.post(`/admin/users/${id}/ban`)

export const grantPremium = (id, plan = 'premium') =>
  client.post(`/admin/users/${id}/grant-premium`, { plan })

export const getUserCircles = (id) =>
  client.get(`/admin/users/${id}/circles`)
