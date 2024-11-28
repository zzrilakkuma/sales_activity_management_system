'use client'

import { useState, useEffect } from 'react'
import { SearchForm, SearchParams } from '@/components/orders/SearchForm'
import { OrderTable } from '@/components/orders/OrderTable'
import { OrderListItem } from '@/types/orders'
import { OrderDetailsModal } from '@/components/orders/OrderDetailsModal'

export function OrderListPage() {
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<OrderListItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async (params?: SearchParams) => {
    setIsLoading(true)
    setError(null)

    try {
      const searchParams = new URLSearchParams()
      if (params) {
        if (params.poNumber) searchParams.set('poNumber', params.poNumber)
        if (params.customerName) searchParams.set('customerName', params.customerName)
        if (params.allocation_status) searchParams.set('allocation_status', params.allocation_status)
        if (params.tracking_status) searchParams.set('tracking_status', params.tracking_status)
        if (params.dateRange?.from) searchParams.set('dateFrom', params.dateRange.from.toISOString())
        if (params.dateRange?.to) searchParams.set('dateTo', params.dateRange.to.toISOString())
        if (params.amountRange?.min) searchParams.set('amountMin', params.amountRange.min.toString())
        if (params.amountRange?.max) searchParams.set('amountMax', params.amountRange.max.toString())
      }

      const response = await fetch(`/api/orders?${searchParams.toString()}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to fetch orders')
      }
      
      const data = await response.json()
      setOrders(data.map((order: any) => ({
        ...order,
        customerName: order.customer.name,
        orderDate: new Date(order.orderDate),
        estimatedShipDate: order.estimatedShipDate ? new Date(order.estimatedShipDate) : null,
        tracking_status: order.tracking_status || [],
        allocation_status: order.allocation_status || 'PENDING',
      })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching orders.')
      console.error('Error fetching orders:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (params: SearchParams) => {
    fetchOrders(params)
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Order List</h1>
      <SearchForm onSearch={handleSearch} />
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : (
        <>
          <OrderTable 
            orders={orders} 
            onViewDetails={(order) => {
              setSelectedOrder(order)
              setIsModalOpen(true)
            }}
          />
          <OrderDetailsModal
            order={selectedOrder}
            isOpen={isModalOpen}
            onClose={() => {
              setIsModalOpen(false)
              setSelectedOrder(null)
            }}
          />
        </>
      )}
    </div>
  )
}
