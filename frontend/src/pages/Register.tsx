import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'

const Register = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isEmployee, setIsEmployee] = useState(false)
  const [supplierCode, setSupplierCode] = useState('')
  
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const navigate = useNavigate()
  const { t, language, setLanguage } = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const payload: any = {
        username,
        password,
        role: isEmployee ? 'Employee' : 'Supplier'
      }

      if (isEmployee) {
        if (!supplierCode.trim()) {
          throw new Error('Supplier code is required for employees')
        }
        payload.supplierCode = supplierCode.trim()
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }))
        throw new Error(errorData.message || 'Registration failed')
      }

      setSuccess(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
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
          <p className="auth-subtitle">{t('register.subtitle')}</p>
        </div>

        {error && (
          <div style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
            {error}
          </div>
        )}
        
        {success && (
           <div style={{ color: '#10b981', fontSize: '14px', marginBottom: '16px', textAlign: 'center' }}>
             Registration successful. Redirecting...
           </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: 'var(--bg-dark)', padding: '4px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
            <button
                type="button"
                onClick={() => setIsEmployee(false)}
                style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: !isEmployee ? 'var(--bg-panel-hover)' : 'transparent',
                    color: !isEmployee ? '#fff' : 'var(--text-muted)',
                    fontWeight: !isEmployee ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                Supplier / Company
            </button>
            <button
                type="button"
                onClick={() => setIsEmployee(true)}
                style={{
                    flex: 1,
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: isEmployee ? 'var(--bg-panel-hover)' : 'transparent',
                    color: isEmployee ? '#fff' : 'var(--text-muted)',
                    fontWeight: isEmployee ? '600' : '400',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                }}
            >
                Employee
            </button>
          </div>

          <input
            type="text"
            required minLength={3} disabled={loading || success}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
            placeholder={t('login.username')}
          />

          <input
            type="password"
            required minLength={6} disabled={loading || success}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder={t('login.password')}
          />

          <input
            type="password"
            required minLength={6} disabled={loading || success}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="input-field"
            placeholder={t('register.confirm_password')}
          />

          {isEmployee && (
            <input
              type="text"
              required={isEmployee} disabled={loading || success}
              value={supplierCode}
              onChange={(e) => setSupplierCode(e.target.value)}
              className="input-field"
              placeholder={t('register.supplier_code')}
              style={{ borderColor: 'var(--brand-red)' }}
            />
          )}

          <button type="submit" disabled={loading || success} className="btn-primary" style={{ marginTop: '8px' }}>
            {loading ? <div className="spinner"></div> : (isEmployee ? 'Join Organization' : 'Create Organization')}
          </button>
        </form>

        <div className="auth-links">
          <span>{t('register.has_account')}</span>
          <a href="/login">{t('register.login')}</a>
        </div>
      </div>
    </div>
  )
}

export default Register
