import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Проверяем, существует ли уже root администратор
  const existingAdmin = await prisma.user.findUnique({
    where: { email: 'admin@admin.com' },
  });

  if (existingAdmin) {
    console.log('Root administrator already exists. Skipping...');
    return;
  }

  // Создаем root администратора
  const hashedPassword = await bcrypt.hash('admin', 10);

  const rootAdmin = await prisma.user.create({
    data: {
      email: 'admin@admin.com',
      password: hashedPassword,
      firstName: 'Root',
      lastName: 'Administrator',
      role: UserRole.ROOT,
      phone: '+7 (000) 000-00-00',
      dateOfBirth: new Date('1990-01-01'),
    },
  });

  console.log('Root administrator created successfully:');
  console.log('  Email: admin@admin.com');
  console.log('  Password: admin');
  console.log('  Role: ROOT');
  console.log('  ID:', rootAdmin.id);
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

