import { PrismaClient } from '@prisma/client';

/**
 * Seed: Puntos de Prueba
 *
 * Genera puntos otorgados de prueba para verificar:
 * - Tab de Puntos en Portal Docente (historial por comisión)
 * - Gráficos de XP por tipo de acción
 * - Listado de puntos recientes
 *
 * Tipos de acciones que crea:
 * - PARTICIPACION (10 XP) - Participación en clase
 * - TAREA_COMPLETADA (15 XP) - Completar tarea
 * - QUIZ_APROBADO (20 XP) - Aprobar quiz
 * - AYUDA_COMPANERO (25 XP) - Ayudar a un compañero
 * - LOGRO (50 XP) - Desbloquear logro
 * - BONUS (5-30 XP) - Bonus especial
 */
export async function seedPuntosPrueba(prisma: PrismaClient) {
  console.log('\n🎖️  Creando puntos de prueba...\n');

  // Obtener docente de prueba (juan.perez@docente.com)
  const docente = await prisma.docente.findFirst({
    where: { email: 'juan.perez@docente.com' },
  });

  if (!docente) {
    console.log(
      '⚠️  Docente de prueba no encontrado. Ejecutar seed de docente primero.',
    );
    return;
  }

  // Obtener algunos estudiantes de prueba (de las suscripciones familiares)
  const estudiantes = await prisma.estudiante.findMany({
    where: {
      tutor: {
        email: {
          contains: 'suscripcion.test',
        },
      },
    },
    take: 10,
    include: {
      inscripcionesActividad: {
        where: { estado: 'ACTIVA' },
        include: { comision: true },
      },
    },
  });

  if (estudiantes.length === 0) {
    console.log(
      '⚠️  Estudiantes de prueba no encontrados. Ejecutar seed de suscripciones familiares primero.',
    );
    return;
  }

  // Tipos de acciones con sus puntos
  const tiposAcciones = [
    {
      tipo: 'PARTICIPACION',
      puntos: 10,
      contextos: [
        'Respuesta correcta en clase',
        'Pregunta inteligente',
        'Participación activa',
      ],
    },
    {
      tipo: 'TAREA_COMPLETADA',
      puntos: 15,
      contextos: ['Tarea Semana 1', 'Ejercicios de práctica', 'Proyecto final'],
    },
    {
      tipo: 'QUIZ_APROBADO',
      puntos: 20,
      contextos: ['Quiz de números', 'Evaluación álgebra', 'Test de geometría'],
    },
    {
      tipo: 'AYUDA_COMPANERO',
      puntos: 25,
      contextos: [
        'Explicó tema a compañero',
        'Trabajo en equipo destacado',
        'Mentor del grupo',
      ],
    },
    {
      tipo: 'LOGRO',
      puntos: 50,
      contextos: [
        'Primera semana perfecta',
        'Streak de 5 días',
        'Top 3 del grupo',
      ],
    },
    {
      tipo: 'BONUS',
      puntos: 15,
      contextos: [
        'Bonus especial',
        'Premio sorpresa',
        'Reconocimiento del docente',
      ],
    },
  ];

  // Generar puntos aleatorios para los últimos 30 días
  const puntosACrear: {
    estudiante_id: string;
    docente_id: string;
    tipo_accion: string;
    puntos: number;
    contexto: string;
    fecha_otorgado: Date;
  }[] = [];

  const ahora = new Date();

  for (const estudiante of estudiantes) {
    // Entre 5 y 15 puntos por estudiante
    const cantidadPuntos = Math.floor(Math.random() * 11) + 5;

    for (let i = 0; i < cantidadPuntos; i++) {
      // Seleccionar tipo aleatorio
      const tipoIdx = Math.floor(Math.random() * tiposAcciones.length);
      const tipo = tiposAcciones[tipoIdx]!;
      const contextoIdx = Math.floor(Math.random() * tipo.contextos.length);
      const contexto = tipo.contextos[contextoIdx]!;

      // Fecha aleatoria en los últimos 30 días
      const diasAtras = Math.floor(Math.random() * 30);
      const fecha = new Date(ahora);
      fecha.setDate(fecha.getDate() - diasAtras);
      fecha.setHours(Math.floor(Math.random() * 8) + 9); // Entre 9am y 5pm

      puntosACrear.push({
        estudiante_id: estudiante.id,
        docente_id: docente.id,
        tipo_accion: tipo.tipo,
        puntos: tipo.puntos,
        contexto: contexto,
        fecha_otorgado: fecha,
      });
    }
  }

  // Crear puntos en batch
  const resultado = await prisma.puntoObtenido.createMany({
    data: puntosACrear,
    skipDuplicates: true,
  });

  // Actualizar XP total de estudiantes (en RecursosEstudiante)
  const xpPorEstudiante: Record<string, number> = {};
  for (const punto of puntosACrear) {
    xpPorEstudiante[punto.estudiante_id] =
      (xpPorEstudiante[punto.estudiante_id] || 0) + punto.puntos;
  }

  for (const estudianteId of Object.keys(xpPorEstudiante)) {
    const xpTotal = xpPorEstudiante[estudianteId];
    await prisma.recursosEstudiante.upsert({
      where: { estudiante_id: estudianteId },
      create: {
        estudiante_id: estudianteId,
        xp_total: xpTotal,
      },
      update: {
        xp_total: {
          increment: xpTotal,
        },
      },
    });
  }

  // Resumen
  const resumenTipos = puntosACrear.reduce(
    (acc, p) => {
      acc[p.tipo_accion] = (acc[p.tipo_accion] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  console.log(
    `   ✅ ${resultado.count} puntos creados para ${estudiantes.length} estudiantes`,
  );
  console.log('   📊 Distribución por tipo:');
  for (const [tipo, cantidad] of Object.entries(resumenTipos)) {
    console.log(`      - ${tipo}: ${cantidad}`);
  }
  console.log(`   👨‍🏫 Docente: ${docente.nombre} ${docente.apellido}`);
  console.log('');
}
