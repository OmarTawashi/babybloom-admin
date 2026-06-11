import client from './client'

export const getAdmins = () =>
  client.get('/admin/admins')

export const createAdmin = (data) =>
  client.post('/admin/admins', data)

export const removeAdmin = (id) =>
  client.delete(`/admin/admins/${id}`)
