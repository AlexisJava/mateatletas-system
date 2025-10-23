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

  const tutor = await prisma.tutor.upsert({
    where: { email },
    update: { password_hash: hashedPassword },
    create: {
      email,
      password_hash: hashedPassword,
      nombre: 'María Elena',
      apellido: 'García López',
      telefono: '+549261234567',
      dni: '32123456',
    },
  });

  console.log(`✅ Tutor creado: ${email} (password: ${rawPassword})`);

  // Crear estudiantes de prueba para este tutor
  const estudiantes = [
    {
      nombre: 'Lucas',
      apellido: 'García',
      edad: 10,
      nivel_escolar: 'Primaria - 5to grado',
      email: 'lucas.garcia@email.com',
      password: 'Student123!',
    },
    {
      nombre: 'Sofía',
      apellido: 'García',
      edad: 8,
      nivel_escolar: 'Primaria - 3er grado',
      email: 'sofia.garcia@email.com',
      password: 'Student123!',
    },
  ];

  for (const estData of estudiantes) {
    const estudianteHashedPassword = await bcrypt.hash(estData.password, 10);
    await prisma.estudiante.upsert({
      where: { email: estData.email },
      update: {},
      create: {
        nombre: estData.nombre,
        apellido: estData.apellido,
        edad: estData.edad,
        nivel_escolar: estData.nivel_escolar,
        email: estData.email,
        password_hash: estudianteHashedPassword,
        tutor_id: tutor.id,
      },
    });
  }

  console.log(`   📚 ${estudiantes.length} estudiantes creados para el tutor\n`);
}
