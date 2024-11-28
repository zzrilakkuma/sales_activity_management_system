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
    contactPerson: string
    priceTerm: string
  }
  orderDate: Date
  totalAmount: number
  tracking_status: string[]  // ["ETD_TRACKING", "MAIL_TRACKING", "ALLOCATION_TRACKING"]
  allocation_status: string  // PENDING/CHECKING/CHECKED/PARTIALLY/FULLY/CANCELLED
  shippingTerm: string
  estimatedShipDate: Date | null
  actualShipDate: Date | null
  notes: string | null
  orderItems: {
    id: number
    quantity: number
    unitPrice: number
    status: string  // PENDING/CHECKED/ALLOCATED
    allocatedQuantity: number
    product: {
      id: number
      model: string
      asusPn: string
      description: string | null
      basePrice: number
    }
  }[]
  shipments: {
    id: number
    trackingNumber: string | null
    status: string
    estimatedDeliveryDate: Date | null
    actualDeliveryDate: Date | null
    notes: string | null
  }[]
  user: {
    id: number
    username: string
    email: string
  }
}
