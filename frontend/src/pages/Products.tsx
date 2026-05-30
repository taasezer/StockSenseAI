import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { productHubConnection } from '../services/api'

interface Product {
  id: number
  name: string
  price: number
  category: string
  stockCount: number
  supplierId?: number
}

interface UserProfile {
    supplierId: string;
}

const Products = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [newProduct, setNewProduct] = useState({ name: '', price: 0, category: '', stockCount: 0 })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    const loadData = async () => {
        try {
            const profileRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfile(profileData);
            }
            
            await fetchProducts();
        } catch (e) {
            console.error(e);
        }
    }
    
    loadData();

    // Setup SignalR Listeners
    const handleProductUpdate = (updatedProduct: Product) => {
      setProducts((prevProducts: Product[]) => {
        const exists = prevProducts.find((p: Product) => p.id === updatedProduct.id)
        if (exists) {
          return prevProducts.map((p: Product) => p.id === updatedProduct.id ? updatedProduct : p)
        } else {
          return [...prevProducts, updatedProduct]
        }
      })
    }

    const handleProductDeleted = (productId: number) => {
      setProducts((prevProducts: Product[]) => prevProducts.filter((p: Product) => p.id !== productId))
    }

    productHubConnection.on("ReceiveProductUpdate", handleProductUpdate)
    productHubConnection.on("ReceiveProductDeleted", handleProductDeleted)

    return () => {
      productHubConnection.off("ReceiveProductUpdate", handleProductUpdate)
      productHubConnection.off("ReceiveProductDeleted", handleProductDeleted)
    }
  }, [navigate])

  async function fetchProducts() {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
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

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newProduct)
      })

      if (!response.ok) throw new Error('Failed to create product')
      
      setShowAddModal(false)
      setNewProduct({ name: '', price: 0, category: '', stockCount: 0 })
      // SignalR will automatically update the list, but we can also fetch just in case
      await fetchProducts()
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 className="page-title">Inventory Management</h2>
            <p className="page-subtitle">
                Isolated Database Area 
                {profile?.supplierId && <span style={{ marginLeft: '8px', color: 'var(--brand-red)', fontWeight: 'bold' }}>[SUP-{String(profile.supplierId).padStart(4, '0')}]</span>}
            </p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="btn-primary" 
            style={{ padding: '10px 20px', width: 'auto', whiteSpace: 'nowrap' }}
          >
            + Add Product
          </button>
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Add New Product</h3>
            <form onSubmit={handleAddProduct} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Name</label>
                <input required type="text" className="input-field" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Price ($)</label>
                  <input required type="number" step="0.01" min="0" className="input-field" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: parseFloat(e.target.value)})} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Stock</label>
                  <input required type="number" min="0" className="input-field" value={newProduct.stockCount} onChange={e => setNewProduct({...newProduct, stockCount: parseInt(e.target.value)})} />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Category</label>
                <input required type="text" className="input-field" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ flex: 1 }}>
                  {isSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {error && (
        <div style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '6px', color: '#ef4444' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="stat-card" style={{ padding: '0', overflow: 'hidden' }}>
        {products.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', color: 'var(--text-primary)', marginBottom: '12px' }}>
              No products found in your database
            </div>
            <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Add some products to populate your organization.
            </div>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>ID</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>Name</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>Price</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>Category</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>Stock</th>
                <th style={{ padding: '16px', fontWeight: '600', color: 'var(--text-muted)' }}>Supplier ID</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr key={product.id} style={{ borderBottom: index < products.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>#{product.id}</td>
                  <td style={{ padding: '16px', color: 'var(--text-primary)', fontWeight: '500' }}>{product.name}</td>
                  <td style={{ padding: '16px', color: '#10b981', fontWeight: '600' }}>
                    ${product.price?.toFixed(2) || '0.00'}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-muted)' }}>{product.category || 'N/A'}</td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: product.stockCount > 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: product.stockCount > 10 ? '#10b981' : '#ef4444',
                      border: `1px solid ${product.stockCount > 10 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
                    }}>
                      {product.stockCount}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: 'var(--brand-red)', fontFamily: 'monospace' }}>
                      {product.supplierId ? `SUP-${product.supplierId.toString().padStart(4, '0')}` : 'Global'}
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
        backgroundColor: 'rgba(220, 38, 38, 0.05)',
        border: '1px solid rgba(220, 38, 38, 0.2)',
        borderRadius: '6px',
        fontSize: '14px',
        color: 'var(--brand-red)'
      }}>
        <strong>Isolated Records Found:</strong> {products.length}
      </div>
    </div>
  )
}

export default Products
