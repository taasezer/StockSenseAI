import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getIntegrationDashboard, getWebhooks, createWebhook, updateWebhook, deleteWebhook, testWebhook,
    getWebhookLogs, getExternalOrders, updateOrderStatus
} from '../services/api'

interface Webhook {
    id: number
    name: string
    description: string | null
    platform: string
    webhookUrl: string
    isActive: boolean
    enabledEvents: string[]
    successCount: number
    failureCount: number
}

interface WebhookLog {
    id: number
    webhookName: string
    eventType: string
    statusCode: number | null
    isSuccess: boolean
    errorMessage: string | null
    sentAt: string
}

interface ExternalOrder {
    id: number
    externalOrderId: string
    platform: string
    customerName: string
    totalAmount: number
    status: string
    receivedAt: string
    itemCount: number
}

interface Dashboard {
    totalWebhooks: number
    activeWebhooks: number
    totalOrdersReceived: number
    pendingOrders: number
    processedToday: number
    recentLogs: WebhookLog[]
}

const Integrations = () => {
    const [dashboard, setDashboard] = useState<Dashboard | null>(null)
    const [webhooks, setWebhooks] = useState<Webhook[]>([])
    const [orders, setOrders] = useState<ExternalOrder[]>([])
    const [logs, setLogs] = useState<WebhookLog[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'dashboard' | 'webhooks' | 'orders' | 'logs'>('dashboard')
    const [showForm, setShowForm] = useState(false)
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null)
    const [formData, setFormData] = useState({
        name: '', description: '', platform: 'Custom', webhookUrl: '', secretKey: '', isActive: true, eventTypes: 127
    })
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            setLoading(true)
            const [dashboardData, webhooksData, ordersData, logsData] = await Promise.all([
                getIntegrationDashboard(),
                getWebhooks(),
                getExternalOrders(),
                getWebhookLogs()
            ])
            setDashboard(dashboardData)
            setWebhooks(webhooksData)
            setOrders(ordersData)
            setLogs(logsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmitWebhook = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingWebhook) {
                await updateWebhook(editingWebhook.id, formData)
            } else {
                await createWebhook(formData)
            }
            setShowForm(false)
            setEditingWebhook(null)
            setFormData({ name: '', description: '', platform: 'Custom', webhookUrl: '', secretKey: '', isActive: true, eventTypes: 127 })
            fetchData()
        } catch (error) {
            console.error('Error saving webhook:', error)
        }
    }

    const handleDeleteWebhook = async (id: number) => {
        if (confirm('Delete this webhook?')) {
            await deleteWebhook(id)
            fetchData()
        }
    }

    const handleTestWebhook = async (id: number) => {
        const result = await testWebhook(id)
        alert(result.message)
        fetchData()
    }

    const handleUpdateOrderStatus = async (orderId: number, status: string) => {
        await updateOrderStatus(orderId, status)
        fetchData()
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'Pending': return { backgroundColor: '#f59e0b', color: 'white' }
            case 'Processing': return { backgroundColor: '#3b82f6', color: 'white' }
            case 'Shipped': return { backgroundColor: '#8b5cf6', color: 'white' }
            case 'Delivered': return { backgroundColor: '#10b981', color: 'white' }
            case 'Cancelled': return { backgroundColor: '#6b7280', color: 'white' }
            default: return { backgroundColor: '#e5e7eb', color: '#374151' }
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>🔌 Integrations</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Dashboard</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'dashboard' as const, label: '📊 Dashboard' },
                    { id: 'webhooks' as const, label: `🔗 Webhooks (${webhooks.length})` },
                    { id: 'orders' as const, label: `📦 Orders (${orders.length})` },
                    { id: 'logs' as const, label: '📋 Logs' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 20px', backgroundColor: activeTab === tab.id ? '#4f46e5' : '#e5e7eb',
                        color: activeTab === tab.id ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Dashboard Tab */}
            {activeTab === 'dashboard' && dashboard && (
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '24px' }}>
                        {[
                            { label: 'Total Webhooks', value: dashboard.totalWebhooks, color: '#4f46e5' },
                            { label: 'Active', value: dashboard.activeWebhooks, color: '#10b981' },
                            { label: 'Orders Received', value: dashboard.totalOrdersReceived, color: '#3b82f6' },
                            { label: 'Pending', value: dashboard.pendingOrders, color: '#f59e0b' },
                            { label: 'Processed Today', value: dashboard.processedToday, color: '#8b5cf6' }
                        ].map(stat => (
                            <div key={stat.label} style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{stat.label}</p>
                                <p style={{ fontSize: '32px', fontWeight: '700', color: stat.color }}>{stat.value}</p>
                            </div>
                        ))}
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Activity</h3>
                        {dashboard.recentLogs.map(log => (
                            <div key={log.id} style={{ padding: '12px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontWeight: '500' }}>{log.webhookName}</span>
                                    <span style={{ marginLeft: '8px', color: '#6b7280' }}>→ {log.eventType}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{ color: log.isSuccess ? '#10b981' : '#dc2626' }}>{log.isSuccess ? '✓' : '✗'}</span>
                                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>{new Date(log.sentAt).toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Webhooks Tab */}
            {activeTab === 'webhooks' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Webhooks</h2>
                        <button onClick={() => { setShowForm(true); setEditingWebhook(null); setFormData({ name: '', description: '', platform: 'Custom', webhookUrl: '', secretKey: '', isActive: true, eventTypes: 127 }); }} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add Webhook</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Platform</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Success/Fail</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {webhooks.map(webhook => (
                                <tr key={webhook.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <p style={{ fontWeight: '500' }}>{webhook.name}</p>
                                        <p style={{ fontSize: '12px', color: '#6b7280' }}>{webhook.webhookUrl.substring(0, 40)}...</p>
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>{webhook.platform}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: webhook.isActive ? '#dcfce7' : '#f3f4f6', color: webhook.isActive ? '#16a34a' : '#6b7280' }}>
                                            {webhook.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ color: '#10b981' }}>{webhook.successCount}</span> / <span style={{ color: '#dc2626' }}>{webhook.failureCount}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => handleTestWebhook(webhook.id)} style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Test</button>
                                        <button onClick={() => handleDeleteWebhook(webhook.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>External Orders</h2>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Order ID</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Customer</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Platform</th>
                                <th style={{ padding: '12px 16px', textAlign: 'right' }}>Amount</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{order.externalOrderId}</td>
                                    <td style={{ padding: '12px 16px' }}>{order.customerName}</td>
                                    <td style={{ padding: '12px 16px' }}>{order.platform}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: '600' }}>${order.totalAmount.toFixed(2)}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ ...getStatusStyle(order.status), padding: '4px 12px', borderRadius: '9999px', fontSize: '12px' }}>{order.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        {order.status === 'Pending' && (
                                            <button onClick={() => handleUpdateOrderStatus(order.id, 'Processing')} style={{ padding: '4px 12px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Process</button>
                                        )}
                                        {order.status === 'Processing' && (
                                            <button onClick={() => handleUpdateOrderStatus(order.id, 'Shipped')} style={{ padding: '4px 12px', backgroundColor: '#8b5cf6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Ship</button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr><td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>No external orders received yet</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Logs Tab */}
            {activeTab === 'logs' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Webhook Logs</h2>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Webhook</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Event</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Error</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{log.webhookName}</td>
                                    <td style={{ padding: '12px 16px' }}>{log.eventType}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: log.isSuccess ? '#dcfce7' : '#fef2f2', color: log.isSuccess ? '#16a34a' : '#dc2626' }}>
                                            {log.isSuccess ? `✓ ${log.statusCode || ''}` : '✗ Failed'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#dc2626', fontSize: '12px' }}>{log.errorMessage || '-'}</td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '12px' }}>{new Date(log.sentAt).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Webhook Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>{editingWebhook ? 'Edit Webhook' : 'Add Webhook'}</h3>
                        <form onSubmit={handleSubmitWebhook}>
                            <input type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <select value={formData.platform} onChange={e => setFormData({ ...formData, platform: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="Custom">Custom</option>
                                <option value="Shopify">Shopify</option>
                                <option value="WooCommerce">WooCommerce</option>
                                <option value="Magento">Magento</option>
                            </select>
                            <input type="url" placeholder="Webhook URL *" value={formData.webhookUrl} onChange={e => setFormData({ ...formData, webhookUrl: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Secret Key (optional)" value={formData.secretKey} onChange={e => setFormData({ ...formData, secretKey: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ marginRight: '8px' }} /> Active
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Integrations
