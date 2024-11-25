'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Loader2, FileIcon, Download, Edit, Check, X } from 'lucide-react'
import { format } from 'date-fns'
import { formatCurrency } from '@/lib/utils/format'

interface OrderDetailsModalProps {
  orderId: number
  showModal: boolean
  onClose: () => void
}

// Mock data - replace with actual data fetching logic
const mockOrderDetails = {
  customer: {
    name: "Acme Corp",
    email: "contact@acmecorp.com",
    phone: "+1 (555) 123-4567"
  },
  items: [
    { id: 1, name: "Product A", quantity: 2, price: 100, subtotal: 200, status: "Allocated" },
    { id: 2, name: "Product B", quantity: 1, price: 150, subtotal: 150, status: "Pending" }
  ],
  shipping: {
    terms: "FOB",
    trackingNumber: "1Z999AA1234567890",
    etd: new Date("2024-03-15"),
    eta: new Date("2024-03-20"),
    status: "In Transit"
  },
  documents: [
    { name: "Invoice.pdf", uploadTime: new Date("2024-02-20T10:30:00") },
    { name: "PackingList.pdf", uploadTime: new Date("2024-02-20T11:15:00") }
  ],
  timeline: [
    { id: 1, action: "Order Created", timestamp: new Date("2024-02-19T09:00:00") },
    { id: 2, action: "Payment Received", timestamp: new Date("2024-02-20T14:30:00") },
    { id: 3, action: "Shipment Prepared", timestamp: new Date("2024-03-01T11:45:00") }
  ]
}

export function OrderDetailsModal({ orderId, showModal, onClose }: OrderDetailsModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [orderDetails, setOrderDetails] = useState(mockOrderDetails)

  // Simulated data fetching
  const fetchOrderDetails = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setOrderDetails(mockOrderDetails)
    } catch (err) {
      setError("Failed to load order details. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleSave = () => {
    // Implement save logic here
    setIsEditing(false)
  }

  const handleCancel = () => {
    // Reset any changes
    setIsEditing(false)
  }

  if (!showModal) return null

  return (
    <Dialog open={showModal} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details - {orderId}</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : (
          <div className="space-y-6">
            {/* Customer Info Card */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Customer Information</CardTitle>
                {!isEditing ? (
                  <Button variant="outline" size="sm" onClick={handleEdit}>
                    <Edit className="h-4 w-4 mr-2" /> Edit
                  </Button>
                ) : (
                  <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={handleSave}>
                      <Check className="h-4 w-4 mr-2" /> Save
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Name:</p>
                    <p>{orderDetails.customer.name}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Email:</p>
                    <p>{orderDetails.customer.email}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Phone:</p>
                    <p>{orderDetails.customer.phone}</p>
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
                      <TableHead>Quantity</TableHead>
                      <TableHead>Unit Price</TableHead>
                      <TableHead>Subtotal</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderDetails.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(item.price)}</TableCell>
                        <TableCell>{formatCurrency(item.subtotal)}</TableCell>
                        <TableCell>
                          <Badge variant={
                            item.status === "Allocated" ? "success" :
                            item.status === "Pending" ? "warning" :
                            item.status === "OutOfStock" ? "destructive" :
                            "secondary"
                          }>
                            {item.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Shipping Details Card */}
            <Card>
              <CardHeader>
                <CardTitle>Shipping Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-semibold">Terms:</p>
                    <p>{orderDetails.shipping.terms}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Tracking Number:</p>
                    <p>{orderDetails.shipping.trackingNumber}</p>
                  </div>
                  <div>
                    <p className="font-semibold">ETD:</p>
                    <p>{format(orderDetails.shipping.etd, 'PPP')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">ETA:</p>
                    <p>{format(orderDetails.shipping.eta, 'PPP')}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <Badge variant="outline">{orderDetails.shipping.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Document Section */}
            <Card>
              <CardHeader>
                <CardTitle>Documents</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {orderDetails.documents.map((doc, index) => (
                    <li key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileIcon className="h-5 w-5 mr-2" />
                        <span>{doc.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-500">
                          {format(doc.uploadTime, 'PPP')}
                        </span>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" /> Download
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Timeline Component */}
            <Card>
              <CardHeader>
                <CardTitle>Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {orderDetails.timeline.map((event) => (
                    <li key={event.id} className="flex items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                        <span className="text-white text-lg font-bold">{event.id}</span>
                      </div>
                      <div className="ml-4">
                        <p className="font-semibold">{event.action}</p>
                        <p className="text-sm text-gray-500">{format(event.timestamp, 'PPP p')}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
