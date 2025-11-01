import axios from 'axios'
import * as signalR from '@microsoft/signalr'

// Backend URL'sini Vercel'in Ortam Değişkenlerinden al
// Örn: 'https://stocksenseai-backend.onrender.com'
const API_URL = import.meta.env.VITE_API_URL;

// Axios instance
const api = axios.create({
  // baseURL'i /api yerine tam adres olarak ayarla
  baseURL: `${API_URL}/api`, 
})

// SignalR connection
export const productHubConnection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_URL}/productHub`)
  .withAutomaticReconnect()
  .build()

// Start connection
productHubConnection.start().catch(err => console.error(err))

// API functions (DEĞİŞİKLİK YOK)
export const getProducts = async () => {
  const response = await api.get('/products')
  return response.data
}

export const predictSales = async (id: number) => {
  const response = await api.post(`/products/${id}/predict`)
  return response.data
}

export const login = async (username: string, password: string) => {
  const response = await api.post('/auth/login', { username, password })
  return response.data
}

// SignalR event listeners (DEĞİŞİKLİK YOK)
productHubConnection.on("ReceiveProductUpdate", (product) => {
  console.log("Product updated:", product)
})

productHubConnection.on("ReceiveSalesPrediction", (productId, prediction) => {
  console.log(`Prediction for product ${productId}:`, prediction)
})

productHubConnection.on("ReceiveProductDeleted", (productId) => {
  console.log(`Product ${productId} deleted`)
})