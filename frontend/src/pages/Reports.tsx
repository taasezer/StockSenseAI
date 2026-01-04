import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getReportSummary,
    downloadInventoryReport,
    downloadLowStockReport,
    downloadSupplierReport,
    downloadShipmentReport
} from '../services/api'

interface ReportSummary {
    totalProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalSuppliers: number
    activeShipments: number
    totalInventoryValue: number
}

const Reports = () => {
    const [summary, setSummary] = useState<ReportSummary | null>(null)
    const [loading, setLoading] = useState(true)
    const [downloading, setDownloading] = useState<string | null>(null)
    const navigate = useNavigate()

    useEffect(() => {
        fetchSummary()
    }, [])

    const fetchSummary = async () => {
        try {
            const data = await getReportSummary()
            setSummary(data)
        } catch (error) {
            console.error('Error fetching summary:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = async (type: string, downloadFn: () => Promise<void>) => {
        setDownloading(type)
        try {
            await downloadFn()
        } catch (error) {
            console.error(`Error downloading ${type} report:`, error)
            alert('Failed to download report. Please try again.')
        } finally {
            setDownloading(null)
        }
    }

    const reports = [
        {
            id: 'inventory',
            title: '📦 Inventory Report',
            description: 'Complete inventory listing with stock levels, prices, and status',
            color: '#4f46e5',
            downloadFn: downloadInventoryReport
        },
        {
            id: 'low-stock',
            title: '⚠️ Low Stock Report',
            description: 'Products below reorder level with suggested order quantities',
            color: '#dc2626',
            downloadFn: downloadLowStockReport
        },
        {
            id: 'suppliers',
            title: '🏭 Supplier Report',
            description: 'Supplier directory with contact info and lead times',
            color: '#0d9488',
            downloadFn: downloadSupplierReport
        },
        {
            id: 'shipments',
            title: '🚚 Shipment Report',
            description: 'Shipment tracking with status and delivery dates',
            color: '#7c3aed',
            downloadFn: downloadShipmentReport
        }
    ]

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>📊 Reports Center</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ← Dashboard
                </button>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Products</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#4f46e5' }}>{summary.totalProducts}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Low Stock</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.lowStockProducts}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Out of Stock</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#dc2626' }}>{summary.outOfStockProducts}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Suppliers</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#0d9488' }}>{summary.totalSuppliers}</p>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Inventory Value</p>
                        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>${summary.totalInventoryValue.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Report Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {reports.map(report => (
                    <div key={report.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: `3px solid ${report.color}`
                    }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' }}>
                                {report.title}
                            </h3>
                            <p style={{ color: '#6b7280', marginBottom: '20px' }}>
                                {report.description}
                            </p>
                            <button
                                onClick={() => handleDownload(report.id, report.downloadFn)}
                                disabled={downloading !== null}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: downloading === report.id ? '#9ca3af' : report.color,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: downloading !== null ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px'
                                }}
                            >
                                {downloading === report.id ? (
                                    <>⏳ Generating PDF...</>
                                ) : (
                                    <>📥 Download PDF</>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Info Box */}
            <div style={{
                marginTop: '32px',
                padding: '16px 24px',
                backgroundColor: '#eff6ff',
                borderRadius: '12px',
                border: '1px solid #3b82f6'
            }}>
                <p style={{ color: '#1e40af', margin: 0 }}>
                    <strong>💡 Tip:</strong> Reports are generated in real-time with the latest data.
                    PDF files are professionally formatted and ready for printing or sharing.
                </p>
            </div>
        </div>
    )
}

export default Reports
