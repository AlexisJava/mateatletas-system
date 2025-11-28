/**
 * Script para crear estudiante de prueba para testing en celular
 *
 * Credenciales:
 * - Username: prueba
 * - Email: prueba@estudiante.com
 * - Password: prueba123
 *
 * Uso: npx tsx scripts/crear-estudiante-prueba-mobile.ts
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Creando estudiante de prueba para mobile testing\n');

  const username = 'prueba';
  const email = 'prueba@estudiante.com';
  const password = 'prueba123';
  const nombre = 'Test';
  const apellido = 'Mobile';

  try {
    // 1. Verificar si ya existe
    const existente = await prisma.estudiante.findFirst({
      where: {
        OR: [{ username }, { email }],
      },
    });

    if (existente) {
      console.log('⚠️  El estudiante ya existe. Actualizando contraseña...');
      const hashedPassword = await bcrypt.hash(password, 10);

      await prisma.estudiante.update({
        where: { id: existente.id },
        data: {
          password_hash: hashedPassword,
          password_temporal: password,
          debe_cambiar_password: false,
        },
      });

      console.log('✅ Contraseña actualizada\n');
      console.log('═══════════════════════════════════════════════════════');
      console.log('📋 CREDENCIALES PARA TESTING MOBILE');
      console.log('═══════════════════════════════════════════════════════');
      console.log(`Username: ${username}`);
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      console.log('═══════════════════════════════════════════════════════\n');

      return;
    }

    // 2. Buscar un tutor existente
    const tutor = await prisma.tutor.findFirst({
      orderBy: { createdAt: 'asc' },
    });

    if (!tutor) {
      throw new Error(
        '❌ No hay tutores en el sistema. Crea un tutor primero.',
      );
    }

    console.log(`✓ Tutor encontrado: ${tutor.nombre} ${tutor.apellido}`);

    // 3. Buscar un grupo activo (preferiblemente B1, B2 o B3)
    const grupo = await prisma.grupo.findFirst({
      where: {
        activo: true,
        codigo: { in: ['B1', 'B2', 'B3'] },
      },
    });

    if (grupo) {
      console.log(`✓ Grupo encontrado: ${grupo.codigo} - ${grupo.nombre}`);
    }

    // 4. Crear el estudiante
    const hashedPassword = await bcrypt.hash(password, 10);

    const estudiante = await prisma.estudiante.create({
      data: {
        username,
        email,
        password_hash: hashedPassword,
        password_temporal: password,
        debe_cambiar_password: false,
        nombre,
        apellido,
        edad: 12,
        nivel_escolar: 'Primaria',
        tutor_id: tutor.id,
        avatar_gradient: 3,
        puntos_totales: 150,
        nivel_actual: 2,
        roles: JSON.parse('["estudiante"]'),
      },
    });

    console.log(`✅ Estudiante creado: ${estudiante.id}`);

    // 5. Crear recursos de gamificación
    await prisma.recursosEstudiante.create({
      data: {
        estudiante_id: estudiante.id,
        xp_total: 150,
        monedas_total: 250,
      },
    });

    console.log('✅ Recursos de gamificación creados');

    // 6. Inscribir en un grupo si existe
    if (grupo) {
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

      if (claseGrupo) {
        await prisma.inscripcionClaseGrupo.create({
          data: {
            estudiante_id: estudiante.id,
            clase_grupo_id: claseGrupo.id,
            tutor_id: tutor.id,
            fecha_inscripcion: new Date(),
            estado: 'activa',
          },
        });

        console.log(`✅ Inscrito en grupo ${grupo.codigo}`);
      }
    }

    // 7. Crear racha inicial
    await prisma.rachaEstudiante.create({
      data: {
        estudiante_id: estudiante.id,
        dias_consecutivos: 3,
        fecha_ultimo_acceso: new Date(),
        dias_totales: 5,
        racha_maxima: 3,
      },
    });

    console.log('✅ Racha inicial creada (3 días consecutivos)');

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ ESTUDIANTE DE PRUEBA CREADO EXITOSAMENTE');
    console.log('═══════════════════════════════════════════════════════');
    console.log('📋 CREDENCIALES PARA TESTING MOBILE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Username: ${username}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DATOS DEL ESTUDIANTE:');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`Nombre completo: ${nombre} ${apellido}`);
    console.log(`Nivel: ${estudiante.nivel_actual}`);
    console.log(`Puntos: ${estudiante.puntos_totales}`);
    console.log(`XP Total: 150`);
    console.log(`Monedas: 250`);
    console.log(`Racha: 3 días consecutivos`);
    if (grupo) {
      console.log(`Grupo: ${grupo.codigo} - ${grupo.nombre}`);
      if (grupo.link_meet) {
        console.log(`Link Meet: ${grupo.link_meet}`);
      }
    }
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error al crear estudiante:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main();
