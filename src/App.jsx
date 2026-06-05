import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './components/Toast'
import AdminLayout from './layouts/AdminLayout'
import Login from './pages/Login'
import LoadingSpinner from './components/LoadingSpinner'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Users = lazy(() => import('./pages/Users'))
const UserDetail = lazy(() => import('./pages/UserDetail'))
const Babies = lazy(() => import('./pages/Babies'))
const Logs = lazy(() => import('./pages/Logs'))
const Subscriptions = lazy(() => import('./pages/Subscriptions'))
const Content = lazy(() => import('./pages/Content'))
const Insights = lazy(() => import('./pages/Insights'))
const Settings = lazy(() => import('./pages/Settings'))

function AuthGuard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner className="h-screen" />
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<AuthGuard><AdminLayout /></AuthGuard>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<LoadingSpinner />}><Users /></Suspense>} />
        <Route path="users/:id" element={<Suspense fallback={<LoadingSpinner />}><UserDetail /></Suspense>} />
        <Route path="babies" element={<Suspense fallback={<LoadingSpinner />}><Babies /></Suspense>} />
        <Route path="logs" element={<Suspense fallback={<LoadingSpinner />}><Logs /></Suspense>} />
        <Route path="subscriptions" element={<Suspense fallback={<LoadingSpinner />}><Subscriptions /></Suspense>} />
        <Route path="content" element={<Suspense fallback={<LoadingSpinner />}><Content /></Suspense>} />
        <Route path="insights" element={<Suspense fallback={<LoadingSpinner />}><Insights /></Suspense>} />
        <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
      </Route>
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </Router>
  )
}