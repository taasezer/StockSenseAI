import axios from 'axios'
import * as signalR from '@microsoft/signalr'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const api = axios.create({
    baseURL: `${API_URL}/api`,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export const productHubConnection = new signalR.HubConnectionBuilder()
    .withUrl(`${API_URL}/productHub`, {
        accessTokenFactory: () => localStorage.getItem('token') || ''
    })
    .withAutomaticReconnect()
    .build()

let isSignalRConnected = false

export const startSignalRConnection = async () => {
    if (isSignalRConnected) return
    try {
        await productHubConnection.start()
        isSignalRConnected = true
        console.log('SignalR Connected')
    } catch (err) {
        console.error('SignalR Connection Error:', err)
    }
}

export const stopSignalRConnection = async () => {
    if (!isSignalRConnected) return
    try {
        await productHubConnection.stop()
        isSignalRConnected = false
        console.log('SignalR Disconnected')
    } catch (err) {
        console.error('SignalR Disconnect Error:', err)
    }
}

export const getProducts = async () => {
    const response = await api.get('/products')
    return response.data
}

export const createProduct = async (product: any) => {
    const response = await api.post('/products', product)
    return response.data
}

export const updateProduct = async (id: number, product: any) => {
    const response = await api.put(`/products/${id}`, product)
    return response.data
}

export const deleteProduct = async (id: number) => {
    const response = await api.delete(`/products/${id}`)
    return response.data
}

export const predictSales = async (id: number) => {
    const response = await api.post(`/products/${id}/predict`)
    return response.data
}

export const generateDescription = async (id: number) => {
    const response = await api.post(`/products/${id}/generate-description`)
    return response.data
}

export const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password })
    return response.data
}

export const register = async (username: string, password: string) => {
    const response = await api.post('/auth/register', { username, password })
    return response.data
}

export const getAlertSummary = async () => {
    const response = await api.get('/alerts/summary')
    return response.data
}

export const getLowStockProducts = async () => {
    const response = await api.get('/alerts/low-stock')
    return response.data
}

export const getActiveAlerts = async () => {
    const response = await api.get('/alerts/active')
    return response.data
}

export const checkAlerts = async () => {
    const response = await api.post('/alerts/check')
    return response.data
}

export const getAlertSettings = async () => {
    const response = await api.get('/alerts/settings')
    return response.data
}

export const updateAlertSettings = async (settings: any) => {
    const response = await api.put('/alerts/settings', settings)
    return response.data
}

export const markAlertAsRead = async (id: number) => {
    const response = await api.patch(`/alerts/${id}/read`)
    return response.data
}

export const resolveAlert = async (id: number) => {
    const response = await api.patch(`/alerts/${id}/resolve`)
    return response.data
}

export const getSuppliers = async () => {
    const response = await api.get('/suppliers')
    return response.data
}

export const getSupplier = async (id: number) => {
    const response = await api.get(`/suppliers/${id}`)
    return response.data
}

export const createSupplier = async (supplier: any) => {
    const response = await api.post('/suppliers', supplier)
    return response.data
}

export const updateSupplier = async (id: number, supplier: any) => {
    const response = await api.put(`/suppliers/${id}`, supplier)
    return response.data
}

export const deleteSupplier = async (id: number) => {
    const response = await api.delete(`/suppliers/${id}`)
    return response.data
}

export const getShipments = async () => {
    const response = await api.get('/shipments')
    return response.data
}

export const getPendingShipments = async () => {
    const response = await api.get('/shipments/pending')
    return response.data
}

export const createShipment = async (shipment: any) => {
    const response = await api.post('/shipments', shipment)
    return response.data
}

export const updateShipmentStatus = async (id: number, status: string) => {
    const response = await api.patch(`/shipments/${id}/status`, { status })
    return response.data
}

export const markShipmentDelivered = async (id: number) => {
    const response = await api.post(`/shipments/${id}/deliver`)
    return response.data
}

export const cancelShipment = async (id: number) => {
    const response = await api.post(`/shipments/${id}/cancel`)
    return response.data
}

