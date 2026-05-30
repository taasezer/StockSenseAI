import { useState, useEffect } from 'react'

interface Shipment {
  id: number
  productName: string
  supplierName: string
  quantity: number
  expectedArrival: string
  trackingNumber: string
  status: string
  originLocation: string
  destinationCountryCode: string
  destinationRegionCode: string
  destinationCity: string
}

const Shipments = () => {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [products, setProducts] = useState<any[]>([])
  const [newShipment, setNewShipment] = useState({
    productId: '',
    quantity: 1,
    expectedArrival: '',
    originLocation: '',
    destinationCountryCode: 'TR',
    destinationRegionCode: '01',
    destinationCity: '',
    destinationAddress: '',
    trackingNumber: ''
  })

  useEffect(() => {
    fetchShipments()
    fetchProducts()
  }, [])

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shipments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setShipments(await res.json())
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (res.ok) setProducts(await res.json())
    } catch (err) { console.error(err) }
  }

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const payload = {
        ...newShipment,
        productId: parseInt(newShipment.productId),
        supplierId: parseInt(localStorage.getItem('supplierId') || '1') // Ideally fetched dynamically, but backend uses JWT supplier context
      }
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })
      if (res.ok) {
        setShowAddModal(false)
        fetchShipments()
      } else {
        alert("Failed to create shipment. Make sure you are a supplier.")
      }
    } catch (err) { console.error(err) }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 className="page-title">Global Shipments</h2>
          <p className="page-subtitle">Track incoming products globally</p>
        </div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>+ New Shipment</button>
      </div>

      <div className="stat-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div className="spinner" style={{ margin: '40px auto' }}></div>
        ) : shipments.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>No active shipments.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-dark)', borderBottom: '1px solid var(--border-color)', fontSize: '12px' }}>
                <th style={{ padding: '12px 16px' }}>Tracking #</th>
                <th style={{ padding: '12px 16px' }}>Product</th>
                <th style={{ padding: '12px 16px' }}>Route</th>
                <th style={{ padding: '12px 16px' }}>Expected</th>
                <th style={{ padding: '12px 16px' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {shipments.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div 
                      style={{ fontWeight: 'bold', fontFamily: 'monospace', color: 'var(--brand-red)', cursor: 'pointer' }}
                      title="Click to copy tracking number"
                      onClick={() => {
                        navigator.clipboard.writeText(s.trackingNumber);
                        alert(`Tracking number ${s.trackingNumber} copied to clipboard!`);
                      }}
                    >
                      {s.trackingNumber}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ color: '#fff' }}>{s.productName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.quantity} units</div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ fontSize: '12px', color: '#fff' }}>{s.originLocation || 'Unknown'} ➔ {s.destinationCity || 'HQ'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{s.destinationCountryCode}-{s.destinationRegionCode}</div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: '12px' }}>{new Date(s.expectedArrival).toLocaleDateString()}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold',
                      backgroundColor: s.status === 'Completed' ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                      color: s.status === 'Completed' ? '#10b981' : '#ef4444'
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="stat-card" style={{ width: '500px', padding: '24px' }}>
            <h3 style={{ fontSize: '20px', marginBottom: '16px' }}>Create Logistics Record</h3>
            <form onSubmit={handleCreateShipment} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Product</label>
                  <select required className="input-field" value={newShipment.productId} onChange={e => setNewShipment({...newShipment, productId: e.target.value})}>
                    <option value="">Select...</option>
                    {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Quantity</label>
                  <input required type="number" min="1" className="input-field" value={newShipment.quantity} onChange={e => setNewShipment({...newShipment, quantity: parseInt(e.target.value)})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Expected Arrival</label>
                <input required type="date" className="input-field" value={newShipment.expectedArrival} onChange={e => setNewShipment({...newShipment, expectedArrival: e.target.value})} />
              </div>

              <hr style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Origin (From)</label>
                  <input required type="text" placeholder="e.g. Shenzhen, CN" className="input-field" value={newShipment.originLocation} onChange={e => setNewShipment({...newShipment, originLocation: e.target.value})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Destination City</label>
                  <input required type="text" placeholder="e.g. Adana" className="input-field" value={newShipment.destinationCity} onChange={e => setNewShipment({...newShipment, destinationCity: e.target.value})} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Country Code</label>
                  <input required type="text" placeholder="TR" maxLength={2} className="input-field" value={newShipment.destinationCountryCode} onChange={e => setNewShipment({...newShipment, destinationCountryCode: e.target.value.toUpperCase()})} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Region/City Code</label>
                  <input required type="text" placeholder="01" maxLength={3} className="input-field" value={newShipment.destinationRegionCode} onChange={e => setNewShipment({...newShipment, destinationRegionCode: e.target.value})} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: 'var(--text-muted)' }}>Full Address</label>
                <input type="text" className="input-field" value={newShipment.destinationAddress} onChange={e => setNewShipment({...newShipment, destinationAddress: e.target.value})} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
                <button type="button" className="btn-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn-primary" style={{ flex: 1 }}>Dispatch Shipment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipments
