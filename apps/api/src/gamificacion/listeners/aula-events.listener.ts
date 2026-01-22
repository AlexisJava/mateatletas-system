import { Injectable, Logger } from '@nestjs/common';
import { OnEvent, EventEmitter2 } from '@nestjs/event-emitter';
import { RecursosService } from '../services/recursos.service';
import { LogrosService } from '../services/logros.service';
import { PrismaService } from '../../core/database/prisma.service';
import { TipoActividadFeed, Prisma } from '@prisma/client';
import {
  EstudianteNivelUpEvent,
  RachaActualizadaEvent,
  LogroDesbloqueadoEvent,
} from '../../common/events/domain-events';

/**
 * Eventos emitidos por EstudianteAulaService
 */
interface LeccionCompletadaEvent {
  estudianteId: string;
  tipo: 'teoria' | 'practica';
  claseId: string;
  claseTitulo?: string;
  claseNumero?: number;
  planificacionId?: string;
  planificacionTitulo?: string;
  asignacionId?: string;
  tiempoSegundos: number;
  xpBase: number;
  xpBonus: number;
  xpTotal: number;
}

interface TareaCompletadaEvent {
  estudianteId: string;
  tareaAsignadaId: string;
  tareaTitulo: string;
  claseTitulo: string;
  planificacionTitulo: string;
  obligatoria: boolean;
  tiempoSegundos: number;
  calificacion?: number;
  entregadoATiempo: boolean;
  xpBase: number;
  xpBonusCalificacion: number;
  xpBonusTiempo: number;
  xpTotal: number;
}

interface ClaseCompletadaEvent {
  estudianteId: string;
  claseId: string;
  claseTitulo: string;
  claseNumero: number;
  planificacionId: string;
  planificacionTitulo: string;
  asignacionId: string;
  tiempoTotalSegundos: number;
  xpBonus: number;
}

interface PlanificacionCompletadaEvent {
  estudianteId: string;
  planificacionId: string;
  planificacionTitulo: string;
  asignacionId: string;
  totalClases: number;
  tiempoTotalSegundos: number;
  xpTotal: number;
}

/**
 * Event Listener para eventos del Aula Virtual
 *
 * Este listener escucha eventos emitidos por EstudianteAulaService y ejecuta
 * lógica de gamificación cuando los estudiantes completan lecciones, clases y tareas.
 *
 * Eventos que escucha:
 * - leccion.completada: Cuando un estudiante completa teoría o práctica
 * - tarea.completada: Cuando un estudiante completa una tarea asignada
 * - clase.completada: Cuando un estudiante completa teoría + práctica de una clase
 * - planificacion.completada: Cuando un estudiante completa todas las clases
 *
 * Beneficios:
 * - Desacopla la lógica de gamificación del servicio del aula
 * - Permite agregar más listeners sin modificar EstudianteAulaService
 * - Facilita testing (se pueden mockear eventos)
 */
@Injectable()
export class AulaEventsListener {
  private readonly logger = new Logger(AulaEventsListener.name);

