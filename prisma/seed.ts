import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

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

    // Create test user (preserve original)
    const testUser = await prisma.user.create({
      data: {
        username: 'testuser',
        email: 'test@example.com',
        passwordHash: await bcrypt.hash('password123', 12),
        role: 'SALES',
        isActive: true,
      },
    })

    // Create customers from Excel
    const customers = await Promise.all([
      prisma.customer.create({
        data: {
          name: 'Bicker',
          contactPerson: 'Bicker Contact',
          email: 'contact@bicker.com',
          phone: '123-456-7890',
          address: 'Bicker Address',
          priceTerm: 'NET30',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'Rutronik',
          contactPerson: 'Rutronik Contact',
          email: 'contact@rutronik.com',
          phone: '123-456-7891',
          address: 'Rutronik Address',
          priceTerm: 'NET30',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'next system',
          contactPerson: 'Next System Contact',
          email: 'contact@nextsystem.com',
          phone: '123-456-7892',
          address: 'Next System Address',
          priceTerm: 'NET30',
        },
      }),
      prisma.customer.create({
        data: {
          name: 'Portwell',
          contactPerson: 'Portwell Contact',
          email: 'contact@portwell.com',
          phone: '123-456-7893',
          address: 'Portwell Address',
          priceTerm: 'NET30',
        },
      }),
    ])

    // Create products with inventory from Excel
    const products = await Promise.all([
      prisma.product.create({
        data: {
          model: 'Q470EI-IM-A R2.0',
          asusPn: '90ME0520-M0ECY0',
          basePrice: 299.99,
          minStockLevel: 100,
          description: 'Q470 Motherboard',
          isActive: true,
          inventory: {
            create: {
              totalQuantity: 470,
              allocatedQuantity: 470,
              availableQuantity: 0,
            },
          },
        },
        include: {
          inventory: true,
        },
      }),
      prisma.product.create({
        data: {
          model: 'J3455T-IM-A',
          asusPn: '90ME0420-M0ECY0',
          basePrice: 199.99,
          minStockLevel: 50,
          description: 'J3455T Motherboard',
          isActive: true,
          inventory: {
            create: {
              totalQuantity: 400,
              allocatedQuantity: 120,
              availableQuantity: 280,
            },
          },
        },
        include: {
          inventory: true,
        },
      }),
      prisma.product.create({
        data: {
          model: 'W480EI-IM-A',
          asusPn: '90ME0530-M0ECY0',
          basePrice: 349.99,
          minStockLevel: 100,
          description: 'W480 Motherboard',
          isActive: true,
          inventory: {
            create: {
              totalQuantity: 190,
              allocatedQuantity: 190,
              availableQuantity: 0,
            },
          },
        },
        include: {
          inventory: true,
        },
      }),
    ])

    // Create orders and order items from Excel
    const orders = await Promise.all([
      // Bicker Q470EI order
      prisma.order.create({
        data: {
          customerId: customers[0].id,
          userId: testUser.id,
          poNumber: '2022-33031',
          orderDate: new Date('2021-09-15'),
          status: 'Allocated',
          totalAmount: 80997.30,
          shippingTerm: 'FOB',
          estimatedShipDate: new Date('2021-10-06'),
          orderItems: {
            create: {
              productId: products[0].id,
              quantity: 270,
              unitPrice: 299.99,
              status: 'Allocated',
              allocatedQuantity: 270,
            },
          },
        },
        include: {
          orderItems: true,
        },
      }),
      // Rutronik J3455T order
      prisma.order.create({
        data: {
          customerId: customers[1].id,
          userId: testUser.id,
          poNumber: '22177611',
          orderDate: new Date('2021-09-16'),
          status: 'Allocated',
          totalAmount: 3999.80,
          shippingTerm: 'FOB',
          orderItems: {
            create: {
              productId: products[1].id,
              quantity: 20,
              unitPrice: 199.99,
              status: 'Allocated',
              allocatedQuantity: 20,
            },
          },
        },
        include: {
          orderItems: true,
        },
      }),
    ])

    // Create allocations for each order
    for (const order of orders) {
      if (order.orderItems && order.orderItems[0]) {
        const orderItem = order.orderItems[0]
        const product = products.find(p => p.id === orderItem.productId)
        
        if (product && product.inventory) {
          await prisma.allocation.create({
            data: {
              orderItemId: orderItem.id,
              inventoryId: product.inventory.id,
              quantity: orderItem.quantity,
              status: 'Allocated',
              estimatedDeliveryDate: new Date('2021-10-30'),
            },
          })
        }
      }
    }

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