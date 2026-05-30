import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getSuppliers, createSupplier, updateSupplier, deleteSupplier,
    getShipments, getPendingShipments, createShipment, markShipmentDelivered, cancelShipment,
    getProducts
} from '../services/api'

interface Supplier {
    id: number
    name: string
    contactEmail: string | null
    contactPhone: string | null
    address: string | null
    averageLeadTimeDays: number
    isActive: boolean
    productCount: number
    supplierCode?: string
    productNames?: string[]
}

interface Shipment {
    id: number
    productId: number
    productName: string
    supplierId: number
    supplierName: string
    quantity: number
    expectedArrival: string
    actualArrival: string | null
    status: string
    trackingNumber: string | null
}

interface Product {
    id: number
    name: string
}

const Suppliers = () => {
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [shipments, setShipments] = useState<Shipment[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'suppliers' | 'shipments'>('suppliers')
    const [showForm, setShowForm] = useState(false)
    const [showShipmentForm, setShowShipmentForm] = useState(false)
    const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
    const [formData, setFormData] = useState({
        name: '',
        contactEmail: '',
        contactPhone: '',
        address: '',
        averageLeadTimeDays: 7,
        isActive: true
    })
    const [shipmentForm, setShipmentForm] = useState({
        productId: 0,
        supplierId: 0,
        quantity: 1,
        expectedArrival: '',
        trackingNumber: ''
    })
    const [searchTerm, setSearchTerm] = useState('')
    const [messagingSupplier, setMessagingSupplier] = useState<Supplier | null>(null)
    const [messageText, setMessageText] = useState('')
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            setLoading(true)
            const [suppliersData, shipmentsData, productsData] = await Promise.all([
                getSuppliers(),
                getShipments(),
                getProducts()
            ])
            setSuppliers(suppliersData)
            setShipments(shipmentsData)
            setProducts(productsData)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleSubmitSupplier = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingSupplier) {
                await updateSupplier(editingSupplier.id, formData)
            } else {
                await createSupplier(formData)
            }
            setShowForm(false)
            setEditingSupplier(null)
            setFormData({ name: '', contactEmail: '', contactPhone: '', address: '', averageLeadTimeDays: 7, isActive: true })
            fetchData()
        } catch (error) {
            console.error('Error saving supplier:', error)
        }
    }

    const handleDeleteSupplier = async (id: number) => {
        if (confirm('Are you sure you want to delete this supplier?')) {
            try {
                await deleteSupplier(id)
                fetchData()
            } catch (error) {
                console.error('Error deleting supplier:', error)
            }
        }
    }

    const handleSubmitShipment = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createShipment(shipmentForm)
            setShowShipmentForm(false)
            setShipmentForm({ productId: 0, supplierId: 0, quantity: 1, expectedArrival: '', trackingNumber: '' })
            fetchData()
        } catch (error) {
            console.error('Error creating shipment:', error)
        }
    }

    const handleDeliverShipment = async (id: number) => {
        try {
            await markShipmentDelivered(id)
            fetchData()
        } catch (error) {
            console.error('Error delivering shipment:', error)
        }
    }

    const handleCancelShipment = async (id: number) => {
        if (confirm('Are you sure you want to cancel this shipment?')) {
            try {
                await cancelShipment(id)
                fetchData()
            } catch (error) {
                console.error('Error cancelling shipment:', error)
            }
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!messagingSupplier || !messageText) return
        try {
            const token = localStorage.getItem('token')
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/suppliers/${messagingSupplier.id}/message`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ message: messageText })
            })
            if (res.ok) {
                alert('Message sent successfully! They will receive a notification.')
                setMessagingSupplier(null)
                setMessageText('')
            } else {
                alert('Failed to send message.')
            }
        } catch (err) { console.error(err) }
    }

    const filteredSuppliers = suppliers.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.supplierCode && s.supplierCode.toLowerCase().includes(searchTerm.toLowerCase())))

    const getStatusBadge = (status: string) => {
        const styles: Record<string, React.CSSProperties> = {
            Pending: { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' },
            InTransit: { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' },
            Delivered: { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' },
            Delayed: { backgroundColor: 'rgba(249, 115, 22, 0.1)', color: '#f97316' },
            Cancelled: { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-muted)' }
        }
        return { padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', ...styles[status] }
    }

    if (loading) {
        return <div className="spinner" style={{ margin: '40px auto' }}></div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    Supply Chain Management
                </h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button onClick={() => setActiveTab('suppliers')} className={activeTab === 'suppliers' ? "btn-primary" : "btn-outline"} style={{ width: 'auto' }}>
                    Suppliers ({suppliers.length})
                </button>
                <button onClick={() => setActiveTab('shipments')} className={activeTab === 'shipments' ? "btn-primary" : "btn-outline"} style={{ width: 'auto' }}>
                    Shipments ({shipments.length})
                </button>
            </div>

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600', margin: 0 }}>Suppliers</h2>
                            <input 
                                type="text" 
                                placeholder="Search by name or code..." 
                                className="input-field" 
                                style={{ width: '250px', margin: 0, padding: '6px 12px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => { setShowForm(true); setEditingSupplier(null); setFormData({ name: '', contactEmail: '', contactPhone: '', address: '', averageLeadTimeDays: 7, isActive: true }); }}>
                            + Add Supplier
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Supplier</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Location & Contact</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Products</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSuppliers.map(supplier => (
                                <tr key={supplier.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ fontWeight: '500', color: '#fff' }}>{supplier.name}</div>
                                        {supplier.supplierCode && <div style={{ fontSize: '12px', color: 'var(--brand-red)', fontFamily: 'monospace' }}>{supplier.supplierCode}</div>}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)', fontSize: '13px' }}>
                                        {supplier.address && <div style={{ marginBottom: '4px' }}>📍 {supplier.address}</div>}
                                        {supplier.contactEmail && <div>✉️ {supplier.contactEmail}</div>}
                                        {supplier.contactPhone && <div>📞 {supplier.contactPhone}</div>}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <div style={{ fontWeight: '600', color: '#fff' }}>{supplier.productCount} Items</div>
                                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '150px', margin: '0 auto', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={supplier.productNames?.join(', ')}>
                                            {supplier.productNames?.join(', ') || '-'}
                                        </div>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold', backgroundColor: supplier.isActive ? 'rgba(16, 185, 129, 0.1)' : 'rgba(220, 38, 38, 0.1)', color: supplier.isActive ? '#10b981' : 'var(--brand-red)' }}>
                                            {supplier.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        <button className="btn-outline" onClick={() => setMessagingSupplier(supplier)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', borderColor: '#3b82f6', color: '#3b82f6' }}>✉️ Message</button>
                                        <button className="btn-outline" onClick={() => { setEditingSupplier(supplier); setFormData({ name: supplier.name, contactEmail: supplier.contactEmail || '', contactPhone: supplier.contactPhone || '', address: supplier.address || '', averageLeadTimeDays: supplier.averageLeadTimeDays, isActive: supplier.isActive }); setShowForm(true); }} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}>Edit</button>
                                        <button className="btn-outline" onClick={() => handleDeleteSupplier(supplier.id)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', borderColor: 'var(--brand-red)', color: 'var(--brand-red)' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Shipments</h2>
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowShipmentForm(true)}>
                            + New Shipment
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Supplier</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Expected</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {shipments.map(shipment => (
                                <tr key={shipment.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{shipment.productName}</td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{shipment.supplierName}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>+{shipment.quantity}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{new Date(shipment.expectedArrival).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={getStatusBadge(shipment.status)}>{shipment.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        {(shipment.status === 'Pending' || shipment.status === 'InTransit') && (
                                            <>
                                                <button className="btn-outline" onClick={() => handleDeliverShipment(shipment.id)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', borderColor: '#10b981', color: '#10b981' }}>✓ Deliver</button>
                                                <button className="btn-outline" onClick={() => handleCancelShipment(shipment.id)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}>Cancel</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Supplier Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="stat-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                        <form onSubmit={handleSubmitSupplier} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input className="input-field" type="text" placeholder="Supplier Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input className="input-field" type="email" placeholder="Email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} />
                            <input className="input-field" type="tel" placeholder="Phone" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} />
                            <input className="input-field" type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
                            <input className="input-field" type="number" placeholder="Lead Time (days)" value={formData.averageLeadTimeDays} onChange={e => setFormData({ ...formData, averageLeadTimeDays: parseInt(e.target.value) })} />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shipment Form Modal */}
            {showShipmentForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="stat-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>New Shipment</h3>
                        <form onSubmit={handleSubmitShipment} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select className="input-field" value={shipmentForm.productId} onChange={e => setShipmentForm({ ...shipmentForm, productId: parseInt(e.target.value) })} required>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select className="input-field" value={shipmentForm.supplierId} onChange={e => setShipmentForm({ ...shipmentForm, supplierId: parseInt(e.target.value) })} required>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input className="input-field" type="number" placeholder="Quantity" min="1" value={shipmentForm.quantity} onChange={e => setShipmentForm({ ...shipmentForm, quantity: parseInt(e.target.value) })} required />
                            <input className="input-field" type="datetime-local" value={shipmentForm.expectedArrival} onChange={e => setShipmentForm({ ...shipmentForm, expectedArrival: e.target.value })} required />
                            <input className="input-field" type="text" placeholder="Tracking Number (optional)" value={shipmentForm.trackingNumber} onChange={e => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })} />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn-outline" onClick={() => setShowShipmentForm(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Message Modal */}
            {messagingSupplier && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="stat-card" style={{ width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>Message {messagingSupplier.name}</h3>
                        <form onSubmit={handleSendMessage} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <textarea 
                                className="input-field" 
                                placeholder="Type your message here... They will receive it as a notification." 
                                rows={4} 
                                value={messageText} 
                                onChange={e => setMessageText(e.target.value)} 
                                required 
                            />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn-outline" onClick={() => setMessagingSupplier(null)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Send Message</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Suppliers