  constructor(
    private readonly recursosService: RecursosService,
    private readonly logrosService: LogrosService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Listener: Lección completada (teoría o práctica)
   *
   * Se ejecuta cuando un estudiante termina de ver/completar una lección.
   *
   * Acciones:
   * - Otorgar XP según el tipo de lección
   * - Verificar logros relacionados
   * - Verificar si completó la clase (teoría + práctica)
   */
  @OnEvent('leccion.completada')
  async handleLeccionCompletada(event: LeccionCompletadaEvent) {
    this.logger.log(
      `Lección completada: ${event.tipo} de clase ${event.claseId} por estudiante ${event.estudianteId}`,
    );

    try {
      // 1. Otorgar XP
      const razon = `${event.tipo === 'teoria' ? 'Teoría' : 'Práctica'} completada: ${event.claseTitulo || 'Clase ' + event.claseNumero}`;
      await this.recursosService.agregarXP(
        event.estudianteId,
        event.xpTotal,
        razon,
        {
          tipo: event.tipo,
          claseId: event.claseId,
          claseTitulo: event.claseTitulo,
          claseNumero: event.claseNumero,
          planificacionTitulo: event.planificacionTitulo,
          tiempoSegundos: event.tiempoSegundos,
        },
      );

      this.logger.log(
        `+${event.xpTotal} XP otorgados a estudiante ${event.estudianteId}`,
      );

      // 2. Verificar logros de lecciones
      await this.verificarLogrosLecciones(event.estudianteId, event.tipo);

      // 3. Verificar si completó la clase (teoría + práctica)
      await this.verificarClaseCompletada(event);
    } catch (error) {
      this.logger.error(
        `Error al procesar leccion.completada para estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Tarea completada
   *
   * Se ejecuta cuando un estudiante completa una tarea asignada.
   *
   * Acciones:
   * - Otorgar XP según la tarea
   * - Verificar logros relacionados
   * - Emitir tarea.perfecta si calificación = 100%
   */
  @OnEvent('tarea.completada')
  async handleTareaCompletada(event: TareaCompletadaEvent) {
    this.logger.log(
      `Tarea completada: ${event.tareaTitulo} por estudiante ${event.estudianteId}`,
    );

    try {
      // 1. Otorgar XP
      const razon = `Tarea completada: ${event.tareaTitulo}`;
      await this.recursosService.agregarXP(
        event.estudianteId,
        event.xpTotal,
        razon,
        {
          tareaAsignadaId: event.tareaAsignadaId,
          tareaTitulo: event.tareaTitulo,
          claseTitulo: event.claseTitulo,
          planificacionTitulo: event.planificacionTitulo,
          obligatoria: event.obligatoria,
          calificacion: event.calificacion,
          entregadoATiempo: event.entregadoATiempo,
          tiempoSegundos: event.tiempoSegundos,
        },
      );

      this.logger.log(
        `+${event.xpTotal} XP otorgados a estudiante ${event.estudianteId} por tarea`,
      );

      // 2. Verificar logros de tareas
      await this.verificarLogrosTareas(
        event.estudianteId,
        event.obligatoria,
        event.entregadoATiempo,
        event.calificacion,
      );

      // 3. Crear entrada en el Activity Feed
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.TAREA_COMPLETADA,
        `completó la tarea "${event.tareaTitulo}"` +
          (event.calificacion ? ` con ${event.calificacion}%` : ''),
        event.xpTotal,
        {
          tareaAsignadaId: event.tareaAsignadaId,
          tareaTitulo: event.tareaTitulo,
          claseTitulo: event.claseTitulo,
          planificacionTitulo: event.planificacionTitulo,
          calificacion: event.calificacion,
          entregadoATiempo: event.entregadoATiempo,
        },
      );

      // 4. Si es tarea perfecta (100%), emitir evento adicional
      if (event.calificacion && event.calificacion >= 100) {
        const xpBonusPerfecta = 20;
        this.eventEmitter.emit('tarea.perfecta', {
          estudianteId: event.estudianteId,
          tareaAsignadaId: event.tareaAsignadaId,
          tareaTitulo: event.tareaTitulo,
          claseTitulo: event.claseTitulo,
          planificacionTitulo: event.planificacionTitulo,
          xpBonus: xpBonusPerfecta,
        });
      }
    } catch (error) {
      this.logger.error(
        `Error al procesar tarea.completada para estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Tarea perfecta (calificación 100%)
   *
   * Se ejecuta cuando un estudiante completa una tarea con calificación perfecta.
   *
   * Acciones:
   * - Otorgar XP bonus por perfección
   * - Verificar logros de tareas perfectas
   */
  @OnEvent('tarea.perfecta')
  async handleTareaPerfecta(event: {
    estudianteId: string;
    tareaAsignadaId: string;
    tareaTitulo: string;
    claseTitulo: string;
    planificacionTitulo: string;
    xpBonus: number;
  }) {
    this.logger.log(
      `🌟 Tarea perfecta: ${event.tareaTitulo} por estudiante ${event.estudianteId}`,
    );

    try {
      // Otorgar XP bonus por perfección
      await this.recursosService.agregarXP(
        event.estudianteId,
        event.xpBonus,
        `Bonus tarea perfecta: ${event.tareaTitulo}`,
        {
          tareaAsignadaId: event.tareaAsignadaId,
          tareaTitulo: event.tareaTitulo,
          tipo: 'tarea_perfecta',
        },
      );

      this.logger.log(
        `+${event.xpBonus} XP bonus por tarea perfecta a estudiante ${event.estudianteId}`,
      );

      // Verificar logros de tareas perfectas
      await this.verificarLogrosTareasPerfectas(event.estudianteId);

      // Crear entrada en el Activity Feed
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.TAREA_PERFECTA,
        `obtuvo 100% en la tarea "${event.tareaTitulo}"`,
        event.xpBonus,
        {
          tareaAsignadaId: event.tareaAsignadaId,
          tareaTitulo: event.tareaTitulo,
          claseTitulo: event.claseTitulo,
          planificacionTitulo: event.planificacionTitulo,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar tarea.perfecta para estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Clase completada (teoría + práctica)
   *
   * Se ejecuta cuando un estudiante completa tanto teoría como práctica de una clase.
   *
   * Acciones:
   * - Otorgar XP bonus por completar clase
   * - Verificar logros de clases completadas
   * - Verificar si completó toda la planificación
   */
  @OnEvent('clase.completada')
  async handleClaseCompletada(event: ClaseCompletadaEvent) {
    this.logger.log(
      `🎉 Clase completada: ${event.claseTitulo} por estudiante ${event.estudianteId}`,
    );

    try {
      // 1. Otorgar XP bonus por clase completa
      await this.recursosService.agregarXP(
        event.estudianteId,
        event.xpBonus,
        `Clase completada: ${event.claseTitulo}`,
        {
          claseId: event.claseId,
          claseTitulo: event.claseTitulo,
          claseNumero: event.claseNumero,
          planificacionId: event.planificacionId,
          planificacionTitulo: event.planificacionTitulo,
          tipo: 'clase_completada',
          tiempoTotalSegundos: event.tiempoTotalSegundos,
        },
      );

      this.logger.log(
        `+${event.xpBonus} XP bonus por clase completa a estudiante ${event.estudianteId}`,
      );

      // 2. Verificar logros de clases completadas
      await this.verificarLogrosClases(event.estudianteId);

      // 3. Crear entrada en el Activity Feed
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.CLASE_COMPLETADA,
        `completó la Clase ${event.claseNumero}: ${event.claseTitulo}`,
        event.xpBonus,
        {
          claseId: event.claseId,
          claseTitulo: event.claseTitulo,
          claseNumero: event.claseNumero,
          planificacionId: event.planificacionId,
          planificacionTitulo: event.planificacionTitulo,
        },
      );

      // 4. Verificar si completó toda la planificación
      await this.verificarPlanificacionCompletada(event);
    } catch (error) {
      this.logger.error(
        `Error al procesar clase.completada para estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Planificación completada (todas las clases)
   *
   * Se ejecuta cuando un estudiante completa todas las clases de una planificación.
   *
   * Acciones:
   * - Otorgar XP bonus grande
   * - Otorgar badge especial
   * - Verificar logros de planificaciones
   */
  @OnEvent('planificacion.completada')
  async handlePlanificacionCompletada(event: PlanificacionCompletadaEvent) {
    this.logger.log(
      `🏆 Planificación completada: ${event.planificacionTitulo} por estudiante ${event.estudianteId}`,
    );

    try {
      // 1. Otorgar XP bonus grande
      await this.recursosService.agregarXP(
        event.estudianteId,
        event.xpTotal,
        `¡Planificación completada: ${event.planificacionTitulo}!`,
        {
          planificacionId: event.planificacionId,
          planificacionTitulo: event.planificacionTitulo,
          asignacionId: event.asignacionId,
          totalClases: event.totalClases,
          tipo: 'planificacion_completada',
          tiempoTotalSegundos: event.tiempoTotalSegundos,
        },
      );

      this.logger.log(
        `+${event.xpTotal} XP por planificación completa a estudiante ${event.estudianteId}`,
      );

      // 2. Verificar logros de planificaciones
      await this.verificarLogrosPlanificaciones(event.estudianteId);

      // 3. Crear entrada en el Activity Feed
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.PLANIFICACION_COMPLETADA,
        `completó la planificación "${event.planificacionTitulo}" con ${event.totalClases} clases`,
        event.xpTotal,
        {
          planificacionId: event.planificacionId,
          planificacionTitulo: event.planificacionTitulo,
          totalClases: event.totalClases,
          tiempoTotalSegundos: event.tiempoTotalSegundos,
        },
      );

      // 4. Otorgar badge especial "Maestro de [Planificación]"
      const codigoBadge = `MAESTRO_${event.planificacionTitulo.toUpperCase().replace(/[^A-Z0-9]/g, '_')}`;
      try {
        await this.logrosService.desbloquearLogro(
          event.estudianteId,
          codigoBadge,
        );
      } catch {
        // Badge específico puede no existir, intentar con genérico
        await this.logrosService.desbloquearLogro(
          event.estudianteId,
          'PLANIFICACION_COMPLETADA',
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al procesar planificacion.completada para estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // LISTENERS DE GAMIFICACIÓN (nivel-up, racha, logro)
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Listener: Estudiante subió de nivel
   *
   * Se ejecuta cuando un estudiante acumula suficiente XP para subir de nivel.
   *
   * Acciones:
   * - Crear entrada en el Activity Feed
   */
  @OnEvent('estudiante.nivel-up')
  async handleNivelUp(event: EstudianteNivelUpEvent) {
    this.logger.log(
      `🚀 Nivel up: Estudiante ${event.estudianteId} subió de nivel ${event.nivelAnterior} → ${event.nivelNuevo}`,
    );

    try {
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.NIVEL_SUBIDO,
        `subió al nivel ${event.nivelNuevo}`,
        0, // No otorga XP adicional, el XP ya fue dado
        {
          nivelAnterior: event.nivelAnterior,
          nivelNuevo: event.nivelNuevo,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar estudiante.nivel-up para ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Racha de estudiante actualizada
   *
   * Solo crea entrada en el feed para hitos importantes (3, 7, 14, 30, 60, 100 días)
   * para evitar spam en el feed.
   *
   * Acciones:
   * - Crear entrada en el Activity Feed (solo en hitos)
   */
  @OnEvent('racha.actualizada')
  async handleRachaActualizada(event: RachaActualizadaEvent) {
    // Solo procesar si es una racha nueva (no rota)
    if (event.rompioRacha) {
      this.logger.debug(
        `Racha rota para estudiante ${event.estudianteId}, no se crea feed`,
      );
      return;
    }

    // Solo crear entrada en hitos importantes
    const hitos = [3, 7, 14, 30, 60, 100];
    if (!hitos.includes(event.rachaActual)) {
      this.logger.debug(
        `Racha ${event.rachaActual} no es hito, no se crea feed`,
      );
      return;
    }

    this.logger.log(
      `🔥 Racha hito: Estudiante ${event.estudianteId} alcanzó ${event.rachaActual} días consecutivos`,
    );

    try {
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.RACHA_EXTENDIDA,
        `alcanzó una racha de ${event.rachaActual} días`,
        0, // XP de racha se otorga en otro listener
        {
          rachaActual: event.rachaActual,
          rachaMaxima: event.rachaMaxima,
          esNuevaRacha: event.esNuevaRacha,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar racha.actualizada para ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * Listener: Logro desbloqueado
   *
   * Se ejecuta cuando un estudiante desbloquea un logro/badge.
   *
   * Acciones:
   * - Crear entrada en el Activity Feed
   */
  @OnEvent('logro.desbloqueado')
  async handleLogroDesbloqueado(event: LogroDesbloqueadoEvent) {
    this.logger.log(
      `🏆 Logro desbloqueado: Estudiante ${event.estudianteId} obtuvo "${event.logroNombre}"`,
    );

    try {
      await this.crearEntradaFeed(
        event.estudianteId,
        TipoActividadFeed.LOGRO_DESBLOQUEADO,
        `desbloqueó el logro "${event.logroNombre}"`,
        event.recompensas.xp || 0,
        {
          logroCodigo: event.logroCodigo,
          logroNombre: event.logroNombre,
        },
      );
    } catch (error) {
      this.logger.error(
        `Error al procesar logro.desbloqueado para ${event.estudianteId}`,
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MÉTODOS PRIVADOS DE VERIFICACIÓN
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Verifica si el estudiante completó la clase (teoría + práctica)
   * Si es así, emite evento clase.completada
   */
  private async verificarClaseCompletada(event: LeccionCompletadaEvent) {
    try {
      // Buscar el progreso actual del estudiante en esta clase
      const progreso = await this.prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudianteId_claseId: {
            estudianteId: event.estudianteId,
            claseId: event.claseId,
          },
        },
      });

      // Si ambas están completadas, emitir evento clase.completada
      if (progreso?.teoriaCompletada && progreso?.practicaCompletada) {
        // Obtener datos de la clase para el evento
        const clase = await this.prisma.clasePlanificacion.findUnique({
          where: { id: event.claseId },
          include: {
            planificacion: {
              select: { id: true, titulo: true },
            },
          },
        });

        if (clase) {
          const tiempoTotal =
            (progreso.tiempoTeoriaSegundos || 0) +
            (progreso.tiempoPracticaSegundos || 0);

          // Buscar la asignación activa para este estudiante
          const asignacion =
            await this.prisma.asignacionPlanificacion.findFirst({
              where: {
                planificacionId: clase.planificacion.id,
                activa: true,
                claseGrupo: {
                  inscripciones: {
                    some: {
                      estudianteId: event.estudianteId,
                      fechaBaja: null,
                    },
                  },
                },
              },
            });

          if (asignacion) {
            const xpBonusClase = 50; // Bonus por completar clase completa

            this.eventEmitter.emit('clase.completada', {
              estudianteId: event.estudianteId,
              claseId: event.claseId,
              claseTitulo: clase.titulo,
              claseNumero: clase.numero,
              planificacionId: clase.planificacion.id,
              planificacionTitulo: clase.planificacion.titulo,
              asignacionId: asignacion.id,
              tiempoTotalSegundos: tiempoTotal,
              xpBonus: xpBonusClase,
            });

            this.logger.log(
              `Emitido evento clase.completada para clase ${clase.titulo}`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error(
        `Error al verificar clase completada: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica si el estudiante completó toda la planificación
   * Si es así, emite evento planificacion.completada
   */
  private async verificarPlanificacionCompletada(event: ClaseCompletadaEvent) {
    try {
      // Obtener todas las clases de la planificación
      const planificacion = await this.prisma.planificacion.findUnique({
        where: { id: event.planificacionId },
        include: {
          clases: {
            select: { id: true },
          },
        },
      });

      if (!planificacion) return;

      const clasesIds = planificacion.clases.map((c) => c.id);

      // Obtener progresos del estudiante en todas las clases
      const progresos = await this.prisma.progresoClaseEstudiante.findMany({
        where: {
          estudianteId: event.estudianteId,
          claseId: { in: clasesIds },
        },
      });

      // Verificar si TODAS las clases están completas (teoría + práctica)
      const todasCompletadas = clasesIds.every((claseId) => {
        const progreso = progresos.find((p) => p.claseId === claseId);
        return progreso?.teoriaCompletada && progreso?.practicaCompletada;
      });

      if (todasCompletadas) {
        // Calcular tiempo total
        const tiempoTotal = progresos.reduce(
          (sum, p) =>
            sum +
            (p.tiempoTeoriaSegundos || 0) +
            (p.tiempoPracticaSegundos || 0),
          0,
        );

        const xpBonusPlanificacion = 200; // Bonus grande por completar planificación

        this.eventEmitter.emit('planificacion.completada', {
          estudianteId: event.estudianteId,
          planificacionId: event.planificacionId,
          planificacionTitulo: event.planificacionTitulo,
          asignacionId: event.asignacionId,
          totalClases: clasesIds.length,
          tiempoTotalSegundos: tiempoTotal,
          xpTotal: xpBonusPlanificacion,
        });

        this.logger.log(
          `🏆 Emitido evento planificacion.completada para ${event.planificacionTitulo}`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error al verificar planificación completada: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica y otorga logros relacionados con lecciones completadas
   */
  private async verificarLogrosLecciones(
    estudianteId: string,
    tipo: 'teoria' | 'practica',
  ) {
    try {
      // Logro: Primera lección de teoría completada
      if (tipo === 'teoria') {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'PRIMERA_LECCION_TEORIA',
        );
      }

      // Logro: Primera lección de práctica completada
      if (tipo === 'practica') {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'PRIMERA_LECCION_PRACTICA',
        );
      }

      // Contar lecciones completadas para logros de cantidad
      const totalCompletadas = await this.prisma.progresoClaseEstudiante.count({
        where: {
          estudianteId: estudianteId,
          OR: [{ teoriaCompletada: true }, { practicaCompletada: true }],
        },
      });

      // Logros por cantidad
      if (totalCompletadas >= 10) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'DIEZ_LECCIONES',
        );
      }
      if (totalCompletadas >= 50) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'CINCUENTA_LECCIONES',
        );
      }
    } catch (error) {
      this.logger.debug(
        `Logro de lección no otorgado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica y otorga logros relacionados con tareas completadas
   */
  private async verificarLogrosTareas(
    estudianteId: string,
    obligatoria: boolean,
    entregadoATiempo: boolean,
    calificacion?: number,
  ) {
    try {
      // Logro: Primera tarea completada
      await this.logrosService.desbloquearLogro(
        estudianteId,
        'PRIMERA_TAREA_COMPLETADA',
      );

      // Logro: Tarea entregada a tiempo
      if (entregadoATiempo) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'TAREA_A_TIEMPO',
        );
      }

      // Logro: Calificación perfecta
      if (calificacion && calificacion >= 100) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'CALIFICACION_PERFECTA',
        );
      }

      // Logro: Completar tarea obligatoria
      if (obligatoria) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'TAREA_OBLIGATORIA_COMPLETADA',
        );
      }

      // Contar tareas completadas
      const totalTareas = await this.prisma.progresoTareaEstudiante.count({
        where: {
          estudianteId: estudianteId,
          estado: 'COMPLETADA',
        },
      });

      if (totalTareas >= 10) {
        await this.logrosService.desbloquearLogro(estudianteId, 'DIEZ_TAREAS');
      }
      if (totalTareas >= 50) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'CINCUENTA_TAREAS',
        );
      }
    } catch (error) {
      this.logger.debug(
        `Logro de tarea no otorgado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica logros de tareas perfectas (rachas, etc.)
   */
  private async verificarLogrosTareasPerfectas(estudianteId: string) {
    try {
      // Contar tareas con calificación 100%
      const tareasPerfectas = await this.prisma.progresoTareaEstudiante.count({
        where: {
          estudianteId: estudianteId,
          calificacion: { gte: 100 },
        },
      });

      if (tareasPerfectas >= 3) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'TRES_TAREAS_PERFECTAS',
        );
      }
      if (tareasPerfectas >= 10) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'DIEZ_TAREAS_PERFECTAS',
        );
      }
    } catch (error) {
      this.logger.debug(
        `Logro de tarea perfecta no otorgado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica logros de clases completadas
   */
  private async verificarLogrosClases(estudianteId: string) {
    try {
      // Contar clases completamente terminadas (teoría + práctica)
      const clasesCompletas = await this.prisma.progresoClaseEstudiante.count({
        where: {
          estudianteId: estudianteId,
          teoriaCompletada: true,
          practicaCompletada: true,
        },
      });

      if (clasesCompletas >= 1) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'PRIMERA_CLASE_COMPLETADA',
        );
      }
      if (clasesCompletas >= 5) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'CINCO_CLASES_COMPLETADAS',
        );
      }
      if (clasesCompletas >= 10) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'DIEZ_CLASES_COMPLETADAS',
        );
      }
      if (clasesCompletas >= 25) {
        await this.logrosService.desbloquearLogro(
          estudianteId,
          'VEINTICINCO_CLASES_COMPLETADAS',
        );
      }
    } catch (error) {
      this.logger.debug(
        `Logro de clase no otorgado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  /**
   * Verifica logros de planificaciones completadas
   */
  private async verificarLogrosPlanificaciones(estudianteId: string) {
    try {
      await this.logrosService.desbloquearLogro(
        estudianteId,
        'PRIMERA_PLANIFICACION_COMPLETADA',
      );

      // Contar planificaciones completadas (todas las clases de la planificación terminadas)
      // Este conteo es más complejo, por ahora solo verificamos el logro genérico
    } catch (error) {
      this.logger.debug(
        `Logro de planificación no otorgado: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // ACTIVITY FEED
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * Crea una entrada en el Activity Feed
   * @param estudianteId - ID del estudiante
   * @param tipo - Tipo de actividad
   * @param mensaje - Mensaje legible para el feed
   * @param xpGanado - XP ganado por la actividad
   * @param metadata - Datos adicionales
   */
  private async crearEntradaFeed(
    estudianteId: string,
    tipo: TipoActividadFeed,
    mensaje: string,
    xpGanado: number,
    metadata: Prisma.InputJsonValue = {},
  ) {
    try {
      // Obtener la casa del estudiante para filtrar el feed
      const estudiante = await this.prisma.estudiante.findUnique({
        where: { id: estudianteId },
        select: { casaId: true, nombre: true, apellido: true },
      });

      await this.prisma.actividadFeed.create({
        data: {
          estudianteId: estudianteId,
          tipo,
          mensaje,
          xpGanado: xpGanado,
          metadata,
          casaId: estudiante?.casaId,
        },
      });

      this.logger.debug(`Feed entry created: ${tipo} for ${estudianteId}`);
    } catch (error) {
      this.logger.error(
        `Error creating feed entry: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }
}
