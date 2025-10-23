import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed para crear un tutor mock para testing
 *
 * Credenciales:
 * Email: tutor.test@mateatletas.com
 * Password: Test1234!
 */
export async function seedTutorMock() {
  console.log('🔧 Seeding tutor mock...');

  // Hash de la contraseña
  const passwordHash = await bcrypt.hash('Test1234!', 10);

  // Verificar si ya existe
  const existingTutor = await prisma.tutor.findUnique({
    where: { email: 'tutor.test@mateatletas.com' },
  });

  if (existingTutor) {
    console.log('✅ Tutor mock ya existe:', existingTutor.email);
    return existingTutor;
  }

  // Crear tutor mock
  const tutor = await prisma.tutor.create({
    data: {
      username: 'tutor_test',
      email: 'tutor.test@mateatletas.com',
      password_hash: passwordHash,
      nombre: 'María',
      apellido: 'González',
      dni: '35123456',
      telefono: '+54 9 11 1234-5678',
      fecha_registro: new Date(),
      debe_cambiar_password: false,
      debe_completar_perfil: false,
      ha_completado_onboarding: true,
      roles: ['tutor'], // JSON array
    },
  });

  console.log('✅ Tutor mock creado exitosamente:');
  console.log('   Email:', tutor.email);
  console.log('   Password: Test1234!');
  console.log('   ID:', tutor.id);

  // Crear algunos estudiantes para este tutor
  const estudiante1 = await prisma.estudiante.create({
    data: {
      tutor_id: tutor.id,
      nombre: 'Juan',
      apellido: 'González',
      edad: 10,
      nivel_escolar: 'Primaria',
      username: 'juan_gonzalez',
      email: 'juan.gonzalez@mateatletas.com',
      password_hash: passwordHash,
      debe_cambiar_password: false,
      nivel_actual: 3,
      puntos_totales: 250,
      avatar_url: 'avataaars',
      roles: ['estudiante'],
    },
  });

  const estudiante2 = await prisma.estudiante.create({
    data: {
      tutor_id: tutor.id,
      nombre: 'Sofía',
      apellido: 'González',
      edad: 8,
      nivel_escolar: 'Primaria',
      username: 'sofia_gonzalez',
      email: 'sofia.gonzalez@mateatletas.com',
      password_hash: passwordHash,
      debe_cambiar_password: false,
      nivel_actual: 1,
      puntos_totales: 150,
      avatar_url: 'avataaars',
      roles: ['estudiante'],
    },
  });

  console.log('✅ Estudiantes creados para el tutor:');
  console.log('   -', estudiante1.nombre, estudiante1.apellido, '(10 años)');
  console.log('   -', estudiante2.nombre, estudiante2.apellido, '(8 años)');

  return tutor;
}

// Ejecutar si se corre directamente
if (require.main === module) {
  seedTutorMock()
    .then(() => {
      console.log('✅ Seed completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
