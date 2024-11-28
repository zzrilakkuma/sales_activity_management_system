import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET() {
  try {
    // Get current date for MTD/YTD calculations
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Fetch KPIs
    const [
      mtdOrders,
      ytdOrders,
      pendingAllocations,
      pendingShipments,
      orderStatusDistribution,
      trackingStatusDistribution,
      recentActivities
    ] = await Promise.all([
      // MTD Orders Total
      prisma.order.aggregate({
        where: {
          orderDate: {
            gte: startOfMonth
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // YTD Orders Total
      prisma.order.aggregate({
        where: {
          orderDate: {
            gte: startOfYear
          }
        },
        _sum: {
          totalAmount: true
        }
      }),

      // Pending Allocations Count
      prisma.order.count({
        where: {
          allocation_status: 'PENDING'
        }
      }),

      // Pending Shipments Count
      prisma.order.count({
        where: {
          allocation_status: 'FULLY',
          actualShipDate: null
        }
      }),

      // Order Status Distribution
      prisma.order.groupBy({
        by: ['allocation_status'],
        _count: true
      }),

      // Tracking Status Distribution
      prisma.order.groupBy({
        by: ['tracking_status'],
        _count: true
      }),

      // Recent Activities
      prisma.order.findMany({
        orderBy: {
          orderDate: 'desc'
        },
        take: 10,
        select: {
          id: true,
          poNumber: true,
          orderDate: true,
          allocation_status: true,
          tracking_status: true,
          customer: {
            select: {
              name: true
            }
          }
        }
      })
    ])

    // Calculate trend (comparing current month to previous month)
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const previousMonthOrders = await prisma.order.aggregate({
      where: {
        orderDate: {
          gte: previousMonth,
          lt: startOfMonth
        }
      },
      _sum: {
        totalAmount: true
      }
    })

    const currentMonthTotal = mtdOrders._sum.totalAmount?.toNumber() || 0
    const previousMonthTotal = previousMonthOrders._sum.totalAmount?.toNumber() || 0
    const trend = previousMonthTotal === 0 ? 0 : 
      ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100

    // Process tracking status data (flatten array values)
    const flattenedTrackingStatus = trackingStatusDistribution.reduce((acc, curr) => {
      curr.tracking_status.forEach(status => {
        const existingStatus = acc.find(item => item.status === status)
        if (existingStatus) {
          existingStatus.count += curr._count
        } else {
          acc.push({ status, count: curr._count })
        }
      })
      return acc
    }, [] as { status: string; count: number }[])

    // Format the response
    return NextResponse.json({
      kpi: {
        totalOrdersValue: {
          mtd: mtdOrders._sum.totalAmount?.toNumber() || 0,
          ytd: ytdOrders._sum.totalAmount?.toNumber() || 0,
          trend: Math.round(trend * 100) / 100
        },
        pendingAllocations,
        pendingShipments
      },
      orderStatusDistribution: orderStatusDistribution.map(status => ({
        status: status.allocation_status,
        count: status._count
      })),
      trackingStatusDistribution: flattenedTrackingStatus,
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        description: `${activity.customer.name} - ${activity.poNumber} (${activity.allocation_status})`,
        timestamp: activity.orderDate.toISOString(),
        status: activity.allocation_status === 'PENDING' ? 'warning' :
               activity.allocation_status === 'CANCELLED' ? 'error' : 'info'
      }))
    })

  } catch (error) {
    console.error('Dashboard data fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
