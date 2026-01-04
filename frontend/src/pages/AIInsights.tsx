import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAIInsights, getAnomalies, getAllPriceOptimizations } from '../services/api'

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
            case 'Critical': return { backgroundColor: '#dc2626', color: 'white' }
            case 'Warning': return { backgroundColor: '#f59e0b', color: 'white' }
            default: return { backgroundColor: '#3b82f6', color: 'white' }
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
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '48px', marginBottom: '16px' }}>🤖</p>
                <p>Analyzing your inventory data...</p>
            </div>
        </div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>🤖 AI Insights</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ← Dashboard
                </button>
            </div>

            {/* Summary Banner */}
            {insights && (
                <div style={{
                    padding: '20px 24px',
                    backgroundColor: insights.overallSummary.includes('critical') ? '#fef2f2' : insights.overallSummary.includes('warning') ? '#fffbeb' : '#f0fdf4',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    border: `2px solid ${insights.overallSummary.includes('critical') ? '#dc2626' : insights.overallSummary.includes('warning') ? '#f59e0b' : '#10b981'}`
                }}>
                    <p style={{ fontSize: '16px', margin: 0, fontWeight: '500' }}>{insights.overallSummary}</p>
                </div>
            )}

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'overview' as const, label: '📊 Overview', count: null },
                    { id: 'prices' as const, label: '💰 Price Optimizations', count: insights?.priceOptimizations.length || 0 },
                    { id: 'anomalies' as const, label: '⚠️ Anomalies', count: insights?.anomalies.length || 0 }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 20px',
                        backgroundColor: activeTab === tab.id ? '#4f46e5' : '#e5e7eb',
                        color: activeTab === tab.id ? 'white' : '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: '600'
                    }}>
                        {tab.label} {tab.count !== null && `(${tab.count})`}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && insights && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
                    {/* Price Optimization Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#4f46e5' }}>💰 Price Suggestions</h3>
                        <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{insights.priceOptimizations.length}</p>
                        <p style={{ color: '#6b7280' }}>products with optimization opportunities</p>
                    </div>

                    {/* Anomalies Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#dc2626' }}>⚠️ Anomalies Detected</h3>
                        <p style={{ fontSize: '48px', fontWeight: 'bold', color: '#1f2937', marginBottom: '8px' }}>{insights.anomalies.length}</p>
                        <p style={{ color: '#6b7280' }}>issues requiring attention</p>
                    </div>

                    {/* Quick Actions Card */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>🚀 Quick Actions</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <button onClick={() => setActiveTab('prices')} style={{ padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                Review Price Suggestions
                            </button>
                            <button onClick={() => setActiveTab('anomalies')} style={{ padding: '10px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                                View All Anomalies
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Price Optimizations Tab */}
            {activeTab === 'prices' && insights && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Price Optimization Suggestions</h2>
                    </div>
                    {insights.priceOptimizations.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
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
                                    border: '1px solid #e5e7eb',
                                    backgroundColor: opt.priceChange > 0 ? '#f0fdf4' : opt.priceChange < 0 ? '#fef2f2' : 'white'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{opt.productName}</h4>
                                            <span style={{ ...getConfidenceStyle(opt.confidence), padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>
                                                {opt.confidence} Confidence
                                            </span>
                                        </div>
                                        <div style={{ textAlign: 'right' }}>
                                            <p style={{ fontSize: '14px', color: '#6b7280' }}>Current: ${opt.currentPrice.toFixed(2)}</p>
                                            <p style={{ fontSize: '20px', fontWeight: 'bold', color: opt.priceChange > 0 ? '#10b981' : opt.priceChange < 0 ? '#dc2626' : '#374151' }}>
                                                Suggested: ${opt.suggestedPrice.toFixed(2)}
                                                <span style={{ fontSize: '14px', marginLeft: '8px' }}>
                                                    ({opt.priceChange > 0 ? '+' : ''}{opt.priceChangePercent.toFixed(1)}%)
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                    <p style={{ color: '#4b5563', fontSize: '14px' }}>{opt.reasoning}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Anomalies Tab */}
            {activeTab === 'anomalies' && insights && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', backgroundColor: '#f9fafb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Detected Anomalies</h2>
                    </div>
                    {insights.anomalies.length === 0 ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
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
                                    border: `2px solid ${anomaly.severity === 'Critical' ? '#dc2626' : anomaly.severity === 'Warning' ? '#f59e0b' : '#3b82f6'}`,
                                    backgroundColor: anomaly.severity === 'Critical' ? '#fef2f2' : anomaly.severity === 'Warning' ? '#fffbeb' : '#eff6ff'
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                                        <div>
                                            <h4 style={{ fontWeight: '600', fontSize: '16px', marginBottom: '4px' }}>{anomaly.productName}</h4>
                                            <div style={{ display: 'flex', gap: '8px' }}>
                                                <span style={{ ...getSeverityStyle(anomaly.severity), padding: '2px 8px', borderRadius: '9999px', fontSize: '12px' }}>
                                                    {anomaly.severity}
                                                </span>
                                                <span style={{ backgroundColor: '#e5e7eb', padding: '2px 8px', borderRadius: '9999px', fontSize: '12px', color: '#374151' }}>
                                                    {anomaly.anomalyType}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '8px' }}>{anomaly.description}</p>
                                    <p style={{ color: '#059669', fontSize: '14px', fontWeight: '500' }}>💡 {anomaly.suggestedAction}</p>
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
