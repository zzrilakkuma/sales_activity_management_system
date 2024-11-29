'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Loader2, FileIcon, Download, Edit, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format'

interface OrderDetailsModalProps {
  order: OrderDetails | null
  isOpen: boolean
  onClose: () => void
}

interface OrderDetails {
  id: number
  poNumber: string
  customerName: string
  orderDate: Date
  totalAmount: number
  tracking_status: string[]
  allocation_status: string
  shippingTerm: string
  estimatedShipDate: Date | null
  actualShipDate: Date | null
  notes: string | null
  customer: {
    id: number
    name: string
    email: string
    phone: string
    address: string
    contactPerson: string
    priceTerm: string
  }
  orderItems: {
    id: number
    quantity: number
    unitPrice: number
    status: string
    allocatedQuantity: number
    product: {
      id: number
      model: string
      asusPn: string
      description: string
      category: string
      unitPrice: number
    }
  }[]
}

export function OrderDetailsModal({ order, isOpen, onClose }: OrderDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleEdit = () => {
    // Implement edit logic here
  }

  const handleSave = () => {
    // Implement save logic here
  }

  const handleCancel = () => {
    onClose()
  }

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'N/A'
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date
      return format(dateObj, 'PPP')
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Invalid Date'
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center items-center p-4">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
            {error}
          </div>
        )}

        {order && (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
                <Button variant="outline" size="sm" onClick={handleEdit}>
                  <Edit className="h-4 w-4 mr-2" /> Edit
                </Button>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{order.customer?.name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{order.customer?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p>{order.customer?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Address:</p>
                    <p>{order.customer?.address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Contact Person:</p>
                    <p>{order.customer?.contactPerson || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Price Term:</p>
                    <p>{order.customer?.priceTerm || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Summary Card */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Date</Label>
                    <p className="text-lg">{formatDate(order.orderDate)}</p>
                  </div>
                  <div>
                    <Label>Total Amount</Label>
                    <p className="text-lg">{order.totalAmount ? formatCurrency(order.totalAmount) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label>Estimated Ship Date</Label>
                    <p className="text-lg">{formatDate(order.estimatedShipDate)}</p>
                  </div>
                  <div>
                    <Label>Actual Ship Date</Label>
                    <p className="text-lg">{formatDate(order.actualShipDate)}</p>
                  </div>
                  <div>
                    <Label>Tracking Status</Label>
                    <p className="text-lg">{order.tracking_status.join(', ')}</p>
                  </div>
                  <div>
                    <Label>Allocation Status</Label>
                    <p className="text-lg">{order.allocation_status}</p>
                  </div>
                  <div>
                    <Label>Shipping Term</Label>
                    <p className="text-lg">{order.shippingTerm}</p>
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <p className="text-lg">{order.notes || 'N/A'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Items Table */}
            <Card>
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>ASUS P/N</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Allocated Quantity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {order.orderItems?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.description || 'N/A'}</TableCell>
                        <TableCell>{item.product?.model || 'N/A'}</TableCell>
                        <TableCell>{item.product?.asusPn || 'N/A'}</TableCell>
                        <TableCell>{item.quantity || 0}</TableCell>
                        <TableCell>{formatCurrency(item.unitPrice || 0)}</TableCell>
                        <TableCell>{formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</TableCell>
                        <TableCell>{item.status}</TableCell>
                        <TableCell>{item.allocatedQuantity}</TableCell>
                      </TableRow>
                    ))}
                    {(!order.orderItems || order.orderItems.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center">No items found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default OrderDetailsModal
