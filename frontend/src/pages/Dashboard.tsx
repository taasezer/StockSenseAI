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

          <div className="grid" style={{ marginTop: 'var(--spacing-xl)', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
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

            {/* Card 2 - Alerts */}
            <div className="stat-card" style={{ borderColor: 'var(--danger)' }}>
              <h3 className="stat-title" style={{ color: 'var(--danger)' }}>⚠️ Alerts</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Monitor low stock and out of stock products
              </p>
              <button
                onClick={() => navigate('/alerts')}
                className="btn btn-danger btn-sm"
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                View Alerts
              </button>
            </div>

            {/* Card 3 - Supply Chain */}
            <div className="stat-card" style={{ borderColor: 'var(--secondary)' }}>
              <h3 className="stat-title" style={{ color: 'var(--secondary)' }}>🚚 Supply Chain</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Manage suppliers and track shipments
              </p>
              <button
                onClick={() => navigate('/suppliers')}
                className="btn btn-secondary btn-sm"
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                Manage Suppliers
              </button>
            </div>

            {/* Card 4 - Reports */}
            <div className="stat-card" style={{ borderColor: 'var(--warning)' }}>
              <h3 className="stat-title" style={{ color: 'var(--warning)' }}>📊 Reports</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Generate PDF reports for inventory
              </p>
              <button
                onClick={() => navigate('/reports')}
                className="btn btn-warning btn-sm"
                style={{ marginTop: 'var(--spacing-sm)' }}
              >
                View Reports
              </button>
            </div>

            {/* Card 5 - AI Insights */}
            <div className="stat-card" style={{ borderColor: '#7c3aed' }}>
              <h3 className="stat-title" style={{ color: '#7c3aed' }}>🤖 AI Insights</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Price optimization & anomaly detection
              </p>
              <button
                onClick={() => navigate('/ai-insights')}
                className="btn"
                style={{ marginTop: 'var(--spacing-sm)', backgroundColor: '#7c3aed', color: 'white' }}
              >
                View Insights
              </button>
            </div>

            {/* Card 6 - Warehouses */}
            <div className="stat-card" style={{ borderColor: '#0d9488' }}>
              <h3 className="stat-title" style={{ color: '#0d9488' }}>🏭 Warehouses</h3>
              <p className="stat-description" style={{ marginTop: 'var(--spacing-sm)' }}>
                Multi-warehouse stock & transfers
              </p>
              <button
                onClick={() => navigate('/warehouses')}
                className="btn"
                style={{ marginTop: 'var(--spacing-sm)', backgroundColor: '#0d9488', color: 'white' }}
              >
                Manage
              </button>
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
