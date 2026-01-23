import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoSuscripcion, Prisma } from '@prisma/client';

/**
 * Motivos de acceso a la plataforma
 */
export type MotivoAcceso =
  | 'PLAN_DIRECTO'
  | 'SUSCRIPCION_TUTOR'
  | 'COMISION_ACTIVA'
  | 'OVERRIDE'
  | 'SIN_ACCESO';

/**
 * Motivos de acceso/rechazo a una clase específica
 */
export type MotivoClase =
  | 'COMISION_INSCRIPTO'
  | 'PLAN_SINCRONICO'
  | 'SIN_INSCRIPCION'
  | 'SIN_PERMISO'
  | 'COMISION_VENCIDA';

/**
 * Permisos específicos del estudiante
 */
export interface PermisosEstudiante {
  /** Acceso a libros digitales */
  accesoLibros: boolean;
  /** Acceso a planificaciones semanales */
  accesoPlanificaciones: boolean;
  /** Acceso a clases en vivo (WebSocket/LiveKit) */
  accesoClasesVivo: boolean;
}

/**
 * Detalles del plan directo
 */
export interface DetallePlanDirecto {
  id: string;
  nombre: string;
  fechaVencimiento?: Date;
}

/**
 * Detalles de suscripción del tutor
 */
export interface DetalleSuscripcionTutor {
  suscripcionId: string;
  planNombre: string;
  estado: string;
}

/**
 * Detalle de una comisión activa
 */
export interface DetalleComision {
  comisionId: string;
  nombre: string;
  fechaInicio: Date | null;
  fechaFin: Date | null;
}

/**
 * Detalles completos del acceso
 */
export interface DetallesAcceso {
  planDirecto?: DetallePlanDirecto;
  suscripcionTutor?: DetalleSuscripcionTutor;
  comisionesActivas: DetalleComision[];
  override?: {
    motivo: string | null;
    hasta: Date | null;
  };
}

/**
 * Resultado de verificarAccesoEstudiante
 */
export interface ResultadoAccesoEstudiante {
  /** Si el estudiante puede acceder a la plataforma */
  puedeAcceder: boolean;
  /** Motivo principal del acceso/rechazo */
  motivo: MotivoAcceso;
  /** Permisos específicos */
  permisos: PermisosEstudiante;
  /** Detalles de las fuentes de acceso */
  detalles: DetallesAcceso;
  /** Mensaje legible para el usuario */
  mensaje: string;
}

/**
 * Resultado de puedeEntrarAClase
 */
export interface ResultadoEntrarClase {
  /** Si puede entrar a la clase específica */
  puedeEntrar: boolean;
  /** Motivo del resultado */
  motivo: MotivoClase;
  /** Mensaje legible */
  mensaje: string;
}

/**
 * Parámetros para registrar historial de acceso
 */
export interface RegistrarHistorialParams {
  estudianteId: string;
  accion: string;
  origen: string;
  origenId?: string;
  estadoAnterior?: unknown;
  estadoNuevo?: unknown;
  ejecutadoPor?: string;
  metadata?: unknown;
}

/**
 * Planes que permiten acceso a clases en vivo
 */
const PLANES_CON_CLASES_VIVO = ['STEAM_SINCRONICO'];

/**
 * Planes que permiten acceso a planificaciones
 */
const PLANES_CON_PLANIFICACIONES = ['STEAM_ASINCRONICO', 'STEAM_SINCRONICO'];

/**
 * Servicio para verificar acceso de estudiantes a la plataforma y clases
 *
 * Sistema de acceso flexible con múltiples fuentes:
 * 1. Plan directo asignado al estudiante
 * 2. Suscripción activa del tutor
 * 3. Comisión activa (colonia, taller, etc.)
 * 4. Override manual por admin
 */
