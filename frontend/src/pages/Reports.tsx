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
            title: 'Inventory Report',
            icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>,
            description: 'Complete inventory listing with stock levels, prices, and status',
            color: 'var(--brand-red)',
            downloadFn: downloadInventoryReport
        },
        {
            id: 'low-stock',
            title: 'Low Stock Report',
            icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>,
            description: 'Products below reorder level with suggested order quantities',
            color: '#f59e0b',
            downloadFn: downloadLowStockReport
        },
        {
            id: 'suppliers',
            title: 'Supplier Report',
            icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>,
            description: 'Supplier directory with contact info and lead times',
            color: '#10b981',
            downloadFn: downloadSupplierReport
        },
        {
            id: 'shipments',
            title: 'Shipment Report',
            icon: <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"></path></svg>,
            description: 'Shipment tracking with status and delivery dates',
            color: '#8b5cf6',
            downloadFn: downloadShipmentReport
        }
    ]

    if (loading) {
        return <div className="spinner" style={{ margin: '40px auto' }}></div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ color: 'var(--brand-red)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h1 className="page-title" style={{ margin: 0 }}>Reports Center</h1>
                </div>
            </div>

            {/* Summary Cards */}
            {summary && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
                    <div className="stat-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Products</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brand-red)' }}>{summary.totalProducts}</p>
                    </div>
                    <div className="stat-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Low Stock</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{summary.lowStockProducts}</p>
                    </div>
                    <div className="stat-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Out of Stock</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: 'var(--brand-red)' }}>{summary.outOfStockProducts}</p>
                    </div>
                    <div className="stat-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Suppliers</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{summary.totalSuppliers}</p>
                    </div>
                    <div className="stat-card" style={{ padding: '16px', textAlign: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Inventory Value</p>
                        <p style={{ fontSize: '22px', fontWeight: 'bold', color: '#10b981' }}>${summary.totalInventoryValue.toLocaleString()}</p>
                    </div>
                </div>
            )}

            {/* Report Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {reports.map(report => (
                    <div key={report.id} className="stat-card" style={{ padding: 0, overflow: 'hidden', borderLeft: `4px solid ${report.color}` }}>
                        <div style={{ padding: '24px' }}>
                            <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '20px', fontWeight: '600', color: 'var(--text-main)', marginBottom: '8px' }}>
                                <span style={{ color: report.color, display: 'flex' }}>{report.icon}</span>
                                {report.title}
                            </h3>
                            <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>
                                {report.description}
                            </p>
                            <button
                                onClick={() => handleDownload(report.id, report.downloadFn)}
                                disabled={downloading !== null}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    backgroundColor: downloading === report.id ? 'var(--bg-dark)' : report.color,
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                    cursor: downloading !== null ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'opacity 0.2s'
                                }}
                            >
                                {downloading === report.id ? (
                                    <>
                                        <svg className="spinner-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10" strokeOpacity="0.25"></circle>
                                            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
                                        </svg>
                                        <span style={{ color: 'var(--text-muted)' }}>Generating PDF...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                        </svg>
                                        Download PDF
                                    </>
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
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start'
            }}>
                <svg width="24" height="24" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0, marginTop: '2px' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
                <p style={{ color: '#3b82f6', margin: 0, lineHeight: '1.5' }}>
                    <strong>Tip:</strong> Reports are generated in real-time with the latest data.
                    PDF files are professionally formatted and ready for printing or sharing.
                </p>
            </div>
        </div>
    )
}

export default Reports
