/**
 * Servicio para verificar acceso de tutores/estudiantes basado en estado de suscripción
 *
 * Estados y acceso:
 * - ACTIVA → ✅ Acceso completo
 * - EN_GRACIA → ✅ Acceso completo (máx 3 días)
 * - PENDIENTE → ⚠️ Acceso limitado (solo ver planes)
 * - MOROSA → ❌ Sin acceso
 * - CANCELADA → ❌ Sin acceso
 * - PAUSADA → ❌ Sin acceso (REGLA: No pausamos, pero por si llega de MP)
 */
import { Injectable, Logger } from '@nestjs/common';
import { EstadoSuscripcion, Suscripcion } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { GRACE_PERIOD_DIAS } from '../domain/constants/suscripcion.constants';

/**
 * Resultado de verificación de acceso
 */
export interface AccesoResult {
  /** Si tiene acceso completo al contenido */
  tieneAcceso: boolean;
  /** Si tiene acceso limitado (ej: ver planes, perfil) */
  accesoLimitado: boolean;
  /** Estado actual de la suscripción */
  estado: EstadoSuscripcion | null;
  /** Razón del resultado */
  razon: string;
  /** ID de la suscripción (si existe) */
  suscripcionId?: string;
  /** Días restantes de gracia (si aplica) */
  diasRestantesGracia?: number;
}

/**
 * Estados que permiten acceso completo
 */
const ESTADOS_CON_ACCESO: ReadonlySet<EstadoSuscripcion> = new Set([
  EstadoSuscripcion.ACTIVA,
  EstadoSuscripcion.EN_GRACIA,
]);

/**
 * Estados que permiten acceso limitado
 */
const ESTADOS_ACCESO_LIMITADO: ReadonlySet<EstadoSuscripcion> = new Set([
  EstadoSuscripcion.PENDIENTE,
]);

@Injectable()
export class SuscripcionAccesoService {
  private readonly logger = new Logger(SuscripcionAccesoService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Verifica si un tutor tiene acceso basado en su suscripción
   *
   * @param tutorId - ID del tutor
   * @returns Resultado de verificación de acceso
   */
  async verificarAccesoTutor(tutorId: string): Promise<AccesoResult> {
    // Buscar suscripción más reciente (cualquier estado)
    const suscripcion = await this.prisma.suscripcion.findFirst({
      where: { tutor_id: tutorId },
      orderBy: { created_at: 'desc' },
    });

    if (!suscripcion) {
      return {
        tieneAcceso: false,
        accesoLimitado: false,
        estado: null,
        razon: 'Tutor sin suscripción',
      };
    }

    return this.evaluarAcceso(suscripcion);
  }

  /**
   * Verifica si un estudiante tiene acceso a través de su tutor
   *
   * @param estudianteId - ID del estudiante
   * @returns Resultado de verificación de acceso
   */
  async verificarAccesoEstudiante(estudianteId: string): Promise<AccesoResult> {
    // Buscar estudiante y su tutor
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { tutor_id: true },
    });

    if (!estudiante) {
      return {
        tieneAcceso: false,
        accesoLimitado: false,
        estado: null,
        razon: 'Estudiante no encontrado',
      };
    }

    // Verificar acceso del tutor
    return this.verificarAccesoTutor(estudiante.tutor_id);
  }

  /**
   * Obtiene la suscripción activa de un tutor (ACTIVA o EN_GRACIA)
   *
   * @param tutorId - ID del tutor
   * @returns Suscripción activa o null
   */
  async obtenerEstadoSuscripcionActiva(
    tutorId: string,
  ): Promise<Suscripcion | null> {
    return this.prisma.suscripcion.findFirst({
      where: {
        tutor_id: tutorId,
        estado: {
          in: [EstadoSuscripcion.ACTIVA, EstadoSuscripcion.EN_GRACIA],
        },
      },
      orderBy: { created_at: 'desc' },
    });
  }

  /**
   * Verifica rápidamente si un tutor tiene acceso a contenido
   * Método simplificado para uso en guards
   *
   * @param tutorId - ID del tutor
   * @returns true si tiene acceso completo
   */
  async tieneAccesoContenido(tutorId: string): Promise<boolean> {
    const result = await this.verificarAccesoTutor(tutorId);
    return result.tieneAcceso;
  }

  /**
   * Evalúa el acceso basado en el estado de la suscripción
   */
  private evaluarAcceso(suscripcion: Suscripcion): AccesoResult {
    const { estado, id, dias_gracia_usados } = suscripcion;

    // Estados con acceso completo
    if (ESTADOS_CON_ACCESO.has(estado)) {
      const diasRestantes =
        estado === EstadoSuscripcion.EN_GRACIA
          ? GRACE_PERIOD_DIAS - (dias_gracia_usados || 0)
          : undefined;

      return {
        tieneAcceso: true,
        accesoLimitado: false,
        estado,
        suscripcionId: id,
        razon:
          estado === EstadoSuscripcion.ACTIVA
            ? 'Suscripción activa'
            : `En período de gracia (${diasRestantes} días restantes)`,
        diasRestantesGracia: diasRestantes,
      };
    }

    // Estados con acceso limitado
    if (ESTADOS_ACCESO_LIMITADO.has(estado)) {
      return {
        tieneAcceso: false,
        accesoLimitado: true,
        estado,
        suscripcionId: id,
        razon: 'Suscripción pendiente de activación',
      };
    }

    // Estados sin acceso (MOROSA, CANCELADA, PAUSADA)
    const razones: Record<EstadoSuscripcion, string> = {
      [EstadoSuscripcion.MOROSA]: 'Suscripción morosa - acceso bloqueado',
      [EstadoSuscripcion.CANCELADA]: 'Suscripción cancelada',
      [EstadoSuscripcion.PAUSADA]: 'Suscripción pausada - acceso bloqueado', // No debería pasar
      [EstadoSuscripcion.ACTIVA]: '', // Ya manejado arriba
      [EstadoSuscripcion.EN_GRACIA]: '', // Ya manejado arriba
      [EstadoSuscripcion.PENDIENTE]: '', // Ya manejado arriba
    };

    return {
      tieneAcceso: false,
      accesoLimitado: false,
      estado,
      suscripcionId: id,
      razon: razones[estado] || `Estado desconocido: ${estado}`,
    };
  }
}