@Injectable()
export class AccesoEstudianteService {
  private readonly logger = new Logger(AccesoEstudianteService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica el acceso de un estudiante a la plataforma
   *
   * Orden de prioridad:
   * 1. Si estadoAcceso = SUSPENDIDO → Sin acceso
   * 2. Si accesoOverride activo → Acceso por override
   * 3. Si tiene plan directo vigente → Acceso por plan
   * 4. Si tutor tiene suscripción activa → Acceso heredado
   * 5. Si tiene comisión activa → Acceso por comisión
   * 6. Sin acceso
   */
  async verificarAccesoEstudiante(
    estudianteId: string,
  ): Promise<ResultadoAccesoEstudiante> {
    // Obtener estudiante con relaciones necesarias
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        plan: true,
        tutor: {
          include: {
            suscripciones: {
              where: {
                estado: {
                  in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.EN_GRACIA],
                },
              },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
        inscripcionesComision: {
          where: { estado: { in: ['Confirmada', 'Pendiente'] } },
          include: {
            comision: true,
          },
        },
      },
    });

    if (!estudiante) {
      return this.sinAcceso('Estudiante no encontrado');
    }

    // 1. Verificar si está suspendido
    if (estudiante.estadoAcceso === 'SUSPENDIDO') {
      return this.sinAcceso('Acceso suspendido por administrador');
    }

    // 2. Verificar override
    if (estudiante.accesoOverride) {
      const overrideVigente = this.esOverrideVigente(
        estudiante.accesoOverrideHasta,
      );
      if (overrideVigente) {
        return this.accesoOverride(estudiante);
      }
    }

    // Obtener comisiones activas (dentro de fechas)
    const hoy = new Date();
    const comisionesActivas = estudiante.inscripcionesComision.filter(
      (inscripcion) => {
        const comision = inscripcion.comision;
        // Si no tiene fechaInicio, asumimos que está activa
        const inicioOk = !comision.fechaInicio || comision.fechaInicio <= hoy;
        const finOk = !comision.fechaFin || comision.fechaFin >= hoy;
        return inicioOk && finOk && comision.activo !== false;
      },
    );

    // Auto-confirmar inscripciones pendientes al acceder
    await this.confirmarInscripcionesPendientes(comisionesActivas);

    // 3. Verificar plan directo
    if (estudiante.plan) {
      const planVigente = this.esPlanVigente(estudiante.fechaVencimientoPlan);
      if (planVigente) {
        return this.accesoPlanDirecto(estudiante, comisionesActivas);
      }
    }

    // 4. Verificar suscripción del tutor
    const suscripcionTutor = estudiante.tutor.suscripciones[0];
    if (suscripcionTutor) {
      return this.accesoSuscripcionTutor(
        estudiante,
        suscripcionTutor,
        comisionesActivas,
      );
    }

    // 5. Verificar comisiones activas
    if (comisionesActivas.length > 0) {
      return this.accesoComision(comisionesActivas);
    }

    // 6. Sin acceso
    return this.sinAcceso('Sin plan, suscripción o comisión activa');
  }

  /**
   * Verifica si un estudiante puede entrar a una clase específica
   *
   * @param estudianteId - ID del estudiante
   * @param claseGrupoId - ID de la clase de grupo (opcional)
   * @param comisionId - ID de la comisión (opcional)
   */
  async puedeEntrarAClase(
    estudianteId: string,
    claseGrupoId?: string,
    comisionId?: string,
  ): Promise<ResultadoEntrarClase> {
    // Validar que se proporcione exactamente uno
    if (!claseGrupoId && !comisionId) {
      throw new BadRequestException(
        'Debe proporcionar claseGrupoId o comisionId',
      );
    }
    if (claseGrupoId && comisionId) {
      throw new BadRequestException(
        'Debe proporcionar claseGrupoId o comisionId, no ambos',
      );
    }

    if (comisionId) {
      return this.verificarAccesoClaseComision(estudianteId, comisionId);
    }

    return this.verificarAccesoClaseGrupo(estudianteId, claseGrupoId!);
  }

