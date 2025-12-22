import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Admin user
 * Crea usuario administrador por defecto para acceso al sistema
 *
 * Credenciales por defecto (desarrollo):
 * - Email: admin@mateatletas.com
 * - Password: Admin123!
 */
export async function seedAdmin(prisma: PrismaClient): Promise<void> {
  console.log('👤 Creando/actualizando usuario Admin...');

  const email = process.env.ADMIN_EMAIL ?? 'admin@mateatletas.com';
  const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  const admin = await prisma.admin.upsert({
    where: { email },
    update: {
      password_hash: hashedPassword,
      nombre: 'Admin',
      apellido: 'Mateatletas',
    },
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'Admin',
      apellido: 'Mateatletas',
    },
  });

  console.log(`✅ Admin creado/actualizado:`);
  console.log(`   ID: ${admin.id}`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${rawPassword}`);
  console.log('');
}

// Ejecutar directamente si se llama como script
const prisma = new PrismaClient();

seedAdmin(prisma)
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error('Error en seed:', e);
    prisma.$disconnect();
    process.exit(1);
  });
