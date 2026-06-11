import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Users as UsersIcon, Baby, ArrowRight } from 'lucide-react'
import { getUsers } from '../api/users'
import { getBabies } from '../api/babies'

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState({ users: [], babies: [] })
  const [searching, setSearching] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef(null)
  const debounceRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults({ users: [], babies: [] })
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    clearTimeout(debounceRef.current)
    if (!query.trim()) {
      setResults({ users: [], babies: [] })
      setSearching(false)
      return
    }
    setSearching(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const [usersRes, babiesRes] = await Promise.all([
          getUsers({ search: query.trim(), per_page: 5 }),
          getBabies({ search: query.trim(), per_page: 5 }),
        ])
        setResults({
          users: usersRes.data.users?.data || [],
          babies: babiesRes.data.babies?.data || [],
        })
        setActiveIndex(0)
      } catch {
        setResults({ users: [], babies: [] })
      } finally {
        setSearching(false)
      }
    }, 300)
    return () => clearTimeout(debounceRef.current)
  }, [query, open])

  const flatItems = [
    ...results.users.map((u) => ({ type: 'user', item: u })),
    ...results.babies.map((b) => ({ type: 'baby', item: b })),
  ]

  const select = (entry) => {
    onClose()
    if (entry.type === 'user') navigate(`/users/${entry.item.id}`)
    else navigate('/babies')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flatItems.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && flatItems[activeIndex]) {
      select(flatItems[activeIndex])
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-start justify-center pt-[15vh] animate-fade-in" onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl border border-border shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-scale-in">
        <div className="flex items-center gap-3 px-4 border-b border-border">
          <Search size={18} className="text-text-secondary shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users and babies..."
            className="flex-1 py-4 bg-transparent text-sm outline-none placeholder:text-text-secondary/50"
          />
          <kbd className="text-[10px] text-text-secondary bg-cream px-1.5 py-0.5 rounded border border-border font-mono">esc</kbd>
        </div>

        <div className="max-h-80 overflow-auto">
          {searching && (
            <div className="px-4 py-6 text-center text-sm text-text-secondary">Searching...</div>
          )}
          {!searching && query.trim() && flatItems.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-text-secondary">No results for "{query}"</div>
          )}
          {!searching && !query.trim() && (
            <div className="px-4 py-6 text-center text-sm text-text-secondary">Type to search users and babies</div>
          )}

          {!searching && results.users.length > 0 && (
            <div className="py-2">
              <div className="px-4 pb-1 text-[10px] uppercase tracking-widest text-text-secondary/60 font-semibold">Users</div>
              {results.users.map((u, i) => (
                <ResultRow
                  key={`u-${u.id}`}
                  active={activeIndex === i}
                  onClick={() => select({ type: 'user', item: u })}
                  onMouseEnter={() => setActiveIndex(i)}
                  icon={UsersIcon}
                  title={u.name}
                  subtitle={u.email}
                />
              ))}
            </div>
          )}

          {!searching && results.babies.length > 0 && (
            <div className="py-2 border-t border-border">
              <div className="px-4 pb-1 text-[10px] uppercase tracking-widest text-text-secondary/60 font-semibold">Babies</div>
              {results.babies.map((b, i) => (
                <ResultRow
                  key={`b-${b.id}`}
                  active={activeIndex === results.users.length + i}
                  onClick={() => select({ type: 'baby', item: b })}
                  onMouseEnter={() => setActiveIndex(results.users.length + i)}
                  icon={Baby}
                  title={b.name}
                  subtitle={b.user?.name ? `Parent: ${b.user.name}` : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ResultRow({ active, onClick, onMouseEnter, icon: Icon, title, subtitle }) {
  return (
    <button
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${active ? 'bg-cream' : ''}`}
    >
      <div className="w-8 h-8 bg-coral/10 rounded-lg flex items-center justify-center shrink-0">
        <Icon size={15} className="text-coral" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{title}</div>
        {subtitle && <div className="text-xs text-text-secondary truncate">{subtitle}</div>}
      </div>
      {active && <ArrowRight size={14} className="text-text-secondary shrink-0" />}
    </button>
  )
}
