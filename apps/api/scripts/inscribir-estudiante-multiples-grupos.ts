/**
 * Script para inscribir al estudiante de prueba en MÚLTIPLES grupos
 * Esto permitirá testear el comportamiento cuando un estudiante tiene varias clases
 *
 * Grupos objetivo:
 * - B1 (ya inscrito)
 * - B2
 * - B3
 * - Otros grupos disponibles
 *
 * Uso: npx tsx scripts/inscribir-estudiante-multiples-grupos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Inscribiendo estudiante de prueba en múltiples grupos\n');

  const username = 'prueba';

  try {
    // 1. Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { username },
      include: {
        inscripciones_clase_grupo: {
          include: {
            claseGrupo: {
              include: {
                grupo: true,
              },
            },
          },
        },
      },
    });

    if (!estudiante) {
      throw new Error('❌ No se encontró el estudiante con username "prueba"');
    }

    console.log(`✓ Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`);
    console.log(`✓ Actualmente inscrito en ${estudiante.inscripciones_clase_grupo.length} grupo(s)\n`);

    // 2. Obtener grupos inscritos actualmente
    const gruposInscritos = estudiante.inscripciones_clase_grupo.map(
      (inscripcion) => inscripcion.claseGrupo.grupo.codigo
    );

    console.log('Grupos actuales:', gruposInscritos.join(', ') || 'ninguno');

    // 3. Buscar grupos disponibles (B1, B2, B3 y algunos más)
    const gruposObjetivo = ['B1', 'B2', 'B3'];

    // Obtener también grupos adicionales si existen
    const gruposAdicionales = await prisma.grupo.findMany({
      where: {
        activo: true,
        codigo: { notIn: gruposObjetivo },
      },
      take: 2, // Agregar 2 grupos adicionales
      orderBy: {
        codigo: 'asc',
      },
    });

    const todosLosGrupos = [...gruposObjetivo, ...gruposAdicionales.map(g => g.codigo)];

    console.log(`\nGrupos objetivo: ${todosLosGrupos.join(', ')}\n`);

    let inscripciones = 0;
    let saltados = 0;

    for (const codigoGrupo of todosLosGrupos) {
      // Saltar si ya está inscrito
      if (gruposInscritos.includes(codigoGrupo)) {
        console.log(`⏭️  ${codigoGrupo}: Ya inscrito, saltando...`);
        saltados++;
        continue;
      }

      // Buscar el grupo
      const grupo = await prisma.grupo.findUnique({
        where: { codigo: codigoGrupo },
      });

      if (!grupo) {
        console.log(`⚠️  ${codigoGrupo}: Grupo no encontrado, saltando...`);
        continue;
      }

      // Buscar una clase activa del grupo
      const claseGrupo = await prisma.claseGrupo.findFirst({
        where: {
          grupo_id: grupo.id,
          activo: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!claseGrupo) {
        console.log(`⚠️  ${codigoGrupo}: No hay clase activa, saltando...`);
        continue;
      }

      // Crear inscripción
      await prisma.inscripcionClaseGrupo.create({
        data: {
          estudiante_id: estudiante.id,
          clase_grupo_id: claseGrupo.id,
          tutor_id: estudiante.tutor_id,
          fecha_inscripcion: new Date(),
        },
      });

      console.log(`✅ ${codigoGrupo}: Inscrito en "${grupo.nombre}"`);
      if (grupo.link_meet) {
        console.log(`   Link Meet: ${grupo.link_meet}`);
      }
      inscripciones++;
    }

    // 4. Obtener estado final
    const estudianteFinal = await prisma.estudiante.findUnique({
      where: { id: estudiante.id },
      include: {
        inscripciones_clase_grupo: {
          include: {
            claseGrupo: {
              include: {
                grupo: true,
              },
            },
          },
        },
      },
    });

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ INSCRIPCIONES COMPLETADAS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Nuevas inscripciones: ${inscripciones}`);
    console.log(`Grupos saltados (ya inscrito): ${saltados}`);
    console.log(`Total de grupos ahora: ${estudianteFinal?.inscripciones_clase_grupo.length}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 GRUPOS DEL ESTUDIANTE:');
    console.log('═══════════════════════════════════════════════════════');

    estudianteFinal?.inscripciones_clase_grupo.forEach((inscripcion, index) => {
      const grupo = inscripcion.claseGrupo.grupo;
      console.log(`${index + 1}. ${grupo.codigo} - ${grupo.nombre}`);
      if (grupo.link_meet) {
        console.log(`   Link: ${grupo.link_meet}`);
      }
    });

    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
