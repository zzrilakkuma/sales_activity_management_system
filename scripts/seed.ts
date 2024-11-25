import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create a test admin user
  await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@asus.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Create a test sales user
  await prisma.user.create({
    data: {
      name: 'Sales User',
      email: 'sales@asus.com',
      password: hashedPassword,
      role: 'SALES',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
