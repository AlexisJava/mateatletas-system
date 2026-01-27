import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Docentes reales de Mateatletas
 * Crea los docentes del equipo
 */
export async function seedDocentes(prisma: PrismaClient) {
  console.log('🧑‍🏫 Creando docentes del equipo...');

  const docentes = [
    {
      email: 'gimena.reniero@mateatletas.com',
      nombre: 'Gimena',
      apellido: 'Reniero',
      password: 'Docente123',
    },
    {
      email: 'ayelen.yanez@mateatletas.com',
      nombre: 'Ayelen',
      apellido: 'Yañez',
      password: 'Docente123',
    },
  ];

  for (const doc of docentes) {
    const passwordHash = await bcrypt.hash(doc.password, 10);

    await prisma.docente.upsert({
      where: { email: doc.email },
      update: {},
      create: {
        email: doc.email,
        nombre: doc.nombre,
        apellido: doc.apellido,
        passwordHash: passwordHash,
        roles: ['docente'],
      },
    });
  }

  console.log('✅ Docentes seeded');
}
