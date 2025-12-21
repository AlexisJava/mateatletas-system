import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EstadoPago } from '../../domain/constants';
import { PaymentStateMapperService } from './payment-state-mapper.service';
import { EstadoPago as EstadoPagoPrisma } from '@prisma/client';

/**
 * DTO para registrar pago manual
 */
export interface RegistrarPagoManualDto {
  estudianteId: string;
  tutorId: string;
  monto?: number;
  metodoPago?: string;
  comprobanteUrl?: string;
  notas?: string;
}

/**
 * Servicio de comandos de pagos (solo escrituras)
 *
 * Responsabilidades:
 * - Registrar pagos manuales
 * - Actualizar estados de inscripciones
 * - Emitir eventos de dominio
 *
 * Este servicio MODIFICA datos pero NO consulta (CQRS - Command side)
 */
@Injectable()
export class PaymentCommandService {
  private readonly logger = new Logger(PaymentCommandService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stateMapper: PaymentStateMapperService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Registra un pago manual para un estudiante
   *
   * Detecta automáticamente inscripciones pendientes del periodo actual
   * y las marca como pagadas.
   *
   * @param dto - Datos del pago manual
   * @returns Resumen del pago registrado
   * @throws BadRequestException si no hay inscripciones pendientes
   */
  async registrarPagoManual(dto: RegistrarPagoManualDto) {
    const {
      estudianteId,
      tutorId,
      metodoPago = 'Manual',
      comprobanteUrl,
      notas,
    } = dto;

    this.logger.log(
      `💵 Registrando pago manual para estudiante: ${estudianteId}`,
    );

    // Obtener periodo actual
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Buscar inscripciones pendientes del estudiante en el periodo actual
    const inscripcionesPendientes =
      await this.prisma.inscripcionMensual.findMany({
        where: {
          estudiante_id: estudianteId,
          tutor_id: tutorId,
          periodo,
          estado_pago: EstadoPagoPrisma.Pendiente,
        },
        include: {
          estudiante: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      });

    const primeraInscripcion = inscripcionesPendientes[0];
    if (!primeraInscripcion) {
      this.logger.warn(
        `⚠️ No se encontraron inscripciones pendientes para estudiante ${estudianteId} en periodo ${periodo}`,
      );
      throw new BadRequestException(
        'No se encontraron inscripciones pendientes para este estudiante',
      );
    }

    // Calcular total adeudado
    const totalAdeudado = inscripcionesPendientes.reduce(
      (sum, insc) => sum + Number(insc.precio_final),
      0,
    );

    // Marcar todas las inscripciones como pagadas
    const fechaPago = new Date();
    const observaciones =
      notas ||
      `Pago registrado manualmente el ${fechaPago.toLocaleDateString('es-AR')}`;

    await this.prisma.inscripcionMensual.updateMany({
      where: {
        estudiante_id: estudianteId,
        tutor_id: tutorId,
        periodo,
        estado_pago: EstadoPagoPrisma.Pendiente,
      },
      data: {
        estado_pago: EstadoPagoPrisma.Pagado,
        fecha_pago: fechaPago,
        metodo_pago: metodoPago,
        comprobante_url: comprobanteUrl,
        observaciones,
      },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit('pago.registrado_manual', {
      estudianteId,
      tutorId,
      periodo,
      cantidadInscripciones: inscripcionesPendientes.length,
      montoTotal: totalAdeudado,
      metodoPago,
      fechaPago,
    });

    this.logger.log(
      `✅ Pago manual registrado: ${inscripcionesPendientes.length} inscripciones - Total: $${totalAdeudado}`,
    );

    return {
      success: true,
      estudianteNombre: `${primeraInscripcion.estudiante.nombre} ${primeraInscripcion.estudiante.apellido}`,
      periodo,
      cantidadInscripciones: inscripcionesPendientes.length,
      montoTotal: totalAdeudado,
      fechaPago,
      metodoPago,
    };
  }

  /**
   * Actualiza el estado de una inscripción mensual según el estado de pago
   *
   * @param inscripcionId - ID de la inscripción
   * @param estadoPago - Estado de pago a aplicar
   * @returns Inscripción actualizada
   */
  async actualizarEstadoInscripcion(
    inscripcionId: string,
    estadoPago: EstadoPago,
  ) {
    const estadoInscripcion =
      this.stateMapper.mapearEstadoInscripcion(estadoPago);

    const updated = await this.prisma.inscripcionMensual.update({
      where: { id: inscripcionId },
      data: {
        estado_pago: estadoInscripcion,
        fecha_pago: this.stateMapper.esPagoExitoso(estadoPago)
          ? new Date()
          : null,
      },
    });

    // Emitir evento de dominio
    this.eventEmitter.emit('inscripcion.estado_actualizado', {
      inscripcionId,
      estadoPago,
      estadoInscripcion,
      fechaActualizacion: new Date(),
    });

    this.logger.log(
      `✅ Inscripción ${inscripcionId} actualizada a estado: ${estadoInscripcion}`,
    );

    return updated;
  }
}
