import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts } from '../services/api'

const Dashboard = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    loading: true,
    error: null as string | null
  })

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    // Fetch real data from backend using service
    const fetchDashboardData = async () => {
      try {
        const products = await getProducts()
        setStats({
          totalProducts: products?.length || 0,
          loading: false,
          error: null
        })
      } catch (error: any) {
        const errorMessage = error.response?.status === 401
          ? 'Session expired. Please login again.'
          : 'Failed to load dashboard data'

        setStats({
          totalProducts: 0,
          loading: false,
          error: errorMessage
        })

        if (error.response?.status === 401) {
          localStorage.removeItem('token')
          setTimeout(() => navigate('/login'), 2000)
        }
      }
    }

    fetchDashboardData()
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="header">
        <h1 className="header-title">StockSenseAI Dashboard</h1>
        <button onClick={handleLogout} className="btn btn-danger btn-sm">
          Logout
        </button>
      </div>

      {/* Content */}
      <div className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
        <div className="card fade-in">
          <h2 className="card-header">Welcome to StockSenseAI</h2>
          <p className="card-body mb-lg">
            Your intelligent stock management system powered by AI
          </p>

          {stats.loading && (
            <div className="alert alert-info">
              <p style={{ margin: 0 }}>
                <strong>⏳ Loading dashboard data...</strong>
              </p>
            </div>
          )}

          {stats.error && (
            <div className="alert alert-error">
              <p style={{ margin: 0 }}>
                <strong>⚠ Error:</strong> {stats.error}
              </p>
            </div>
          )}

          <div className="grid grid-3" style={{ marginTop: 'var(--spacing-xl)' }}>
            {/* Card 1 - Products */}
            <div className="stat-card" style={{ borderColor: 'var(--primary)' }}>
              <h3 className="stat-title" style={{ color: 'var(--primary)' }}>Products</h3>
              <p className="stat-value" style={{ color: 'var(--gray-900)' }}>
                {stats.loading ? '...' : stats.totalProducts}
              </p>
              <p className="stat-description">Total products in inventory</p>
              <button
                onClick={() => navigate('/products')}
                className="btn btn-primary btn-sm"
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                View Products
              </button>
            </div>

            {/* Card 2 - Analytics */}
            <div className="stat-card" style={{ borderColor: 'var(--secondary)' }}>
              <h3 className="stat-title" style={{ color: 'var(--secondary)' }}>Analytics</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                View sales predictions and insights powered by AI
              </p>
            </div>

            {/* Card 3 - AI Features */}
            <div className="stat-card" style={{ borderColor: 'var(--warning)' }}>
              <h3 className="stat-title" style={{ color: 'var(--warning)' }}>AI Features</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Powered by OpenAI for smart descriptions & predictions
              </p>
            </div>
          </div>

          {!stats.loading && !stats.error && (
            <div className="alert alert-success" style={{ marginTop: 'var(--spacing-xl)' }}>
              <p style={{ margin: 0 }}>
                <strong>✓ Backend connected successfully!</strong><br />
                Frontend is now communicating with the .NET API
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
