"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { sampleData } from "@/types/dashboard"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, AlertTriangle, ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Truck } from 'lucide-react'
import { Bar, BarChart, Line, LineChart, Pie, PieChart } from "recharts"

export default function DashboardPage() {
  const { kpi, orderStatus, monthlyOrders, recentActivities, criticalAlerts } = sampleData

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Order Management Dashboard</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${kpi.totalOrdersValue.mtd.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">MTD</p>
            <div className="text-lg font-semibold mt-2">${kpi.totalOrdersValue.ytd.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">YTD</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Allocations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.pendingAllocations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.delayedShipments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpi.lowStockAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart width={400} height={300}>
              <Pie
                data={orderStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                fill="hsl(var(--primary))"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              />
            </PieChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Monthly Order Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={monthlyOrders}>
              <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" />
            </LineChart>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities and Critical Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {recentActivities.map((activity) => (
                <li key={activity.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {activity.status === 'Completed' && <ArrowUp className="h-5 w-5 text-green-500" />}
                    {activity.status === 'Pending' && <ArrowDown className="h-5 w-5 text-yellow-500" />}
                    {activity.status === 'Cancelled' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    {(activity.status === 'Shipped' || activity.status === 'In Progress') && <Truck className="h-5 w-5 text-blue-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{activity.orderId} - {activity.status}</p>
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Critical Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <Alert key={alert.id} variant={alert.type === 'error' ? 'destructive' : 'default'}>
                  {alert.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                  <AlertTitle>{alert.type === 'error' ? 'Error' : 'Warning'}</AlertTitle>
                  <AlertDescription>{alert.message}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
