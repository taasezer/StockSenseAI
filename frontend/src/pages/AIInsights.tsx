import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAIInsights } from '../services/api'

interface PriceOptimization {
    productId: number
    productName: string
    currentPrice: number
    suggestedPrice: number
    priceChange: number
    priceChangePercent: number
    reasoning: string
    confidence: string
}

interface Anomaly {
    productId: number
    productName: string
    anomalyType: string
    severity: string
    description: string
    suggestedAction: string
}

interface AIInsights {
    priceOptimizations: PriceOptimization[]
    anomalies: Anomaly[]
    overallSummary: string
}

const AIInsights = () => {
    const [insights, setInsights] = useState<AIInsights | null>(null)
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'overview' | 'prices' | 'anomalies'>('overview')
    const navigate = useNavigate()

    useEffect(() => {
        fetchInsights()
    }, [])

    const fetchInsights = async () => {
        try {
            setLoading(true)
            const data = await getAIInsights()
            setInsights(data)
        } catch (error) {
            console.error('Error fetching insights:', error)
        } finally {
            setLoading(false)
        }
    }

    const getSeverityStyle = (severity: string) => {
        switch (severity) {
            case 'Critical': return { backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#ef4444', border: '1px solid rgba(220, 38, 38, 0.2)' }
            case 'Warning': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' }
            default: return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' }
        }
    }

    const getConfidenceStyle = (confidence: string) => {
        switch (confidence) {
            case 'High': return { backgroundColor: '#10b981', color: 'white' }
            case 'Medium': return { backgroundColor: '#f59e0b', color: 'white' }
            default: return { backgroundColor: '#6b7280', color: 'white' }
        }
    }

    if (loading) {
        return <div className="spinner" style={{ margin: '40px auto' }}></div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <h1 className="page-title" style={{ margin: 0 }}>
                        <span style={{ color: 'var(--brand-red)' }}>✦</span> AI Insights
                    </h1>
                </div>
            </div>

            {/* Summary Banner */}
            {insights && (
                <div style={{
                    padding: '20px 24px',
                    backgroundColor: insights.overallSummary.includes('critical') ? 'rgba(220, 38, 38, 0.1)' : insights.overallSummary.includes('warning') ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: `1px solid ${insights.overallSummary.includes('critical') ? 'rgba(220, 38, 38, 0.2)' : insights.overallSummary.includes('warning') ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    color: insights.overallSummary.includes('critical') ? '#ef4444' : insights.overallSummary.includes('warning') ? '#f59e0b' : '#10b981'
                }}>
                    <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{insights.overallSummary}</p>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
                {[
                    { id: 'overview' as const, label: '📊 Overview', count: null },
                    { id: 'prices' as const, label: '💰 Price Optimizations', count: insights?.priceOptimizations.length || 0 },
                    { id: 'anomalies' as const, label: '⚠️ Anomalies', count: insights?.anomalies.length || 0 }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "btn-primary" : "btn-outline"} style={{ width: 'auto' }}>
                        {tab.label} {tab.count !== null && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && insights && (
                <div className="dash-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="stat-card">
                        <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '16px' }}>💰 Price Suggestions</h3>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>{insights.priceOptimizations.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>products with optimization opportunities</div>
                    </div>

                    <div className="stat-card">
                        <h3 style={{ fontSize: '16px', color: 'var(--brand-red)', marginBottom: '16px' }}>⚠️ Anomalies Detected</h3>
                        <div style={{ fontSize: '48px', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '8px' }}>{insights.anomalies.length}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '14px' }}>issues requiring attention</div>
                    </div>

                    <div className="stat-card">
                        <h3 style={{ fontSize: '16px', color: 'var(--text-main)', marginBottom: '16px' }}>🚀 Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button className="btn-outline" onClick={() => setActiveTab('prices')}>Review Price Suggestions</button>
                            <button className="btn-primary" onClick={() => setActiveTab('anomalies')}>View All Anomalies</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Optimizations Tab */}
            {activeTab === 'prices' && insights && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Price Optimization Suggestions</h2>
                    </div>
                    {insights.priceOptimizations.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
                            <p>All products are optimally priced!</p>
                        </div>
                    ) : (
                        <div style={{ padding: '16px' }}>
                            {insights.priceOptimizations.map(opt => (
                                <div key={opt.productId} style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    borderRadius: '8px',
                                    border: '1px solid var(--border-color)',
                                    backgroundColor: 'var(--bg-dark)'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{opt.productName}</h4>
                                            <span style={{ ...getConfidenceStyle(opt.confidence), padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>
                                                {opt.confidence} Confidence
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>Current: ${opt.currentPrice.toFixed(2)}</p>
                                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: opt.priceChange > 0 ? '#10b981' : opt.priceChange < 0 ? 'var(--brand-red)' : 'var(--text-main)' }}>
                                                Suggested: ${opt.suggestedPrice.toFixed(2)}
                                                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                                                    ({opt.priceChange > 0 ? '+' : ''}{opt.priceChangePercent.toFixed(1)}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{opt.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && insights && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Detected Anomalies</h2>
                    </div>
                    {insights.anomalies.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p style={{ fontSize: '48px', marginBottom: '16px' }}>✅</p>
                            <p>No anomalies detected!</p>
                        </div>
                    ) : (
                        <div style={{ padding: '16px' }}>
                            {insights.anomalies.map((anomaly, index) => (
                                <div key={index} style={{
                                    padding: '16px',
                                    marginBottom: '12px',
                                    borderRadius: '8px',
                                    ...getSeverityStyle(anomaly.severity)
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{anomaly.productName}</h4>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span style={{ backgroundColor: 'currentColor', color: 'var(--bg-panel)', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>
                                                    {anomaly.severity}
                                                </span>
                                                <span style={{ backgroundColor: 'var(--bg-dark)', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', color: 'var(--text-main)' }}>
                                                    {anomaly.anomalyType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ color: 'var(--text-main)', fontSize: '14px', marginBottom: '8px' }}>{anomaly.description}</p>
                                    <p style={{ color: 'currentColor', fontSize: '14px', fontWeight: 'bold' }}>💡 {anomaly.suggestedAction}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default AIInsights
