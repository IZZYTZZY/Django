import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { apiclient } from '../lib/apiclient'

interface User {
  id: number
  username: string
  email: string
  phone_number?: string
  name?: string   // ✅ ADDED (only change)
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (
    username: string,
    email: string,
    password: string,
    password2: string,
    phone_number?: string
  ) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isAuthenticated = !!user

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await apiclient.get('/api/auth/profile/')
        setUser(res.data)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const login = async (email: string, password: string) => {
    const res = await apiclient.post('/api/auth/login/', {
      email,
      password,
    })

    localStorage.setItem('access_token', res.data.access)
    localStorage.setItem('refresh_token', res.data.refresh)

    const profile = await apiclient.get('/api/auth/profile/')
    setUser(profile.data)
  }

  const register = async (
    username: string,
    email: string,
    password: string,
    password2: string,
    phone_number?: string
  ) => {
    try {
      await apiclient.post('/api/auth/register/', {
        username,
        email,
        password,
        password2,
        phone_number,
      })
    } catch (err: any) {
      console.error('DJANGO REGISTER ERROR RESPONSE:', err.response?.data)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
