import axios from 'axios'
import * as signalR from '@microsoft/signalr'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
})

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// SignalR connection - lazy initialization
export const productHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/productHub`, {
    accessTokenFactory: () => localStorage.getItem('token') || ''
  })
  .withAutomaticReconnect()
  .build()

// Flag to track connection status
let isSignalRConnected = false

// Start connection - call this after login
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

// Stop connection - call on logout
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

// API functions
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

// Alert API functions
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

// SignalR event listeners
productHubConnection.on("ReceiveProductUpdate", (product) => {
  console.log("Product updated:", product)
})

productHubConnection.on("ReceiveSalesPrediction", (productId, prediction) => {
  console.log(`Prediction for product ${productId}:`, prediction)
})

productHubConnection.on("ReceiveProductDeleted", (productId) => {
  console.log(`Product ${productId} deleted`)
})
