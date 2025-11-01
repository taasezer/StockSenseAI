import { useState, useEffect } from 'react'
import { productHubConnection } from '@/services/api'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getProducts } from '@/services/api'
import  Button  from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const Products = () => {
  const queryClient = useQueryClient()
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  })

  useEffect(() => {
    productHubConnection.on("ReceiveProductUpdate", (product) => {
      queryClient.setQueryData(['products'], (oldData: any[]) => {
        const existingIndex = oldData.findIndex(p => p.id === product.id)
        if (existingIndex >= 0) {
          const newData = [...oldData]
          newData[existingIndex] = product
          return newData
        }
        return [...oldData, product]
      })
    })

    productHubConnection.on("ReceiveProductDeleted", (productId) => {
      queryClient.setQueryData(['products'], (oldData: any[]) =>
        oldData.filter(p => p.id !== productId)
      )
    })

    return () => {
      productHubConnection.off("ReceiveProductUpdate")
      productHubConnection.off("ReceiveProductDeleted")
    }
  }, [queryClient])

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Product Management</h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products?.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.id}</TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>${product.price?.toFixed(2)}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>{product.stockCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Products
