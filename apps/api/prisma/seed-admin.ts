/**
 * Seed Admin - Solo crea el usuario admin
 * Ejecutar: npx ts-node prisma/seed-admin.ts
 */
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando Admin...\n');

  const adminPassword = await bcrypt.hash('Admin123!', 10);

  const admin = await prisma.admin.upsert({
    where: { email: 'admin@mateatletas.com' },
    update: { passwordHash: adminPassword },
    create: {
      email: 'admin@mateatletas.com',
      passwordHash: adminPassword,
      nombre: 'Admin',
      apellido: 'Mateatletas',
    },
  });

  console.log('═══════════════════════════════════════════════════════════');
  console.log('✅ ADMIN CREADO');
  console.log(`   Email: ${admin.email}`);
  console.log('   Password: Admin123!');
  console.log('═══════════════════════════════════════════════════════════');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
