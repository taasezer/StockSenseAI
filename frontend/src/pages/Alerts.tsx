import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAlertSummary, getLowStockProducts, checkAlerts } from '../services/api'

interface AlertSummary {
    totalAlerts: number
    criticalCount: number
    lowStockCount: number
    warningCount: number
    topAlerts: LowStockProduct[]
}

interface LowStockProduct {
    id: number
    name: string
    sku: string | null
    category: string
    currentStock: number
    reorderLevel: number
    leadTimeDays: number
    supplierName: string | null
    alertLevel: string
    suggestedOrderQuantity: number
}

const Alerts = () => {
    const [summary, setSummary] = useState<AlertSummary | null>(null)
    const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([])
    const [loading, setLoading] = useState(true)
    const [checking, setChecking] = useState(false)
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            setLoading(true)
            const [summaryData, productsData] = await Promise.all([
                getAlertSummary(),
                getLowStockProducts()
            ])
            setSummary(summaryData)
            setLowStockProducts(productsData)
        } catch (error) {
            console.error('Error fetching alerts:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleCheckAlerts = async () => {
        setChecking(true)
        try {
            await checkAlerts()
            await fetchData()
        } catch (error) {
            console.error('Error checking alerts:', error)
        } finally {
            setChecking(false)
        }
    }

    const getAlertBadgeStyle = (level: string) => {
        switch (level) {
            case 'Critical':
                return { backgroundColor: '#dc2626', color: 'white' }
            case 'Low':
                return { backgroundColor: '#f59e0b', color: 'white' }
            case 'Warning':
                return { backgroundColor: '#3b82f6', color: 'white' }
            default:
                return { backgroundColor: '#6b7280', color: 'white' }
        }
    }

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <p>Loading alerts...</p>
            </div>
        )
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>
                    📊 Stock Alerts Dashboard
                </h1>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleCheckAlerts}
                        disabled={checking}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#10b981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: checking ? 'not-allowed' : 'pointer',
                            opacity: checking ? 0.6 : 1
                        }}
                    >
                        {checking ? '⏳ Checking...' : '🔄 Check Alerts'}
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6b7280',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer'
                        }}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
                <div style={{
                    backgroundColor: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Alerts</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#1f2937' }}>
                        {summary?.totalAlerts || 0}
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#fef2f2',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    border: '2px solid #dc2626'
                }}>
                    <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '8px' }}>🚨 Critical (Out of Stock)</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#dc2626' }}>
                        {summary?.criticalCount || 0}
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#fffbeb',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    border: '2px solid #f59e0b'
                }}>
                    <p style={{ fontSize: '14px', color: '#f59e0b', marginBottom: '8px' }}>⚠️ Low Stock</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#f59e0b' }}>
                        {summary?.lowStockCount || 0}
                    </p>
                </div>

                <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    textAlign: 'center',
                    border: '2px solid #3b82f6'
                }}>
                    <p style={{ fontSize: '14px', color: '#3b82f6', marginBottom: '8px' }}>ℹ️ Warning</p>
                    <p style={{ fontSize: '36px', fontWeight: 'bold', color: '#3b82f6' }}>
                        {summary?.warningCount || 0}
                    </p>
                </div>
            </div>

            {/* Low Stock Products Table */}
            <div style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflow: 'hidden'
            }}>
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>
                        📦 Products Requiring Attention
                    </h2>
                </div>

                {lowStockProducts.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                        <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
                        <p style={{ fontSize: '18px' }}>All products are well stocked!</p>
                    </div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '600', color: '#374151' }}>SKU</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Current</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Reorder Level</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Lead Time</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600', color: '#374151' }}>Suggested Order</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockProducts.map((product, index) => (
                                <tr key={product.id} style={{
                                    borderBottom: '1px solid #e5e7eb',
                                    backgroundColor: index % 2 === 0 ? 'white' : '#f9fafb'
                                }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div>
                                            <p style={{ fontWeight: '500', color: '#1f2937' }}>{product.name}</p>
                                            <p style={{ fontSize: '12px', color: '#6b7280' }}>{product.category}</p>
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', fontFamily: 'monospace' }}>
                                        {product.sku || '-'}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{
                                            ...getAlertBadgeStyle(product.alertLevel),
                                            padding: '4px 12px',
                                            borderRadius: '9999px',
                                            fontSize: '12px',
                                            fontWeight: '600'
                                        }}>
                                            {product.alertLevel}
                                        </span>
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: product.currentStock === 0 ? '#dc2626' : '#f59e0b'
                                    }}>
                                        {product.currentStock}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>
                                        {product.reorderLevel}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#6b7280' }}>
                                        {product.leadTimeDays} days
                                    </td>
                                    <td style={{
                                        padding: '12px 16px',
                                        textAlign: 'center',
                                        fontWeight: '600',
                                        color: '#10b981'
                                    }}>
                                        +{product.suggestedOrderQuantity}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default Alerts
