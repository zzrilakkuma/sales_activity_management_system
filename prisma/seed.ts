import { PrismaClient } from '@prisma/client'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create a test user first
  const hashedPassword = await hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      username: 'testuser',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      role: 'SALES',
      isActive: true,
    },
  })

  // Create customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: 'Tech Solutions Inc',
        contactPerson: 'John Smith',
        email: 'john@techsolutions.com',
        phone: '886-2-12345678',
        address: 'No. 1, Technology Road, Taipei',
        priceTerm: 'NET 30',
      },
    }),
    prisma.customer.create({
      data: {
        name: 'Digital Systems Co',
        contactPerson: 'Mary Johnson',
        email: 'mary@digitalsystems.com',
        phone: '886-2-87654321',
        address: 'No. 100, Innovation Street, New Taipei',
        priceTerm: 'NET 45',
      },
    }),
  ])

  // Create products
  const products = await Promise.all([
    prisma.product.create({
      data: {
        model: 'ROG Strix G15',
        asusPn: 'G513QR-HF010T',
        basePrice: 1299.99,
        minStockLevel: 50,
        description: 'Gaming Laptop, AMD Ryzen 9, RTX 3070',
        isActive: true,
        inventory: {
          create: {
            totalQuantity: 100,
            allocatedQuantity: 0,
            availableQuantity: 100,
          },
        },
      },
    }),
    prisma.product.create({
      data: {
        model: 'ZenBook Pro Duo',
        asusPn: 'UX582LR-H2013R',
        basePrice: 2499.99,
        minStockLevel: 30,
        description: 'Professional Laptop, Intel i9, RTX 3070',
        isActive: true,
        inventory: {
          create: {
            totalQuantity: 50,
            allocatedQuantity: 0,
            availableQuantity: 50,
          },
        },
      },
    }),
  ])

  // Create orders
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        customerId: customers[0].id,
        userId: user.id,
        poNumber: 'PO-2024-001',
        status: 'Processing',
        totalAmount: 12999.90,
        shippingTerm: 'FOB',
        estimatedShipDate: new Date('2024-02-01'),
        orderItems: {
          create: {
            productId: products[0].id,
            quantity: 10,
            unitPrice: 1299.99,
            status: 'Processing',
          },
        },
      },
    }),
    prisma.order.create({
      data: {
        customerId: customers[1].id,
        userId: user.id,
        poNumber: 'PO-2024-002',
        status: 'Pending',
        totalAmount: 24999.90,
        shippingTerm: 'CIF',
        estimatedShipDate: new Date('2024-02-15'),
        orderItems: {
          create: {
            productId: products[1].id,
            quantity: 10,
            unitPrice: 2499.99,
            status: 'Pending',
          },
        },
      },
    }),
  ])

  console.log('Seed data created successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })