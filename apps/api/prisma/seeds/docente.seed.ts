import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

/**
 * Seed: Docente
 * Crea docente de prueba para desarrollo
 */
export async function seedDocente(prisma: PrismaClient) {
  console.log('👨‍🏫 Creando docente de prueba...');

  const email = 'juan.perez@docente.com';
  const rawPassword = 'Test123!';
  const hashedPassword = await bcrypt.hash(rawPassword, 10);

  await prisma.docente.upsert({
    where: { email },
    update: {
      passwordHash: hashedPassword,
      titulo: 'Profesor de Matemáticas Avanzadas',
      bio: 'Docente con 10 años de experiencia en enseñanza de matemáticas para niños y jóvenes. Especializado en álgebra, geometría y resolución de problemas matemáticos. Apasionado por hacer que las matemáticas sean divertidas y accesibles.',
      especialidades: [
        'Álgebra',
        'Geometría',
        'Resolución de Problemas',
        'Olimpíadas',
      ],
      experienciaAnos: 10,
    },
    create: {
      email,
      passwordHash: hashedPassword,
      nombre: 'Juan Carlos',
      apellido: 'Pérez Martínez',
      titulo: 'Profesor de Matemáticas Avanzadas',
      bio: 'Docente con 10 años de experiencia en enseñanza de matemáticas para niños y jóvenes. Especializado en álgebra, geometría y resolución de problemas matemáticos. Apasionado por hacer que las matemáticas sean divertidas y accesibles.',
      especialidades: [
        'Álgebra',
        'Geometría',
        'Resolución de Problemas',
        'Olimpíadas',
      ],
      experienciaAnos: 10,
    },
  });

  console.log(`✅ Docente creado: ${email} (password: ${rawPassword})\n`);
}
