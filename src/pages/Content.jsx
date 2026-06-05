import { useEffect, useState, useCallback } from 'react'
import { Edit3, Trash2, Plus, X } from 'lucide-react'
import { getArticles, createArticle, updateArticle, deleteArticle } from '../api/articles'
import ConfirmDialog from '../components/ConfirmDialog'
import LoadingSpinner from '../components/LoadingSpinner'

const CATEGORIES = ['Onboarding', 'Sleep', 'Feeding', 'AI', 'Family', 'Insights', 'Billing', 'Legal', 'General']

function ArticleEditor({ article, onSave, onClose }) {
  const [form, setForm] = useState({
    title: article?.title || '',
    category: article?.category || 'General',
    body: article?.body || '',
    emoji: article?.emoji || '',
    read_time: article?.read_time || 3,
    summary: article?.summary || '',
    is_premium: article?.is_premium || false,
    is_published: article?.is_published || false,
  })
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (article?.id) {
        await updateArticle(article.id, form)
      } else {
        await createArticle(form)
      }
      onSave()
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-xl overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{article?.id ? 'Edit Article' : 'New Article'}</h2>
            <button onClick={onClose} className="p-2 rounded-xl hover:bg-cream"><X size={18} className="text-text-secondary" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
                >
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Emoji</label>
                <input
                  type="text"
                  value={form.emoji}
                  onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
                  placeholder="✨"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Read Time (min)</label>
                <input
                  type="number"
                  value={form.read_time}
                  onChange={(e) => setForm({ ...form, read_time: parseInt(e.target.value) || 3 })}
                  className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
                  min={1}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Summary</label>
              <input
                type="text"
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none"
                placeholder="Short summary for article cards"
                maxLength={500}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Body</label>
              <textarea
                value={form.body}
                onChange={(e) => setForm({ ...form, body: e.target.value })}
                rows={12}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 resize-y"
                placeholder="Article content..."
              />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_premium}
                  onChange={(e) => setForm({ ...form, is_premium: e.target.checked })}
                  className="w-4 h-4 text-coral rounded"
                />
                <span className="text-sm font-medium">Premium Only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
                  className="w-4 h-4 text-coral rounded"
                />
                <span className="text-sm font-medium">Published</span>
              </label>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-xl border border-black/10 hover:bg-cream">Cancel</button>
              <button type="submit" disabled={saving} className="px-6 py-2 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark disabled:opacity-50">
                {saving ? 'Saving...' : (article?.id ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function Content() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 })
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('')
  const [editing, setEditing] = useState(null)
  const [confirm, setConfirm] = useState(null)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, per_page: 20 }
      if (statusFilter) params.status = statusFilter
      const res = await getArticles(params)
      setArticles(res.data.articles.data)
      setMeta({
        current_page: res.data.articles.current_page,
        last_page: res.data.articles.last_page,
        total: res.data.articles.total,
      })
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [page, statusFilter])

  useEffect(() => { fetchArticles() }, [fetchArticles])

  const handleDelete = async (article) => {
    await deleteArticle(article.id)
    setConfirm(null)
    fetchArticles()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Content</h1>
          <p className="text-text-secondary text-sm mt-1">{meta.total} articles</p>
        </div>
        <button onClick={() => setEditing({})} className="flex items-center gap-2 px-4 py-2 bg-coral text-white rounded-xl text-sm font-semibold hover:bg-coral-dark transition-colors">
          <Plus size={16} /> New Article
        </button>
      </div>

      <div className="flex gap-3">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }} className="px-4 py-2.5 bg-white rounded-xl text-sm border border-border outline-none">
          <option value="">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-surface rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Title</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Category</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Premium</th>
                  <th className="text-left text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Updated</th>
                  <th className="text-right text-xs font-semibold text-text-secondary uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((article) => (
                  <tr key={article.id} className="border-b border-black/3 hover:bg-cream/30 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{article.emoji || '📄'}</span>
                        <span className="font-medium text-sm">{article.title}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3">
                      <span className="px-2.5 py-1 bg-cream rounded-full text-xs font-medium">{article.category}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${article.is_published ? 'bg-emerald-100 text-emerald-600' : 'bg-mango/10 text-mango'}`}>
                        {article.is_published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {article.is_premium ? <span className="px-2 py-0.5 bg-plum/10 text-plum rounded text-xs font-semibold">Premium</span> : <span className="text-xs text-text-secondary">Free</span>}
                    </td>
                    <td className="px-6 py-3 text-sm text-text-secondary">
                      {new Date(article.updated_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button onClick={() => setEditing(article)} className="p-1.5 rounded-lg hover:bg-cream transition-colors"><Edit3 size={14} className="text-text-secondary" /></button>
                      <button onClick={() => setConfirm(article)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors"><Trash2 size={14} className="text-red-300" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <span className="text-xs text-text-secondary">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-cream disabled:opacity-30">Previous</button>
              <button onClick={() => setPage(Math.min(meta.last_page, page + 1))} disabled={page >= meta.last_page} className="px-3 py-1.5 rounded-lg text-xs text-text-secondary hover:bg-cream disabled:opacity-30">Next</button>
            </div>
          </div>
        </div>
      )}

      {editing && <ArticleEditor article={editing} onSave={() => { setEditing(null); fetchArticles() }} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={!!confirm}
        title="Delete Article"
        message={`Delete "${confirm?.title}"? This cannot be undone.`}
        danger
        onConfirm={() => handleDelete(confirm)}
        onCancel={() => setConfirm(null)}
      />
    </div>
  )
}
