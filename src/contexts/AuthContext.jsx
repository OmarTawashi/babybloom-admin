import { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin, logout as apiLogout, me as apiMe } from '../api/auth'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('babyglow_token')
    if (token) {
      apiMe()
        .then((res) => {
          const userData = res.data.user
          if (userData.role !== 'admin') {
            localStorage.removeItem('babyglow_token')
            localStorage.removeItem('babyglow_user')
            setUser(null)
          } else {
            setUser(userData)
          }
        })
        .catch(() => {
          localStorage.removeItem('babyglow_token')
          localStorage.removeItem('babyglow_user')
          setUser(null)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    const res = await apiLogin(email, password)
    const { user: userData, token } = res.data
    if (userData.role !== 'admin') {
      throw new Error('Access denied. Admin role required.')
    }
    localStorage.setItem('babyglow_token', token)
    localStorage.setItem('babyglow_user', JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // ignore
    }
    localStorage.removeItem('babyglow_token')
    localStorage.removeItem('babyglow_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
