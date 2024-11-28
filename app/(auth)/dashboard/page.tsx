"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  AlertCircle,
  ArrowDown, 
  ArrowUp, 
  DollarSign, 
  Package, 
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Timer
} from 'lucide-react'
import { Pie, PieChart, Tooltip } from "recharts"

interface DashboardData {
  kpi: {
    totalOrdersValue: {
      mtd: number
      ytd: number
      trend: number
    }
    pendingAllocations: number
    pendingShipments: number
  }
  orderStatusDistribution: {
    status: string
    count: number
  }[]
  trackingStatusDistribution: {
    status: string
    count: number
  }[]
  recentActivities: {
    id: number
    description: string
    timestamp: string
    status: 'info' | 'warning' | 'error'
  }[]
  ordersByStatus: {
    status: string
    count: number
  }[]
  shipmentTracking: {
    status: string
    count: number
  }[]
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>
  }

  if (error) {
    return <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  }

  if (!data) return null

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'FULLY':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'CANCELLED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'PENDING':
        return <Timer className="h-4 w-4 text-yellow-500" />
      case 'PARTIALLY':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'CHECKING':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'Pending'
      case 'PARTIALLY':
        return 'Partially Allocated'
      case 'CHECKING':
        return 'Checking'
      case 'CHECKED':
        return 'Checked'
      case 'FULLY':
        return 'Fully Allocated'
      case 'CANCELLED':
        return 'Cancelled'
      default:
        return status
    }
  }

  const getTrackingStatusDisplay = (status: string) => {
    switch (status) {
      case 'ETD_TRACKING':
        return 'ETD Tracking'
      case 'MAIL_TRACKING':
        return 'Mail Tracking'
      case 'ALLOCATION_TRACKING':
        return 'Allocation Tracking'
      default:
        return status
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Order Management Dashboard</h1>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.kpi.totalOrdersValue.mtd.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">MTD</p>
            <div className="text-lg font-semibold mt-2">${data.kpi.totalOrdersValue.ytd.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">YTD</p>
            <div className="flex items-center mt-2">
              {data.kpi.totalOrdersValue.trend > 0 ? (
                <ArrowUp className="h-4 w-4 text-green-500" />
              ) : (
                <ArrowDown className="h-4 w-4 text-red-500" />
              )}
              <span className={data.kpi.totalOrdersValue.trend > 0 ? "text-green-500" : "text-red-500"}>
                {Math.abs(data.kpi.totalOrdersValue.trend)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Allocations</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.pendingAllocations}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Shipments</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.kpi.pendingShipments}</div>
          </CardContent>
        </Card>
      </div>

      {/* Status Distribution Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <PieChart width={180} height={180}>
                  <Pie
                    data={data.orderStatusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="hsl(var(--primary))"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                </PieChart>
              </div>
              <div className="space-y-2">
                {data.orderStatusDistribution.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <span className="text-sm">{getStatusDisplay(status.status)}</span>
                    </div>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tracking Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-center">
                <PieChart width={180} height={180}>
                  <Pie
                    data={data.trackingStatusDistribution}
                    dataKey="count"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    fill="hsl(var(--secondary))"
                    label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  />
                  <Tooltip />
                </PieChart>
              </div>
              <div className="space-y-2">
                {data.trackingStatusDistribution.map((status) => (
                  <div key={status.status} className="flex items-center justify-between">
                    <span className="text-sm">{getTrackingStatusDisplay(status.status)}</span>
                    <span className="font-semibold">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Order Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4">
            {data.recentActivities.map((activity) => (
              <li key={activity.id} className="flex items-center space-x-4">
                <div className={`p-2 rounded-full ${
                  activity.status === 'info' ? 'bg-blue-100' :
                  activity.status === 'warning' ? 'bg-yellow-100' : 'bg-red-100'
                }`}>
                  <Clock className={`h-4 w-4 ${
                    activity.status === 'info' ? 'text-blue-500' :
                    activity.status === 'warning' ? 'text-yellow-500' : 'text-red-500'
                  }`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
