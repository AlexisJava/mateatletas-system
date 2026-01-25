/**
 * ============================================================================
 * VERANO COMMAND SERVICE - Operaciones de escritura para Verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md
 *
 * Responsabilidades:
 * - POST /tutor/verano/decidir - Tomar decisión de verano
 * - POST /tutor/verano/solicitar-colonia - Cambio tardío a Colonia
 * - POST /tutor/verano/cancelar-colonia - Cancelar Colonia (pierde matrícula)
 */

import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { ClockService } from '../../core/services/clock.service';
import { VeranoQueryService } from './verano-query.service';
import {
  DecidirVeranoDto,
  DecidirVeranoResponseDto,
  SolicitarColoniaDto,
  SolicitarColoniaResponseDto,
  CancelarColoniaDto,
  CancelarColoniaResponseDto,
  DecisionVeranoInput,
} from '../dto/verano.dto';
import { DecisionVerano, EstadoSuscripcionFamiliar } from '@prisma/client';

// ============================================================================
// CONSTANTES DE PRECIOS (según spec 1.4)
// ============================================================================

export const PRECIOS_VERANO = {
  MATRICULA_COLONIA: 40000, // Diciembre - NO reembolsable
  CUOTA_COLONIA: 95000, // Enero y Febrero
  CUOTA_CONTINUIDAD: 20000, // Diciembre, Enero, Febrero
};

// ============================================================================
// SERVICE
// ============================================================================

