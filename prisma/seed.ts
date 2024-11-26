import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  try {
    // Clean up existing data
    await prisma.allocation.deleteMany()
    await prisma.orderItem.deleteMany()
    await prisma.order.deleteMany()
    await prisma.inventory.deleteMany()
    await prisma.product.deleteMany()
    await prisma.customer.deleteMany()
    await prisma.user.deleteMany()

    // Create test product with inventory
    const product = await prisma.product.create({
      data: {
        model: 'ROG Strix G15',
        asusPn: 'G513QR-HF010T',
        basePrice: 1499.99,
        minStockLevel: 10,
        description: 'Gaming Laptop with RTX 3070',
        isActive: true,
        inventory: {
          create: {
            totalQuantity: 50,
            allocatedQuantity: 10,
            availableQuantity: 40,
          },
        },
      },
      include: {
        inventory: true,
      },
    })

    console.log('Created test product:', product)

    if (!product.inventory) {
      throw new Error('Failed to create inventory for product')
    }

    // Create test customer
    const customer = await prisma.customer.create({
      data: {
        name: 'Tech Solutions Inc',
        contactPerson: 'John Doe',
        email: 'john.doe@techsolutions.com',
        phone: '123-456-7890',
        address: '123 Tech Street, Silicon Valley, CA',
        priceTerm: 'NET30',
      },
    })

    console.log('Created test customer:', customer)

    // Create test user
    const user = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'SALES',
        isActive: true,
      },
    })

    console.log('Created test user:', user)

    // Create test order
    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        userId: user.id,
        poNumber: 'PO-2023-001',
        status: 'Processing',
        totalAmount: 2999.98,
        shippingTerm: 'FOB',
        orderItems: {
          create: {
            productId: product.id,
            quantity: 2,
            unitPrice: 1499.99,
            status: 'Pending',
          },
        },
      },
      include: {
        orderItems: true,
      },
    })

    console.log('Created test order:', order)

    if (!order.orderItems[0]) {
      throw new Error('Failed to create order item')
    }

    // Create test allocation
    const allocation = await prisma.allocation.create({
      data: {
        orderItemId: order.orderItems[0].id,
        inventoryId: product.inventory.id,
        quantity: 2,
        status: 'Pending',
        estimatedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    console.log('Created test allocation:', allocation)
    console.log('Seed completed successfully')
  } catch (error) {
    console.error('Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })