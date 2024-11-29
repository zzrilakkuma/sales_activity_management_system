import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/auth'
import { prisma } from '@/lib/prisma'

// GET /api/inventory/stock
export async function GET() {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all inventory items with their products
    const inventoryItems = await prisma.inventory.findMany({
      include: {
        product: true,
      },
    })

    // Calculate summary statistics
    const totalStock = inventoryItems.reduce((sum, item) => sum + item.totalQuantity, 0)
    const allocatedStock = inventoryItems.reduce((sum, item) => sum + item.allocatedQuantity, 0)
    const availableStock = inventoryItems.reduce((sum, item) => sum + item.availableQuantity, 0)
    const lowStockItems = inventoryItems.filter(
      item => item.availableQuantity <= item.product.minStockLevel
    ).length

    // Transform inventory data for the frontend
    const stockItems = inventoryItems.map(item => ({
      id: item.id,
      model: item.product.model,
      asusPn: item.product.asusPn,
      currentStock: item.totalQuantity,
      minStockLevel: item.product.minStockLevel,
      allocated: item.allocatedQuantity,
      available: item.availableQuantity,
      status: item.availableQuantity <= item.product.minStockLevel 
        ? 'Low Stock' 
        : item.availableQuantity === 0 
          ? 'Out of Stock' 
          : 'In Stock',
    }))

    return NextResponse.json({
      totalStock,
      allocatedStock,
      availableStock,
      lowStockItems,
      stockItems,
    })
  } catch (error) {
    console.error('Error fetching inventory data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch inventory data' },
      { status: 500 }
    )
  }
}

// POST /api/inventory/stock
export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    
    // Create new inventory item
    const inventory = await prisma.inventory.create({
      data: {
        productId: data.productId,
        totalQuantity: data.totalQuantity,
        allocatedQuantity: 0,
        availableQuantity: data.totalQuantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error creating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to create inventory item' },
      { status: 500 }
    )
  }
}

// PATCH /api/inventory/stock/[id]
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

    // Update inventory item
    const inventory = await prisma.inventory.update({
      where: { id },
      data: {
        totalQuantity: data.totalQuantity,
        availableQuantity: data.totalQuantity - data.allocatedQuantity,
        allocatedQuantity: data.allocatedQuantity,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(inventory)
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json(
      { error: 'Failed to update inventory item' },
      { status: 500 }
    )
  }
}
