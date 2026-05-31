import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { AuthUser } from '../types'

interface AuthContextType {
  user: AuthUser | null
  login: (user: AuthUser) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem('ladvs_user')
    return saved ? JSON.parse(saved) : null
  })

  const login = (userData: AuthUser) => {
    setUser(userData)
    localStorage.setItem('ladvs_user', JSON.stringify(userData))
    localStorage.setItem('ladvs_token', userData.token)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('ladvs_user')
    localStorage.removeItem('ladvs_token')
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}