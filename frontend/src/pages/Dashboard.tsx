import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getProducts } from '@/services/api'

const Dashboard = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  if (isLoading) return <div className="p-6">Loading...</div>
  if (error) return <div className="p-6 text-red-500">Error: {error.message}</div>

  const salesData = products.map((product: any) => ({
    name: product.name,
    sales: product.salesHistories?.reduce((sum: number, sale: any) => sum + sale.quantity, 0) || 0,
  }))

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">StockSenseAI Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Products</h2>
          <ul className="divide-y divide-gray-200">
            {products
              .sort((a: any, b: any) => b.stockCount - a.stockCount)
              .slice(0, 5)
              .map((product: any) => (
                <li key={product.id} className="py-2">
                  <div className="flex justify-between">
                    <span>{product.name}</span>
                    <span className="font-medium">{product.stockCount} in stock</span>
                  </div>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
