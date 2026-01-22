import { Injectable, Logger } from '@nestjs/common';
import { Decimal } from 'decimal.js';
import { CalcularPrecioUseCase } from '../../application/use-cases/calcular-precio.use-case';
import { ActualizarConfiguracionPreciosUseCase } from '../../application/use-cases/actualizar-configuracion-precios.use-case';
import { CrearInscripcionMensualUseCase } from '../../application/use-cases/crear-inscripcion-mensual.use-case';
import { ObtenerMetricasDashboardUseCase } from '../../application/use-cases/obtener-metricas-dashboard.use-case';
import { ConfiguracionPreciosRepository } from '../../infrastructure/repositories/configuracion-precios.repository';
import { InscripcionMensualRepository } from '../../infrastructure/repositories/inscripcion-mensual.repository';
import { MercadoPagoService } from '../../mercadopago.service';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  EstadoPago as EstadoPagoMP,
  mapearEstadoMercadoPago,
} from '../../../domain/constants';
import { EstadoPago } from '../../domain/types/pagos.types';
import {
  CalcularPrecioInputDTO,
  CalcularPrecioOutputDTO,
} from '../../application/dtos/calcular-precio.dto';
import {
  ActualizarConfiguracionPreciosInputDTO,
  ActualizarConfiguracionPreciosOutputDTO,
} from '../../application/dtos/actualizar-configuracion-precios.dto';
import {
  CrearInscripcionMensualInputDTO,
  CrearInscripcionMensualOutputDTO,
} from '../../application/dtos/crear-inscripcion-mensual.dto';
import {
  ObtenerMetricasDashboardInputDTO,
  ObtenerMetricasDashboardOutputDTO,
} from '../../application/dtos/obtener-metricas-dashboard.dto';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';
import { CrearInscripcionMensualRequestDto } from '../dtos/crear-inscripcion-mensual-request.dto';
import { ObtenerMetricasDashboardRequestDto } from '../dtos/obtener-metricas-dashboard-request.dto';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';

/**
 * PagosService - Presentation Layer
 *
 * Responsabilidades:
 * - Adaptador entre HTTP DTOs y Application DTOs
 * - Conversión de tipos (number → Decimal)
 * - Inyección de dependencias de Use Cases
 * - Orquestación de llamadas a Use Cases
 *
 * NO contiene lógica de negocio (eso está en Use Cases)
 */
