// KPI Types
interface TotalOrdersValue {
  mtd: number;
  ytd: number;
}

interface KPI {
  totalOrdersValue: TotalOrdersValue;
  pendingAllocations: number;
  delayedShipments: number;
  lowStockAlerts: number;
}

// Order Status Types
interface OrderStatus {
  status: string;
  count: number;
}

// Monthly Orders Type
interface MonthlyOrder {
  month: string;
  orders: number;
}

// Activity Types
interface Activity {
  id: string;
  orderId: string;
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Shipped' | 'In Progress';
  timestamp: string;
}

// Alert Types
interface Alert {
  id: string;
  type: 'error' | 'warning';
  message: string;
}

// Sample Data
export const sampleData = {
  kpi: {
    totalOrdersValue: {
      mtd: 125000,
      ytd: 1500000
    },
    pendingAllocations: 23,
    delayedShipments: 5,
    lowStockAlerts: 12
  },
  orderStatus: [
    { status: 'Completed', count: 145 },
    { status: 'Pending', count: 32 },
    { status: 'Processing', count: 48 },
    { status: 'Cancelled', count: 8 }
  ],
  monthlyOrders: [
    { month: 'Jan', orders: 65 },
    { month: 'Feb', orders: 85 },
    { month: 'Mar', orders: 95 },
    { month: 'Apr', orders: 75 },
    { month: 'May', orders: 88 },
    { month: 'Jun', orders: 97 }
  ],
  recentActivities: [
    { id: '1', orderId: 'ORD-001', status: 'Completed', timestamp: '2024-03-20 14:30' },
    { id: '2', orderId: 'ORD-002', status: 'Pending', timestamp: '2024-03-20 13:45' },
    { id: '3', orderId: 'ORD-003', status: 'Shipped', timestamp: '2024-03-20 12:30' },
    { id: '4', orderId: 'ORD-004', status: 'Cancelled', timestamp: '2024-03-20 11:15' },
    { id: '5', orderId: 'ORD-005', status: 'In Progress', timestamp: '2024-03-20 10:00' }
  ],
  criticalAlerts: [
    { id: '1', type: 'error', message: 'Stock level critical for Product A' },
    { id: '2', type: 'warning', message: 'Delayed shipment for Order #ORD-006' },
    { id: '3', type: 'error', message: 'Payment verification failed for Order #ORD-007' }
  ]
} as const;