  /**
   * Registra un cambio de acceso en el historial
   */
  async registrarHistorialAcceso(
    params: RegistrarHistorialParams,
  ): Promise<void> {
    await this.prisma.historialAccesoEstudiante.create({
      data: {
        estudianteId: params.estudianteId,
        accion: params.accion,
        origen: params.origen,
        origenId: params.origenId,
        estadoAnterior: params.estadoAnterior as Prisma.InputJsonValue,
        estadoNuevo: params.estadoNuevo as Prisma.InputJsonValue,
        ejecutadoPor: params.ejecutadoPor,
        metadata: params.metadata as Prisma.InputJsonValue,
      },
    });

    this.logger.log(
      `Historial acceso registrado: ${params.accion} para estudiante ${params.estudianteId}`,
    );
  }

  // ============================================================================
  // Métodos privados - Verificación de acceso a plataforma
  // ============================================================================

  private sinAcceso(mensaje: string): ResultadoAccesoEstudiante {
    return {
      puedeAcceder: false,
      motivo: 'SIN_ACCESO',
      permisos: {
        accesoLibros: false,
        accesoPlanificaciones: false,
        accesoClasesVivo: false,
      },
      detalles: {
        comisionesActivas: [],
      },
      mensaje,
    };
  }

  private accesoOverride(estudiante: {
    accesoOverrideMotivo: string | null;
    accesoOverrideHasta: Date | null;
  }): ResultadoAccesoEstudiante {
    return {
      puedeAcceder: true,
      motivo: 'OVERRIDE',
      permisos: {
        accesoLibros: true,
        accesoPlanificaciones: true,
        accesoClasesVivo: true, // Override da acceso completo
      },
      detalles: {
        comisionesActivas: [],
        override: {
          motivo: estudiante.accesoOverrideMotivo,
          hasta: estudiante.accesoOverrideHasta,
        },
      },
      mensaje: estudiante.accesoOverrideMotivo
        ? `Acceso por: ${estudiante.accesoOverrideMotivo}`
        : 'Acceso por override administrativo',
    };
  }

  private accesoPlanDirecto(
    estudiante: {
      plan: { id: string; nombre: string } | null;
      fechaVencimientoPlan: Date | null;
    },
    comisionesActivas: Array<{
      comision: {
        id: string;
        nombre: string;
        fechaInicio: Date | null;
        fechaFin: Date | null;
      };
    }>,
  ): ResultadoAccesoEstudiante {
    // TODO [HIGH-003]: Reemplazar estudiante.plan! por validación explícita
    // Ver: /docs/TODO_PRE_LAUNCH.md
    const plan = estudiante.plan!;
    const tieneClasesVivo =
      PLANES_CON_CLASES_VIVO.includes(plan.nombre) ||
      comisionesActivas.length > 0;
    const tienePlanificaciones =
      PLANES_CON_PLANIFICACIONES.includes(plan.nombre) ||
      comisionesActivas.length > 0;

    return {
      puedeAcceder: true,
      motivo: 'PLAN_DIRECTO',
      permisos: {
        accesoLibros: true, // Cualquier plan da acceso a libros
        accesoPlanificaciones: tienePlanificaciones,
        accesoClasesVivo: tieneClasesVivo,
      },
      detalles: {
        planDirecto: {
          id: plan.id,
          nombre: plan.nombre,
          fechaVencimiento: estudiante.fechaVencimientoPlan ?? undefined,
        },
        comisionesActivas: comisionesActivas.map((ic) => ({
          comisionId: ic.comision.id,
          nombre: ic.comision.nombre,
          fechaInicio: ic.comision.fechaInicio,
          fechaFin: ic.comision.fechaFin,
        })),
      },
      mensaje: `Acceso por plan ${plan.nombre}`,
    };
  }

