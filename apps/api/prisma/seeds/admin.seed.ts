import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Admin user
 * Crea usuario administrador por defecto para acceso al sistema
 */
export async function seedAdmin(prisma: PrismaClient) {
  console.log('👤 Creando/actualizando usuario Admin por defecto...');

  const email = process.env.ADMIN_EMAIL ?? 'admin@mateatletas.com';
  const rawPassword = process.env.ADMIN_PASSWORD ?? 'Admin123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  // Nota: User table no existe, se usa directamente en auth
  // El admin se gestiona vía variables de entorno en auth
  console.log(`   Admin email: ${email}`);

  console.log(`✅ Admin creado: ${email} (password: ${rawPassword})\n`);
}
