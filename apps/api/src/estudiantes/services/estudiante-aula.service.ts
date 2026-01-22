import { Injectable, NotFoundException } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoTarea } from '@prisma/client';

/**
 * Service para operaciones del Aula Virtual del estudiante
 * Responsabilidad: Acceso a planificaciones, contenido activado y tareas asignadas
 *
 * FUNCIONALIDADES:
 * - Ver planificaciones activas de sus grupos
 * - Acceder a teoría/práctica activada por docentes
 * - Ver y completar tareas asignadas
 * - Registrar progreso y otorgar XP
 */
@Injectable()
export class EstudianteAulaService {
  constructor(
    private prisma: PrismaService,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Obtiene el resumen del aula para un estudiante
   * Incluye planificaciones activas de todos sus grupos
   * @param estudianteId - ID del estudiante autenticado
   * @returns Resumen del aula con planificaciones y progreso
   */
  async getMiAula(estudianteId: string) {
    // 1. Obtener todos los grupos donde el estudiante está inscrito
    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    const inscripciones = await this.prisma.inscripcionUnificada.findMany({
      where: {
        estudianteId: estudianteId,
        estado: 'ACTIVA',
      },
      select: {
        claseGrupoId: true,
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            grupo: {
              select: {
                id: true,
                nombre: true,
                sector: {
                  select: {
                    id: true,
                    nombre: true,
                    color: true,
                    icono: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const claseGrupoIds = inscripciones.map((i) => i.claseGrupoId);

    // 2. Obtener asignaciones de planificación para esos grupos
    const asignaciones = await this.prisma.asignacionPlanificacion.findMany({
      where: {
        claseGrupoId: { in: claseGrupoIds },
        activa: true,
      },
      include: {
        planificacion: {
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            cantidadClases: true,
            mundoTipo: true,
            casaTipo: true,
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        estadosClases: {
          where: {
            OR: [{ teoriaActiva: true }, { practicaActiva: true }],
          },
          select: {
            id: true,
            claseId: true,
            teoriaActiva: true,
            practicaActiva: true,
            activadaEn: true,
            completadaEn: true,
          },
        },
        tareasAsignadas: {
          where: { activa: true },
          select: {
            id: true,
            tareaClaseId: true,
            fechaLimite: true,
          },
        },
      },
    });

    // 3. Obtener progreso del estudiante en clases
    const clasesIds = asignaciones.flatMap((a) =>
      a.estadosClases.map((e) => e.claseId),
    );

    const progresosClases = await this.prisma.progresoClaseEstudiante.findMany({
      where: {
        estudianteId: estudianteId,
        claseId: { in: clasesIds },
      },
    });

    const progresosMap = new Map(progresosClases.map((p) => [p.claseId, p]));

    // 4. Obtener tareas asignadas y su progreso
    const tareasAsignadasIds = asignaciones.flatMap((a) =>
      a.tareasAsignadas.map((t) => t.id),
    );

    const progresosTareas = await this.prisma.progresoTareaEstudiante.findMany({
      where: {
        estudianteId: estudianteId,
        tareaAsignadaId: { in: tareasAsignadasIds },
      },
    });

    const progresosTareasMap = new Map(
      progresosTareas.map((p) => [p.tareaAsignadaId, p]),
    );

    // 5. Estructurar respuesta
    const planificaciones = asignaciones.map((asignacion) => {
      const clasesActivas = asignacion.estadosClases.length;
      const clasesCompletadas = asignacion.estadosClases.filter((e) => {
        const progreso = progresosMap.get(e.claseId);
        return progreso?.teoriaCompletada && progreso?.practicaCompletada;
      }).length;

      const tareasTotal = asignacion.tareasAsignadas.length;
      const tareasCompletadas = asignacion.tareasAsignadas.filter((t) => {
        const progreso = progresosTareasMap.get(t.id);
        return progreso?.estado === EstadoTarea.COMPLETADA;
      }).length;

      return {
        asignacionId: asignacion.id,
        planificacion: asignacion.planificacion,
        grupo: {
          id: asignacion.claseGrupo.id,
          nombre: asignacion.claseGrupo.nombre,
          codigo: asignacion.claseGrupo.codigo,
        },
        docente: asignacion.docente,
        fechaInicio: asignacion.fechaInicio,
        progreso: {
          clasesActivas: clasesActivas,
          clasesCompletadas: clasesCompletadas,
          tareasTotal: tareasTotal,
          tareasCompletadas: tareasCompletadas,
          porcentaje:
            clasesActivas > 0
              ? Math.round((clasesCompletadas / clasesActivas) * 100)
              : 0,
        },
      };
    });

    // 6. Agrupar por sector
    const sectoresMap = new Map<
      string,
      {
        id: string;
        nombre: string;
        color: string;
        icono: string;
        planificaciones: typeof planificaciones;
      }
    >();

    for (const inscripcion of inscripciones) {
      const sector = inscripcion.claseGrupo.grupo.sector;
      if (!sector) continue;

      if (!sectoresMap.has(sector.id)) {
        sectoresMap.set(sector.id, {
          ...sector,
          planificaciones: [],
        });
      }

      const planificacionesDelGrupo = planificaciones.filter(
        (p) => p.grupo.id === inscripcion.claseGrupo.id,
      );

      sectoresMap
        .get(sector.id)!
        .planificaciones.push(...planificacionesDelGrupo);
    }

    return {
      sectores: Array.from(sectoresMap.values()),
      resumen: {
        totalPlanificaciones: planificaciones.length,
        totalClasesActivas: planificaciones.reduce(
          (sum, p) => sum + p.progreso.clasesActivas,
          0,
        ),
        totalClasesCompletadas: planificaciones.reduce(
          (sum, p) => sum + p.progreso.clasesCompletadas,
          0,
        ),
        totalTareas: planificaciones.reduce(
          (sum, p) => sum + p.progreso.tareasTotal,
          0,
        ),
        totalTareasCompletadas: planificaciones.reduce(
          (sum, p) => sum + p.progreso.tareasCompletadas,
          0,
        ),
      },
    };
  }

  /**
   * Obtiene el detalle de una planificación para el estudiante
   * Solo muestra clases/contenido que el docente ha activado
   * @param estudianteId - ID del estudiante
   * @param asignacionId - ID de la asignación de planificación
   * @returns Detalle de la planificación con clases activadas
   */
  async getPlanificacionDetalle(estudianteId: string, asignacionId: string) {
    // 1. Verificar que el estudiante tiene acceso a esta asignación
    const asignacion = await this.prisma.asignacionPlanificacion.findFirst({
      where: {
        id: asignacionId,
        activa: true,
        claseGrupo: {
          inscripciones: {
            some: {
              estudianteId: estudianteId,
              fechaBaja: null,
            },
          },
        },
      },
      include: {
        planificacion: {
          include: {
            clases: {
              orderBy: { numero: 'asc' },
              include: {
                teoria: {
                  select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    tipo: true,
                    duracionMinutos: true,
                    imagenPortada: true,
                  },
                },
                practica: {
                  select: {
                    id: true,
                    titulo: true,
                    descripcion: true,
                    tipo: true,
                    duracionMinutos: true,
                    imagenPortada: true,
                  },
                },
                tareas: {
                  include: {
                    contenido: {
                      select: {
                        id: true,
                        titulo: true,
                        tipo: true,
                        duracionMinutos: true,
                      },
                    },
                  },
                  orderBy: { orden: 'asc' },
                },
              },
            },
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
            codigo: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        estadosClases: true,
        tareasAsignadas: {
          where: { activa: true },
          include: {
            tareaClase: true,
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'Planificación no encontrada o no tienes acceso',
      );
    }

    // 2. Crear mapas para estados
    const estadosMap = new Map(
      asignacion.estadosClases.map((e) => [e.claseId, e]),
    );
    const tareasAsignadasMap = new Map(
      asignacion.tareasAsignadas.map((t) => [t.tareaClaseId, t]),
    );

    // 3. Obtener progresos del estudiante
    const clasesIds = asignacion.planificacion.clases.map((c) => c.id);
    const progresosClases = await this.prisma.progresoClaseEstudiante.findMany({
      where: {
        estudianteId: estudianteId,
        claseId: { in: clasesIds },
      },
    });
    const progresosClasesMap = new Map(
      progresosClases.map((p) => [p.claseId, p]),
    );

    const tareasAsignadasIds = asignacion.tareasAsignadas.map((t) => t.id);
    const progresosTareas = await this.prisma.progresoTareaEstudiante.findMany({
      where: {
        estudianteId: estudianteId,
        tareaAsignadaId: { in: tareasAsignadasIds },
      },
    });
    const progresosTareasMap = new Map(
      progresosTareas.map((p) => [p.tareaAsignadaId, p]),
    );

    // 4. Estructurar clases con información de activación y progreso
    const clases = asignacion.planificacion.clases.map((clase) =>
      this.mapClaseConEstadoYProgreso(
        clase,
        estadosMap,
        progresosClasesMap,
        tareasAsignadasMap,
        progresosTareasMap,
      ),
    );

    return {
      asignacionId: asignacion.id,
      planificacion: {
        id: asignacion.planificacion.id,
        titulo: asignacion.planificacion.titulo,
        descripcion: asignacion.planificacion.descripcion,
        cantidadClases: asignacion.planificacion.cantidadClases,
        mundoTipo: asignacion.planificacion.mundoTipo,
        casaTipo: asignacion.planificacion.casaTipo,
      },
      grupo: asignacion.claseGrupo,
      docente: asignacion.docente,
      fechaInicio: asignacion.fechaInicio,
      clases: clases.filter((c) => c.activada), // Solo clases activadas
    };
  }

  /**
   * Obtiene el contenido de una lección (teoría o práctica)
   * @param estudianteId - ID del estudiante
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   * @param tipo - 'teoria' o 'practica'
   * @returns Contenido completo con nodos
   */
  async getContenidoClase(
    estudianteId: string,
    asignacionId: string,
    claseId: string,
    tipo: 'teoria' | 'practica',
  ) {
    // 1. Verificar acceso y que el contenido esté activado
    const asignacion = await this.prisma.asignacionPlanificacion.findFirst({
      where: {
        id: asignacionId,
        activa: true,
        claseGrupo: {
          inscripciones: {
            some: {
              estudianteId: estudianteId,
              fechaBaja: null,
            },
          },
        },
      },
      include: {
        estadosClases: {
          where: { claseId: claseId },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('No tienes acceso a esta planificación');
    }

    const estado = asignacion.estadosClases[0];
    if (!estado) {
      throw new NotFoundException('Esta clase no está disponible aún');
    }

    const activo =
      tipo === 'teoria' ? estado.teoriaActiva : estado.practicaActiva;
    if (!activo) {
      throw new NotFoundException(
        `La ${tipo} de esta clase no está activada aún`,
      );
    }

    // 2. Obtener la clase con el contenido
    const clase = await this.prisma.clasePlanificacion.findUnique({
      where: { id: claseId },
      include: {
        teoria:
          tipo === 'teoria'
            ? {
                include: {
                  nodos: {
                    orderBy: { orden: 'asc' },
                  },
                },
              }
            : false,
        practica:
          tipo === 'practica'
            ? {
                include: {
                  nodos: {
                    orderBy: { orden: 'asc' },
                  },
                },
              }
            : false,
      },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    const contenido = tipo === 'teoria' ? clase.teoria : clase.practica;

    // 3. Obtener o crear progreso
    let progreso = await this.prisma.progresoClaseEstudiante.findUnique({
      where: {
        estudianteId_claseId: {
          estudianteId: estudianteId,
          claseId: claseId,
        },
      },
    });

    if (!progreso) {
      progreso = await this.prisma.progresoClaseEstudiante.create({
        data: {
          estudianteId: estudianteId,
          claseId: claseId,
        },
      });
    }

    return {
      clase: {
        id: clase.id,
        numero: clase.numero,
        titulo: clase.titulo,
      },
      tipo,
      contenido,
      progreso: {
        completada:
          tipo === 'teoria'
            ? progreso.teoriaCompletada
            : progreso.practicaCompletada,
        completadaEn:
          tipo === 'teoria'
            ? progreso.teoriaCompletadaEn
            : progreso.practicaCompletadaEn,
        tiempoSegundos:
          tipo === 'teoria'
            ? progreso.tiempoTeoriaSegundos
            : progreso.tiempoPracticaSegundos,
      },
    };
  }

  /**
   * Marca una lección como completada y otorga XP
   * @param estudianteId - ID del estudiante
   * @param asignacionId - ID de la asignación
   * @param claseId - ID de la clase
   * @param tipo - 'teoria' o 'practica'
   * @param tiempoSegundos - Tiempo dedicado en segundos
   * @returns Resultado con XP ganado
   */
  async completarLeccion(
    estudianteId: string,
    asignacionId: string,
    claseId: string,
    tipo: 'teoria' | 'practica',
    tiempoSegundos: number,
  ) {
    // 1. Verificar acceso
    const asignacion = await this.prisma.asignacionPlanificacion.findFirst({
      where: {
        id: asignacionId,
        activa: true,
        claseGrupo: {
          inscripciones: {
            some: {
              estudianteId: estudianteId,
              fechaBaja: null,
            },
          },
        },
      },
      include: {
        estadosClases: {
          where: { claseId: claseId },
        },
        planificacion: {
          select: {
            titulo: true,
          },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('No tienes acceso a esta planificación');
    }

    const estado = asignacion.estadosClases[0];
    if (!estado) {
      throw new NotFoundException('Esta clase no está disponible');
    }

    const activo =
      tipo === 'teoria' ? estado.teoriaActiva : estado.practicaActiva;
    if (!activo) {
      throw new NotFoundException(`La ${tipo} no está activada`);
    }

    // 2. Obtener clase para el nombre
    const clase = await this.prisma.clasePlanificacion.findUnique({
      where: { id: claseId },
      select: { titulo: true, numero: true },
    });

    // 3. Calcular XP (valores fijos)
    const xpBase = tipo === 'teoria' ? 50 : 75; // Práctica da más XP
    const xpBonusTiempo = Math.min(Math.floor(tiempoSegundos / 60) * 2, 20); // Hasta 20 XP bonus por tiempo

    // 4. UPSERT ATÓMICO con INSERT ON CONFLICT para garantizar idempotencia
    // Solo hacemos UPDATE si el campo completado es FALSE (WHERE condition en DO UPDATE)
    // Esto garantiza que solo UNA request puede "ganar" y marcar como completado
    let esPrimeraCompletacion = false;

    if (tipo === 'teoria') {
      // UPSERT atómico para teoría con DO UPDATE condicionado
      const result = await this.prisma.$queryRawUnsafe<
        Array<{ was_insert: boolean }>
      >(
        `INSERT INTO progresos_clase_estudiante
           (id, estudianteId, claseId, teoriaCompletada, teoriaCompletadaEn, tiempoTeoriaSegundos)
         VALUES (gen_random_uuid()::text, $1, $2, true, NOW(), $3)
         ON CONFLICT (estudianteId, claseId) DO UPDATE SET
           teoriaCompletada = true,
           teoriaCompletadaEn = COALESCE(progresos_clase_estudiante.teoriaCompletadaEn, NOW()),
           tiempoTeoriaSegundos = progresos_clase_estudiante.tiempoTeoriaSegundos + EXCLUDED.tiempoTeoriaSegundos
         WHERE progresos_clase_estudiante.teoriaCompletada = false
         RETURNING (xmax = 0) as was_insert`,
        estudianteId,
        claseId,
        tiempoSegundos,
      );
      // Si hay resultado: fue INSERT (was_insert=true) o UPDATE exitoso (was_insert=false pero el WHERE pasó)
      // Si no hay resultado: ya estaba completado (el WHERE falló)
      esPrimeraCompletacion = result.length > 0;
    } else {
      // UPSERT atómico para práctica
      const result = await this.prisma.$queryRawUnsafe<
        Array<{ was_insert: boolean }>
      >(
        `INSERT INTO progresos_clase_estudiante
           (id, estudianteId, claseId, practicaCompletada, practicaCompletadaEn, tiempoPracticaSegundos)
         VALUES (gen_random_uuid()::text, $1, $2, true, NOW(), $3)
         ON CONFLICT (estudianteId, claseId) DO UPDATE SET
           practicaCompletada = true,
           practicaCompletadaEn = COALESCE(progresos_clase_estudiante.practicaCompletadaEn, NOW()),
           tiempoPracticaSegundos = progresos_clase_estudiante.tiempoPracticaSegundos + EXCLUDED.tiempoPracticaSegundos
         WHERE progresos_clase_estudiante.practicaCompletada = false
         RETURNING (xmax = 0) as was_insert`,
        estudianteId,
        claseId,
        tiempoSegundos,
      );
      esPrimeraCompletacion = result.length > 0;
    }

    // 4b. Obtener el progreso actualizado
    const progreso = await this.prisma.progresoClaseEstudiante.findUnique({
      where: {
        estudianteId_claseId: {
          estudianteId: estudianteId,
          claseId: claseId,
        },
      },
    });

    // Validar que el progreso existe (debería existir después del INSERT/UPDATE)
    if (!progreso) {
      throw new Error('Error interno: progreso no encontrado después de crear');
    }

    // 5. Emitir evento de gamificación SOLO si es la primera vez que completa
    // Esto garantiza idempotencia: doble-click NO otorga XP duplicado
    if (esPrimeraCompletacion) {
      this.eventEmitter.emit('leccion.completada', {
        estudianteId,
        tipo,
        claseId,
        claseTitulo: clase?.titulo,
        claseNumero: clase?.numero,
        planificacionTitulo: asignacion.planificacion.titulo,
        tiempoSegundos,
        xpBase,
        xpBonus: xpBonusTiempo,
        xpTotal: xpBase + xpBonusTiempo,
      });
    }

    return {
      success: true,
      progreso: {
        teoriaCompletada: progreso.teoriaCompletada,
        practicaCompletada: progreso.practicaCompletada,
      },
      xpGanado: xpBase + xpBonusTiempo,
      mensaje: `¡${tipo === 'teoria' ? 'Teoría' : 'Práctica'} completada! +${xpBase + xpBonusTiempo} XP`,
    };
  }

  /**
   * Obtiene las tareas asignadas al estudiante
   * @param estudianteId - ID del estudiante
   * @param filtro - 'todas', 'pendientes', 'completadas'
   * @returns Lista de tareas con progreso
   */
  async getMisTareas(
    estudianteId: string,
    filtro: 'todas' | 'pendientes' | 'completadas' = 'todas',
  ) {
    // 1. Obtener grupos del estudiante
    // Usa vista unificada para incluir inscripciones manuales y via suscripción
    const inscripciones = await this.prisma.inscripcionUnificada.findMany({
      where: {
        estudianteId: estudianteId,
        estado: 'ACTIVA',
      },
      select: { claseGrupoId: true },
    });

    const claseGrupoIds = inscripciones.map((i) => i.claseGrupoId);

    // 2. Obtener tareas asignadas
    const tareasAsignadas = await this.prisma.tareaAsignada.findMany({
      where: {
        activa: true,
        asignacion: {
          activa: true,
          claseGrupoId: { in: claseGrupoIds },
        },
      },
      include: {
        tareaClase: {
          include: {
            contenido: {
              select: {
                id: true,
                titulo: true,
                descripcion: true,
                tipo: true,
                duracionMinutos: true,
                imagenPortada: true,
              },
            },
            clase: {
              select: {
                id: true,
                numero: true,
                titulo: true,
                planificacion: {
                  select: {
                    id: true,
                    titulo: true,
                  },
                },
              },
            },
          },
        },
        asignacion: {
          select: {
            id: true,
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
            claseGrupo: {
              select: {
                id: true,
                nombre: true,
                codigo: true,
              },
            },
          },
        },
        progresos: {
          where: { estudianteId: estudianteId },
        },
      },
      orderBy: [{ fechaLimite: 'asc' }, { fechaAsignacion: 'desc' }],
    });

    // 3. Mapear y filtrar
    const tareas = tareasAsignadas.map((ta) => {
      const progreso = ta.progresos[0];
      const vencida = ta.fechaLimite && new Date(ta.fechaLimite) < new Date();

      return {
        tareaAsignadaId: ta.id,
        contenido: ta.tareaClase.contenido,
        clase: ta.tareaClase.clase,
        obligatoria: ta.tareaClase.obligatoria,
        fechaAsignacion: ta.fechaAsignacion,
        fechaLimite: ta.fechaLimite,
        vencida: vencida && progreso?.estado !== EstadoTarea.COMPLETADA,
        grupo: ta.asignacion.claseGrupo,
        docente: ta.asignacion.docente,
        asignacionId: ta.asignacion.id,
        progreso: progreso
          ? {
              estado: progreso.estado,
              iniciadaEn: progreso.iniciadaEn,
              completadaEn: progreso.completadaEn,
              tiempoTotalSegundos: progreso.tiempoTotalSegundos,
              intentos: progreso.intentos,
              calificacion: progreso.calificacion,
            }
          : {
              estado: EstadoTarea.PENDIENTE,
              iniciadaEn: null,
              completadaEn: null,
              tiempoTotalSegundos: 0,
              intentos: 0,
              calificacion: null,
            },
      };
    });

    // 4. Filtrar según parámetro
    let tareasFiltradas = tareas;
    if (filtro === 'pendientes') {
      tareasFiltradas = tareas.filter(
        (t) => t.progreso.estado !== EstadoTarea.COMPLETADA,
      );
    } else if (filtro === 'completadas') {
      tareasFiltradas = tareas.filter(
        (t) => t.progreso.estado === EstadoTarea.COMPLETADA,
      );
    }

    return {
      tareas: tareasFiltradas,
      resumen: {
        total: tareas.length,
        pendientes: tareas.filter(
          (t) => t.progreso.estado === EstadoTarea.PENDIENTE,
        ).length,
        enProgreso: tareas.filter(
          (t) => t.progreso.estado === EstadoTarea.EN_PROGRESO,
        ).length,
        completadas: tareas.filter(
          (t) => t.progreso.estado === EstadoTarea.COMPLETADA,
        ).length,
        vencidas: tareas.filter((t) => t.vencida).length,
      },
    };
  }

  /**
   * Inicia una tarea (marca como EN_PROGRESO)
   * @param estudianteId - ID del estudiante
   * @param tareaAsignadaId - ID de la tarea asignada
   * @returns Progreso actualizado
   */
  async iniciarTarea(estudianteId: string, tareaAsignadaId: string) {
    // 1. Verificar que la tarea está asignada a un grupo del estudiante
    const tareaAsignada = await this.prisma.tareaAsignada.findFirst({
      where: {
        id: tareaAsignadaId,
        activa: true,
        asignacion: {
          activa: true,
          claseGrupo: {
            inscripciones: {
              some: {
                estudianteId: estudianteId,
                fechaBaja: null,
              },
            },
          },
        },
      },
      include: {
        tareaClase: {
          include: {
            contenido: {
              include: {
                nodos: {
                  orderBy: { orden: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!tareaAsignada) {
      throw new NotFoundException('Tarea no encontrada o no tienes acceso');
    }

    // 2. Crear o actualizar progreso
    const progreso = await this.prisma.progresoTareaEstudiante.upsert({
      where: {
        estudianteId_tareaAsignadaId: {
          estudianteId: estudianteId,
          tareaAsignadaId: tareaAsignadaId,
        },
      },
      create: {
        estudianteId: estudianteId,
        tareaAsignadaId: tareaAsignadaId,
        estado: EstadoTarea.EN_PROGRESO,
        iniciadaEn: new Date(),
        intentos: 1,
      },
      update: {
        estado: EstadoTarea.EN_PROGRESO,
        iniciadaEn: new Date(),
        intentos: { increment: 1 },
      },
    });

    return {
      success: true,
      progreso,
      contenido: tareaAsignada.tareaClase.contenido,
    };
  }

  /**
   * Obtiene el leaderboard de una planificación (asignación)
   * Muestra el ranking de compañeros del mismo grupo
   * @param estudianteId - ID del estudiante autenticado (para verificar acceso)
   * @param asignacionId - ID de la asignación de planificación
   * @returns Leaderboard con posiciones y progreso
   */
  async getLeaderboard(estudianteId: string, asignacionId: string) {
    // 1. Verificar que el estudiante tiene acceso a esta asignación
    const asignacion = await this.prisma.asignacionPlanificacion.findFirst({
      where: {
        id: asignacionId,
        activa: true,
        claseGrupo: {
          inscripciones: {
            some: {
              estudianteId: estudianteId,
              fechaBaja: null,
            },
          },
        },
      },
      include: {
        planificacion: {
          select: {
            id: true,
            titulo: true,
            cantidadClases: true,
          },
        },
        claseGrupo: {
          select: {
            id: true,
            nombre: true,
            inscripciones: {
              where: { fechaBaja: null },
              select: {
                estudianteId: true,
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    avatarUrl: true,
                    recursos: {
                      select: { xpTotal: true },
                    },
                  },
                },
              },
            },
          },
        },
        estadosClases: {
          where: {
            OR: [{ teoriaActiva: true }, { practicaActiva: true }],
          },
          select: { claseId: true },
        },
        tareasAsignadas: {
          where: { activa: true },
          select: { id: true },
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException(
        'Planificación no encontrada o no tienes acceso',
      );
    }

    const estudiantesIds = asignacion.claseGrupo.inscripciones.map(
      (i) => i.estudianteId,
    );
    const clasesActivasIds = asignacion.estadosClases.map((e) => e.claseId);
    const tareasAsignadasIds = asignacion.tareasAsignadas.map((t) => t.id);

    // 2. Obtener progresos de clases para todos los estudiantes
    const progresosClases = await this.prisma.progresoClaseEstudiante.findMany({
      where: {
        estudianteId: { in: estudiantesIds },
        claseId: { in: clasesActivasIds },
      },
    });

    // Agrupar por estudiante
    const progresosClasesPorEstudiante = new Map<
      string,
      typeof progresosClases
    >();
    for (const p of progresosClases) {
      const existing = progresosClasesPorEstudiante.get(p.estudianteId) || [];
      existing.push(p);
      progresosClasesPorEstudiante.set(p.estudianteId, existing);
    }

    // 3. Obtener progresos de tareas
    const progresosTareas = await this.prisma.progresoTareaEstudiante.findMany({
      where: {
        estudianteId: { in: estudiantesIds },
        tareaAsignadaId: { in: tareasAsignadasIds },
      },
    });

    const progresosTareasPorEstudiante = new Map<
      string,
      typeof progresosTareas
    >();
    for (const p of progresosTareas) {
      const existing = progresosTareasPorEstudiante.get(p.estudianteId) || [];
      existing.push(p);
      progresosTareasPorEstudiante.set(p.estudianteId, existing);
    }

    // 4. Calcular progreso y puntos por estudiante
    const leaderboardEntries = asignacion.claseGrupo.inscripciones.map((i) => {
      const est = i.estudiante;
      const progClases = progresosClasesPorEstudiante.get(est.id) || [];
      const progTareas = progresosTareasPorEstudiante.get(est.id) || [];

      // Clases completadas (teoría Y práctica)
      const clasesCompletadas = progClases.filter(
        (p) => p.teoriaCompletada && p.practicaCompletada,
      ).length;

      // Tareas completadas
      const tareasCompletadas = progTareas.filter(
        (p) => p.estado === EstadoTarea.COMPLETADA,
      ).length;

      // Puntaje de progreso para ordenar:
      // - Cada clase completa = 10 puntos
      // - Cada tarea completa = 5 puntos
      const puntosPlanificacion =
        clasesCompletadas * 10 + tareasCompletadas * 5;

      // Porcentaje de progreso
      const totalActividades =
        clasesActivasIds.length + tareasAsignadasIds.length;
      const actividadesCompletadas = clasesCompletadas + tareasCompletadas;
      const porcentaje =
        totalActividades > 0
          ? Math.round((actividadesCompletadas / totalActividades) * 100)
          : 0;

      return {
        estudiante: {
          id: est.id,
          nombre: est.nombre,
          apellido: est.apellido,
          avatar: est.avatarUrl,
          xpTotal: est.recursos?.xpTotal ?? 0,
        },
        progreso: {
          clasesCompletadas: clasesCompletadas,
          clasesTotales: clasesActivasIds.length,
          tareasCompletadas: tareasCompletadas,
          tareasTotales: tareasAsignadasIds.length,
          porcentaje,
        },
        puntosPlanificacion: puntosPlanificacion,
        esYo: est.id === estudianteId,
      };
    });

    // 5. Ordenar por puntos de planificación, luego por XP total como desempate
    leaderboardEntries.sort((a, b) => {
      if (b.puntosPlanificacion !== a.puntosPlanificacion) {
        return b.puntosPlanificacion - a.puntosPlanificacion;
      }
      return b.estudiante.xpTotal - a.estudiante.xpTotal;
    });

    // 6. Asignar posiciones
    const leaderboard = leaderboardEntries.map((entry, index) => ({
      posicion: index + 1,
      ...entry,
    }));

    // 7. Encontrar mi posición
    const miPosicion =
      leaderboard.find((e) => e.esYo)?.posicion ?? leaderboard.length;

    return {
      planificacion: asignacion.planificacion,
      grupo: {
        id: asignacion.claseGrupo.id,
        nombre: asignacion.claseGrupo.nombre,
      },
      miPosicion: miPosicion,
      totalParticipantes: leaderboard.length,
      leaderboard,
    };
  }

  /**
   * Completa una tarea y otorga XP
   * @param estudianteId - ID del estudiante
   * @param tareaAsignadaId - ID de la tarea asignada
   * @param tiempoSegundos - Tiempo total dedicado
   * @param calificacion - Calificación opcional (0-100)
   * @returns Resultado con XP ganado
   */
  async completarTarea(
    estudianteId: string,
    tareaAsignadaId: string,
    tiempoSegundos: number,
    calificacion?: number,
  ) {
    // 1. Verificar acceso
    const tareaAsignada = await this.prisma.tareaAsignada.findFirst({
      where: {
        id: tareaAsignadaId,
        activa: true,
        asignacion: {
          activa: true,
          claseGrupo: {
            inscripciones: {
              some: {
                estudianteId: estudianteId,
                fechaBaja: null,
              },
            },
          },
        },
      },
      include: {
        tareaClase: {
          include: {
            contenido: {
              select: { titulo: true },
            },
            clase: {
              select: {
                titulo: true,
                planificacion: {
                  select: { titulo: true },
                },
              },
            },
          },
        },
      },
    });

    if (!tareaAsignada) {
      throw new NotFoundException('Tarea no encontrada o no tienes acceso');
    }

    // 2. Verificar si ya está completada
    const progresoExistente =
      await this.prisma.progresoTareaEstudiante.findUnique({
        where: {
          estudianteId_tareaAsignadaId: {
            estudianteId: estudianteId,
            tareaAsignadaId: tareaAsignadaId,
          },
        },
      });

    if (progresoExistente?.estado === EstadoTarea.COMPLETADA) {
      return {
        success: false,
        mensaje: 'Esta tarea ya fue completada',
        progreso: progresoExistente,
        xpGanado: 0,
      };
    }

    // 3. Actualizar progreso
    const progreso = await this.prisma.progresoTareaEstudiante.upsert({
      where: {
        estudianteId_tareaAsignadaId: {
          estudianteId: estudianteId,
          tareaAsignadaId: tareaAsignadaId,
        },
      },
      create: {
        estudianteId: estudianteId,
        tareaAsignadaId: tareaAsignadaId,
        estado: EstadoTarea.COMPLETADA,
        iniciadaEn: new Date(),
        completadaEn: new Date(),
        tiempoTotalSegundos: tiempoSegundos,
        intentos: 1,
        calificacion,
      },
      update: {
        estado: EstadoTarea.COMPLETADA,
        completadaEn: new Date(),
        tiempoTotalSegundos: { increment: tiempoSegundos },
        calificacion,
      },
    });

    // 4. Calcular XP
    const xpBase = tareaAsignada.tareaClase.obligatoria ? 100 : 75;
    const xpBonusCalificacion = calificacion
      ? Math.floor((calificacion / 100) * 25)
      : 0;
    const xpBonusTiempo =
      tareaAsignada.fechaLimite &&
      new Date() < new Date(tareaAsignada.fechaLimite)
        ? 15
        : 0; // Bonus por entregar a tiempo

    const xpTotal = xpBase + xpBonusCalificacion + xpBonusTiempo;

    // 5. Emitir evento de gamificación
    this.eventEmitter.emit('tarea.completada', {
      estudianteId,
      tareaAsignadaId,
      tareaTitulo: tareaAsignada.tareaClase.contenido.titulo,
      claseTitulo: tareaAsignada.tareaClase.clase.titulo,
      planificacionTitulo: tareaAsignada.tareaClase.clase.planificacion.titulo,
      obligatoria: tareaAsignada.tareaClase.obligatoria,
      tiempoSegundos,
      calificacion,
      entregadoATiempo: xpBonusTiempo > 0,
      xpBase,
      xpBonusCalificacion,
      xpBonusTiempo,
      xpTotal,
    });

    return {
      success: true,
      progreso,
      xpGanado: xpTotal,
      mensaje: `¡Tarea completada! +${xpTotal} XP`,
      desgloseXp: {
        base: xpBase,
        bonusCalificacion: xpBonusCalificacion,
        bonusTiempo: xpBonusTiempo,
      },
    };
  }

  // ==================== HELPERS PRIVADOS ====================

  /**
   * Mapea una clase con su estado de activación y progreso del estudiante
   */
  private mapClaseConEstadoYProgreso(
    clase: {
      id: string;
      numero: number;
      titulo: string;
      descripcion: string | null;
      teoria: unknown;
      practica: unknown;
      tareas: Array<{
        id: string;
        contenido: unknown;
        orden: number;
        obligatoria: boolean;
      }>;
    },
    estadosMap: Map<
      string,
      {
        teoriaActiva: boolean;
        practicaActiva: boolean;
        activadaEn: Date | null;
      }
    >,
    progresosClasesMap: Map<
      string,
      {
        teoriaCompletada: boolean;
        teoriaCompletadaEn: Date | null;
        tiempoTeoriaSegundos: number;
        practicaCompletada: boolean;
        practicaCompletadaEn: Date | null;
        tiempoPracticaSegundos: number;
      }
    >,
    tareasAsignadasMap: Map<string, { id: string; fechaLimite: Date | null }>,
    progresosTareasMap: Map<
      string,
      {
        estado: EstadoTarea;
        iniciadaEn: Date | null;
        completadaEn: Date | null;
        calificacion: number | null;
      }
    >,
  ) {
    const estado = estadosMap.get(clase.id);
    const progresoClase = progresosClasesMap.get(clase.id);

    const tareasConEstado = this.mapTareasConProgreso(
      clase.tareas,
      tareasAsignadasMap,
      progresosTareasMap,
    );

    return {
      id: clase.id,
      numero: clase.numero,
      titulo: clase.titulo,
      descripcion: clase.descripcion,
      teoria: this.buildSeccionConProgreso(
        estado?.teoriaActiva,
        clase.teoria,
        progresoClase?.teoriaCompletada,
        progresoClase?.teoriaCompletadaEn,
        progresoClase?.tiempoTeoriaSegundos,
      ),
      practica: this.buildSeccionConProgreso(
        estado?.practicaActiva,
        clase.practica,
        progresoClase?.practicaCompletada,
        progresoClase?.practicaCompletadaEn,
        progresoClase?.tiempoPracticaSegundos,
      ),
      activada: !!(estado?.teoriaActiva || estado?.practicaActiva),
      activadaEn: estado?.activadaEn || null,
      tareas: tareasConEstado.filter((t) => t.asignada),
    };
  }

  /**
   * Construye la sección de teoría/práctica con progreso si está activa
   */
  private buildSeccionConProgreso(
    activa: boolean | undefined,
    contenido: unknown,
    completada: boolean | undefined,
    completadaEn: Date | null | undefined,
    tiempoSegundos: number | undefined,
  ) {
    if (!activa) return null;
    return {
      ...(contenido as object),
      completada: completada || false,
      completadaEn: completadaEn || null,
      tiempoSegundos: tiempoSegundos || 0,
    };
  }

  /**
   * Mapea las tareas de una clase con su estado de asignación y progreso
   */
  private mapTareasConProgreso(
    tareas: Array<{
      id: string;
      contenido: unknown;
      orden: number;
      obligatoria: boolean;
    }>,
    tareasAsignadasMap: Map<string, { id: string; fechaLimite: Date | null }>,
    progresosTareasMap: Map<
      string,
      {
        estado: EstadoTarea;
        iniciadaEn: Date | null;
        completadaEn: Date | null;
        calificacion: number | null;
      }
    >,
  ) {
    return tareas.map((tarea) => {
      const tareaAsignada = tareasAsignadasMap.get(tarea.id);
      const progresoTarea = tareaAsignada
        ? progresosTareasMap.get(tareaAsignada.id)
        : null;

      return {
        id: tarea.id,
        contenido: tarea.contenido,
        orden: tarea.orden,
        obligatoria: tarea.obligatoria,
        asignada: !!tareaAsignada,
        tareaAsignadaId: tareaAsignada?.id || null,
        fechaLimite: tareaAsignada?.fechaLimite || null,
        progreso: progresoTarea
          ? {
              estado: progresoTarea.estado,
              iniciadaEn: progresoTarea.iniciadaEn,
              completadaEn: progresoTarea.completadaEn,
              calificacion: progresoTarea.calificacion,
            }
          : null,
      };
    });
  }
}
