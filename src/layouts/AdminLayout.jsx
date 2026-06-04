import { useState, useEffect } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, FileText, BarChart3,
  Settings, LogOut, Baby, Bell, Search, ChevronDown, BookOpen, ScrollText,
  Menu, X, Moon, Sun
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users' },
  { to: '/babies', icon: Baby, label: 'Babies' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
  { to: '/content', icon: FileText, label: 'Content' },
  { to: '/insights', icon: BarChart3, label: 'Insights' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('babyglow-dark') === 'true'
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('babyglow-dark', darkMode)
  }, [darkMode])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-white flex flex-col shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="w-10 h-10 bg-coral rounded-xl flex items-center justify-center">
            <Baby size={22} />
          </div>
          <div>
            <div className="font-bold text-lg leading-tight">BabyGlow</div>
            <div className="text-xs text-white/40">Admin Panel</div>
          </div>
          <button
            className="ml-auto lg:hidden p-1 rounded-lg hover:bg-white/10"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/dashboard' || item.to === '/users'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-sidebar-active text-coral'
                    : 'text-white/50 hover:bg-sidebar-hover hover:text-white/80'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-hover">
            <div className="w-8 h-8 bg-coral/20 rounded-full flex items-center justify-center text-coral text-sm font-bold">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
              <div className="text-xs text-white/30">{user?.role || 'admin'}</div>
            </div>
            <LogOut size={16} className="text-white/30 hover:text-coral cursor-pointer transition-colors" onClick={handleLogout} />
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-xl hover:bg-cream transition-colors lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-text-primary" />
            </button>
            <div className="relative hidden md:block">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
              <input
                type="text"
                placeholder="Search users, logs, reports..."
                className="pl-9 pr-4 py-2 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 w-56 lg:w-72"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl hover:bg-cream transition-colors"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun size={18} className="text-mango" />
              ) : (
                <Moon size={18} className="text-text-secondary" />
              )}
            </button>
            <button className="relative p-2 rounded-xl hover:bg-cream transition-colors">
              <Bell size={18} className="text-text-secondary" />
            </button>
            <div className="h-8 w-px bg-border hidden md:block" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-coral/10 rounded-full flex items-center justify-center text-coral text-sm font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || 'A'}
              </div>
              <ChevronDown size={14} className="text-text-secondary hidden md:block" />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
