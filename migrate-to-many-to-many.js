const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function migrateSectores() {
  console.log('🔄 Iniciando migración de sectores a relación muchos-a-muchos...\n');

  try {
    // 1. Obtener todos los estudiantes con sector_id
    const estudiantes = await prisma.estudiante.findMany({
      where: {
        sector_id: {
          not: null
        }
      },
      include: {
        tutor: true,
        sector: true
      }
    });

    console.log(`📊 Encontrados ${estudiantes.length} estudiantes con sector asignado\n`);

    // 2. Agrupar estudiantes por tutor_id + nombre + apellido para detectar duplicados
    const estudiantesAgrupados = estudiantes.reduce((acc, est) => {
      const key = `${est.tutor_id}-${est.nombre}-${est.apellido}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(est);
      return acc;
    }, {});

    console.log('🔍 Analizando duplicados...\n');

    let totalUnificados = 0;
    let totalMigrados = 0;

    for (const [key, duplicados] of Object.entries(estudiantesAgrupados)) {
      if (duplicados.length > 1) {
        console.log(`\n👥 Encontrado estudiante duplicado:`);
        console.log(`   Nombre: ${duplicados[0].nombre} ${duplicados[0].apellido}`);
        console.log(`   Tutor: ${duplicados[0].tutor.nombre} ${duplicados[0].tutor.apellido}`);
        console.log(`   Registros: ${duplicados.length}`);

        // Mantener solo el PRIMER registro (el más antiguo)
        const estudiantePrincipal = duplicados.sort((a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )[0];

        console.log(`   ✅ Manteniendo ID: ${estudiantePrincipal.id} (${estudiantePrincipal.sector?.nombre})`);

        // Crear registros en estudiante_sectores para TODOS los sectores
        for (const dup of duplicados) {
          const esPrincipal = dup.id === estudiantePrincipal.id;

          // Verificar si ya existe el registro en estudiante_sectores
          const existeRelacion = await prisma.estudianteSector.findFirst({
            where: {
              estudiante_id: estudiantePrincipal.id,
              sector_id: dup.sector_id
            }
          });

          if (!existeRelacion && dup.sector_id) {
            await prisma.estudianteSector.create({
              data: {
                estudiante_id: estudiantePrincipal.id,
                sector_id: dup.sector_id,
                es_principal: esPrincipal,
                fecha_inicio: dup.createdAt
              }
            });
            console.log(`   🔗 Vinculado a sector: ${dup.sector?.nombre} ${esPrincipal ? '(PRINCIPAL)' : ''}`);
          }
        }

        // Migrar inscripciones de clases de los duplicados al principal
        for (const dup of duplicados) {
          if (dup.id !== estudiantePrincipal.id) {
            // Actualizar inscripciones_clase_grupo
            const updated = await prisma.inscripcionClaseGrupo.updateMany({
              where: {
                estudiante_id: dup.id
              },
              data: {
                estudiante_id: estudiantePrincipal.id
              }
            });

            if (updated.count > 0) {
              console.log(`   📝 Migradas ${updated.count} inscripciones de clase del duplicado`);
            }

            // Eliminar el registro duplicado
            await prisma.estudiante.delete({
              where: {
                id: dup.id
              }
            });
            console.log(`   🗑️  Eliminado duplicado ID: ${dup.id}`);
          }
        }

        totalUnificados++;
      } else {
        // Estudiante sin duplicados, solo migrar a estudiante_sectores
        const est = duplicados[0];

        if (est.sector_id) {
          const existeRelacion = await prisma.estudianteSector.findFirst({
            where: {
              estudiante_id: est.id,
              sector_id: est.sector_id
            }
          });

          if (!existeRelacion) {
            await prisma.estudianteSector.create({
              data: {
                estudiante_id: est.id,
                sector_id: est.sector_id,
                es_principal: true,
                fecha_inicio: est.createdAt
              }
            });
            totalMigrados++;
          }
        }
      }
    }

    console.log('\n\n✅ Migración completada!');
    console.log(`   📊 Estudiantes unificados: ${totalUnificados}`);
    console.log(`   📊 Estudiantes migrados (sin duplicados): ${totalMigrados}`);

    // Verificar resultados
    const totalRelaciones = await prisma.estudianteSector.count();
    console.log(`   📊 Total de relaciones estudiante-sector: ${totalRelaciones}`);

    // Mostrar Emma como ejemplo
    console.log('\n🎯 Verificando Emma Figueroa Yañez:');
    const emma = await prisma.estudiante.findFirst({
      where: {
        nombre: 'Emma',
        apellido: 'Figueroa Yañez'
      },
      include: {
        sectores: {
          include: {
            sector: true
          }
        }
      }
    });

    if (emma) {
      console.log(`   ID único: ${emma.id}`);
      console.log(`   Sectores: ${emma.sectores.map(s => s.sector.nombre).join(', ')}`);
    }

  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateSectores();
