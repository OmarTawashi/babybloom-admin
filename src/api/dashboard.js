import client from './client'

export const getDashboard = () =>
  client.get('/admin/dashboard')

export const getDashboardCharts = (weeks = 8) =>
  client.get('/admin/dashboard/charts', { params: { weeks } })

export const getDashboardActivity = (limit = 20) =>
  client.get('/admin/dashboard/activity', { params: { limit } })