const downloadBlob = (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

export const getReportSummary = async () => {
    const response = await api.get('/reports/summary')
    return response.data
}

export const downloadInventoryReport = async () => {
    const response = await api.get('/reports/inventory/pdf', { responseType: 'blob' })
    downloadBlob(response.data, `inventory-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const downloadLowStockReport = async () => {
    const response = await api.get('/reports/low-stock/pdf', { responseType: 'blob' })
    downloadBlob(response.data, `low-stock-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const downloadSupplierReport = async () => {
    const response = await api.get('/reports/suppliers/pdf', { responseType: 'blob' })
    downloadBlob(response.data, `supplier-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const downloadShipmentReport = async () => {
    const response = await api.get('/reports/shipments/pdf', { responseType: 'blob' })
    downloadBlob(response.data, `shipment-report-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const getAIInsights = async () => {
    const response = await api.get('/ai-insights')
    return response.data
}

export const getPriceOptimization = async (productId: number) => {
    const response = await api.get(`/ai-insights/price-optimization/${productId}`)
    return response.data
}

export const getAllPriceOptimizations = async () => {
    const response = await api.get('/ai-insights/price-optimizations')
    return response.data
}

export const getTrendAnalysis = async (productId: number) => {
    const response = await api.get(`/ai-insights/trends/${productId}`)
    return response.data
}

export const getAnomalies = async () => {
    const response = await api.get('/ai-insights/anomalies')
    return response.data
}

export const getWarehouses = async () => {
    const response = await api.get('/warehouses')
    return response.data
}

export const getWarehouse = async (id: number) => {
    const response = await api.get(`/warehouses/${id}`)
    return response.data
}

export const createWarehouse = async (warehouse: any) => {
    const response = await api.post('/warehouses', warehouse)
    return response.data
}

export const updateWarehouse = async (id: number, warehouse: any) => {
    const response = await api.put(`/warehouses/${id}`, warehouse)
    return response.data
}

export const deleteWarehouse = async (id: number) => {
    const response = await api.delete(`/warehouses/${id}`)
    return response.data
}

export const getWarehouseStock = async (warehouseId: number) => {
    const response = await api.get(`/warehouses/${warehouseId}/stock`)
    return response.data
}

export const addWarehouseStock = async (warehouseId: number, stock: any) => {
    const response = await api.post(`/warehouses/${warehouseId}/stock`, stock)
    return response.data
}

export const getStockTransfers = async () => {
    const response = await api.get('/warehouses/transfers')
    return response.data
}

export const createStockTransfer = async (transfer: any) => {
    const response = await api.post('/warehouses/transfers', transfer)
    return response.data
}

export const completeTransfer = async (id: number) => {
    const response = await api.post(`/warehouses/transfers/${id}/complete`)
    return response.data
}

export const cancelTransfer = async (id: number) => {
    const response = await api.post(`/warehouses/transfers/${id}/cancel`)
    return response.data
}

export const generateQRCode = async (productId: number, size: number = 200) => {
    const response = await api.get(`/barcodes/qr/${productId}?size=${size}`)
    return response.data
}

export const scanBarcode = async (code: string) => {
    const response = await api.get(`/barcodes/scan?code=${encodeURIComponent(code)}`)
    return response.data
}

export const getProductLabel = async (productId: number) => {
    const response = await api.get(`/barcodes/label/${productId}`)
    return response.data
}

export const generateBulkBarcodes = async (productIds: number[], barcodeType: string = 'QR') => {
    const response = await api.post('/barcodes/bulk', { productIds, barcodeType })
    return response.data
}

export const downloadLabelSheet = async (productIds: number[]) => {
    const response = await api.post('/barcodes/labels/pdf', { productIds }, { responseType: 'blob' })
    downloadBlob(response.data, `product-labels-${new Date().toISOString().split('T')[0]}.pdf`)
}

export const getIntegrationDashboard = async () => {
    const response = await api.get('/integrations/dashboard')
    return response.data
}

export const getWebhooks = async () => {
    const response = await api.get('/integrations/webhooks')
    return response.data
}

export const createWebhook = async (webhook: any) => {
    const response = await api.post('/integrations/webhooks', webhook)
    return response.data
}

export const updateWebhook = async (id: number, webhook: any) => {
    const response = await api.put(`/integrations/webhooks/${id}`, webhook)
    return response.data
}

export const deleteWebhook = async (id: number) => {
    const response = await api.delete(`/integrations/webhooks/${id}`)
    return response.data
}

export const testWebhook = async (id: number) => {
    const response = await api.post(`/integrations/webhooks/${id}/test`)
    return response.data
}

export const getWebhookLogs = async (webhookId?: number, limit: number = 50) => {
    const params = new URLSearchParams()
    if (webhookId) params.append('webhookId', webhookId.toString())
    params.append('limit', limit.toString())
    const response = await api.get(`/integrations/logs?${params}`)
    return response.data
}

export const getExternalOrders = async (status?: string) => {
    const url = status ? `/integrations/orders?status=${status}` : '/integrations/orders'
    const response = await api.get(url)
    return response.data
}

export const updateOrderStatus = async (id: number, status: string) => {
    const response = await api.patch(`/integrations/orders/${id}/status`, { status })
    return response.data
}

productHubConnection.on("ReceiveProductUpdate", (product) => {
    console.log("Product updated:", product)
})

productHubConnection.on("ReceiveSalesPrediction", (productId, prediction) => {
    console.log(`Prediction for product ${productId}:`, prediction)
})

productHubConnection.on("ReceiveProductDeleted", (productId) => {
    console.log(`Product ${productId} deleted`)
})