  private accesoSuscripcionTutor(
    estudiante: {
      plan: { id: string; nombre: string } | null;
      fechaVencimientoPlan: Date | null;
    },
    suscripcion: {
      id: string;
      estado: EstadoSuscripcion;
      plan: { id: string; nombre: string };
    },
    comisionesActivas: Array<{
      comision: {
        id: string;
        nombre: string;
        fechaInicio: Date | null;
        fechaFin: Date | null;
      };
    }>,
  ): ResultadoAccesoEstudiante {
    const plan = suscripcion.plan;
    const tieneClasesVivo =
      PLANES_CON_CLASES_VIVO.includes(plan.nombre) ||
      comisionesActivas.length > 0;
    const tienePlanificaciones =
      PLANES_CON_PLANIFICACIONES.includes(plan.nombre) ||
      comisionesActivas.length > 0;

    return {
      puedeAcceder: true,
      motivo: 'SUSCRIPCION_TUTOR',
      permisos: {
        accesoLibros: true,
        accesoPlanificaciones: tienePlanificaciones,
        accesoClasesVivo: tieneClasesVivo,
      },
      detalles: {
        suscripcionTutor: {
          suscripcionId: suscripcion.id,
          planNombre: plan.nombre,
          estado: suscripcion.estado,
        },
        comisionesActivas: comisionesActivas.map((ic) => ({
          comisionId: ic.comision.id,
          nombre: ic.comision.nombre,
          fechaInicio: ic.comision.fechaInicio,
          fechaFin: ic.comision.fechaFin,
        })),
      },
      mensaje: `Acceso heredado por suscripción del tutor (${plan.nombre})`,
    };
  }

  private accesoComision(
    comisionesActivas: Array<{
      comision: {
        id: string;
        nombre: string;
        fechaInicio: Date | null;
        fechaFin: Date | null;
        modalidad: 'SINCRONICO' | 'ASINCRONICO';
      };
    }>,
  ): ResultadoAccesoEstudiante {
    const primeraComision = comisionesActivas[0];

    // Verificar si alguna comisión es SINCRONICO para dar acceso a clases en vivo
    const tieneComisionSincronica = comisionesActivas.some(
      (ic) => ic.comision.modalidad === 'SINCRONICO',
    );

    return {
      puedeAcceder: true,
      motivo: 'COMISION_ACTIVA',
      permisos: {
        accesoLibros: true,
        accesoPlanificaciones: true, // Comisiones siempre dan acceso a planificaciones
        accesoClasesVivo: tieneComisionSincronica, // Solo si tiene comisión SINCRONICO
      },
      detalles: {
        comisionesActivas: comisionesActivas.map((ic) => ({
          comisionId: ic.comision.id,
          nombre: ic.comision.nombre,
          fechaInicio: ic.comision.fechaInicio,
          fechaFin: ic.comision.fechaFin,
          modalidad: ic.comision.modalidad,
        })),
      },
      mensaje: `Acceso por comisión activa: ${primeraComision?.comision.nombre ?? 'Sin nombre'}`,
    };
  }

  // ============================================================================
  // Métodos privados - Verificación de acceso a clase específica
  // ============================================================================

