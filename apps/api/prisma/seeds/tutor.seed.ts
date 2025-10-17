import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Tutor
 * Crea tutor de prueba para desarrollo
 */
export async function seedTutor(prisma: PrismaClient) {
  console.log('👨‍👩‍👧 Creando tutor de prueba...');

  const email = 'maria.garcia@tutor.com';
  const rawPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.tutor.upsert({
    where: { email },
    update: { password_hash: hashedPassword },
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'María Elena',
      apellido: 'García López',
    },
  });

  console.log(`✅ Tutor creado: ${email} (password: ${rawPassword})\n`);
}
