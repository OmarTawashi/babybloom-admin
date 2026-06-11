import client from './client'

export const getAdmins = () =>
  client.get('/admin/admins')
