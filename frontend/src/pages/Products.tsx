import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stockCount: number
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    fetchProducts()
  }, [navigate])

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token')
          navigate('/login')
          return
        }
        throw new Error('Failed to fetch products')
      }

      const data = await response.json()
      setProducts(data)
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Failed to load products')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '20px', color: '#666' }}>Loading products...</div>
        </div>
      </div>
    )
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
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', margin: 0 }}>
            Products
          </h1>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f3f4f6',
              color: '#333',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            ← Dashboard
          </button>
        </div>
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
      <div style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
        {error && (
          <div style={{
            padding: '16px',
            marginBottom: '20px',
            backgroundColor: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: '6px',
            color: '#991b1b'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {products.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', color: '#666', marginBottom: '12px' }}>
                No products found
              </div>
              <div style={{ fontSize: '14px', color: '#999' }}>
                Add some products to get started
              </div>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>ID</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Name</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Price</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Category</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product, index) => (
                  <tr key={product.id} style={{
                    borderBottom: index < products.length - 1 ? '1px solid #e5e7eb' : 'none',
                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                  }}>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{product.id}</td>
                    <td style={{ padding: '12px 16px', color: '#111827', fontWeight: '500' }}>{product.name}</td>
                    <td style={{ padding: '12px 16px', color: '#059669', fontWeight: '600' }}>
                      ${product.price?.toFixed(2) || '0.00'}
                    </td>
                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{product.category || 'N/A'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        backgroundColor: product.stockCount > 10 ? '#d1fae5' : '#fee2e2',
                        color: product.stockCount > 10 ? '#065f46' : '#991b1b'
                      }}>
                        {product.stockCount}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{
          marginTop: '20px',
          padding: '12px 16px',
          backgroundColor: '#dbeafe',
          border: '1px solid #93c5fd',
          borderRadius: '6px',
          fontSize: '14px',
          color: '#1e40af'
        }}>
          <strong>Total Products:</strong> {products.length}
        </div>
      </div>
    </div>
  )
}

export default Products
