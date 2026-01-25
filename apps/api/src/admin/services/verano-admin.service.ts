/**
 * ============================================================================
 * VERANO ADMIN SERVICE - Operaciones administrativas para Verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md (sección 4.3)
 *
 * Responsabilidades:
 * - GET /admin/verano/resumen - Dashboard resumen
 * - GET /admin/verano/decisiones - Listar decisiones con filtro
 * - POST /admin/verano/procesar-bajas - Procesar no-respuesta como BAJA
 * - POST /admin/verano/restaurar-suscripciones - Restaurar montos en marzo
 * - POST /admin/verano/forzar-decision - Override admin de decisión
 */

import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ClockService } from '../../core/services/clock.service';
import {
  ResumenVeranoResponseDto,
  DecisionEstudianteDto,
  ProcesarBajasResponseDto,
  RestaurarSuscripcionesResponseDto,
  ForzarDecisionResponseDto,
  ForzarDecisionVeranoDto,
  GetDecisionesVeranoQueryDto,
  CupoGrupoColoniaDto,
} from '../dto/verano-admin.dto';
import { DecisionVeranoInput } from '../../tutor/dto/verano.dto';
import { PRECIOS_VERANO } from '../../tutor/services/verano-command.service';
import { PERIODO_DECISION } from '../../tutor/services/verano-query.service';
import { DecisionVerano, EstadoSuscripcionFamiliar } from '@prisma/client';

