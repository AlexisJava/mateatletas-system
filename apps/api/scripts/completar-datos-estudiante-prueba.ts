/**
 * Script para completar datos faltantes del estudiante de prueba
 * - Recursos de gamificación
 * - Racha
 * - Inscripción a grupo
 *
 * Uso: npx tsx scripts/completar-datos-estudiante-prueba.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Completando datos del estudiante de prueba\n');

  const username = 'prueba';

  try {
    // 1. Buscar el estudiante
    const estudiante = await prisma.estudiante.findUnique({
      where: { username },
      include: {
        recursos: true,
        racha: true,
        inscripciones_clase_grupo: true,
      },
    });

    if (!estudiante) {
      throw new Error('❌ No se encontró el estudiante con username "prueba"');
    }

    console.log(
      `✓ Estudiante encontrado: ${estudiante.nombre} ${estudiante.apellido}`,
    );

    // 2. Crear recursos si no existen
    if (!estudiante.recursos) {
      await prisma.recursosEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          xp_total: 150,
          monedas_total: 250,
        },
      });
      console.log('✅ Recursos de gamificación creados');
    } else {
      console.log('✓ Recursos ya existen');
    }

    // 3. Crear racha si no existe
    if (!estudiante.racha) {
      await prisma.rachaEstudiante.create({
        data: {
          estudiante_id: estudiante.id,
          racha_actual: 3,
          racha_maxima: 3,
          ultima_actividad: new Date(),
          inicio_racha_actual: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Hace 3 días
          total_dias_activos: 5,
        },
      });
      console.log('✅ Racha inicial creada (3 días consecutivos)');
    } else {
      console.log('✓ Racha ya existe');
    }

    // 4. Inscribir en grupo B1 si no está inscrito
    if (estudiante.inscripciones_clase_grupo.length === 0) {
      const grupo = await prisma.grupo.findFirst({
        where: {
          activo: true,
          codigo: 'B1',
        },
      });

      if (grupo) {
        const claseGrupo = await prisma.claseGrupo.findFirst({
          where: {
            grupo_id: grupo.id,
            activo: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (claseGrupo) {
          await prisma.inscripcionClaseGrupo.create({
            data: {
              estudiante_id: estudiante.id,
              clase_grupo_id: claseGrupo.id,
              tutor_id: estudiante.tutor_id,
              fecha_inscripcion: new Date(),
            },
          });
          console.log(`✅ Inscrito en grupo ${grupo.codigo}`);
        } else {
          console.log('⚠️  No se encontró clase activa para grupo B1');
        }
      } else {
        console.log('⚠️  No se encontró grupo B1');
      }
    } else {
      console.log('✓ Ya está inscrito en un grupo');
    }

    // 5. Obtener datos finales
    const estudianteCompleto = await prisma.estudiante.findUnique({
      where: { id: estudiante.id },
      include: {
        recursos: true,
        racha: true,
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
    console.log('✅ DATOS COMPLETADOS EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES PARA TESTING MOBILE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Username: prueba`);
    console.log(`Email: prueba@estudiante.com`);
    console.log(`Password: prueba123`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DATOS DEL ESTUDIANTE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(
      `Nombre completo: ${estudianteCompleto?.nombre} ${estudianteCompleto?.apellido}`,
    );
    console.log(`Nivel: ${estudianteCompleto?.nivel_actual}`);
    console.log(`Puntos: ${estudianteCompleto?.puntos_totales}`);
    console.log(`XP Total: ${estudianteCompleto?.recursos?.xp_total || 0}`);
    console.log(`Monedas: ${estudianteCompleto?.recursos?.monedas_total || 0}`);
    console.log(
      `Racha: ${estudianteCompleto?.racha?.racha_actual || 0} días consecutivos`,
    );

    if (estudianteCompleto?.inscripciones_clase_grupo.length) {
      const inscripcion = estudianteCompleto.inscripciones_clase_grupo[0];
      const grupo = inscripcion.claseGrupo.grupo;
      console.log(`Grupo: ${grupo.codigo} - ${grupo.nombre}`);
      if (grupo.link_meet) {
        console.log(`Link Meet: ${grupo.link_meet}`);
      }
    }
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
