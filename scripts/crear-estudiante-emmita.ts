import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Script para crear estudiante trucha: Emmita Figueroa Yañez
 *
 * Credenciales:
 * - Email: emmita@estudiante.com
 * - Password: emmita123
 */

async function main() {
  console.log('🚀 Creando estudiante trucha: Emmita Figueroa Yañez');

  const email = 'emmita@estudiante.com';
  const password = 'emmita123';
  const nombre = 'Emmita';
  const apellido = 'Figueroa Yañez';

  // 1. Verificar si ya existe
  const existingUser = await prisma.usuario.findUnique({
    where: { email },
  });

  if (existingUser) {
    console.log('⚠️  El usuario ya existe. Actualizando contraseña...');
    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.usuario.update({
      where: { email },
      data: { password: hashedPassword },
    });

    console.log('✅ Contraseña actualizada');
    console.log('\n📋 CREDENCIALES:');
    console.log('   Email: emmita@estudiante.com');
    console.log('   Password: emmita123');
    console.log('   Rol: estudiante');

    return;
  }

  // 2. Crear usuario
  const hashedPassword = await bcrypt.hash(password, 10);

  const usuario = await prisma.usuario.create({
    data: {
      email,
      password: hashedPassword,
      nombre,
      apellido,
      role: 'estudiante',
      activo: true,
    },
  });

  console.log(`✅ Usuario creado: ${usuario.id}`);

  // 3. Crear perfil de estudiante
  const estudiante = await prisma.estudiante.create({
    data: {
      usuario_id: usuario.id,
      fecha_nacimiento: new Date('2010-03-15'), // 14 años
      nivel_educativo: 'Primaria',
      observaciones: 'Estudiante trucha para testing - Emmita Figueroa Yañez',
    },
  });

  console.log(`✅ Estudiante creado: ${estudiante.id}`);

  // 4. Buscar un tutor existente (el primero que encuentre)
  const tutorExistente = await prisma.tutor.findFirst();

  if (tutorExistente) {
    // Vincular con tutor
    await prisma.estudiante.update({
      where: { id: estudiante.id },
      data: { tutor_id: tutorExistente.id },
    });
    console.log(`✅ Vinculado con tutor: ${tutorExistente.id}`);
  } else {
    console.log('⚠️  No hay tutores en el sistema. Estudiante sin tutor.');
  }

  console.log('\n✨ PROCESO COMPLETADO\n');
  console.log('📋 CREDENCIALES:');
  console.log('   Email: emmita@estudiante.com');
  console.log('   Password: emmita123');
  console.log('   Rol: estudiante');
  console.log('\n🌐 URLs:');
  console.log('   Login: http://localhost:3000/login');
  console.log('   Dashboard: http://localhost:3000/estudiante/dashboard');
  console.log('   Planificaciones: http://localhost:3000/estudiante/planificaciones');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
