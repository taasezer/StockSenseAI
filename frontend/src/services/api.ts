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

// SignalR connection
export const productHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/productHub`, {
    accessTokenFactory: () => localStorage.getItem('token') || ''
  })
  .withAutomaticReconnect()
  .build()

// Start connection
productHubConnection.start()
  .then(() => console.log('SignalR Connected'))
  .catch(err => console.error('SignalR Connection Error:', err))

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
