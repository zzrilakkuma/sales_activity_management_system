import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // Fetch KPI data
    const [mtdOrders, ytdOrders, lastMonthOrders] = await Promise.all([
      prisma.order.aggregate({
        where: {
          orderDate: {
            gte: startOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          orderDate: {
            gte: startOfYear,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
      prisma.order.aggregate({
        where: {
          orderDate: {
            gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
            lt: startOfMonth,
          },
        },
        _sum: {
          totalAmount: true,
        },
      }),
    ])

    // Calculate trend
    const currentMonthTotal = mtdOrders._sum.totalAmount?.toNumber() || 0
    const lastMonthTotal = lastMonthOrders._sum.totalAmount?.toNumber() || 0
    const trend = lastMonthTotal === 0 ? 0 : ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100

    // Fetch order status distribution
    const orderStatusDistribution = await prisma.order.groupBy({
      by: ['allocation_status'],
      _count: true,
    })

    // Fetch tracking status distribution
    const orders = await prisma.order.findMany({
      select: {
        tracking_status: true,
      },
    })

    // Process tracking statuses (since it's an array)
    const trackingStatusCounts: { [key: string]: number } = {}
    orders.forEach(order => {
      order.tracking_status.forEach(status => {
        trackingStatusCounts[status] = (trackingStatusCounts[status] || 0) + 1
      })
    })

    const trackingStatusDistribution = Object.entries(trackingStatusCounts).map(([status, count]) => ({
      status,
      count,
    }))

    // Fetch low stock products
    const lowStockProducts = await prisma.$queryRaw`
      SELECT 
        p.id,
        p.model,
        p.asus_pn as "asusPn",
        p.min_stock_level as "minStockLevel",
        i.available_quantity as "availableQuantity",
        i.allocated_quantity as "allocatedQuantity"
      FROM products p
      JOIN inventory i ON i.product_id = p.id
      WHERE i.available_quantity <= p.min_stock_level
        AND p.min_stock_level > 0
      ORDER BY i.available_quantity ASC
      LIMIT 5
    `

    // Fetch recent orders
    const recentOrders = await prisma.order.findMany({
      select: {
        id: true,
        poNumber: true,
        customer: {
          select: {
            name: true,
          },
        },
        orderDate: true,
        totalAmount: true,
        allocation_status: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
      take: 5,
    })

    // Fetch top customers
    const topCustomers = await prisma.customer.findMany({
      include: {
        orders: {
          select: {
            totalAmount: true,
          },
        },
        _count: {
          select: {
            orders: true,
          },
        },
      },
      orderBy: {
        orders: {
          _count: 'desc',
        },
      },
      take: 5,
    })

    // Fetch recent activities
    const recentActivities = await prisma.order.findMany({
      select: {
        id: true,
        poNumber: true,
        orderDate: true,
        allocation_status: true,
        customer: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
      take: 10,
    })

    // Calculate pending allocations and shipments
    const [pendingAllocations, pendingShipments] = await Promise.all([
      prisma.order.count({
        where: {
          allocation_status: {
            in: ['PENDING', 'PARTIALLY'],
          },
        },
      }),
      prisma.order.count({
        where: {
          allocation_status: 'FULLY',
          actualShipDate: null,
        },
      }),
    ])

    return NextResponse.json({
      kpi: {
        totalOrdersValue: {
          mtd: mtdOrders._sum.totalAmount?.toNumber() || 0,
          ytd: ytdOrders._sum.totalAmount?.toNumber() || 0,
          trend,
        },
        pendingAllocations,
        pendingShipments,
      },
      orderStatusDistribution: orderStatusDistribution.map((item) => ({
        status: item.allocation_status,
        count: item._count,
      })),
      trackingStatusDistribution,
      lowStockProducts: lowStockProducts.map(product => ({
        id: Number(product.id),
        model: product.model,
        asusPn: product.asusPn,
        currentStock: Number(product.availableQuantity),
        minStockLevel: Number(product.minStockLevel),
        allocatedQuantity: Number(product.allocatedQuantity),
      })),
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        poNumber: order.poNumber,
        customerName: order.customer.name,
        orderDate: order.orderDate.toISOString(),
        totalAmount: order.totalAmount.toNumber(),
        status: order.allocation_status,
      })),
      topCustomers: topCustomers.map((customer) => ({
        id: customer.id,
        name: customer.name,
        ordersCount: customer._count.orders,
        totalAmount: customer.orders.reduce((sum, order) => 
          sum + (order.totalAmount?.toNumber() || 0), 0
        ),
      })),
      recentActivities: recentActivities.map(activity => ({
        id: activity.id,
        description: `${activity.customer.name} - ${activity.poNumber}`,
        timestamp: activity.orderDate.toISOString(),
        status: activity.allocation_status === 'PENDING' ? 'warning' :
               activity.allocation_status === 'CANCELLED' ? 'error' : 'info'
      })),
    })
  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch dashboard data',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}
