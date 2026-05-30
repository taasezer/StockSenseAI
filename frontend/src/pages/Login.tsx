import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { startSignalRConnection } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }))
        throw new Error(errorData.message || 'Login failed')
      }

      const data = await response.json()
      const token = data.token || data.Token
      if (token) {
        localStorage.setItem('token', token)
        await startSignalRConnection()
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div style={{ position: 'absolute', top: 20, right: 20 }}>
        <select 
            className="lang-select" 
            value={language} 
            onChange={(e) => setLanguage(e.target.value as any)}
        >
            <option value="en">EN</option>
            <option value="tr">TR</option>
            <option value="fr">FR</option>
            <option value="es">ES</option>
        </select>
      </div>

      <div className="auth-box">
        <div className="auth-logo">
          <h1>StockSense<span>AI</span></h1>
          <p className="auth-subtitle">{t('login.subtitle')}</p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            type="text"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder={t('login.username')}
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder={t('login.password')}
          />

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? <div className="spinner"></div> : t('login.submit')}
          </button>
        </form>

        <div className="auth-links">
          <span>{t('login.new')}</span>
          <a href="/register">{t('login.register')}</a>
        </div>
      </div>
    </div>
  )
}

export default Login
