/**
 * Script para normalizar estudiantes duplicados
 *
 * Problema: Algunos estudiantes tienen múltiples registros porque están en varios sectores
 * Solución: Consolidar en UN solo registro y usar la tabla estudiante_sectores para la relación
 *
 * Uso: npx tsx scripts/normalizar-estudiantes-duplicados.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface EstudianteDuplicado {
  nombre: string;
  apellido: string;
  registros: {
    id: string;
    password_temporal: string | null;
    createdAt: Date;
    sectores: { id: string; nombre: string }[];
  }[];
}

async function encontrarDuplicados(): Promise<EstudianteDuplicado[]> {
  // Encontrar todos los nombres duplicados
  const duplicados = await prisma.$queryRaw<
    { nombre: string; apellido: string }[]
  >`
    SELECT nombre, apellido
    FROM estudiantes
    GROUP BY nombre, apellido
    HAVING COUNT(*) > 1
  `;

  console.log(
    `\n📊 Encontrados ${duplicados.length} estudiantes con registros duplicados\n`,
  );

  // Para cada duplicado, obtener todos sus registros con sectores
  const resultado: EstudianteDuplicado[] = [];

  for (const dup of duplicados) {
    const registros = await prisma.estudiante.findMany({
      where: {
        nombre: dup.nombre,
        apellido: dup.apellido,
      },
      include: {
        sectores: {
          include: {
            sector: {
              select: { id: true, nombre: true },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Más antiguo primero
      },
    });

    resultado.push({
      nombre: dup.nombre,
      apellido: dup.apellido,
      registros: registros.map((r) => ({
        id: r.id,
        password_temporal: r.password_temporal,
        createdAt: r.createdAt,
        sectores: r.sectores.map((s) => ({
          id: s.sector.id,
          nombre: s.sector.nombre,
        })),
      })),
    });
  }

  return resultado;
}

async function consolidarEstudiante(duplicado: EstudianteDuplicado) {
  console.log(`\n🔄 Consolidando: ${duplicado.nombre} ${duplicado.apellido}`);

  // El registro a mantener es el más antiguo (primero en el array)
  const registroPrincipal = duplicado.registros[0];
  const registrosAEliminar = duplicado.registros.slice(1);

  console.log(
    `   ✅ Mantener: ID ${registroPrincipal.id} (PIN: ${registroPrincipal.password_temporal})`,
  );
  console.log(
    `   📍 Sectores actuales: ${registroPrincipal.sectores.map((s) => s.nombre).join(', ')}`,
  );

  // Recopilar todos los sectores únicos de todos los registros
  const todosLosSectores = new Set<string>();
  duplicado.registros.forEach((reg) => {
    reg.sectores.forEach((sector) => {
      todosLosSectores.add(sector.id);
    });
  });

  // Agregar sectores faltantes al registro principal
  for (const sectorId of todosLosSectores) {
    const yaExiste = registroPrincipal.sectores.some((s) => s.id === sectorId);

    if (!yaExiste) {
      const sectorNombre = duplicado.registros
        .flatMap((r) => r.sectores)
        .find((s) => s.id === sectorId)?.nombre;

      console.log(`   ➕ Agregando sector: ${sectorNombre}`);

      await prisma.estudianteSector.create({
        data: {
          estudiante_id: registroPrincipal.id,
          sector_id: sectorId,
          es_principal: false,
        },
      });
    }
  }

  // Migrar relaciones de los duplicados al principal (asistencias, planificaciones, etc.)
  for (const regDup of registrosAEliminar) {
    console.log(
      `   🔀 Migrando datos de ID ${regDup.id} (PIN: ${regDup.password_temporal})`,
    );

    // Migrar asistencias
    const asistencias = await prisma.asistencia.count({
      where: { estudiante_id: regDup.id },
    });
    if (asistencias > 0) {
      await prisma.asistencia.updateMany({
        where: { estudiante_id: regDup.id },
        data: { estudiante_id: registroPrincipal.id },
      });
      console.log(`      → ${asistencias} asistencias migradas`);
    }

    // Migrar asistencias_clase_grupo
    const asistenciasGrupo = await prisma.asistenciaClaseGrupo.count({
      where: { estudiante_id: regDup.id },
    });
    if (asistenciasGrupo > 0) {
      await prisma.asistenciaClaseGrupo.updateMany({
        where: { estudiante_id: regDup.id },
        data: { estudiante_id: registroPrincipal.id },
      });
      console.log(`      → ${asistenciasGrupo} asistencias de grupo migradas`);
    }

    // Eliminar sectores del duplicado (se eliminará automáticamente por CASCADE)
    console.log(`   🗑️  Eliminando registro duplicado ID ${regDup.id}`);
    await prisma.estudiante.delete({
      where: { id: regDup.id },
    });
  }

  console.log(`   ✅ Consolidación completa`);
  console.log(
    `   📍 Sectores finales: ${Array.from(todosLosSectores).length} sectores`,
  );
}

async function main() {
  console.log('🚀 Iniciando normalización de estudiantes duplicados...\n');

  try {
    // 1. Encontrar duplicados
    const duplicados = await encontrarDuplicados();

    if (duplicados.length === 0) {
      console.log(
        '✅ No hay estudiantes duplicados. Base de datos ya normalizada.\n',
      );
      return;
    }

    // 2. Mostrar resumen
    console.log('═══════════════════════════════════════════════════════');
    console.log('RESUMEN DE DUPLICADOS');
    console.log('═══════════════════════════════════════════════════════');
    duplicados.forEach((dup) => {
      console.log(`\n${dup.nombre} ${dup.apellido}:`);
      dup.registros.forEach((reg, idx) => {
        console.log(
          `  ${idx + 1}. ID: ${reg.id} | PIN: ${reg.password_temporal} | Sectores: ${reg.sectores.map((s) => s.nombre).join(', ')}`,
        );
      });
    });
    console.log('\n═══════════════════════════════════════════════════════\n');

    // 3. Consolidar cada duplicado
    for (const dup of duplicados) {
      await consolidarEstudiante(dup);
    }

    // 4. Verificar resultado
    const duplicadosRestantes = await prisma.$queryRaw<{ count: number }[]>`
      SELECT COUNT(*) as count
      FROM (
        SELECT nombre, apellido, COUNT(*) as cantidad
        FROM estudiantes
        GROUP BY nombre, apellido
        HAVING COUNT(*) > 1
      ) duplicados
    `;

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ NORMALIZACIÓN COMPLETADA');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Duplicados restantes: ${duplicadosRestantes[0].count}`);
    console.log(`Total de estudiantes procesados: ${duplicados.length}`);
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error durante la normalización:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
