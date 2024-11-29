import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    console.log('Search params:', Object.fromEntries(searchParams.entries()))
    
    const where: Prisma.OrderWhereInput = {}
    
    // Apply filters
    const poNumber = searchParams.get('poNumber')
    if (poNumber) {
      where.poNumber = {
        contains: poNumber,
        mode: 'insensitive',
      }
    }
    
    const customerName = searchParams.get('customerName')
    if (customerName) {
      where.customer = {
        name: {
          contains: customerName,
          mode: 'insensitive',
        }
      }
    }
    
    const status = searchParams.get('allocation_status')
    if (status) {
      where.allocation_status = status
    }
    
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    if (dateFrom || dateTo) {
      where.orderDate = {}
      if (dateFrom) {
        where.orderDate.gte = new Date(dateFrom)
      }
      if (dateTo) {
        where.orderDate.lte = new Date(dateTo)
      }
    }
    
    const amountMin = searchParams.get('amountMin')
    const amountMax = searchParams.get('amountMax')
    if (amountMin || amountMax) {
      where.totalAmount = {}
      if (amountMin) {
        where.totalAmount.gte = new Prisma.Decimal(amountMin)
      }
      if (amountMax) {
        where.totalAmount.lte = new Prisma.Decimal(amountMax)
      }
    }

    console.log('Query where clause:', where)

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
            contactPerson: true,
            priceTerm: true,
          }
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                model: true,
                asusPn: true,
                description: true,
                basePrice: true,
              }
            },
          },
        },
        shipments: {
          select: {
            id: true,
            trackingNumber: true,
            status: true,
            etd: true,
            eta: true,
            notes: true,
          }
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          }
        },
      },
      orderBy: {
        orderDate: 'desc',
      },
    })

    console.log('Found orders:', orders.length)

    // Transform the data to match the expected format
    const transformedOrders = orders.map(order => ({
      id: order.id,
      poNumber: order.poNumber,
      customerName: order.customer.name,
      customer: {
        id: order.customer.id,
        name: order.customer.name,
        email: order.customer.email,
        phone: order.customer.phone,
        address: order.customer.address,
        contactPerson: order.customer.contactPerson,
        priceTerm: order.customer.priceTerm,
      },
      orderDate: order.orderDate,
      tracking_status: order.tracking_status,
      allocation_status: order.allocation_status,
      totalAmount: order.totalAmount,
      shippingTerm: order.shippingTerm,
      estimatedShipDate: order.estimatedShipDate,
      actualShipDate: order.actualShipDate,
      notes: order.notes,
      orderItems: order.orderItems.map(item => ({
        id: item.id,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        status: item.status,
        allocatedQuantity: item.allocatedQuantity,
        product: {
          id: item.product.id,
          model: item.product.model,
          asusPn: item.product.asusPn,
          description: item.product.description,
          basePrice: item.product.basePrice,
        }
      })),
      shipments: order.shipments.map(shipment => ({
        id: shipment.id,
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        estimatedDeliveryDate: shipment.etd,
        actualDeliveryDate: shipment.eta,
        notes: shipment.notes,
      })),
      user: {
        id: order.user.id,
        username: order.user.username,
        email: order.user.email,
      }
    }))

    console.log('Transformed orders:', transformedOrders.length)

    return NextResponse.json(transformedOrders)
  } catch (error) {
    console.error('Detailed error:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Prisma error code:', error.code)
      console.error('Prisma error meta:', error.meta)
    }

    return NextResponse.json(
      { error: 'Failed to fetch orders', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // Create the order with its related items
    const order = await prisma.order.create({
      data: {
        poNumber: body.poNumber,
        customerId: parseInt(body.customerId),
        orderDate: new Date(body.orderDate),
        shippingTerm: body.shippingTerm,
        estimatedShipDate: body.estimatedShipDate ? new Date(body.estimatedShipDate) : null,
        tracking_status: body.tracking_status,
        allocation_status: body.allocation_status,
        totalAmount: new Prisma.Decimal(body.totalAmount),
        notes: body.notes,
        // Assuming we have the user's id from the session
        userId: 1, // TODO: Get from session
        orderItems: {
          create: body.items.map((item: any) => ({
            productId: parseInt(item.productId),
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice || 0),
            status: item.status,
            notes: item.notes,
            allocatedQuantity: 0
          }))
        }
      },
      include: {
        customer: true,
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error('Order creation error:', error)
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: 'Database error', code: error.code, details: error.meta },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create order', details: error.message },
      { status: 500 }
    )
  }
}
