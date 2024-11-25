import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    const where: any = {}
    
    // Apply filters
    if (searchParams.has('poNumber')) {
      where.poNumber = {
        contains: searchParams.get('poNumber'),
        mode: 'insensitive',
      }
    }
    
    if (searchParams.has('customerName')) {
      where.customer = {
        name: {
          contains: searchParams.get('customerName'),
          mode: 'insensitive',
        }
      }
    }
    
    if (searchParams.has('status')) {
      where.status = searchParams.get('status')
    }
    
    if (searchParams.has('dateFrom') || searchParams.has('dateTo')) {
      where.orderDate = {}
      if (searchParams.has('dateFrom')) {
        where.orderDate.gte = new Date(searchParams.get('dateFrom')!)
      }
      if (searchParams.has('dateTo')) {
        where.orderDate.lte = new Date(searchParams.get('dateTo')!)
      }
    }
    
    if (searchParams.has('amountMin') || searchParams.has('amountMax')) {
      where.totalAmount = {}
      if (searchParams.has('amountMin')) {
        where.totalAmount.gte = parseFloat(searchParams.get('amountMin')!)
      }
      if (searchParams.has('amountMax')) {
        where.totalAmount.lte = parseFloat(searchParams.get('amountMax')!)
      }
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true,
          },
        },
        shipments: true,
      },
      orderBy: {
        orderDate: 'desc',
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}
