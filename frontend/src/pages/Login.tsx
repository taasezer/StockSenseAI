import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/button'
import Input from '@/components/ui/input'
import { Link } from 'react-router-dom'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
    } catch (error) {
      setError('Invalid username or password')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">StockSenseAI</h1>
        {error && <div className="mb-4 p-3 text-red-500 bg-red-50 border border-red-200 rounded text-center">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Username</label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/register" className="text-blue-600 hover:underline">
            Don't have an account? Register
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Login
