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

    const getStatusBadge = (status: string) => {
        const styles: Record<string, React.CSSProperties> = {
            Pending: { backgroundColor: '#fbbf24', color: '#1f2937' },
            InTransit: { backgroundColor: '#3b82f6', color: 'white' },
            Delivered: { backgroundColor: '#10b981', color: 'white' },
            Delayed: { backgroundColor: '#f97316', color: 'white' },
            Cancelled: { backgroundColor: '#6b7280', color: 'white' }
        }
        return { padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: '600', ...styles[status] }
    }

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>
    }

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>🚚 Supply Chain Management</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                    ← Dashboard
                </button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                <button onClick={() => setActiveTab('suppliers')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'suppliers' ? '#4f46e5' : '#e5e7eb', color: activeTab === 'suppliers' ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Suppliers ({suppliers.length})
                </button>
                <button onClick={() => setActiveTab('shipments')} style={{ padding: '10px 20px', backgroundColor: activeTab === 'shipments' ? '#4f46e5' : '#e5e7eb', color: activeTab === 'shipments' ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600' }}>
                    Shipments ({shipments.length})
                </button>
            </div>

            {/* Suppliers Tab */}
            {activeTab === 'suppliers' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Suppliers</h2>
                        <button onClick={() => { setShowForm(true); setEditingSupplier(null); setFormData({ name: '', contactEmail: '', contactPhone: '', address: '', averageLeadTimeDays: 7, isActive: true }); }} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            + Add Supplier
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Name</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Contact</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Lead Time</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Products</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{supplier.name}</td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', fontSize: '14px' }}>
                                        {supplier.contactEmail && <div>📧 {supplier.contactEmail}</div>}
                                        {supplier.contactPhone && <div>📞 {supplier.contactPhone}</div>}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{supplier.averageLeadTimeDays} days</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>{supplier.productCount}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: supplier.isActive ? '#dcfce7' : '#fee2e2', color: supplier.isActive ? '#166534' : '#dc2626' }}>
                                            {supplier.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <button onClick={() => { setEditingSupplier(supplier); setFormData({ name: supplier.name, contactEmail: supplier.contactEmail || '', contactPhone: supplier.contactPhone || '', address: supplier.address || '', averageLeadTimeDays: supplier.averageLeadTimeDays, isActive: supplier.isActive }); setShowForm(true); }} style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Edit</button>
                                        <button onClick={() => handleDeleteSupplier(supplier.id)} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Shipments Tab */}
            {activeTab === 'shipments' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Shipments</h2>
                        <button onClick={() => setShowShipmentForm(true)} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
                            + New Shipment
                        </button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
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
                                <tr key={shipment.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{shipment.productName}</td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280' }}>{shipment.supplierName}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>+{shipment.quantity}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>{new Date(shipment.expectedArrival).toLocaleDateString()}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={getStatusBadge(shipment.status)}>{shipment.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        {(shipment.status === 'Pending' || shipment.status === 'InTransit') && (
                                            <>
                                                <button onClick={() => handleDeliverShipment(shipment.id)} style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>✓ Deliver</button>
                                                <button onClick={() => handleCancelShipment(shipment.id)} style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>{editingSupplier ? 'Edit Supplier' : 'Add Supplier'}</h3>
                        <form onSubmit={handleSubmitSupplier}>
                            <input type="text" placeholder="Supplier Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="email" placeholder="Email" value={formData.contactEmail} onChange={e => setFormData({ ...formData, contactEmail: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="tel" placeholder="Phone" value={formData.contactPhone} onChange={e => setFormData({ ...formData, contactPhone: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="number" placeholder="Lead Time (days)" value={formData.averageLeadTimeDays} onChange={e => setFormData({ ...formData, averageLeadTimeDays: parseInt(e.target.value) })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Shipment Form Modal */}
            {showShipmentForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>New Shipment</h3>
                        <form onSubmit={handleSubmitShipment}>
                            <select value={shipmentForm.productId} onChange={e => setShipmentForm({ ...shipmentForm, productId: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <select value={shipmentForm.supplierId} onChange={e => setShipmentForm({ ...shipmentForm, supplierId: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="">Select Supplier</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <input type="number" placeholder="Quantity" min="1" value={shipmentForm.quantity} onChange={e => setShipmentForm({ ...shipmentForm, quantity: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="datetime-local" value={shipmentForm.expectedArrival} onChange={e => setShipmentForm({ ...shipmentForm, expectedArrival: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Tracking Number (optional)" value={shipmentForm.trackingNumber} onChange={e => setShipmentForm({ ...shipmentForm, trackingNumber: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create</button>
                                <button type="button" onClick={() => setShowShipmentForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Suppliers
