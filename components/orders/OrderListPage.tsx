'use client'

import { useState } from 'react'
import { SearchForm, SearchParams } from '@/components/orders/SearchForm'
import { OrderTable } from '@/components/orders/OrderTable'
import { OrderListItem } from '@/types/orders'

const sampleOrders: OrderListItem[] = [
  {
    id: 1,
    poNumber: "PO-2024-001",
    customerName: "Customer A",
    orderDate: new Date("2024-01-01"),
    totalAmount: 5000,
    status: "Processing",
    estimatedShipDate: new Date("2024-02-01")
  },
  {
    id: 2,
    poNumber: "PO-2024-002",
    customerName: "Customer B",
    orderDate: new Date("2024-01-15"),
    totalAmount: 7500,
    status: "Shipped",
    estimatedShipDate: new Date("2024-02-15")
  },
  {
    id: 3,
    poNumber: "PO-2024-003",
    customerName: "Customer C",
    orderDate: new Date("2024-02-01"),
    totalAmount: 3000,
    status: "Pending",
    estimatedShipDate: new Date("2024-03-01")
  },
  // Add more sample data as needed
]

export function OrderListPage() {
  const [orders, setOrders] = useState<OrderListItem[]>(sampleOrders)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = (params: SearchParams) => {
    setIsLoading(true)
    setError(null)

    // Simulate API call
    setTimeout(() => {
      try {
        // Filter orders based on search params
        const filteredOrders = sampleOrders.filter(order => {
          if (params.poNumber && !order.poNumber.toLowerCase().includes(params.poNumber.toLowerCase())) return false
          if (params.customerName && !order.customerName.toLowerCase().includes(params.customerName.toLowerCase())) return false
          if (params.dateRange?.from && params.dateRange?.to) {
            const orderDate = new Date(order.orderDate)
            if (orderDate < params.dateRange.from || orderDate > params.dateRange.to) return false
          }
          if (params.status && order.status !== params.status) return false
          if (params.amountRange?.min && order.totalAmount < params.amountRange.min) return false
          if (params.amountRange?.max && order.totalAmount > params.amountRange.max) return false
          return true
        })

        setOrders(filteredOrders)
        setIsLoading(false)
      } catch (err) {
        setError('An error occurred while searching orders.')
        setIsLoading(false)
      }
    }, 1000) // Simulate network delay
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Order List</h1>
      <SearchForm onSearch={handleSearch} />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-lg">Loading...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <OrderTable orders={orders} />
      )}
    </div>
  )
}

