import { PrismaClient } from '@prisma/client';

/**
 * Seed de logros específicos para el sistema de planificaciones
 * Estos logros se otorgan cuando los estudiantes completan:
 * - Lecciones (teoría/práctica)
 * - Clases completas (teoría + práctica)
 * - Tareas asignadas
 * - Planificaciones completas
 */
export async function seedLogrosPlanificaciones(prisma: PrismaClient) {
  console.log('📚 Seeding logros de planificaciones...');

  const logrosPlanificaciones = [
    // ========== LECCIONES (teoría/práctica individual) ==========
    {
      codigo: 'PRIMERA_LECCION_TEORIA',
      nombre: 'Primer Vistazo',
      descripcion: 'Completa tu primera lección de teoría',
      categoria: 'planificaciones',
      xp_recompensa: 25,
      criterio_tipo: 'leccion_teoria_completada',
      criterio_valor: '1',
      icono: '📖',
      rareza: 'comun',
      secreto: false,
      orden: 100,
    },
    {
      codigo: 'PRIMERA_LECCION_PRACTICA',
      nombre: 'Manos a la Obra',
      descripcion: 'Completa tu primera lección de práctica',
      categoria: 'planificaciones',
      xp_recompensa: 30,
      criterio_tipo: 'leccion_practica_completada',
      criterio_valor: '1',
      icono: '⚡',
      rareza: 'comun',
      secreto: false,
      orden: 101,
    },
    {
      codigo: 'DIEZ_LECCIONES',
      nombre: 'Estudiante Aplicado',
      descripcion: 'Completa 10 lecciones (teoría o práctica)',
      categoria: 'planificaciones',
      xp_recompensa: 100,
      criterio_tipo: 'lecciones_completadas',
      criterio_valor: '10',
      icono: '📚',
      rareza: 'comun',
      secreto: false,
      orden: 102,
    },
    {
      codigo: 'CINCUENTA_LECCIONES',
      nombre: 'Devorador de Contenido',
      descripcion: 'Completa 50 lecciones',
      categoria: 'planificaciones',
      xp_recompensa: 300,
      criterio_tipo: 'lecciones_completadas',
      criterio_valor: '50',
      icono: '🔥📚',
      rareza: 'raro',
      secreto: false,
      animacion: 'lluvia_libros',
      orden: 103,
    },

    // ========== CLASES COMPLETAS (teoría + práctica) ==========
    {
      codigo: 'PRIMERA_CLASE_COMPLETADA',
      nombre: 'Clase Maestra',
      descripcion: 'Completa tu primera clase (teoría + práctica)',
      categoria: 'planificaciones',
      xp_recompensa: 50,
      criterio_tipo: 'clase_completada',
      criterio_valor: '1',
      icono: '🎓',
      rareza: 'comun',
      secreto: false,
      orden: 110,
    },
    {
      codigo: 'CINCO_CLASES_COMPLETADAS',
      nombre: 'Estudiante Dedicado',
      descripcion: 'Completa 5 clases completas',
      categoria: 'planificaciones',
      xp_recompensa: 150,
      criterio_tipo: 'clases_completadas',
      criterio_valor: '5',
      icono: '🎓🎓',
      rareza: 'comun',
      secreto: false,
      orden: 111,
    },
    {
      codigo: 'DIEZ_CLASES_COMPLETADAS',
      nombre: 'Académico',
      descripcion: 'Completa 10 clases completas',
      categoria: 'planificaciones',
      xp_recompensa: 300,
      criterio_tipo: 'clases_completadas',
      criterio_valor: '10',
      icono: '🏅',
      rareza: 'raro',
      secreto: false,
      animacion: 'medalla_dorada',
      orden: 112,
    },
    {
      codigo: 'VEINTICINCO_CLASES_COMPLETADAS',
      nombre: 'Erudito',
      descripcion: 'Completa 25 clases completas',
      categoria: 'planificaciones',
      xp_recompensa: 600,
      criterio_tipo: 'clases_completadas',
      criterio_valor: '25',
      icono: '🎖️',
      rareza: 'epico',
      secreto: false,
      titulo: 'Erudito',
      animacion: 'corona_academica',
      orden: 113,
    },

    // ========== TAREAS ==========
    {
      codigo: 'PRIMERA_TAREA_COMPLETADA',
      nombre: 'Responsable',
      descripcion: 'Completa tu primera tarea asignada',
      categoria: 'planificaciones',
      xp_recompensa: 40,
      criterio_tipo: 'tarea_completada',
      criterio_valor: '1',
      icono: '✅',
      rareza: 'comun',
      secreto: false,
      orden: 120,
    },
    {
      codigo: 'TAREA_A_TIEMPO',
      nombre: 'Puntual',
      descripcion: 'Entrega una tarea antes de la fecha límite',
      categoria: 'planificaciones',
      xp_recompensa: 30,
      criterio_tipo: 'tarea_a_tiempo',
      criterio_valor: '1',
      icono: '⏰',
      rareza: 'comun',
      secreto: false,
      orden: 121,
    },
    {
      codigo: 'CALIFICACION_PERFECTA',
      nombre: 'Perfeccionista',
      descripcion: 'Obtén 100% en una tarea',
      categoria: 'planificaciones',
      xp_recompensa: 50,
      criterio_tipo: 'tarea_perfecta',
      criterio_valor: '1',
      icono: '💯',
      rareza: 'comun',
      secreto: false,
      orden: 122,
    },
    {
      codigo: 'TAREA_OBLIGATORIA_COMPLETADA',
      nombre: 'Cumplidor',
      descripcion: 'Completa una tarea obligatoria',
      categoria: 'planificaciones',
      xp_recompensa: 35,
      criterio_tipo: 'tarea_obligatoria',
      criterio_valor: '1',
      icono: '📋',
      rareza: 'comun',
      secreto: false,
      orden: 123,
    },
    {
      codigo: 'DIEZ_TAREAS',
      nombre: 'Trabajador',
      descripcion: 'Completa 10 tareas',
      categoria: 'planificaciones',
      xp_recompensa: 200,
      criterio_tipo: 'tareas_completadas',
      criterio_valor: '10',
      icono: '💪',
      rareza: 'raro',
      secreto: false,
      orden: 124,
    },
    {
      codigo: 'CINCUENTA_TAREAS',
      nombre: 'Máquina de Tareas',
      descripcion: 'Completa 50 tareas',
      categoria: 'planificaciones',
      xp_recompensa: 500,
      criterio_tipo: 'tareas_completadas',
      criterio_valor: '50',
      icono: '🤖',
      rareza: 'epico',
      secreto: false,
      titulo: 'Incansable',
      animacion: 'engranajes',
      orden: 125,
    },
    {
      codigo: 'TRES_TAREAS_PERFECTAS',
      nombre: 'Hat-trick Perfecto',
      descripcion: 'Obtén 100% en 3 tareas',
      categoria: 'planificaciones',
      xp_recompensa: 100,
      criterio_tipo: 'tareas_perfectas',
      criterio_valor: '3',
      icono: '🎯',
      rareza: 'raro',
      secreto: false,
      orden: 126,
    },
    {
      codigo: 'DIEZ_TAREAS_PERFECTAS',
      nombre: 'Sin Errores',
      descripcion: 'Obtén 100% en 10 tareas',
      categoria: 'planificaciones',
      xp_recompensa: 400,
      criterio_tipo: 'tareas_perfectas',
      criterio_valor: '10',
      icono: '🎯🔥',
      rareza: 'epico',
      secreto: false,
      titulo: 'Impecable',
      animacion: 'diana_perfecta',
      orden: 127,
    },

    // ========== PLANIFICACIONES COMPLETAS ==========
    {
      codigo: 'PRIMERA_PLANIFICACION_COMPLETADA',
      nombre: 'Graduado',
      descripcion: 'Completa tu primera planificación',
      categoria: 'planificaciones',
      xp_recompensa: 250,
      criterio_tipo: 'planificacion_completada',
      criterio_valor: '1',
      icono: '🏆',
      rareza: 'raro',
      secreto: false,
      animacion: 'confeti_dorado',
      orden: 130,
    },
    {
      codigo: 'PLANIFICACION_COMPLETADA',
      nombre: 'Maestro del Curso',
      descripcion: 'Completa una planificación completa',
      categoria: 'planificaciones',
      xp_recompensa: 200,
      criterio_tipo: 'planificacion_completada',
      criterio_valor: '1',
      icono: '👑',
      rareza: 'raro',
      secreto: false,
      badge: 'Maestro',
      orden: 131,
    },
    {
      codigo: 'TRES_PLANIFICACIONES',
      nombre: 'Multidisciplinario',
      descripcion: 'Completa 3 planificaciones diferentes',
      categoria: 'planificaciones',
      xp_recompensa: 800,
      criterio_tipo: 'planificaciones_completadas',
      criterio_valor: '3',
      icono: '🌟🌟🌟',
      rareza: 'epico',
      secreto: false,
      titulo: 'Polivalente',
      animacion: 'explosion_estrellas',
      orden: 132,
    },
    {
      codigo: 'CINCO_PLANIFICACIONES',
      nombre: 'Sabio',
      descripcion: 'Completa 5 planificaciones diferentes',
      categoria: 'planificaciones',
      xp_recompensa: 1500,
      criterio_tipo: 'planificaciones_completadas',
      criterio_valor: '5',
      icono: '📜👑',
      rareza: 'legendario',
      secreto: false,
      titulo: 'Gran Sabio',
      animacion: 'aura_sabia',
      extras: ['Avatar con aura académica', 'Mención en Hall of Fame'],
      orden: 133,
    },

    // ========== VELOCIDAD ==========
    {
      codigo: 'CLASE_RAPIDA',
      nombre: 'Veloz',
      descripcion: 'Completa una clase en menos de 30 minutos',
      categoria: 'planificaciones',
      xp_recompensa: 75,
      criterio_tipo: 'clase_tiempo',
      criterio_valor: '1800', // 30 minutos en segundos
      icono: '⚡',
      rareza: 'raro',
      secreto: false,
      orden: 140,
    },
    {
      codigo: 'SESION_MARATON',
      nombre: 'Maratón',
      descripcion: 'Completa 3 clases en una sola sesión',
      categoria: 'planificaciones',
      xp_recompensa: 200,
      criterio_tipo: 'clases_sesion',
      criterio_valor: '3',
      icono: '🏃',
      rareza: 'raro',
      secreto: false,
      animacion: 'corredor',
      orden: 141,
    },

    // ========== SECRETOS ==========
    {
      codigo: 'PRIMERA_HORA',
      nombre: 'Madrugador Académico',
      descripcion: 'Completa una lección antes de las 7 AM',
      categoria: 'planificaciones',
      xp_recompensa: 100,
      criterio_tipo: 'leccion_hora',
      criterio_valor: JSON.stringify({ hora_max: 7 }),
      icono: '🌅',
      rareza: 'raro',
      secreto: true,
      mensaje_desbloqueo: '¡El que madruga... aprende más!',
      orden: 150,
    },
    {
      codigo: 'NOCTAMBULO',
      nombre: 'Noctámbulo Estudioso',
      descripcion: 'Completa una lección después de las 11 PM',
      categoria: 'planificaciones',
      xp_recompensa: 100,
      criterio_tipo: 'leccion_hora',
      criterio_valor: JSON.stringify({ hora_min: 23 }),
      icono: '🌙',
      rareza: 'raro',
      secreto: true,
      mensaje_desbloqueo: '¡Las estrellas te acompañan en tu estudio! 🌟',
      orden: 151,
    },
    {
      codigo: 'FIN_DE_SEMANA_ESTUDIOSO',
      nombre: 'Fin de Semana Productivo',
      descripcion: 'Completa 5 lecciones en un fin de semana',
      categoria: 'planificaciones',
      xp_recompensa: 150,
      criterio_tipo: 'lecciones_fin_semana',
      criterio_valor: '5',
      icono: '📚🏠',
      rareza: 'raro',
      secreto: true,
      mensaje_desbloqueo: '¡Aprovechaste el fin de semana al máximo!',
      orden: 152,
    },
  ];

  let created = 0;
  let updated = 0;

  for (const logro of logrosPlanificaciones) {
    const result = await prisma.logro.upsert({
      where: { codigo: logro.codigo },
      update: logro,
      create: logro,
    });

    if (result.created_at === result.updated_at) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(
    `✅ ${logrosPlanificaciones.length} logros de planificaciones procesados`,
  );
  console.log(`   - Nuevos: ${created}`);
  console.log(`   - Actualizados: ${updated}`);
  console.log('📊 Distribución:');
  console.log(
    '  - Comunes:',
    logrosPlanificaciones.filter((l) => l.rareza === 'comun').length,
  );
  console.log(
    '  - Raros:',
    logrosPlanificaciones.filter((l) => l.rareza === 'raro').length,
  );
  console.log(
    '  - Épicos:',
    logrosPlanificaciones.filter((l) => l.rareza === 'epico').length,
  );
  console.log(
    '  - Legendarios:',
    logrosPlanificaciones.filter((l) => l.rareza === 'legendario').length,
  );
  console.log(
    '  - Secretos:',
    logrosPlanificaciones.filter((l) => l.secreto).length,
  );
}
