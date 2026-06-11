import client from './client'

const downloadBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

const exportCsv = async (path, filename, params = {}) => {
  const res = await client.get(path, { params, responseType: 'blob' })
  downloadBlob(res.data, filename)
}

export const exportUsersCsv = () =>
  exportCsv('/admin/users-export', `babynova-users-${new Date().toISOString().slice(0, 10)}.csv`)

export const exportLogsCsv = (params = {}) =>
  exportCsv('/admin/logs-export', `babynova-logs-${new Date().toISOString().slice(0, 10)}.csv`, params)
