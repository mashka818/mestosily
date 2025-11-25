const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function waitForDatabase(maxAttempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log('✅ Database connection successful!');
      await prisma.$disconnect();
      return true;
    } catch (error) {
      console.log(`⏳ Waiting for database... (attempt ${attempt}/${maxAttempts})`);
      if (attempt === maxAttempts) {
        console.error('❌ Could not connect to database after', maxAttempts, 'attempts');
        await prisma.$disconnect();
        process.exit(1);
      }
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
}

waitForDatabase().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});

