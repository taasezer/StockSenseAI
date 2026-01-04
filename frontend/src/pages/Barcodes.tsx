import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getProducts, generateQRCode, scanBarcode, getProductLabel, generateBulkBarcodes, downloadLabelSheet } from '../services/api'

interface Product {
    id: number
    name: string
    sku: string | null
}

interface BarcodeResult {
    productId: number
    productName: string
    sku: string | null
    barcodeData: string
    imageBase64: string
}

interface ScanResult {
    found: boolean
    productId: number | null
    productName: string | null
    sku: string | null
    stockCount: number | null
    price: number | null
    warehouseLocation: string | null
    message: string
}

interface ProductLabel {
    productId: number
    productName: string
    sku: string | null
    price: number
    qrCodeBase64: string
    barcodeBase64: string
}

const Barcodes = () => {
    const [products, setProducts] = useState<Product[]>([])
    const [selectedProducts, setSelectedProducts] = useState<number[]>([])
    const [generatedBarcodes, setGeneratedBarcodes] = useState<BarcodeResult[]>([])
    const [scanCode, setScanCode] = useState('')
    const [scanResult, setScanResult] = useState<ScanResult | null>(null)
    const [selectedLabel, setSelectedLabel] = useState<ProductLabel | null>(null)
    const [loading, setLoading] = useState(true)
    const [generating, setGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<'generate' | 'scan' | 'labels'>('generate')
    const navigate = useNavigate()

    useEffect(() => {
        fetchProducts()
    }, [])

    const fetchProducts = async () => {
        try {
            setLoading(true)
            const data = await getProducts()
            setProducts(data)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const toggleProductSelection = (productId: number) => {
        setSelectedProducts(prev =>
            prev.includes(productId)
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        )
    }

    const handleGenerateBarcodes = async () => {
        if (selectedProducts.length === 0) return
        try {
            setGenerating(true)
            const barcodes = await generateBulkBarcodes(selectedProducts, 'QR')
            setGeneratedBarcodes(barcodes)
        } catch (error) {
            console.error('Error generating barcodes:', error)
        } finally {
            setGenerating(false)
        }
    }

    const handleScan = async () => {
        if (!scanCode.trim()) return
        try {
            const result = await scanBarcode(scanCode)
            setScanResult(result)
        } catch (error) {
            console.error('Error scanning:', error)
            setScanResult({ found: false, message: 'Error scanning barcode', productId: null, productName: null, sku: null, stockCount: null, price: null, warehouseLocation: null })
        }
    }

    const handleViewLabel = async (productId: number) => {
        try {
            const label = await getProductLabel(productId)
            setSelectedLabel(label)
            setActiveTab('labels')
        } catch (error) {
            console.error('Error getting label:', error)
        }
    }

    const handleDownloadLabels = async () => {
        if (selectedProducts.length === 0) {
            alert('Please select at least one product')
            return
        }
        try {
            await downloadLabelSheet(selectedProducts)
        } catch (error) {
            console.error('Error downloading labels:', error)
        }
    }

    if (loading) return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>

    return (
        <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>📱 Barcode & QR Center</h1>
                <button onClick={() => navigate('/dashboard')} style={{ padding: '10px 20px', backgroundColor: '#6b7280', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>← Dashboard</button>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
                {[
                    { id: 'generate' as const, label: '🔲 Generate Barcodes' },
                    { id: 'scan' as const, label: '📷 Scan Product' },
                    { id: 'labels' as const, label: '🏷️ Product Labels' }
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                        padding: '10px 20px', backgroundColor: activeTab === tab.id ? '#4f46e5' : '#e5e7eb',
                        color: activeTab === tab.id ? 'white' : '#374151', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'
                    }}>{tab.label}</button>
                ))}
            </div>

            {/* Generate Tab */}
            {activeTab === 'generate' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Product Selection */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Select Products ({selectedProducts.length})</h2>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button onClick={handleGenerateBarcodes} disabled={selectedProducts.length === 0 || generating} style={{ padding: '8px 16px', backgroundColor: selectedProducts.length > 0 ? '#4f46e5' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed' }}>
                                    {generating ? 'Generating...' : 'Generate QR'}
                                </button>
                                <button onClick={handleDownloadLabels} disabled={selectedProducts.length === 0} style={{ padding: '8px 16px', backgroundColor: selectedProducts.length > 0 ? '#10b981' : '#9ca3af', color: 'white', border: 'none', borderRadius: '6px', cursor: selectedProducts.length > 0 ? 'pointer' : 'not-allowed' }}>
                                    📄 Download PDF
                                </button>
                            </div>
                        </div>
                        <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '8px' }}>
                            {products.map(product => (
                                <div key={product.id} onClick={() => toggleProductSelection(product.id)} style={{
                                    padding: '12px', margin: '4px 0', borderRadius: '6px', cursor: 'pointer',
                                    backgroundColor: selectedProducts.includes(product.id) ? '#eef2ff' : 'white',
                                    border: `2px solid ${selectedProducts.includes(product.id) ? '#4f46e5' : '#e5e7eb'}`,
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <p style={{ fontWeight: '500', marginBottom: '4px' }}>{product.name}</p>
                                        <p style={{ fontSize: '12px', color: '#6b7280' }}>SKU: {product.sku || 'N/A'}</p>
                                    </div>
                                    <input type="checkbox" checked={selectedProducts.includes(product.id)} readOnly style={{ width: '20px', height: '20px' }} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Generated Barcodes */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e5e7eb' }}>
                            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Generated QR Codes ({generatedBarcodes.length})</h2>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', padding: '16px', maxHeight: '400px', overflowY: 'auto' }}>
                            {generatedBarcodes.map(barcode => (
                                <div key={barcode.productId} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px', textAlign: 'center' }}>
                                    <img src={`data:image/png;base64,${barcode.imageBase64}`} alt={barcode.productName} style={{ width: '120px', height: '120px', marginBottom: '8px' }} />
                                    <p style={{ fontWeight: '500', fontSize: '14px', marginBottom: '4px' }}>{barcode.productName}</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>{barcode.barcodeData}</p>
                                    <button onClick={() => handleViewLabel(barcode.productId)} style={{ marginTop: '8px', padding: '4px 12px', backgroundColor: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}>View Label</button>
                                </div>
                            ))}
                            {generatedBarcodes.length === 0 && (
                                <div style={{ gridColumn: 'span 2', padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                                    <p style={{ fontSize: '48px', marginBottom: '16px' }}>🔲</p>
                                    <p>Select products and click "Generate QR" to create barcodes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Scan Tab */}
            {activeTab === 'scan' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    {/* Scanner Input */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>📷 Scan Barcode</h2>
                        <p style={{ color: '#6b7280', marginBottom: '16px' }}>Enter or scan a barcode/QR code to look up product information</p>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <input type="text" placeholder="Enter barcode data (e.g., STOCK:1 or SKU)" value={scanCode} onChange={e => setScanCode(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleScan()} style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '6px', fontSize: '16px' }} />
                            <button onClick={handleScan} style={{ padding: '12px 24px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Search</button>
                        </div>
                        <p style={{ marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>Try: "STOCK:1" or any product SKU</p>
                    </div>

                    {/* Scan Result */}
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Scan Result</h2>
                        {scanResult ? (
                            scanResult.found ? (
                                <div style={{ padding: '16px', backgroundColor: '#f0fdf4', borderRadius: '8px', border: '2px solid #10b981' }}>
                                    <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#10b981', marginBottom: '12px' }}>✓ Product Found!</h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div><strong>Name:</strong> {scanResult.productName}</div>
                                        <div><strong>SKU:</strong> {scanResult.sku || 'N/A'}</div>
                                        <div><strong>Stock:</strong> {scanResult.stockCount} units</div>
                                        <div><strong>Price:</strong> ${scanResult.price?.toFixed(2)}</div>
                                        <div style={{ gridColumn: 'span 2' }}><strong>Location:</strong> {scanResult.warehouseLocation || 'Not assigned'}</div>
                                    </div>
                                    <button onClick={() => navigate(`/products`)} style={{ marginTop: '12px', padding: '8px 16px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>View Product Details</button>
                                </div>
                            ) : (
                                <div style={{ padding: '16px', backgroundColor: '#fef2f2', borderRadius: '8px', border: '2px solid #dc2626' }}>
                                    <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>✗ Not Found</h3>
                                    <p style={{ color: '#4b5563' }}>{scanResult.message}</p>
                                </div>
                            )
                        ) : (
                            <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                                <p style={{ fontSize: '48px', marginBottom: '16px' }}>📷</p>
                                <p>Enter a barcode to see product information</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Labels Tab */}
            {activeTab === 'labels' && (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', padding: '24px' }}>
                    <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>🏷️ Product Label Preview</h2>
                    {selectedLabel ? (
                        <div style={{ display: 'flex', gap: '32px', alignItems: 'start' }}>
                            {/* Label Preview */}
                            <div style={{ padding: '24px', border: '2px solid #1f2937', borderRadius: '8px', backgroundColor: 'white', width: '300px' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>{selectedLabel.productName}</h3>
                                <p style={{ color: '#6b7280', marginBottom: '4px' }}>SKU: {selectedLabel.sku || 'N/A'}</p>
                                <p style={{ fontSize: '24px', fontWeight: '700', color: '#10b981', marginBottom: '16px' }}>${selectedLabel.price.toFixed(2)}</p>
                                <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                                    <div style={{ textAlign: 'center' }}>
                                        <img src={`data:image/png;base64,${selectedLabel.qrCodeBase64}`} alt="QR Code" style={{ width: '100px', height: '100px' }} />
                                        <p style={{ fontSize: '10px', color: '#9ca3af' }}>QR Code</p>
                                    </div>
                                </div>
                            </div>
                            {/* Info */}
                            <div style={{ flex: 1 }}>
                                <h4 style={{ fontWeight: '600', marginBottom: '12px' }}>Label Information</h4>
                                <p style={{ marginBottom: '8px' }}><strong>Product ID:</strong> {selectedLabel.productId}</p>
                                <p style={{ marginBottom: '16px' }}><strong>Barcode Data:</strong> STOCK:{selectedLabel.productId}</p>
                                <button onClick={() => downloadLabelSheet([selectedLabel.productId])} style={{ padding: '10px 20px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>📄 Download as PDF</button>
                            </div>
                        </div>
                    ) : (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#6b7280' }}>
                            <p style={{ fontSize: '48px', marginBottom: '16px' }}>🏷️</p>
                            <p>Generate barcodes and click "View Label" to preview a product label</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default Barcodes
