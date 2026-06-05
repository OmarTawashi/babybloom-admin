import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sidebar via-sidebar to-plum/30 flex items-center justify-center p-4">
      <div className="w-full max-w-sm animate-fade-in-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-coral to-coral-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-coral/20">
            <Baby size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">BabyGlow Admin</h1>
          <p className="text-white/40 text-sm mt-1">Sign in to manage your app</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-2xl p-6 shadow-xl space-y-4 border border-border">
          {error && (
            <div className="bg-red-500/10 text-red-500 text-sm px-4 py-3 rounded-xl border border-red-500/20 animate-fade-in">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 transition-shadow"
              placeholder="admin@babyglow.app"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-cream rounded-xl text-sm border-0 outline-none focus:ring-2 focus:ring-coral/20 transition-shadow pr-10"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-gradient-to-r from-coral to-coral-dark text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-coral/20 transition-all disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </span>
            ) : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Protected admin area • BabyGlow © {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}