import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, startSignalRConnection, stopSignalRConnection } from '@/services/api'

type AuthContextType = {
  user: any
  token: string | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'))
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser(payload)
        // Connect SignalR when session is restored
        startSignalRConnection()
      } catch (e) {
        console.error("Invalid token", e)
        localStorage.removeItem('token')
        setToken(null)
      }
    }
  }, [token])

  const login = async (username: string, password: string) => {
    const response = await apiLogin(username, password)
    // Handle both cases for token property name
    const tokenValue = response.token || response.Token
    localStorage.setItem('token', tokenValue)
    setToken(tokenValue)
    await startSignalRConnection()
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    stopSignalRConnection()
    navigate('/login')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

