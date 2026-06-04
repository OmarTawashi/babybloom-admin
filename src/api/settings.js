import client from './client'

export const getSettings = () => client.get('/admin/settings')

export const updateSettings = (data) => client.put('/admin/settings', data)