  private async verificarAccesoClaseComision(
    estudianteId: string,
    comisionId: string,
  ): Promise<ResultadoEntrarClase> {
    // Verificar que existe la comisión y obtener fechas
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
    });

    if (!comision) {
      return {
        puedeEntrar: false,
        motivo: 'SIN_INSCRIPCION',
        mensaje: 'Comisión no encontrada',
      };
    }

    // Verificar si la comisión está vencida
    const hoy = new Date();
    if (comision.fechaFin && comision.fechaFin < hoy) {
      return {
        puedeEntrar: false,
        motivo: 'COMISION_VENCIDA',
        mensaje: 'La comisión ha finalizado',
      };
    }

    // Verificar inscripción confirmada
    const inscripcion = await this.prisma.inscripcionComision.findFirst({
      where: {
        estudianteId: estudianteId,
        comisionId: comisionId,
        estado: 'Confirmada',
      },
    });

    if (!inscripcion) {
      return {
        puedeEntrar: false,
        motivo: 'SIN_INSCRIPCION',
        mensaje: 'No estás inscrito en esta comisión',
      };
    }

    return {
      puedeEntrar: true,
      motivo: 'COMISION_INSCRIPTO',
      mensaje: `Acceso permitido a ${comision.nombre}`,
    };
  }

  private async verificarAccesoClaseGrupo(
    estudianteId: string,
    claseGrupoId: string,
  ): Promise<ResultadoEntrarClase> {
    // Verificar inscripción en el grupo usando vista unificada
    // Incluye inscripciones manuales (admin/becas) y via suscripción (tutor 2026)
    const inscripcion = await this.prisma.inscripcionUnificada.findFirst({
      where: {
        estudianteId: estudianteId,
        claseGrupoId: claseGrupoId,
        estado: 'ACTIVA',
      },
    });

    if (!inscripcion) {
      return {
        puedeEntrar: false,
        motivo: 'SIN_INSCRIPCION',
        mensaje: 'No estás inscrito en esta clase de grupo',
      };
    }

    // Verificar que tiene plan STEAM_SINCRONICO
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        plan: true,
        tutor: {
          include: {
            suscripciones: {
              where: {
                estado: {
                  in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.EN_GRACIA],
                },
              },
              include: { plan: true },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    });

    if (!estudiante) {
      return {
        puedeEntrar: false,
        motivo: 'SIN_PERMISO',
        mensaje: 'Estudiante no encontrado',
      };
    }

    // Verificar plan directo
    if (estudiante.plan) {
      const planVigente = this.esPlanVigente(estudiante.fechaVencimientoPlan);
      if (
        planVigente &&
        PLANES_CON_CLASES_VIVO.includes(estudiante.plan.nombre)
      ) {
        return {
          puedeEntrar: true,
          motivo: 'PLAN_SINCRONICO',
          mensaje: 'Acceso por plan STEAM Sincrónico',
        };
      }
    }

    // Verificar suscripción del tutor
    const suscripcionTutor = estudiante.tutor.suscripciones[0];
    if (
      suscripcionTutor &&
      PLANES_CON_CLASES_VIVO.includes(suscripcionTutor.plan.nombre)
    ) {
      return {
        puedeEntrar: true,
        motivo: 'PLAN_SINCRONICO',
        mensaje: 'Acceso por suscripción del tutor (STEAM Sincrónico)',
      };
    }

    // No tiene plan sincrónico - la comisión activa NO da acceso a clases de grupo
    return {
      puedeEntrar: false,
      motivo: 'SIN_PERMISO',
      mensaje: 'Requiere plan STEAM Sincrónico para acceder a clases de grupo',
    };
  }

  // ============================================================================
  // Métodos privados - Utilidades
  // ============================================================================

  private esOverrideVigente(hasta: Date | null): boolean {
    if (!hasta) return true; // Sin fecha = indefinido
    return hasta >= new Date();
  }

  private esPlanVigente(fechaVencimiento: Date | null): boolean {
    if (!fechaVencimiento) return true; // Sin fecha = indefinido
    return fechaVencimiento >= new Date();
  }

  /**
   * Auto-confirma inscripciones pendientes cuando el estudiante accede
   * Esto cambia el estado de Pendiente a Confirmada
   */
  private async confirmarInscripcionesPendientes(
    inscripciones: Array<{
      id: string;
      estado: string;
      comision: { id: string; nombre: string };
    }>,
  ): Promise<void> {
    const pendientes = inscripciones.filter((i) => i.estado === 'Pendiente');

    if (pendientes.length === 0) return;

    // Actualizar todas las inscripciones pendientes a Confirmada
    const ids = pendientes.map((i) => i.id);
    await this.prisma.inscripcionComision.updateMany({
      where: { id: { in: ids } },
      data: { estado: 'Confirmada' },
    });

    this.logger.log(
      `Auto-confirmadas ${pendientes.length} inscripciones: ${pendientes.map((p) => p.comision.nombre).join(', ')}`,
    );
  }
}
