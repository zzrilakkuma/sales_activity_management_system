import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/allocation
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all allocations with related data
    const allocations = await prisma.allocation.findMany({
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
        orderItem: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
      orderBy: {
        allocationDate: 'desc',
      },
    })

    // Calculate summary statistics
    const totalAllocations = allocations.length
    const pendingAllocations = allocations.filter(a => a.status === 'Pending').length
    const completedAllocations = allocations.filter(a => a.status === 'Completed').length
    const inProgressAllocations = allocations.filter(a => a.status === 'In Progress').length

    // Transform allocation data for the frontend
    const allocationItems = allocations.map(allocation => ({
      id: allocation.id,
      orderNumber: allocation.orderItem.order.poNumber,
      model: allocation.inventory.product.model,
      quantity: allocation.quantity,
      customer: allocation.orderItem.order.customer.name,
      status: allocation.status,
      requestDate: allocation.allocationDate.toISOString(),
      estimatedDeliveryDate: allocation.estimatedDeliveryDate.toISOString(),
    }))

    return NextResponse.json({
      totalAllocations,
      pendingAllocations,
      completedAllocations,
      inProgressAllocations,
      allocations: allocationItems,
    })
  } catch (error) {
    console.error('Error fetching allocation data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch allocation data' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/allocation
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()

    // Start a transaction
    const allocation = await prisma.$transaction(async (prisma) => {
      // Get the inventory item
      const inventory = await prisma.inventory.findUnique({
        where: { id: data.inventoryId },
      })

      if (!inventory) {
        throw new Error('Inventory not found')
      }

      if (inventory.availableQuantity < data.quantity) {
        throw new Error('Insufficient inventory')
      }

      // Update inventory quantities
      await prisma.inventory.update({
        where: { id: data.inventoryId },
        data: {
          allocatedQuantity: inventory.allocatedQuantity + data.quantity,
          availableQuantity: inventory.availableQuantity - data.quantity,
        },
      })

      // Update order item allocated quantity
      await prisma.orderItem.update({
        where: { id: data.orderItemId },
        data: {
          allocatedQuantity: {
            increment: data.quantity,
          },
        },
      })

      // Create allocation
      return prisma.allocation.create({
        data: {
          inventoryId: data.inventoryId,
          orderItemId: data.orderItemId,
          quantity: data.quantity,
          status: 'Pending',
          estimatedDeliveryDate: data.estimatedDeliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default to 7 days from now
        },
        include: {
          inventory: {
            include: {
              product: true,
            },
          },
          orderItem: {
            include: {
              order: {
                include: {
                  customer: true,
                },
              },
            },
          },
        },
      })
    })

    return NextResponse.json(allocation)
  } catch (error) {
    console.error('Error creating allocation:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create allocation' },
      { status: 500 }
    )
  }
}

// PATCH /api/inventory/allocation/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const id = parseInt(params.id)

    // Update allocation status
    const allocation = await prisma.allocation.update({
      where: { id },
      data: {
        status: data.status,
      },
      include: {
        inventory: {
          include: {
            product: true,
          },
        },
        orderItem: {
          include: {
            order: {
              include: {
                customer: true,
              },
            },
          },
        },
      },
    })

    return NextResponse.json(allocation)
  } catch (error) {
    console.error('Error updating allocation:', error)
    return NextResponse.json(
      { error: 'Failed to update allocation' },
      { status: 500 }
    )
  }
}
