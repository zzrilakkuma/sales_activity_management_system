import { OrderListItem } from '@/types/orders'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDate, formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface OrderTableProps {
  orders: OrderListItem[]
  onViewDetails: (order: OrderListItem) => void
}

const getAllocationStatusColor = (status: string) => {
  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CHECKING: 'bg-blue-100 text-blue-800',
    CHECKED: 'bg-purple-100 text-purple-800',
    PARTIALLY: 'bg-orange-100 text-orange-800',
    FULLY: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  } as const

  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

const getTrackingStatusColor = (status: string) => {
  const colors = {
    ETD_TRACKING: 'bg-blue-100 text-blue-800',
    MAIL_TRACKING: 'bg-purple-100 text-purple-800',
    ALLOCATION_TRACKING: 'bg-green-100 text-green-800',
  } as const

  return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'
}

export function OrderTable({ orders, onViewDetails }: OrderTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PO Number</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Order Date</TableHead>
            <TableHead>Allocation Status</TableHead>
            <TableHead>Tracking Status</TableHead>
            <TableHead>Total Amount</TableHead>
            <TableHead>Est. Ship Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.poNumber}</TableCell>
              <TableCell>{order.customerName}</TableCell>
              <TableCell>{formatDate(order.orderDate)}</TableCell>
              <TableCell>
                <Badge 
                  className={getAllocationStatusColor(order.allocation_status)}
                >
                  {order.allocation_status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {order.tracking_status.map((status, index) => (
                    <Badge 
                      key={index}
                      className={getTrackingStatusColor(status)}
                    >
                      {status.replace('_TRACKING', '')}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(order.totalAmount)}</TableCell>
              <TableCell>
                {formatDate(order.estimatedShipDate)}
              </TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(order)}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
