import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const Dashboard = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Check if logged in
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
    }
  }, [navigate])

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'white',
        borderBottom: '1px solid #e0e0e0',
        padding: '16px 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          StockSenseAI Dashboard
        </h1>
        <button
          onClick={handleLogout}
          style={{
            padding: '8px 16px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Logout
        </button>
      </div>

      {/* Content */}
      <div style={{
        padding: '32px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          padding: '32px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#333'
          }}>
            Welcome to StockSenseAI
          </h2>
          <p style={{
            color: '#666',
            lineHeight: '1.6',
            marginBottom: '24px'
          }}>
            Your intelligent stock management system is up and running!
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            marginTop: '32px'
          }}>
            {/* Card 1 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#4F46E5'
              }}>
                Products
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Manage your product inventory
              </p>
            </div>

            {/* Card 2 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#10B981'
              }}>
                Analytics
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                View sales predictions and insights
              </p>
            </div>

            {/* Card 3 */}
            <div style={{
              padding: '24px',
              backgroundColor: '#f9fafb',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                marginBottom: '8px',
                color: '#F59E0B'
              }}>
                AI Features
              </h3>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Powered by OpenAI technology
              </p>
            </div>
          </div>

          <div style={{
            marginTop: '32px',
            padding: '16px',
            backgroundColor: '#dbeafe',
            border: '1px solid #93c5fd',
            borderRadius: '6px'
          }}>
            <p style={{
              color: '#1e40af',
              fontSize: '14px',
              margin: 0
            }}>
              <strong>✓ Frontend is working correctly!</strong><br />
              Backend integration coming soon...
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
