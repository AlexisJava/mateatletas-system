import { PrismaClient, TipoClaseGrupo, DiaSemana } from '@prisma/client';

/**
 * Seed: ClaseGrupos
 * Crea grupos de clases recurrentes para desarrollo
 */
export async function seedClaseGrupos(prisma: PrismaClient) {
  console.log('\n📅 Creando grupos de clases recurrentes...');

  // Buscar docente y estudiantes
  const docente = await prisma.docente.findFirst({
    where: { email: 'juan.perez@docente.com' },
  });

  const estudiantes = await prisma.estudiante.findMany({
    where: {
      tutor: {
        email: 'maria.garcia@tutor.com',
      },
    },
  });

  if (!docente) {
    console.log('⚠️  No se encontró el docente de prueba, saltando...');
    return;
  }

  if (estudiantes.length === 0) {
    console.log('⚠️  No se encontraron estudiantes, saltando...');
    return;
  }

  // Buscar ruta curricular
  const rutaAlgebra = await prisma.rutaCurricular.findFirst({
    where: { nombre: { contains: 'Álgebra' } },
  });

  // Obtener grupo pedagógico B1
  const grupoPedagogicoB1 = await prisma.grupo.findUnique({
    where: { codigo: 'B1' },
  });

  if (!grupoPedagogicoB1) {
    throw new Error(
      'Grupo pedagógico B1 no encontrado. Ejecutar migración primero.',
    );
  }

  // Grupo B1 - Lunes 19:30
  const grupoB1 = await prisma.claseGrupo.upsert({
    where: {
      nombre: 'GRUPO B1 - MATEMÁTICA - PERFIL BASE PROGRESIVO (6 y 7 años)',
    },
    update: {},
    create: {
      codigo: 'B1',
      nombre: 'GRUPO B1 - MATEMÁTICA - PERFIL BASE PROGRESIVO (6 y 7 años)',
      tipo: TipoClaseGrupo.GRUPO_REGULAR,
      dia_semana: DiaSemana.LUNES,
      hora_inicio: '19:30',
      hora_fin: '21:00',
      fecha_inicio: new Date('2025-03-01'),
      fecha_fin: new Date('2025-12-15'), // Automático para GRUPO_REGULAR
      anio_lectivo: 2025,
      cupo_maximo: 15,
      grupo_id: grupoPedagogicoB1.id,
      docente_id: docente.id,
      ruta_curricular_id: rutaAlgebra?.id,
      nivel: '6 y 7 años',
      activo: true,
    },
  });

  console.log(`   ✅ ${grupoB1.codigo} - ${grupoB1.nombre}`);
  console.log(
    `      ${grupoB1.dia_semana} ${grupoB1.hora_inicio} - ${grupoB1.hora_fin}`,
  );

  // Inscribir estudiantes al grupo
  for (const estudiante of estudiantes) {
    await prisma.inscripcionClaseGrupo.upsert({
      where: {
        clase_grupo_id_estudiante_id: {
          clase_grupo_id: grupoB1.id,
          estudiante_id: estudiante.id,
        },
      },
      update: {},
      create: {
        clase_grupo_id: grupoB1.id,
        estudiante_id: estudiante.id,
        tutor_id: estudiante.tutor_id,
        fecha_inscripcion: new Date(),
      },
    });

    console.log(
      `      📝 ${estudiante.nombre} ${estudiante.apellido} inscrito`,
    );
  }

  // Obtener grupo pedagógico B2
  const grupoPedagogicoB2 = await prisma.grupo.findUnique({
    where: { codigo: 'B2' },
  });

  if (!grupoPedagogicoB2) {
    throw new Error(
      'Grupo pedagógico B2 no encontrado. Ejecutar migración primero.',
    );
  }

  // Grupo B2 - Miércoles 18:00 (ejemplo de curso temporal)
  const grupoB2 = await prisma.claseGrupo.upsert({
    where: { nombre: 'CURSO TEMPORAL - Álgebra Intensiva' },
    update: {},
    create: {
      codigo: 'B2',
      nombre: 'CURSO TEMPORAL - Álgebra Intensiva',
      tipo: TipoClaseGrupo.CURSO_TEMPORAL,
      dia_semana: DiaSemana.MIERCOLES,
      hora_inicio: '18:00',
      hora_fin: '19:30',
      grupo_id: grupoPedagogicoB2.id,
      fecha_inicio: new Date('2025-11-01'),
      fecha_fin: new Date('2026-01-15'), // Fecha específica para cursos temporales
      anio_lectivo: 2025,
      cupo_maximo: 10,
      docente_id: docente.id,
      ruta_curricular_id: rutaAlgebra?.id,
      nivel: 'Secundaria',
      activo: true,
    },
  });

  console.log(`   ✅ ${grupoB2.codigo} - ${grupoB2.nombre}`);
  console.log(
    `      ${grupoB2.dia_semana} ${grupoB2.hora_inicio} - ${grupoB2.hora_fin}`,
  );
  console.log(
    `      Finaliza: ${grupoB2.fecha_fin.toISOString().split('T')[0]}`,
  );

  console.log('✅ Grupos de clases creados\n');
}
