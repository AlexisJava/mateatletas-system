import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createTestStudent() {
  console.log('🧑‍🎓 Creando estudiante de prueba...\n');

  // Obtener tutor y equipo
  const tutor = await prisma.tutor.findFirst();
  const equipo = await prisma.equipo.findFirst();

  if (!tutor || !equipo) {
    console.error(
      '❌ Error: No se encontró tutor o equipo. Ejecuta el seed primero.',
    );
    return;
  }

  const email = 'estudiante1@test.com';
  const password = 'estudiante123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Verificar si ya existe
  const existente = await prisma.estudiante.findUnique({
    where: { email },
  });

  if (existente) {
    console.log('✅ El estudiante ya existe:');
    console.log(`   Email: ${email}`);
    console.log(`   Nombre: ${existente.nombre} ${existente.apellido}`);
    console.log(`   Password: ${password}\n`);
    await prisma.$disconnect();
    return;
  }

  // Crear estudiante
  const estudiante = await prisma.estudiante.create({
    data: {
      email,
      password_hash: passwordHash,
      nombre: 'Ana',
      apellido: 'García',
      edad: 15, // Calculado desde 2010-05-15
      nivel_escolar: 'Secundaria',
      tutor_id: tutor.id,
      equipo_id: equipo.id,
      avatar_gradient: 0,
      puntos_totales: 250, // Para que tenga un nivel inicial
    },
  });

  console.log('✅ Estudiante creado exitosamente:');
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Nombre: ${estudiante.nombre} ${estudiante.apellido}`);
  console.log(`   Puntos: ${estudiante.puntos_totales}`);
  console.log(`   Equipo: ${equipo.nombre}\n`);

  await prisma.$disconnect();
}

createTestStudent().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
  process.exit(1);
});
