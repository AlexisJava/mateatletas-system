/**
 * Script para asignar estudiantes a sus grupos basándose en sus sectores
 *
 * Problema: Los estudiantes tienen sectores pero no grupos específicos asignados
 * Solución: Asignar el campo equipo_id al primer grupo activo del sector principal
 *
 * Uso: npx tsx scripts/asignar-estudiantes-a-grupos.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Iniciando asignación de estudiantes a grupos...\n');

  try {
    // Obtener todos los estudiantes con sus sectores
    const estudiantes = await prisma.estudiante.findMany({
      include: {
        sectores: {
          include: {
            sector: {
              include: {
                grupos: {
                  where: { activo: true },
                  orderBy: { nombre: 'asc' },
                },
              },
            },
          },
          orderBy: {
            es_principal: 'desc', // Sector principal primero
          },
        },
      },
    });

    console.log(`📊 Total de estudiantes: ${estudiantes.length}\n`);

    let asignados = 0;
    let sinGrupo = 0;
    let yaTienenGrupo = 0;

    for (const estudiante of estudiantes) {
      // Si ya tiene equipo_id asignado, verificar si es válido
      if (estudiante.equipo_id) {
        // Verificar si el equipo_id apunta a un grupo válido
        const grupoExiste = await prisma.grupo.findUnique({
          where: { id: estudiante.equipo_id },
        });

        if (grupoExiste) {
          console.log(`✅ ${estudiante.nombre} ${estudiante.apellido} - Ya asignado a grupo: ${grupoExiste.nombre}`);
          yaTienenGrupo++;
          continue;
        } else {
          console.log(`⚠️  ${estudiante.nombre} ${estudiante.apellido} - Tiene equipo_id inválido, reasignando...`);
        }
      }

      // Obtener el sector principal (o el primero si no hay principal)
      const sectorPrincipal = estudiante.sectores.find((s) => s.es_principal) || estudiante.sectores[0];

      if (!sectorPrincipal) {
        console.log(`⚠️  ${estudiante.nombre} ${estudiante.apellido} - Sin sectores asignados`);
        sinGrupo++;
        continue;
      }

      // Obtener el primer grupo activo del sector
      const grupos = sectorPrincipal.sector.grupos;

      if (grupos.length === 0) {
        console.log(`⚠️  ${estudiante.nombre} ${estudiante.apellido} - Sector "${sectorPrincipal.sector.nombre}" sin grupos activos`);
        sinGrupo++;
        continue;
      }

      // Asignar al primer grupo del sector
      const grupoAsignado = grupos[0];

      await prisma.estudiante.update({
        where: { id: estudiante.id },
        data: { equipo_id: grupoAsignado.id },
      });

      console.log(`✅ ${estudiante.nombre} ${estudiante.apellido} → Grupo: ${grupoAsignado.nombre} (${sectorPrincipal.sector.nombre})`);
      asignados++;
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ASIGNACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Estudiantes asignados: ${asignados}`);
    console.log(`Ya tenían grupo: ${yaTienenGrupo}`);
    console.log(`Sin grupo (sin sectores o sector sin grupos): ${sinGrupo}`);
    console.log(`Total procesados: ${estudiantes.length}`);
    console.log('═══════════════════════════════════════════════════════\n');

    // Mostrar resumen por grupo
    console.log('📊 RESUMEN POR GRUPO:');
    console.log('═══════════════════════════════════════════════════════');

    const gruposConEstudiantes = await prisma.grupo.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: {
            estudiantes: true, // Asumiendo que existe la relación inversa
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });

    // Contar manualmente ya que no existe la relación directa
    for (const grupo of gruposConEstudiantes) {
      const count = await prisma.estudiante.count({
        where: { equipo_id: grupo.id },
      });

      if (count > 0) {
        console.log(`${grupo.nombre} (${grupo.codigo}): ${count} estudiantes`);
      }
    }
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error durante la asignación:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
