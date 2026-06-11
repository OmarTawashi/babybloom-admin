import { useState, useEffect } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, CreditCard, FileText, BarChart3,
  Settings, LogOut, Baby, Bell, Search, ChevronDown, ScrollText,
  Menu, X, Moon, Sun, ChevronRight, DollarSign
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import CommandPalette from '../components/CommandPalette'

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { to: '/insights', icon: BarChart3, label: 'Insights' },
      { to: '/revenue', icon: DollarSign, label: 'Revenue' },
    ]
  },
  {
    label: 'Management',
    items: [
      { to: '/users', icon: Users, label: 'Users' },
      { to: '/babies', icon: Baby, label: 'Babies' },
      { to: '/logs', icon: ScrollText, label: 'Logs' },
      { to: '/subscriptions', icon: CreditCard, label: 'Subscriptions' },
    ]
  },
  {
    label: 'Content & Config',
    items: [
      { to: '/content', icon: FileText, label: 'Content' },
      { to: '/notifications', icon: Bell, label: 'Notifications' },
      { to: '/settings', icon: Settings, label: 'Settings' },
    ]
  },
]

export default function AdminLayout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    return localStorage.getItem('babyglow-sidebar-collapsed') === 'true'
  })
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('babyglow-dark') === 'true'
  })
  const [profileOpen, setProfileOpen] = useState(false)
  const [paletteOpen, setPaletteOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setPaletteOpen((v) => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('babyglow-dark', darkMode)
  }, [darkMode])

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    localStorage.setItem('babyglow-sidebar-collapsed', sidebarCollapsed)
  }, [sidebarCollapsed])

  const handleLogout = async () => {
    await logout()
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 bg-sidebar text-white flex flex-col shrink-0 transition-all duration-300 ease-in-out lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
      } ${sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'}`}>
        {/* Logo */}
        <div className={`p-4 flex items-center border-b border-white/5 ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : 'gap-3'}`}>
          <div className="w-10 h-10 bg-gradient-to-br from-coral to-coral-dark rounded-xl flex items-center justify-center shadow-lg shadow-coral/20 shrink-0">
            <Baby size={22} />
          </div>
          {!sidebarCollapsed && (
            <div className="animate-fade-in">
              <div className="font-bold text-lg leading-tight">BabyGlow</div>
              <div className="text-[10px] text-white/30 uppercase tracking-widest font-medium">Admin Panel</div>
            </div>
          )}
          <button
            className="ml-auto p-1 rounded-lg hover:bg-white/10 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 overflow-auto">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              {!sidebarCollapsed && (
                <div className="px-3 mb-2 text-[10px] uppercase tracking-widest text-white/20 font-semibold">
                  {section.label}
                </div>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/dashboard' || item.to === '/users'}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      `flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        sidebarCollapsed ? 'px-0 py-2.5 justify-center lg:mx-auto lg:w-12' : 'px-3 py-2.5'
                      } ${
                        isActive
                          ? 'bg-sidebar-active text-coral shadow-sm'
                          : 'text-white/40 hover:bg-sidebar-hover hover:text-white/80'
                      }`
                    }
                  >
                    <item.icon size={18} className="shrink-0" />
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Collapse toggle - desktop only */}
        <div className="hidden lg:block px-3 pb-2">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-white/30 hover:bg-sidebar-hover hover:text-white/60 transition-colors text-xs"
          >
            <ChevronRight size={14} className={`transition-transform duration-300 ${sidebarCollapsed ? '' : 'rotate-180'}`} />
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>

        {/* User profile */}
        <div className="p-3 border-t border-white/5">
          <div className={`flex items-center gap-3 rounded-xl bg-sidebar-hover p-3 ${sidebarCollapsed ? 'lg:justify-center lg:px-2' : ''}`}>
            <div className="w-9 h-9 bg-gradient-to-br from-coral to-coral-dark rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0 animate-fade-in">
                <div className="text-sm font-medium truncate">{user?.name || 'Admin'}</div>
                <div className="text-[10px] text-white/30 uppercase tracking-wider">{user?.role || 'admin'}</div>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors group"
                title="Logout"
              >
                <LogOut size={15} className="text-white/30 group-hover:text-coral transition-colors" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-4 md:px-6 shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="p-2 rounded-xl hover:bg-cream transition-colors lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-text-primary" />
            </button>
            <button
              onClick={() => setPaletteOpen(true)}
              className="relative hidden md:flex items-center gap-2 pl-3 pr-4 py-2 bg-cream rounded-xl text-sm w-56 lg:w-72 text-text-secondary/50 hover:ring-2 hover:ring-coral/20 transition-all text-left"
            >
              <Search size={16} className="text-text-secondary" />
              <span className="flex-1">Search users, babies...</span>
              <kbd className="text-[10px] text-text-secondary bg-surface px-1.5 py-0.5 rounded border border-border font-mono hidden lg:block">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2.5 rounded-xl hover:bg-cream transition-all duration-200 hover:scale-105"
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun size={18} className="text-mango" />
              ) : (
                <Moon size={18} className="text-text-secondary" />
              )}
            </button>
            <button
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 rounded-xl hover:bg-cream transition-all duration-200 hover:scale-105"
              title="Notifications"
            >
              <Bell size={18} className="text-text-secondary" />
            </button>
            <div className="h-6 w-px bg-border hidden md:block mx-1" />
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 py-1 px-2 rounded-xl hover:bg-cream transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-coral to-coral-dark rounded-full flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {user?.name?.charAt(0)?.toUpperCase() || 'A'}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium leading-tight">{user?.name || 'Admin'}</div>
                </div>
                <ChevronDown size={14} className={`text-text-secondary hidden md:block transition-transform ${profileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-surface rounded-xl border border-border shadow-xl z-20 py-2 animate-fade-in-down">
                    <div className="px-4 py-2 border-b border-border">
                      <div className="text-sm font-medium">{user?.name || 'Admin'}</div>
                      <div className="text-xs text-text-secondary">{user?.email}</div>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-cream transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <div className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </div>
  )
}