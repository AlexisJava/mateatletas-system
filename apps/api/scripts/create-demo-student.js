const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function createStudent() {
  const hash = await bcrypt.hash('estudiante123', 12);

  // Buscar tutor y casa
  const tutor = await prisma.tutor.findFirst();
  const casa = await prisma.casa.findFirst();

  console.log('Tutor:', tutor?.id);
  console.log('Casa:', casa?.id);

  if (!tutor || !casa) {
    console.log('ERROR: No hay tutor o casa en la DB');
    await prisma.$disconnect();
    return;
  }

  // Eliminar si existe
  try {
    await prisma.recursosEstudiante.deleteMany({
      where: { estudiante_id: 'demo-estudiante' },
    });
    await prisma.estudiante.deleteMany({
      where: { username: 'demo.estudiante' },
    });
  } catch (e) {
    console.log('Limpieza previa:', e.message);
  }

  // Crear estudiante usando connect para relaciones
  const estudiante = await prisma.estudiante.create({
    data: {
      id: 'demo-estudiante',
      username: 'demo.estudiante',
      nombre: 'Demo',
      apellido: 'Estudiante',
      nivelEscolar: 'PRIMARIA',
      edad: 12,
      email: 'demo@estudiante.com',
      password_hash: hash,
      tutor: { connect: { id: tutor.id } },
      casa: { connect: { id: casa.id } },
      roles: ['ESTUDIANTE'],
      nivel_actual: 1,
      avatar_gradient: 0,
    },
  });

  // Crear recursos
  await prisma.recursosEstudiante.create({
    data: {
      estudiante: { connect: { id: estudiante.id } },
      xp_total: 100,
    },
  });

  console.log('✅ Estudiante creado exitosamente');
  console.log('   Username: demo.estudiante');
  console.log('   Password: estudiante123');
  await prisma.$disconnect();
}

createStudent().catch((e) => {
  console.error('Error:', e);
  prisma.$disconnect();
});
