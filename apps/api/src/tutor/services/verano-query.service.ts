/**
 * ============================================================================
 * VERANO QUERY SERVICE - Consultas de lectura para Verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md
 *
 * Responsabilidades:
 * - GET /tutor/verano/estado - Estado de verano para la familia
 * - Verificar período de decisión (15 nov - 5 dic)
 * - Obtener cupos disponibles por grupo de Colonia
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ClockService } from '../../core/services/clock.service';
import {
  EstadoVeranoResponseDto,
  EstudianteVeranoDto,
} from '../dto/verano.dto';

// ============================================================================
// CONSTANTES DE PERÍODO
// ============================================================================

/**
 * Período de decisión de verano (según spec 2.1)
 * - Inicio: 15 de noviembre
 * - Fin: 5 de diciembre 23:59:59
 */
export const PERIODO_DECISION = {
  MES_INICIO: 11, // Noviembre (0-indexed en JS = 10, pero usamos 1-indexed = 11)
  DIA_INICIO: 15,
  MES_FIN: 12, // Diciembre
  DIA_FIN: 5,
};

// ============================================================================
// SERVICE
// ============================================================================

@Injectable()
export class VeranoQueryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  /**
   * Obtiene el estado de verano para todos los hijos de un tutor
   *
   * @param tutorId - ID del tutor autenticado
   * @returns Estado de verano con lista de estudiantes
   */
  async getEstadoVerano(tutorId: string): Promise<EstadoVeranoResponseDto> {
    const fechaActual = this.clock.now();
    const anioActual = fechaActual.getFullYear();
    const puedeDecidir = this.estaDentroPeriodoDecision(fechaActual);
    const fechaLimite = this.getFechaLimiteDecision(anioActual);

    // Obtener suscripción familiar del tutor
    const suscripcionFamiliar =
      await this.prisma.suscripcionFamiliar.findUnique({
        where: { tutorId },
        include: {
          inscripciones: {
            where: { estado: 'ACTIVA' },
            include: {
              estudiante: true,
            },
          },
          decisionesVerano: {
            where: { anio: anioActual },
          },
        },
      });

    if (!suscripcionFamiliar) {
      return {
        puedeDecidir,
        fechaLimite: fechaLimite.toISOString(),
        estudiantes: [],
      };
    }

    // Obtener cupos disponibles de grupos de Colonia
    const cuposDisponibles = await this.getCuposColoniaDisponibles();

    // Mapear estudiantes con sus decisiones
    const estudiantesUnicos = new Map<string, EstudianteVeranoDto>();

    for (const inscripcion of suscripcionFamiliar.inscripciones) {
      const estudianteId = inscripcion.estudianteId;

      // Evitar duplicados (un estudiante puede tener múltiples inscripciones)
      if (estudiantesUnicos.has(estudianteId)) continue;

      // Buscar decisión del estudiante
      const decisionVerano = suscripcionFamiliar.decisionesVerano.find(
        (d) => d.estudianteId === estudianteId,
      );

      estudiantesUnicos.set(estudianteId, {
        id: estudianteId,
        nombre: `${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido}`,
        decision: decisionVerano?.decision ?? null,
        cuposColoniaDisponibles: cuposDisponibles,
      });
    }

    return {
      puedeDecidir,
      fechaLimite: fechaLimite.toISOString(),
      estudiantes: Array.from(estudiantesUnicos.values()),
    };
  }

  /**
   * Verifica si estamos dentro del período de decisión (15 nov - 5 dic)
   */
  estaDentroPeriodoDecision(fecha?: Date): boolean {
    const fechaActual = fecha ?? this.clock.now();
    const anio = fechaActual.getFullYear();
    const inicio = new Date(
      anio,
      PERIODO_DECISION.MES_INICIO - 1,
      PERIODO_DECISION.DIA_INICIO,
      0,
      0,
      0,
    );
    const fin = new Date(
      anio,
      PERIODO_DECISION.MES_FIN - 1,
      PERIODO_DECISION.DIA_FIN,
      23,
      59,
      59,
    );

    return fechaActual >= inicio && fechaActual <= fin;
  }

  /**
   * Obtiene la fecha límite de decisión para un año
   */
  getFechaLimiteDecision(anio: number): Date {
    return new Date(
      anio,
      PERIODO_DECISION.MES_FIN - 1,
      PERIODO_DECISION.DIA_FIN,
      23,
      59,
      59,
    );
  }

  /**
   * Obtiene el total de cupos disponibles en grupos de Colonia
   * Spec 3.6: El cupo es por grupo, no total
   */
  async getCuposColoniaDisponibles(): Promise<number> {
    // Buscar grupos de Colonia activos
    // NOTA: Asumimos que los grupos de Colonia se identifican por tipo o nombre
    // Esto puede necesitar ajuste según la implementación real
    const grupos = await this.prisma.claseGrupo.findMany({
      where: {
        activo: true,
        // Filtrar por grupos de Colonia (ajustar según modelo real)
        // tipo: 'COLONIA_VERANO' o similar
      },
      select: {
        id: true,
        cupoMaximo: true,
        _count: {
          select: {
            asignacionesColoniaVerano: {
              where: {
                decision: 'COLONIA',
                anio: this.clock.currentYear(),
              },
            },
          },
        },
      },
    });

    // Sumar cupos disponibles de todos los grupos
    let totalDisponible = 0;
    for (const grupo of grupos) {
      const ocupado = grupo._count.asignacionesColoniaVerano;
      const disponible = Math.max(0, grupo.cupoMaximo - ocupado);
      totalDisponible += disponible;
    }

    return totalDisponible;
  }

  /**
   * Obtiene grupos de Colonia con cupos disponibles
   * Retorna ordenados por disponibilidad (mayor primero)
   */
  async getGruposColoniaConCupos(anio?: number) {
    const anioActual = anio ?? this.clock.currentYear();
    const grupos = await this.prisma.claseGrupo.findMany({
      where: {
        activo: true,
      },
      include: {
        _count: {
          select: {
            asignacionesColoniaVerano: {
              where: {
                decision: 'COLONIA',
                anio: anioActual,
              },
            },
          },
        },
      },
    });

    return grupos
      .map((grupo) => ({
        id: grupo.id,
        nombre: grupo.nombre,
        cupoMaximo: grupo.cupoMaximo,
        cupoOcupado: grupo._count.asignacionesColoniaVerano,
        disponible: Math.max(
          0,
          grupo.cupoMaximo - grupo._count.asignacionesColoniaVerano,
        ),
      }))
      .filter((g) => g.disponible > 0)
      .sort((a, b) => b.disponible - a.disponible);
  }

  /**
   * Verifica si un estudiante pertenece a un tutor
   */
  async verificarEstudiantePerteneceATutor(
    estudianteId: string,
    tutorId: string,
  ): Promise<boolean> {
    const estudiante = await this.prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        tutorId: tutorId,
      },
    });

    return estudiante !== null;
  }

  /**
   * Obtiene la suscripción familiar de un tutor
   */
  async getSuscripcionFamiliar(tutorId: string) {
    return this.prisma.suscripcionFamiliar.findUnique({
      where: { tutorId },
      include: {
        inscripciones: true,
        decisionesVerano: true,
      },
    });
  }

  /**
   * Obtiene la decisión de verano de un estudiante para un año
   */
  async getDecisionVeranoEstudiante(estudianteId: string, anio: number) {
    return this.prisma.decisionVeranoEstudiante.findUnique({
      where: {
        estudianteId_anio: {
          estudianteId,
          anio,
        },
      },
    });
  }
}