@Injectable()
export class VeranoAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
  ) {}

  /**
   * Obtiene resumen del estado de verano para el dashboard admin
   *
   * Spec 4.3: Vista de dashboard con totales y cupos por grupo
   */
  async getResumen(anio?: number): Promise<ResumenVeranoResponseDto> {
    const anioActual = anio ?? this.clock.currentYear();
    // 1. Get unique student count
    const estudiantesUnicos = await this.prisma.inscripcionActividad.findMany({
      where: {
        estado: 'ACTIVA',
        suscripcionFamiliar: {
          estado: {
            in: [
              EstadoSuscripcionFamiliar.AUTHORIZED,
              EstadoSuscripcionFamiliar.CONTINUIDAD,
            ],
          },
        },
      },
      select: {
        estudianteId: true,
      },
      distinct: ['estudianteId'],
    });

    const totalEstudiantesUnicos = estudiantesUnicos.length;

    // 2. Contar decisiones por tipo
    const decisiones = await this.prisma.decisionVeranoEstudiante.groupBy({
      by: ['decision'],
      where: { anio: anioActual },
      _count: true,
    });

    const decidieronColonia =
      decisiones.find((d) => d.decision === DecisionVerano.COLONIA)?._count ??
      0;
    const decidieronContinuidad =
      decisiones.find((d) => d.decision === DecisionVerano.CONTINUIDAD)
        ?._count ?? 0;
    const pendientes =
      decisiones.find((d) => d.decision === DecisionVerano.PENDIENTE)?._count ??
      0;

    // Estudiantes sin decisión = total - los que tienen decisión registrada
    const totalConDecision = decisiones.reduce((sum, d) => sum + d._count, 0);
    const noRespondieron =
      totalEstudiantesUnicos - totalConDecision + pendientes;

    // 3. Calcular fecha límite
    const fechaLimite = new Date(
      anioActual,
      PERIODO_DECISION.MES_FIN - 1,
      PERIODO_DECISION.DIA_FIN,
      23,
      59,
      59,
    );

    // 4. Obtener cupos por grupo de Colonia
    const grupos = await this.prisma.claseGrupo.findMany({
      where: { activo: true },
      include: {
        _count: {
          select: {
            asignacionesColoniaVerano: {
              where: {
                decision: DecisionVerano.COLONIA,
                anio: anioActual,
              },
            },
          },
        },
      },
    });

    const cuposColoniaPorGrupo: CupoGrupoColoniaDto[] = grupos.map((grupo) => ({
      grupoId: grupo.id,
      nombre: grupo.nombre,
      cupoTotal: grupo.cupoMaximo,
      cupoOcupado: grupo._count.asignacionesColoniaVerano,
      disponible: Math.max(
        0,
        grupo.cupoMaximo - grupo._count.asignacionesColoniaVerano,
      ),
    }));

    return {
      totalEstudiantes: totalEstudiantesUnicos,
      decidieronColonia,
      decidieronContinuidad,
      noRespondieron: Math.max(0, noRespondieron),
      fechaLimite: fechaLimite.toISOString(),
      cuposColoniaPorGrupo,
    };
  }

  /**
   * Lista todas las decisiones de verano con filtro opcional
   */
  async getDecisiones(
    query: GetDecisionesVeranoQueryDto,
    anio?: number,
  ): Promise<DecisionEstudianteDto[]> {
    const anioActual = anio ?? this.clock.currentYear();
    // Build where clause based on filter
    const whereDecision: DecisionVerano | undefined =
      query.filtro === 'COLONIA'
        ? DecisionVerano.COLONIA
        : query.filtro === 'CONTINUIDAD'
          ? DecisionVerano.CONTINUIDAD
          : query.filtro === 'PENDIENTE'
            ? DecisionVerano.PENDIENTE
            : undefined;

    // If filter is BAJA, we need to find students without decision or PENDIENTE
    if (query.filtro === 'BAJA') {
      // Students with BAJA are those who had their inscriptions cancelled
      // For now, return empty - BAJA is handled differently
      return [];
    }

    const decisiones = await this.prisma.decisionVeranoEstudiante.findMany({
      where: {
        anio: anioActual,
        ...(whereDecision && { decision: whereDecision }),
      },
      include: {
        estudiante: {
          include: {
            tutor: true,
          },
        },
      },
      orderBy: { fechaDecision: 'desc' },
    });

    return decisiones.map((d) => ({
      estudianteId: d.estudianteId,
      nombre: `${d.estudiante.nombre} ${d.estudiante.apellido}`,
      tutor: d.estudiante.tutor
        ? `${d.estudiante.tutor.nombre} ${d.estudiante.tutor.apellido}`
        : 'Sin tutor',
      decision: d.decision,
      fechaDecision: d.fechaDecision?.toISOString(),
    }));
  }

  /**
   * Procesa estudiantes que no respondieron después del deadline
   *
   * Spec 2.2: Si no responde en plazo → BAJA automática (pierde cupo)
   *
   * Solo ejecutar después del 5 de diciembre
   */
  async procesarBajas(): Promise<ProcesarBajasResponseDto> {
    const fechaActual = this.clock.now();
    const anio = fechaActual.getFullYear();
    const fechaLimite = new Date(
      anio,
      PERIODO_DECISION.MES_FIN - 1,
      PERIODO_DECISION.DIA_FIN,
      23,
      59,
      59,
    );

    // Verificar que ya pasó el deadline
    if (fechaActual <= fechaLimite) {
      throw new BadRequestException(
        `El período de decisión no ha terminado. Fecha límite: ${fechaLimite.toISOString()}`,
      );
    }

    // Buscar estudiantes con suscripción activa que NO tienen decisión o tienen PENDIENTE
    const estudiantesActivos = await this.prisma.inscripcionActividad.findMany({
      where: {
        estado: 'ACTIVA',
        suscripcionFamiliar: {
          estado: {
            in: [
              EstadoSuscripcionFamiliar.AUTHORIZED,
              EstadoSuscripcionFamiliar.CONTINUIDAD,
            ],
          },
        },
      },
      select: {
        estudianteId: true,
        suscripcionFamiliarId: true,
      },
      distinct: ['estudianteId'],
    });

    // Filtrar los que no tienen decisión o tienen PENDIENTE
    const estudiantesSinDecision: string[] = [];

    for (const inscripcion of estudiantesActivos) {
      const decision = await this.prisma.decisionVeranoEstudiante.findUnique({
        where: {
          estudianteId_anio: {
            estudianteId: inscripcion.estudianteId,
            anio,
          },
        },
      });

      if (!decision || decision.decision === DecisionVerano.PENDIENTE) {
        estudiantesSinDecision.push(inscripcion.estudianteId);
      }
    }

    // Procesar bajas en transacción
    await this.prisma.$transaction(async (tx) => {
      for (const estudianteId of estudiantesSinDecision) {
        // Cancelar todas las inscripciones del estudiante
        await tx.inscripcionActividad.updateMany({
          where: { estudianteId },
          data: { estado: 'CANCELADA' },
        });

        // Marcar como BAJA (aunque el enum no lo tiene, usamos PENDIENTE y cancelamos inscripción)
        // En la práctica, BAJA = inscripción cancelada + sin decisión COLONIA/CONTINUIDAD
      }
    });

    return {
      procesados: estudiantesSinDecision.length,
      dadosDeBaja: estudiantesSinDecision,
    };
  }

  /**
   * Restaura los montos originales de suscripciones en marzo
   *
   * Spec 2.3: En marzo se restauran los montos normales
   */
  async restaurarSuscripciones(): Promise<RestaurarSuscripcionesResponseDto> {
    const mes = this.clock.currentMonth(); // 1-12

    // Solo permitir en marzo (3)
    if (mes !== 3) {
      throw new BadRequestException(
        'La restauración de suscripciones solo se puede ejecutar en marzo',
      );
    }

    // Buscar suscripciones con monto original guardado
    const suscripciones = await this.prisma.suscripcionFamiliar.findMany({
      where: {
        montoOriginal: { not: null },
        estado: {
          in: [
            EstadoSuscripcionFamiliar.AUTHORIZED,
            EstadoSuscripcionFamiliar.CONTINUIDAD,
          ],
        },
      },
    });

    // Restaurar en transacción
    await this.prisma.$transaction(async (tx) => {
      for (const sub of suscripciones) {
        await tx.suscripcionFamiliar.update({
          where: { id: sub.id },
          data: {
            montoMensual: sub.montoOriginal!,
            montoOriginal: null, // Limpiar para próximo verano
            estado: EstadoSuscripcionFamiliar.AUTHORIZED, // Volver a estado normal
          },
        });
      }

      // Limpiar decisiones del año anterior (opcional, para mantener histórico comentado)
      // await tx.decisionVeranoEstudiante.deleteMany({
      //   where: { anio: anio - 1 }
      // });
    });

    return {
      restaurados: suscripciones.length,
      mensaje: `${suscripciones.length} suscripciones restauradas a sus montos originales`,
    };
  }

  /**
   * Fuerza una decisión de verano para un estudiante (override admin)
   *
   * Spec 4.3: Admin puede forzar decisiones (ej: becas especiales)
   */
  async forzarDecision(
    dto: ForzarDecisionVeranoDto,
    adminId: string,
  ): Promise<ForzarDecisionResponseDto> {
    const anio = this.clock.currentYear();

    // 1. Verificar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      include: { tutor: true },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 2. Obtener suscripción familiar
    const suscripcionFamiliar =
      await this.prisma.suscripcionFamiliar.findUnique({
        where: { tutorId: estudiante.tutorId },
      });

    if (!suscripcionFamiliar) {
      throw new NotFoundException(
        'El estudiante no tiene una suscripción familiar activa',
      );
    }

    // 3. Mapear decisión
    let decisionDB: DecisionVerano;
    switch (dto.decision) {
      case DecisionVeranoInput.COLONIA:
        decisionDB = DecisionVerano.COLONIA;
        break;
      case DecisionVeranoInput.CONTINUIDAD:
        decisionDB = DecisionVerano.CONTINUIDAD;
        break;
      case DecisionVeranoInput.BAJA:
        decisionDB = DecisionVerano.PENDIENTE; // BAJA se maneja cancelando inscripción
        break;
      default:
        throw new BadRequestException('Decisión inválida');
    }

    // 4. Aplicar decisión en transacción
    await this.prisma.$transaction(async (tx) => {
      await tx.decisionVeranoEstudiante.upsert({
        where: {
          estudianteId_anio: {
            estudianteId: dto.estudianteId,
            anio,
          },
        },
        create: {
          estudianteId: dto.estudianteId,
          suscripcionFamiliarId: suscripcionFamiliar.id,
          anio,
          decision: decisionDB,
          fechaDecision: this.clock.now(),
          motivoAdmin: `[Admin Override] ${dto.motivo}`,
          matriculaColoniaPagada: dto.decision === DecisionVeranoInput.COLONIA,
        },
        update: {
          decision: decisionDB,
          fechaDecision: this.clock.now(),
          motivoAdmin: `[Admin Override] ${dto.motivo}`,
        },
      });

      // Si es BAJA, cancelar inscripciones
      if (dto.decision === DecisionVeranoInput.BAJA) {
        await tx.inscripcionActividad.updateMany({
          where: { estudianteId: dto.estudianteId },
          data: { estado: 'CANCELADA' },
        });
      }

      // Recalcular monto de suscripción
      await this.recalcularMontoSuscripcion(tx, suscripcionFamiliar.id, anio);

      // Registrar en AuditLog para trazabilidad
      await tx.auditLog.create({
        data: {
          userId: adminId,
          userType: 'ADMIN',
          action: 'FORZAR_DECISION_VERANO',
          entityType: 'DecisionVeranoEstudiante',
          entityId: dto.estudianteId,
          description: `Admin forzó decisión ${dto.decision} para ${estudiante.nombre} ${estudiante.apellido}. Motivo: ${dto.motivo}`,
          category: 'data_modification',
          severity: 'warning',
          metadata: {
            decision: dto.decision,
            motivo: dto.motivo,
            anio,
            estudianteNombre: `${estudiante.nombre} ${estudiante.apellido}`,
          },
        },
      });
    });

    return {
      success: true,
      mensaje: `Decisión ${dto.decision} aplicada a ${estudiante.nombre} ${estudiante.apellido}. Motivo: ${dto.motivo}`,
    };
  }

  /**
   * Recalcula el monto mensual de la suscripción familiar
   *
   * Lógica de cobro COLONIA según spec:
   * - Período decisión (nov-dic) o diciembre: matrícula $40k
   * - Enero/Febrero: cuota $95k
   */
  private async recalcularMontoSuscripcion(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    suscripcionFamiliarId: string,
    anio: number,
  ): Promise<void> {
    const decisiones = await tx.decisionVeranoEstudiante.findMany({
      where: {
        suscripcionFamiliarId,
        anio,
      },
    });

    let montoTotal = 0;
    const mesActual = this.clock.currentMonth();

    // Determinar si estamos en período donde se cobra matrícula
    // (período de decisión nov-dic o diciembre)
    const esPeriodoMatricula = mesActual === 11 || mesActual === 12; // Nov o Dic

    for (const decision of decisiones) {
      switch (decision.decision) {
        case DecisionVerano.COLONIA:
          if (esPeriodoMatricula) {
            montoTotal += PRECIOS_VERANO.MATRICULA_COLONIA;
          } else {
            montoTotal += PRECIOS_VERANO.CUOTA_COLONIA;
          }
          break;

        case DecisionVerano.CONTINUIDAD:
          montoTotal += PRECIOS_VERANO.CUOTA_CONTINUIDAD;
          break;

        case DecisionVerano.PENDIENTE:
          break;
      }
    }

    const suscripcion = await tx.suscripcionFamiliar.findUnique({
      where: { id: suscripcionFamiliarId },
    });

    // Determinar nuevo estado de suscripción basado en decisiones
    let nuevoEstado = suscripcion?.estado;
    const todasContinuidad =
      decisiones.length > 0 &&
      decisiones.every((d) => d.decision === DecisionVerano.CONTINUIDAD);
    if (todasContinuidad) {
      nuevoEstado = EstadoSuscripcionFamiliar.CONTINUIDAD;
    }

    await tx.suscripcionFamiliar.update({
      where: { id: suscripcionFamiliarId },
      data: {
        montoMensual: montoTotal,
        montoOriginal: suscripcion?.montoOriginal ?? suscripcion?.montoMensual,
        ...(nuevoEstado !== suscripcion?.estado && { estado: nuevoEstado }),
      },
    });
  }
}