@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);

  constructor(
    private readonly calcularPrecioUseCase: CalcularPrecioUseCase,
    private readonly actualizarConfiguracionUseCase: ActualizarConfiguracionPreciosUseCase,
    private readonly crearInscripcionUseCase: CrearInscripcionMensualUseCase,
    private readonly obtenerMetricasUseCase: ObtenerMetricasDashboardUseCase,
    private readonly configuracionRepo: ConfiguracionPreciosRepository,
    private readonly inscripcionRepo: InscripcionMensualRepository,
    private readonly mercadoPagoService: MercadoPagoService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Calcula el precio de actividades
   * Convierte DTO HTTP → DTO Application → Use Case
   */
  async calcularPrecio(
    requestDto: CalcularPrecioRequestDto,
  ): Promise<CalcularPrecioOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: CalcularPrecioInputDTO = {
      tutorId: requestDto.tutorId,
      estudiantesIds: requestDto.estudiantesIds,
      productosIdsPorEstudiante: requestDto.productosIdsPorEstudiante,
      tieneAACREA: requestDto.tieneAACREA,
    };

    // Ejecutar use case
    return await this.calcularPrecioUseCase.execute(applicationDto);
  }

  /**
   * Actualiza la configuración de precios
   * Convierte numbers a Decimals antes de llamar al Use Case
   * Sistema STEAM 2026
   */
  async actualizarConfiguracionPrecios(
    requestDto: ActualizarConfiguracionPreciosRequestDto,
  ): Promise<ActualizarConfiguracionPreciosOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    // IMPORTANTE: Convertir numbers a Decimals
    const applicationDto: ActualizarConfiguracionPreciosInputDTO = {
      adminId: requestDto.adminId,
      // Precios por Tier STEAM (Sistema 2026)
      precioSteamLibros: requestDto.precioSteamLibros
        ? new Decimal(requestDto.precioSteamLibros)
        : undefined,
      precioSteamAsincronico: requestDto.precioSteamAsincronico
        ? new Decimal(requestDto.precioSteamAsincronico)
        : undefined,
      precioSteamSincronico: requestDto.precioSteamSincronico
        ? new Decimal(requestDto.precioSteamSincronico)
        : undefined,
      // Descuento familiar simplificado
      descuentoSegundoHermano: requestDto.descuentoSegundoHermano
        ? new Decimal(requestDto.descuentoSegundoHermano)
        : undefined,
      // Configuración de notificaciones
      diaVencimiento: requestDto.diaVencimiento,
      diasAntesRecordatorio: requestDto.diasAntesRecordatorio,
      notificacionesActivas: requestDto.notificacionesActivas,
      motivoCambio: requestDto.motivoCambio,
    };

    // Ejecutar use case
    return await this.actualizarConfiguracionUseCase.execute(applicationDto);
  }

  /**
   * Crea inscripciones mensuales
   * Convierte DTO HTTP a DTO Application
   */
  async crearInscripcionMensual(
    requestDto: CrearInscripcionMensualRequestDto,
  ): Promise<CrearInscripcionMensualOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: CrearInscripcionMensualInputDTO = {
      tutorId: requestDto.tutorId,
      estudiantesIds: requestDto.estudiantesIds,
      productosIdsPorEstudiante: requestDto.productosIdsPorEstudiante,
      anio: requestDto.anio,
      mes: requestDto.mes,
      tieneAACREA: requestDto.tieneAACREA,
    };

    // Ejecutar use case
    return await this.crearInscripcionUseCase.execute(applicationDto);
  }

  /**
   * Obtiene métricas del dashboard
   * Convierte DTO HTTP a DTO Application
   */
  async obtenerMetricasDashboard(
    requestDto: ObtenerMetricasDashboardRequestDto,
  ): Promise<ObtenerMetricasDashboardOutputDTO> {
    // Convertir DTO HTTP a DTO Application
    const applicationDto: ObtenerMetricasDashboardInputDTO = {
      anio: requestDto.anio,
      mes: requestDto.mes,
      tutorId: requestDto.tutorId,
    };

    // Ejecutar use case
    return await this.obtenerMetricasUseCase.execute(applicationDto);
  }

  /**
   * Obtiene la configuración de precios actual
   */
  async obtenerConfiguracion() {
    const config = await this.configuracionRepo.obtenerConfiguracion();
    return config;
  }

  /**
   * Obtiene el historial de cambios de precios
   */
  async obtenerHistorialCambios() {
    const historial = await this.configuracionRepo.obtenerHistorialCambios(50);
    return historial;
  }

  /**
   * Obtiene inscripciones pendientes con información de estudiantes
   */
  async obtenerInscripcionesPendientes() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const inscripciones =
      await this.inscripcionRepo.obtenerInscripcionesPorPeriodo(periodo);

    // Filtrar solo pendientes
    return inscripciones.filter((i) => i.estadoPago === EstadoPago.Pendiente);
  }

  /**
   * Obtiene estudiantes con descuentos aplicados
   */
  async obtenerEstudiantesConDescuentos() {
    const now = new Date();
    const periodo = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return await this.inscripcionRepo.obtenerEstudiantesConDescuentos(periodo);
  }

  /**
   * Procesa webhooks de MercadoPago
   *
   * Flujo:
   * 1. Valida que sea notificación de tipo "payment"
   * 2. Consulta detalles del pago a MercadoPago API
   * 3. Parsea externalReference para identificar el tipo
   * 4. Actualiza estado en DB según resultado del pago
   *
   * External Reference Format:
   * - Inscripción: "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
   *
   * Estados de pago MercadoPago → Estados del sistema:
   * - approved → Pagado
   * - rejected, cancelled → Mantiene Pendiente (para reintentar)
   * - pending, in_process, in_mediation → Mantiene Pendiente
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    this.logger.log(
      `📨 Webhook recibido: ${webhookData.type} - ${webhookData.action}`,
    );

    // Solo procesar notificaciones de tipo "payment"
    if (webhookData.type !== 'payment') {
      this.logger.log(`⏭️ Ignorando webhook de tipo: ${webhookData.type}`);
      return { message: 'Webhook type not handled' };
    }

    const paymentId = webhookData.data.id;
    this.logger.log(`💳 Procesando pago ID: ${paymentId}`);

    try {
      // Consultar detalles del pago a MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log(
        `💰 Pago consultado - Estado: ${payment.status} - Ref Externa: ${payment.externalReference}`,
      );

      // Parsear externalReference para identificar el tipo
      const externalRef = payment.externalReference;

      if (!externalRef) {
        this.logger.warn('⚠️ Pago sin externalReference - Ignorando');
        return { message: 'Payment without externalReference' };
      }

      // Procesar solo inscripciones
      if (externalRef.startsWith('inscripcion-')) {
        if (!payment.id || !payment.status) {
          this.logger.warn('⚠️ Pago sin id o status - Ignorando');
          return { message: 'Payment without id or status' };
        }
        return await this.procesarPagoInscripcion({
          externalReference: externalRef,
          id: payment.id,
          status: payment.status,
        });
      } else {
        this.logger.warn(
          `⚠️ Formato de externalReference desconocido: ${externalRef}`,
        );
        return { message: 'Unknown externalReference format' };
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `❌ Error procesando webhook: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Procesa pago de inscripción a curso
   * externalReference format: "inscripcion-{inscripcionId}-estudiante-{estudianteId}-producto-{productoId}"
   */
  private async procesarPagoInscripcion(payment: {
    externalReference: string;
    id: string;
    status: string;
  }) {
    const externalRef = payment.externalReference;
    const parts = externalRef.split('-');
    const inscripcionId = parts[1]; // "inscripcion-{ID}-estudiante-..."

    this.logger.log(`📚 Procesando pago de inscripción ID: ${inscripcionId}`);

    // Mapear estado de MercadoPago a estado de pago
    const estadoPago = mapearEstadoMercadoPago(payment.status);

    // Convertir EstadoPago a estado de inscripción
    let nuevoEstado: 'Pagado' | 'Pendiente' = 'Pendiente';

    switch (estadoPago) {
      case EstadoPagoMP.PAGADO:
        nuevoEstado = 'Pagado';
        break;
      case EstadoPagoMP.CANCELADO:
      case EstadoPagoMP.RECHAZADO:
        nuevoEstado = 'Pendiente'; // Permitir reintentar
        break;
      default:
        nuevoEstado = 'Pendiente';
        break;
    }

    // Actualizar inscripción mensual en DB
    await this.prisma.inscripcionMensual.update({
      where: { id: inscripcionId },
      data: {
        estadoPago: nuevoEstado,
      },
    });

    this.logger.log(
      `✅ Inscripción ${inscripcionId} actualizada a estado: ${nuevoEstado}`,
    );

    return {
      message: 'Webhook processed successfully',
      type: 'inscripcion',
      inscripcionId,
      nuevoEstado,
      paymentStatus: payment.status,
    };
  }

  /**
   * Registra un pago manual para un estudiante
   * Detecta automáticamente inscripciones pendientes del periodo actual y las marca como pagadas
   */
  async registrarPagoManual(estudianteId: string, tutorId: string) {
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
          estudianteId: estudianteId,
          tutorId: tutorId,
          periodo,
          estadoPago: 'Pendiente',
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
      throw new Error(
        'No se encontraron inscripciones pendientes para este estudiante',
      );
    }

    // Calcular total adeudado
    const totalAdeudado = inscripcionesPendientes.reduce(
      (sum, insc) => sum + Number(insc.precioFinal),
      0,
    );

    // Marcar todas las inscripciones como pagadas
    const fechaPago = new Date();
    await this.prisma.inscripcionMensual.updateMany({
      where: {
        estudianteId: estudianteId,
        tutorId: tutorId,
        periodo,
        estadoPago: 'Pendiente',
      },
      data: {
        estadoPago: 'Pagado',
        fechaPago: fechaPago,
        metodoPago: 'Manual',
        observaciones: `Pago registrado manualmente el ${fechaPago.toLocaleDateString('es-AR')}`,
      },
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
      metodoPago: 'Manual',
    };
  }
}