@Injectable()
export class VeranoCommandService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly clock: ClockService,
    private readonly veranoQuery: VeranoQueryService,
  ) {}

  /**
   * Procesa la decisión de verano de un tutor para un estudiante
   *
   * Spec 2.1 Timeline:
   * - Respondió "Colonia" → Estado: ACTIVA, Cobra: $40.000 (matrícula)
   * - Respondió "Mantener cupo" → Estado: CONTINUIDAD, Cobra: $20.000
   * - Respondió "Baja" → Estado: BAJA, Cobra: $0, pierde cupo
   */
  async decidir(
    tutorId: string,
    dto: DecidirVeranoDto,
  ): Promise<DecidirVeranoResponseDto> {
    const fechaActual = this.clock.now();
    const anioActual = fechaActual.getFullYear();

    // 1. Verificar período de decisión
    if (!this.veranoQuery.estaDentroPeriodoDecision(fechaActual)) {
      throw new BadRequestException(
        'No estamos dentro del período de decisión de verano (15 nov - 5 dic)',
      );
    }

    // 2. Verificar que el estudiante existe (404 si no existe)
    const estudianteExiste = await this.prisma.estudiante.findUnique({
      where: { id: dto.estudianteId },
      select: { id: true },
    });
    if (!estudianteExiste) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // 3. Verificar que el estudiante pertenece al tutor (403 si no pertenece)
    const perteneceATutor =
      await this.veranoQuery.verificarEstudiantePerteneceATutor(
        dto.estudianteId,
        tutorId,
      );
    if (!perteneceATutor) {
      throw new ForbiddenException(
        'No tienes permiso para decidir por este estudiante',
      );
    }

    // 3. Obtener suscripción familiar
    const suscripcionFamiliar =
      await this.veranoQuery.getSuscripcionFamiliar(tutorId);
    if (!suscripcionFamiliar) {
      throw new NotFoundException('No tienes una suscripción familiar activa');
    }

    // 4. Procesar según decisión
    let montoProximoCobro = 0;
    let decisionDB: DecisionVerano;
    let mensaje: string;

    switch (dto.decision) {
      case DecisionVeranoInput.COLONIA:
        decisionDB = DecisionVerano.COLONIA;
        montoProximoCobro = PRECIOS_VERANO.MATRICULA_COLONIA;
        mensaje = `Decisión registrada: Colonia de Verano. Matrícula: $${PRECIOS_VERANO.MATRICULA_COLONIA.toLocaleString()}`;
        break;

      case DecisionVeranoInput.CONTINUIDAD:
        decisionDB = DecisionVerano.CONTINUIDAD;
        montoProximoCobro = PRECIOS_VERANO.CUOTA_CONTINUIDAD;
        mensaje = `Decisión registrada: Continuidad. Cuota mensual: $${PRECIOS_VERANO.CUOTA_CONTINUIDAD.toLocaleString()}`;
        break;

      case DecisionVeranoInput.BAJA:
        // BAJA no existe en DecisionVerano, se maneja cancelando inscripción
        decisionDB = DecisionVerano.PENDIENTE; // Temporal, se cancelará la inscripción
        montoProximoCobro = 0;
        mensaje =
          'Decisión registrada: Baja. Tu suscripción será cancelada y perderás el cupo.';
        break;

      default:
        throw new BadRequestException('Decisión inválida');
    }

    // 5. Ejecutar en transacción
    await this.prisma.$transaction(async (tx) => {
      // Crear o actualizar decisión de verano
      await tx.decisionVeranoEstudiante.upsert({
        where: {
          estudianteId_anio: {
            estudianteId: dto.estudianteId,
            anio: anioActual,
          },
        },
        create: {
          estudianteId: dto.estudianteId,
          suscripcionFamiliarId: suscripcionFamiliar.id,
          anio: anioActual,
          decision: decisionDB,
          fechaDecision: this.clock.now(),
          matriculaColoniaPagada: dto.decision === DecisionVeranoInput.COLONIA,
        },
        update: {
          decision: decisionDB,
          fechaDecision: this.clock.now(),
          matriculaColoniaPagada: dto.decision === DecisionVeranoInput.COLONIA,
        },
      });

      // Si eligió BAJA, cancelar inscripciones
      if (dto.decision === DecisionVeranoInput.BAJA) {
        await tx.inscripcionActividad.updateMany({
          where: { estudianteId: dto.estudianteId },
          data: { estado: 'CANCELADA' },
        });
      }

      // Recalcular monto total de la suscripción familiar
      await this.recalcularMontoSuscripcion(
        tx,
        suscripcionFamiliar.id,
        anioActual,
      );
    });

    return {
      success: true,
      mensaje,
      montoProximoCobro,
    };
  }

  /**
   * Solicitar cambio tardío de CONTINUIDAD a COLONIA
   *
   * Spec 3.3:
   * - SI hay cupo disponible → Se aprueba, pasa a ACTIVA, paga $95k desde ese mes
   * - SI NO hay cupo → Se rechaza, sigue en CONTINUIDAD
   * - Cupo se verifica por grupo de Colonia, no total
   */
  async solicitarColonia(
    tutorId: string,
    dto: SolicitarColoniaDto,
  ): Promise<SolicitarColoniaResponseDto> {
    const anioActual = this.clock.currentYear();

    // 1. Verificar que el estudiante pertenece al tutor
    const perteneceATutor =
      await this.veranoQuery.verificarEstudiantePerteneceATutor(
        dto.estudianteId,
        tutorId,
      );
    if (!perteneceATutor) {
      throw new ForbiddenException('No tienes permiso para este estudiante');
    }

    // 2. Verificar decisión actual del estudiante
    const decisionActual = await this.veranoQuery.getDecisionVeranoEstudiante(
      dto.estudianteId,
      anioActual,
    );

    if (decisionActual?.decision === DecisionVerano.COLONIA) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en Colonia',
      );
    }

    // 3. Buscar grupo con cupo disponible
    const gruposConCupo =
      await this.veranoQuery.getGruposColoniaConCupos(anioActual);

    let grupoAsignado: { id: string; nombre: string } | null = null;

    if (dto.grupoPreferidoId) {
      // Intentar asignar al grupo preferido
      const grupoPreferido = gruposConCupo.find(
        (g) => g.id === dto.grupoPreferidoId,
      );
      if (grupoPreferido) {
        grupoAsignado = {
          id: grupoPreferido.id,
          nombre: grupoPreferido.nombre,
        };
      }
    } else {
      // Asignar al primer grupo con cupo
      const primerGrupo = gruposConCupo[0];
      if (primerGrupo) {
        grupoAsignado = {
          id: primerGrupo.id,
          nombre: primerGrupo.nombre,
        };
      }
    }

    if (!grupoAsignado) {
      return {
        success: false,
        mensaje: 'Sin cupo disponible en ningún grupo de Colonia',
      };
    }

    // 4. Obtener suscripción familiar
    const suscripcionFamiliar =
      await this.veranoQuery.getSuscripcionFamiliar(tutorId);
    if (!suscripcionFamiliar) {
      throw new NotFoundException('No tienes una suscripción familiar activa');
    }

    // 5. Actualizar decisión y asignar grupo
    await this.prisma.$transaction(async (tx) => {
      await tx.decisionVeranoEstudiante.upsert({
        where: {
          estudianteId_anio: {
            estudianteId: dto.estudianteId,
            anio: anioActual,
          },
        },
        create: {
          estudianteId: dto.estudianteId,
          suscripcionFamiliarId: suscripcionFamiliar.id,
          anio: anioActual,
          decision: DecisionVerano.COLONIA,
          fechaDecision: this.clock.now(),
          claseGrupoColoniaId: grupoAsignado.id,
          // No cobra matrícula en cambio tardío (ya pasó diciembre)
          matriculaColoniaPagada: false,
        },
        update: {
          decision: DecisionVerano.COLONIA,
          fechaDecision: this.clock.now(),
          claseGrupoColoniaId: grupoAsignado.id,
        },
      });

      // Recalcular monto
      await this.recalcularMontoSuscripcion(
        tx,
        suscripcionFamiliar.id,
        anioActual,
      );
    });

    return {
      success: true,
      mensaje: `Aprobado. Asignado al grupo: ${grupoAsignado.nombre}`,
      cupoAsignado: grupoAsignado.id,
    };
  }

  /**
   * Cancelar Colonia y pasar a CONTINUIDAD
   *
   * Spec 3.3:
   * - Se puede hacer en cualquier momento
   * - PIERDE la matrícula de $40k (no hay devolución)
   * - Empieza a pagar $20k/mes desde el mes siguiente
   * - Mantiene cupo para marzo
   */
  async cancelarColonia(
    tutorId: string,
    dto: CancelarColoniaDto,
  ): Promise<CancelarColoniaResponseDto> {
    const anioActual = this.clock.currentYear();

    // 1. Verificar confirmación
    if (!dto.confirmaPerderMatricula) {
      throw new BadRequestException(
        'Debes confirmar que aceptas perder la matrícula de $40.000 (no reembolsable)',
      );
    }

    // 2. Verificar que el estudiante pertenece al tutor
    const perteneceATutor =
      await this.veranoQuery.verificarEstudiantePerteneceATutor(
        dto.estudianteId,
        tutorId,
      );
    if (!perteneceATutor) {
      throw new ForbiddenException('No tienes permiso para este estudiante');
    }

    // 3. Obtener suscripción familiar
    const suscripcionFamiliar =
      await this.veranoQuery.getSuscripcionFamiliar(tutorId);
    if (!suscripcionFamiliar) {
      throw new NotFoundException('No tienes una suscripción familiar activa');
    }

    // 4. Actualizar decisión a CONTINUIDAD
    await this.prisma.$transaction(async (tx) => {
      await tx.decisionVeranoEstudiante.upsert({
        where: {
          estudianteId_anio: {
            estudianteId: dto.estudianteId,
            anio: anioActual,
          },
        },
        create: {
          estudianteId: dto.estudianteId,
          suscripcionFamiliarId: suscripcionFamiliar.id,
          anio: anioActual,
          decision: DecisionVerano.CONTINUIDAD,
          fechaDecision: this.clock.now(),
          // Matrícula pagada pero no reembolsable
          matriculaColoniaPagada: true,
        },
        update: {
          decision: DecisionVerano.CONTINUIDAD,
          fechaDecision: this.clock.now(),
          claseGrupoColoniaId: null, // Libera el cupo
        },
      });

      // Recalcular monto
      await this.recalcularMontoSuscripcion(
        tx,
        suscripcionFamiliar.id,
        anioActual,
      );
    });

    return {
      success: true,
      mensaje: `Matrícula no reembolsable. Ahora pagás $${PRECIOS_VERANO.CUOTA_CONTINUIDAD.toLocaleString()}/mes`,
    };
  }

  /**
   * Recalcula el monto mensual de la suscripción familiar
   * basándose en las decisiones de verano de cada estudiante
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
    // Obtener todas las decisiones de verano de esta familia
    const decisiones = await tx.decisionVeranoEstudiante.findMany({
      where: {
        suscripcionFamiliarId,
        anio,
      },
    });

    let montoTotal = 0;
    const mesActual = this.clock.currentMonth(); // 1-12
    const fechaActual = this.clock.now();

    // Determinar si estamos en período donde se cobra matrícula
    // (período de decisión nov-dic o diciembre)
    const esPeridoMatricula =
      this.veranoQuery.estaDentroPeriodoDecision(fechaActual) ||
      mesActual === 12;

    for (const decision of decisiones) {
      switch (decision.decision) {
        case DecisionVerano.COLONIA:
          // Período decisión o diciembre: matrícula $40k, después: cuota $95k
          if (esPeridoMatricula) {
            montoTotal += PRECIOS_VERANO.MATRICULA_COLONIA;
          } else {
            montoTotal += PRECIOS_VERANO.CUOTA_COLONIA;
          }
          break;

        case DecisionVerano.CONTINUIDAD:
          montoTotal += PRECIOS_VERANO.CUOTA_CONTINUIDAD;
          break;

        case DecisionVerano.PENDIENTE:
          // No cobra hasta que decida
          break;
      }
    }

    // Guardar monto original si no existe (para restaurar en marzo)
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
        // Guardar monto original solo la primera vez
        montoOriginal: suscripcion?.montoOriginal ?? suscripcion?.montoMensual,
        // Actualizar estado si corresponde
        ...(nuevoEstado !== suscripcion?.estado && { estado: nuevoEstado }),
      },
    });
  }
}
