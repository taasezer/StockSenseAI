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
            case 'InTransit': return { backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }
            case 'Completed': return { backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }
            case 'Cancelled': return { backgroundColor: 'rgba(107, 114, 128, 0.1)', color: 'var(--text-muted)' }
            default: return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }
        }
    }

    if (loading) return <div className="spinner" style={{ margin: '40px auto' }}></div>

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 className="page-title" style={{ margin: 0 }}>🏭 Warehouse Management</h1>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'warehouses' as const, label: `🏭 Warehouses (${warehouses.length})` },
                    { id: 'stock' as const, label: `📦 Stock ${selectedWarehouse ? `- ${selectedWarehouse.name}` : ''}` },
                    { id: 'transfers' as const, label: `🔄 Transfers (${transfers.length})` }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "btn-primary" : "btn-outline"} style={{ width: 'auto' }}>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Warehouses Tab */}
            {activeTab === 'warehouses' && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Warehouses</h2>
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => { setShowForm(true); setEditingWarehouse(null); setFormData({ name: '', code: '', address: '', city: '', country: '', contactPhone: '', managerName: '', isActive: true, isPrimary: false }); }}>+ Add Warehouse</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', padding: '16px' }}>
                        {warehouses.map(warehouse => (
                            <div key={warehouse.id} onClick={() => handleSelectWarehouse(warehouse)} style={{
                                padding: '16px', borderRadius: '8px', border: `2px solid ${warehouse.isPrimary ? 'var(--brand-red)' : 'var(--border-color)'}`,
                                cursor: 'pointer', backgroundColor: warehouse.isPrimary ? 'rgba(220, 38, 38, 0.05)' : 'var(--bg-dark)', transition: 'all 0.2s'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <h3 style={{ fontWeight: '600', fontSize: '16px', color: 'var(--text-main)' }}>{warehouse.name}</h3>
                                    {warehouse.isPrimary && <span style={{ backgroundColor: 'var(--brand-red)', color: 'white', padding: '2px 8px', borderRadius: '9999px', fontSize: '10px' }}>PRIMARY</span>}
                                </div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '8px' }}>{warehouse.code} • {warehouse.city || 'No location'}</p>
                                <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: 'var(--text-main)' }}>
                                    <span><strong>{warehouse.totalProducts}</strong> products</span>
                                    <span><strong>{warehouse.totalStock}</strong> units</span>
                                </div>
                                <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                                    <button className="btn-outline" onClick={(e) => { e.stopPropagation(); setEditingWarehouse(warehouse); setFormData({ name: warehouse.name, code: warehouse.code || '', address: warehouse.address || '', city: warehouse.city || '', country: warehouse.country || '', contactPhone: warehouse.contactPhone || '', managerName: warehouse.managerName || '', isActive: warehouse.isActive, isPrimary: warehouse.isPrimary }); setShowForm(true); }} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}>Edit</button>
                                    <button className="btn-outline" onClick={(e) => { e.stopPropagation(); handleDeleteWarehouse(warehouse.id); }} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', borderColor: 'var(--brand-red)', color: 'var(--brand-red)' }}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Stock Tab */}
            {activeTab === 'stock' && (
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>{selectedWarehouse ? `${selectedWarehouse.name} Stock` : 'Select a warehouse'}</h2>
                    </div>
                    {!selectedWarehouse ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            <p>Please select a warehouse from the Warehouses tab to view stock</p>
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Quantity</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Reorder Level</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'left' }}>Location</th>
                                    <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {warehouseStock.map(stock => (
                                    <tr key={stock.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                        <td style={{ padding: '12px 16px', fontWeight: '500' }}>{stock.productName}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>{stock.quantity}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>{stock.reorderLevel}</td>
                                        <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{stock.location || '-'}</td>
                                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                            <span style={{ padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', backgroundColor: stock.isLowStock ? 'rgba(220, 38, 38, 0.1)' : 'rgba(16, 185, 129, 0.1)', color: stock.isLowStock ? 'var(--brand-red)' : '#10b981', fontWeight: 'bold' }}>
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
                <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-dark)' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Stock Transfers</h2>
                        <button className="btn-primary" style={{ width: 'auto' }} onClick={() => setShowTransferForm(true)}>+ New Transfer</button>
                    </div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--text-main)' }}>
                        <thead>
                            <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)' }}>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>Product</th>
                                <th style={{ padding: '12px 16px', textAlign: 'left' }}>From → To</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Status</th>
                                <th style={{ padding: '12px 16px', textAlign: 'center' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transfers.map(transfer => (
                                <tr key={transfer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td style={{ padding: '12px 16px', fontWeight: '500' }}>{transfer.productName}</td>
                                    <td style={{ padding: '12px 16px' }}>{transfer.sourceWarehouseName} → {transfer.destinationWarehouseName}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', fontWeight: '600' }}>{transfer.quantity}</td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{ ...getStatusStyle(transfer.status), padding: '4px 12px', borderRadius: '9999px', fontSize: '12px', fontWeight: 'bold' }}>{transfer.status}</span>
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'center', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                                        {transfer.status === 'InTransit' && (
                                            <>
                                                <button className="btn-outline" onClick={() => handleCompleteTransfer(transfer.id)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto', borderColor: '#10b981', color: '#10b981' }}>Complete</button>
                                                <button className="btn-outline" onClick={() => handleCancelTransfer(transfer.id)} style={{ padding: '4px 8px', fontSize: '12px', width: 'auto' }}>Cancel</button>
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
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="stat-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>{editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}</h3>
                        <form onSubmit={handleSubmitWarehouse} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <input className="input-field" type="text" placeholder="Name *" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                            <input className="input-field" type="text" placeholder="Code (e.g., WH-01)" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} />
                            <input className="input-field" type="text" placeholder="City" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} />
                            <input className="input-field" type="text" placeholder="Manager Name" value={formData.managerName} onChange={e => setFormData({ ...formData, managerName: e.target.value })} />
                            <label style={{ display: 'flex', alignItems: 'center', color: 'var(--text-main)', marginTop: '8px' }}>
                                <input type="checkbox" checked={formData.isPrimary} onChange={e => setFormData({ ...formData, isPrimary: e.target.checked })} style={{ marginRight: '8px', accentColor: 'var(--brand-red)' }} /> Primary Warehouse
                            </label>
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn-outline" onClick={() => setShowForm(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Transfer Form Modal */}
            {showTransferForm && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div className="stat-card" style={{ width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '18px', fontWeight: '600' }}>New Stock Transfer</h3>
                        <form onSubmit={handleSubmitTransfer} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <select className="input-field" value={transferForm.sourceWarehouseId} onChange={e => setTransferForm({ ...transferForm, sourceWarehouseId: parseInt(e.target.value) })} required>
                                <option value="">From Warehouse</option>
                                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <select className="input-field" value={transferForm.destinationWarehouseId} onChange={e => setTransferForm({ ...transferForm, destinationWarehouseId: parseInt(e.target.value) })} required>
                                <option value="">To Warehouse</option>
                                {warehouses.filter(w => w.id !== transferForm.sourceWarehouseId).map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                            </select>
                            <select className="input-field" value={transferForm.productId} onChange={e => setTransferForm({ ...transferForm, productId: parseInt(e.target.value) })} required>
                                <option value="">Select Product</option>
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                            <input className="input-field" type="number" placeholder="Quantity" min="1" value={transferForm.quantity} onChange={e => setTransferForm({ ...transferForm, quantity: parseInt(e.target.value) })} required />
                            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                                <button type="button" className="btn-outline" onClick={() => setShowTransferForm(false)} style={{ flex: 1 }}>Cancel</button>
                                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Create Transfer</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Warehouses
