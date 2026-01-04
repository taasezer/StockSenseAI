import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
    getWarehouses, createWarehouse, updateWarehouse, deleteWarehouse,
    getWarehouseStock, addWarehouseStock,
    getStockTransfers, createStockTransfer, completeTransfer, cancelTransfer,
    getProducts
} from '../services/api'

interface Warehouse {
    id: number
    name: string
    code: string | null
    address: string | null
    city: string | null
    country: string | null
    contactPhone: string | null
    managerName: string | null
    isActive: boolean
    isPrimary: boolean
    totalProducts: number
    totalStock: number
}

interface WarehouseStock {
    id: number
    warehouseId: number
    warehouseName: string
    productId: number
    productName: string
    quantity: number
    reorderLevel: number
    location: string | null
    isLowStock: boolean
}

interface StockTransfer {
    id: number
    sourceWarehouseName: string
    destinationWarehouseName: string
    productName: string
    quantity: number
    status: string
    createdAt: string
}

interface Product {
    id: number
    name: string
}

const Warehouses = () => {
    const [warehouses, setWarehouses] = useState<Warehouse[]>([])
    const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null)
    const [warehouseStock, setWarehouseStock] = useState<WarehouseStock[]>([])
    const [transfers, setTransfers] = useState<StockTransfer[]>([])
    const [products, setProducts] = useState<Product[]>([])
    const [loading, setLoading] = useState(true)
    const [activeTab, setActiveTab] = useState<'warehouses' | 'stock' | 'transfers'>('warehouses')
    const [showForm, setShowForm] = useState(false)
    const [showTransferForm, setShowTransferForm] = useState(false)
    const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
    const [formData, setFormData] = useState({
        name: '', code: '', address: '', city: '', country: '',
        contactPhone: '', managerName: '', isActive: true, isPrimary: false
    })
    const [transferForm, setTransferForm] = useState({
        sourceWarehouseId: 0, destinationWarehouseId: 0, productId: 0, quantity: 1, notes: ''
    })
    const navigate = useNavigate()

    const fetchData = async () => {
        try {
            setLoading(true)
            const [warehousesData, transfersData, productsData] = await Promise.all([
                getWarehouses(),
                getStockTransfers(),
                getProducts()
            ])
            setWarehouses(warehousesData)
            setTransfers(transfersData)
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

    const handleSelectWarehouse = async (warehouse: Warehouse) => {
        setSelectedWarehouse(warehouse)
        setActiveTab('stock')
        try {
            const stock = await getWarehouseStock(warehouse.id)
            setWarehouseStock(stock)
        } catch (error) {
            console.error('Error fetching stock:', error)
        }
    }

    const handleSubmitWarehouse = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            if (editingWarehouse) {
                await updateWarehouse(editingWarehouse.id, formData)
            } else {
                await createWarehouse(formData)
            }
            setShowForm(false)
            setEditingWarehouse(null)
            setFormData({ name: '', code: '', address: '', city: '', country: '', contactPhone: '', managerName: '', isActive: true, isPrimary: false })
            fetchData()
        } catch (error) {
            console.error('Error saving warehouse:', error)
        }
    }

    const handleDeleteWarehouse = async (id: number) => {
        if (confirm('Are you sure you want to delete this warehouse?')) {
            try {
                await deleteWarehouse(id)
                fetchData()
            } catch (error) {
                console.error('Error deleting warehouse:', error)
            }
        }
    }

    const handleSubmitTransfer = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await createStockTransfer(transferForm)
            setShowTransferForm(false)
            setTransferForm({ sourceWarehouseId: 0, destinationWarehouseId: 0, productId: 0, quantity: 1, notes: '' })
            fetchData()
        } catch (error) {
            console.error('Error creating transfer:', error)
            alert('Failed to create transfer. Check stock availability.')
        }
    }

    const handleCompleteTransfer = async (id: number) => {
        try {
            await completeTransfer(id)
            fetchData()
        } catch (error) {
            console.error('Error completing transfer:', error)
        }
    }

    const handleCancelTransfer = async (id: number) => {
        if (confirm('Cancel this transfer and return stock to source?')) {
            try {
                await cancelTransfer(id)
                fetchData()
            } catch (error) {
                console.error('Error cancelling transfer:', error)
            }
        }
    }

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'InTransit': return { backgroundColor: '#3b82f6', color: 'white' }
            case 'Completed': return { backgroundColor: '#10b981', color: 'white' }
            case 'Cancelled': return { backgroundColor: '#6b7280', color: 'white' }
            default: return { backgroundColor: '#f59e0b', color: 'white' }
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>🏭 Warehouse Management</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Dashboard</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'warehouses' as const, label: `🏭 Warehouses (${warehouses.length})` },
                    { id: 'stock' as const, label: `📦 Stock ${selectedWarehouse ? `- ${selectedWarehouse.name}` : ''}` },
                    { id: 'transfers' as const, label: `🔄 Transfers (${transfers.length})` }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 20px', backgroundColor: activeTab === tab.id ? '#4f46e5' : '#e5e7eb',
                        color: activeTab === tab.id ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Warehouses Tab */}
            {activeTab === 'warehouses' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Warehouses</h2>
                        <button onClick={() => { setShowForm(true); setEditingWarehouse(null); setFormData({ name: '', code: '', address: '', city: '', country: '', contactPhone: '', managerName: '', isActive: true, isPrimary: false }); }} style={{ padding: '8px 16px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Add Warehouse</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px' }}>
                        {warehouses.map(warehouse => (
                            <div key={warehouse.id} onClick={() => handleSelectWarehouse(warehouse)} style={{
                                padding: '16px', borderRadius: '8px', border: `2px solid ${warehouse.isPrimary ? '#4f46e5' : '#e5e7eb'}`,
                                cursor: 'pointer', backgroundColor: warehouse.isPrimary ? '#f5f3ff' : 'white', transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h3 style={{ fontWeight: '600', fontSize: '16px' }}>{warehouse.name}</h3>
                                    {warehouse.isPrimary && <span style={{ backgroundColor: '#4f46e5', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px' }}>PRIMARY</span>}
                                </div>
                                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '8px' }}>{warehouse.code} • {warehouse.city || 'No location'}</p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
                                    <span><strong>{warehouse.totalProducts}</strong> products</span>
                                    <span><strong>{warehouse.totalStock}</strong> units</span>
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                    <button onClick={(e) => { e.stopPropagation(); setEditingWarehouse(warehouse); setFormData({ name: warehouse.name, code: warehouse.code || '', address: warehouse.address || '', city: warehouse.city || '', country: warehouse.country || '', contactPhone: warehouse.contactPhone || '', managerName: warehouse.managerName || '', isActive: warehouse.isActive, isPrimary: warehouse.isPrimary }); setShowForm(true); }} style={{ padding: '4px 8px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Edit</button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDeleteWarehouse(warehouse.id); }} style={{ padding: '4px 8px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Tab */}
            {activeTab === 'stock' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedWarehouse ? `${selectedWarehouse.name} Stock` : 'Select a warehouse'}</h2>
                    </div>
                    {!selectedWarehouse ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                            <p>Please select a warehouse from the Warehouses tab to view stock</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ backgroundColor: '#f9fafb' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Reorder Level</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouseStock.map(stock => (
                                    <tr key={stock.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{stock.productName}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>{stock.quantity}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{stock.reorderLevel}</td>
                                        <td style={{ padding: '12px 16px', color: '#6b7280' }}>{stock.location || '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: stock.isLowStock ? '#fef2f2' : '#f0fdf4', color: stock.isLowStock ? '#dc2626' : '#16a34a' }}>
                                                {stock.isLowStock ? 'Low Stock' : 'OK'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Transfers Tab */}
            {activeTab === 'transfers' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Stock Transfers</h2>
                        <button onClick={() => setShowTransferForm(true)} style={{ padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ New Transfer</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ backgroundColor: '#f9fafb' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>From → To</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map(transfer => (
                                <tr key={transfer.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{transfer.productName}</td>
                                    <td style={{ padding: '12px 16px' }}>{transfer.sourceWarehouseName} → {transfer.destinationWarehouseName}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>{transfer.quantity}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ ...getStatusStyle(transfer.status), padding: '4px 12px', borderRadius: '9999px', fontSize: '12px' }}>{transfer.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        {transfer.status === 'InTransit' && (
                                            <>
                                                <button onClick={() => handleCompleteTransfer(transfer.id)} style={{ marginRight: '8px', padding: '4px 8px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Complete</button>
                                                <button onClick={() => handleCancelTransfer(transfer.id)} style={{ padding: '4px 8px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Cancel</button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Warehouse Form Modal */}
            {showForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h3>
                        <form onSubmit={handleSubmitWarehouse}>
                            <input type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Code (e.g., WH-01)" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <input type="text" placeholder="Manager Name" value={formData.managerName} onChange={e => setFormData({ ...formData, managerName: e.target.value })} style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                                <input type="checkbox" checked={formData.isPrimary} onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })} style={{ marginRight: '8px' }} /> Primary Warehouse
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Save</button>
                                <button type="button" onClick={() => setShowForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Form Modal */}
            {showTransferForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '12px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>New Stock Transfer</h3>
                        <form onSubmit={handleSubmitTransfer}>
                            <select value={transferForm.sourceWarehouseId} onChange={e => setTransferForm({ ...transferForm, sourceWarehouseId: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="">From Warehouse</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <select value={transferForm.destinationWarehouseId} onChange={e => setTransferForm({ ...transferForm, destinationWarehouseId: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="">To Warehouse</option>
                                {warehouses.filter(w => w.id !== transferForm.sourceWarehouseId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <select value={transferForm.productId} onChange={e => setTransferForm({ ...transferForm, productId: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }}>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input type="number" placeholder="Quantity" min="1" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) })} required style={{ width: '100%', padding: '10px', marginBottom: '12px', border: '1px solid #ddd', borderRadius: '6px', boxSizing: 'border-box' }} />
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Create Transfer</button>
                                <button type="button" onClick={() => setShowTransferForm(false)} style={{ flex: 1, padding: '10px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Warehouses
