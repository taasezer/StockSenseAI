import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, productHubConnection } from '../services/api'
import { useLanguage } from '../contexts/LanguageContext'

interface Product {
  id: number
  name: string
  stockCount: number
  price: number
}

const Dashboard = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { t } = useLanguage()

  const [activeTaskCount, setActiveTaskCount] = useState(0)

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const data = await getProducts()
      setProducts(data)

      if (token) {
          const tasksRes = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks`, {
              headers: { 'Authorization': `Bearer ${token}` }
          })
          if (tasksRes.ok) {
              const tasks = await tasksRes.json()
              const pendingAndProgress = tasks.filter((t: any) => t.status !== 'Completed').length
              setActiveTaskCount(pendingAndProgress)
          }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    const handleProductAddedOrDeleted = () => {
      fetchDashboardData()
    }

    const handleProductUpdate = (updatedProduct: any) => {
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === updatedProduct.id ? updatedProduct : p)
      )
    }

    if (productHubConnection) {
      productHubConnection.on("ProductAdded", handleProductAddedOrDeleted)
      productHubConnection.on("ProductDeleted", handleProductAddedOrDeleted)
      productHubConnection.on("ReceiveProductUpdate", handleProductUpdate)
    }

    return () => {
      if (productHubConnection) {
        productHubConnection.off("ProductAdded", handleProductAddedOrDeleted)
        productHubConnection.off("ProductDeleted", handleProductAddedOrDeleted)
        productHubConnection.off("ReceiveProductUpdate", handleProductUpdate)
      }
    }
  }, [])


  const totalValue = products.reduce((sum, p) => sum + (p.stockCount * p.price), 0)
  const lowStockItems = products.filter(p => p.stockCount < 20).length

  return (
    <div>
      <h2 className="page-title">{t('dash.title')}</h2>
      <p className="page-subtitle">{t('dash.subtitle')}</p>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <div className="spinner"></div>
        </div>
      ) : (
        <div className="dash-grid">
          <div className="stat-card">
            <div className="stat-header">
                <div>
                    <p className="stat-title">{t('dash.total_products')}</p>
                    <h3 className="stat-value">{products.length}</h3>
                </div>
                <div className="stat-icon red">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                </div>
            </div>
            <button onClick={() => navigate('/products')} className="btn-outline" style={{ marginTop: 'auto' }}>{t('dash.manage_inventory')}</button>
          </div>

          <div className="stat-card">
            <div className="stat-header">
                <div>
                    <p className="stat-title">{t('dash.active_tasks')}</p>
                    <h3 className="stat-value">{activeTaskCount}</h3>
                </div>
                <div className="stat-icon blue">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
                </div>
            </div>
            <button onClick={() => navigate('/tasks')} className="btn-outline" style={{ marginTop: 'auto' }}>{t('dash.view_kanban')}</button>
          </div>

          <div className="stat-card">
            <div className="stat-header">
                <div>
                    <p className="stat-title">{t('dash.total_value')}</p>
                    <h3 className="stat-value">${totalValue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h3>
                </div>
                <div className="stat-icon green">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
            </div>
            <button onClick={() => navigate('/ai-insights')} className="btn-outline" style={{ marginTop: 'auto' }}>{t('dash.ai_analytics')}</button>
          </div>
          
          <div className="stat-card">
            <div className="stat-header">
                <div>
                    <p className="stat-title">{t('dash.low_stock')}</p>
                    <h3 className="stat-value">{lowStockItems}</h3>
                </div>
                <div className="stat-icon orange">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                </div>
            </div>
            <button onClick={() => navigate('/reports')} className="btn-outline" style={{ marginTop: 'auto' }}>{t('dash.pdf_report')}</button>
          </div>

        </div>
      )}
    </div>
  )
}

export default Dashboard
