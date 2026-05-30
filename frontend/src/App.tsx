import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Alerts from './pages/Alerts'
import Suppliers from './pages/Suppliers'
import Reports from './pages/Reports'
import AIInsights from './pages/AIInsights'
import Warehouses from './pages/Warehouses'
import Barcodes from './pages/Barcodes'
import Integrations from './pages/Integrations'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import Staff from './pages/Staff'
import Shipments from './pages/Shipments'
import Messages from './pages/Messages'
import PlaceholderPage from './pages/PlaceholderPage'
import { useEffect } from 'react'
import { startSignalRConnection } from './services/api'
import { LanguageProvider } from './contexts/LanguageContext'
import { ThemeProvider } from './contexts/ThemeContext'
import MainLayout from './components/layout/MainLayout'

function App() {
  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      startSignalRConnection()
    }
  }, [])

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected Routes inside MainLayout */}
          <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
          <Route path="/products" element={<MainLayout><Products /></MainLayout>} />
          <Route path="/alerts" element={<MainLayout><Alerts /></MainLayout>} />
          <Route path="/suppliers" element={<MainLayout><Suppliers /></MainLayout>} />
          <Route path="/reports" element={<MainLayout><Reports /></MainLayout>} />
          <Route path="/ai-insights" element={<MainLayout><AIInsights /></MainLayout>} />
          <Route path="/warehouses" element={<MainLayout><Warehouses /></MainLayout>} />
          <Route path="/barcodes" element={<MainLayout><Barcodes /></MainLayout>} />
          <Route path="/integrations" element={<MainLayout><Integrations /></MainLayout>} />
          <Route path="/tasks" element={<MainLayout><Tasks /></MainLayout>} />
          <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
          <Route path="/staff" element={<MainLayout><Staff /></MainLayout>} />
          <Route path="/shipments" element={<MainLayout><Shipments /></MainLayout>} />
          <Route path="/messages" element={<MainLayout><Messages /></MainLayout>} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </LanguageProvider>
    </ThemeProvider>
  )
}

export default App








