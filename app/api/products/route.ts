import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        model: true,
        asusPn: true,
        basePrice: true,
        description: true,
        inventory: {
          select: {
            availableQuantity: true,
          },
        },
      },
      where: {
        isActive: true,
      },
      orderBy: {
        model: 'asc',
      },
    })

    // Transform the data to include availableQuantity at the top level
    const transformedProducts = products.map(product => ({
      ...product,
      availableQuantity: product.inventory?.availableQuantity ?? 0,
      basePrice: Number(product.basePrice), // Convert Decimal to number
      inventory: undefined, // Remove the nested inventory object
    }))

    return NextResponse.json(transformedProducts)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
