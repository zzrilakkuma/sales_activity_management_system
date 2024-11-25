export interface OrderListItem {
  id: number
  poNumber: string
  customerName: string  // Added for display in table
  customer: {
    id: number
    name: string
    email: string
    phone: string
    address: string
  }
  orderDate: Date
  totalAmount: number
  status: string
  estimatedShipDate: Date | null
  orderItems: {
    id: number
    quantity: number
    unitPrice: number
    product: {
      id: number
      name: string
      sku: string
      description: string | null
    }
  }[]
  shipments: {
    id: number
    trackingNumber: string
    status: string
    estimatedDeliveryDate: Date
    actualDeliveryDate: Date | null
  }[]
}
