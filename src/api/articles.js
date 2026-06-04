import client from './client'

export const getArticles = (params = {}) =>
  client.get('/admin/articles', { params })

export const getArticle = (id) =>
  client.get(`/admin/articles/${id}`)

export const createArticle = (data) =>
  client.post('/admin/articles', data)

export const updateArticle = (id, data) =>
  client.put(`/admin/articles/${id}`, data)

export const deleteArticle = (id) =>
  client.delete(`/admin/articles/${id}`)
