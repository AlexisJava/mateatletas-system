/**
 * LIMPIAR ESTUDIANTES DUPLICADOS
 * Elimina los estudiantes con nombres incompletos que son duplicados
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Limpiando estudiantes duplicados...\n');

  // Los usernames de los duplicados a eliminar
  const duplicadosAEliminar = [
    'augusto.carrilo',           // duplicado de augusto.carrillo.bascary.rojas
    'diego.colman',              // duplicado de diego.paolo.colman.gonzalez
    'lucio.pepe.ronchese',       // duplicado de lucio.ronchese
    'jazmn.acosta.mangini',      // duplicado de jazmin.acosta
    'camilo.torres.dominguez',   // duplicado de camilo.torres
  ];

  for (const username of duplicadosAEliminar) {
    const estudiante = await prisma.estudiante.findUnique({
      where: { username },
      include: {
        inscripciones_clase_grupo: true,
        inscripciones_mensuales: true,
      }
    });

    if (estudiante) {
      console.log(`\n🗑️  Eliminando duplicado: ${estudiante.nombre} ${estudiante.apellido} (${username})`);
      console.log(`   Inscripciones en grupos: ${estudiante.inscripciones_clase_grupo.length}`);
      console.log(`   Inscripciones mensuales: ${estudiante.inscripciones_mensuales.length}`);

      // Eliminar inscripciones mensuales
      await prisma.inscripcionMensual.deleteMany({
        where: { estudiante_id: estudiante.id }
      });

      // Eliminar inscripciones a grupos
      await prisma.inscripcionClaseGrupo.deleteMany({
        where: { estudiante_id: estudiante.id }
      });

      // Eliminar estudiante
      await prisma.estudiante.delete({
        where: { id: estudiante.id }
      });

      console.log(`   ✓ Eliminado`);
    } else {
      console.log(`   ⚠️  No se encontró: ${username}`);
    }
  }

  console.log('\n========================================');
  console.log('✅ DUPLICADOS ELIMINADOS');
  console.log('========================================\n');
}

main()
  .catch((e) => {
    console.error('❌ Error limpiando duplicados:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
