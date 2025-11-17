import { Injectable } from '@nestjs/common';
import {
  PaymentQueryService,
  FindAllInscripcionesParams,
} from './payment-query.service';
import {
  PaymentCommandService,
  RegistrarPagoManualDto,
} from './payment-command.service';
import { PaymentWebhookService } from './payment-webhook.service';
import { PaymentStateMapperService } from './payment-state-mapper.service';
import { MercadoPagoWebhookDto } from '../dto/mercadopago-webhook.dto';
import { EstadoPago } from '../../domain/constants';

/**
 * Facade para gestión de pagos
 *
 * Este servicio actúa como punto de entrada único para el controller,
 * orquestando llamadas a los servicios especializados según el patrón CQRS.
 *
 * Responsabilidades:
 * - Delegar queries a PaymentQueryService
 * - Delegar commands a PaymentCommandService
 * - Delegar webhooks a PaymentWebhookService
 * - Exponer utilities de PaymentStateMapperService
 *
 * NO contiene lógica de negocio, solo orquesta.
 */
@Injectable()
export class PagosManagementFacadeService {
  constructor(
    private readonly queryService: PaymentQueryService,
    private readonly commandService: PaymentCommandService,
    private readonly webhookService: PaymentWebhookService,
    private readonly stateMapper: PaymentStateMapperService,
  ) {}

  // ==================== QUERIES ====================

  /**
   * Buscar inscripciones mensuales con filtros
   *
   * @param params - Parámetros de búsqueda y paginación
   * @returns Inscripciones paginadas
   */
  async findAllInscripciones(params: FindAllInscripcionesParams) {
    return this.queryService.findAllInscripciones(params);
  }

  /**
   * Obtener una inscripción mensual por ID
   *
   * @param id - ID de la inscripción
   * @returns Inscripción con datos relacionados
   */
  async findInscripcionById(id: string | number) {
    return this.queryService.findInscripcionById(id);
  }

  /**
   * Obtener membresías de un tutor
   *
   * @param tutorId - ID del tutor
   * @returns Lista de membresías
   */
  async findMembresiasDelTutor(tutorId: string) {
    return this.queryService.findMembresiasDelTutor(tutorId);
  }

  /**
   * Obtener membresía activa de un tutor
   *
   * @param tutorId - ID del tutor
   * @returns Membresía activa o null
   */
  async findMembresiaActiva(tutorId: string) {
    return this.queryService.findMembresiaActiva(tutorId);
  }

  /**
   * Verificar si estudiante tiene inscripción pendiente
   *
   * @param estudianteId - ID del estudiante
   * @param anio - Año del periodo
   * @param mes - Mes del periodo
   * @returns true si tiene inscripción pendiente
   */
  async tieneInscripcionPendiente(
    estudianteId: string,
    anio: number,
    mes: number,
  ) {
    return this.queryService.tieneInscripcionPendiente(
      estudianteId,
      anio,
      mes,
    );
  }

  /**
   * Obtener la configuración de precios actual
   *
   * @returns Configuración de precios
   */
  async obtenerConfiguracion() {
    return this.queryService.obtenerConfiguracion();
  }

  /**
   * Obtener historial de cambios de precios
   *
   * @param limit - Cantidad máxima de registros
   * @returns Historial de cambios
   */
  async obtenerHistorialCambios(limit?: number) {
    return this.queryService.obtenerHistorialCambios(limit);
  }

  /**
   * Obtener inscripciones pendientes del periodo actual
   *
   * @returns Inscripciones pendientes
   */
  async obtenerInscripcionesPendientes() {
    return this.queryService.obtenerInscripcionesPendientes();
  }

  /**
   * Obtener estudiantes con descuentos aplicados
   *
   * @returns Estudiantes con descuentos
   */
  async obtenerEstudiantesConDescuentos() {
    return this.queryService.obtenerEstudiantesConDescuentos();
  }

  /**
   * Buscar inscripción por periodo específico
   *
   * @param estudianteId - ID del estudiante
   * @param anio - Año del periodo
   * @param mes - Mes del periodo
   * @returns Inscripción del periodo o null
   */
  async findInscripcionPorPeriodo(
    estudianteId: string,
    anio: number,
    mes: number,
  ) {
    return this.queryService.findInscripcionPorPeriodo(
      estudianteId,
      anio,
      mes,
    );
  }

  // ==================== COMMANDS ====================

  /**
   * Registrar pago manual para un estudiante
   *
   * @param dto - Datos del pago manual
   * @returns Resumen del pago registrado
   */
  async registrarPagoManual(dto: RegistrarPagoManualDto) {
    return this.commandService.registrarPagoManual(dto);
  }

  /**
   * Actualizar estado de membresía
   *
   * @param membresiaId - ID de la membresía
   * @param estadoPago - Estado de pago a aplicar
   * @returns Membresía actualizada
   */
  async actualizarEstadoMembresia(membresiaId: string, estadoPago: EstadoPago) {
    return this.commandService.actualizarEstadoMembresia(
      membresiaId,
      estadoPago,
    );
  }

  /**
   * Actualizar estado de inscripción
   *
   * @param inscripcionId - ID de la inscripción
   * @param estadoPago - Estado de pago a aplicar
   * @returns Inscripción actualizada
   */
  async actualizarEstadoInscripcion(
    inscripcionId: string,
    estadoPago: EstadoPago,
  ) {
    return this.commandService.actualizarEstadoInscripcion(
      inscripcionId,
      estadoPago,
    );
  }

  // ==================== WEBHOOKS ====================

  /**
   * Procesar webhook de MercadoPago
   *
   * @param webhookData - Datos del webhook
   * @returns Resultado del procesamiento
   */
  async procesarWebhookMercadoPago(webhookData: MercadoPagoWebhookDto) {
    return this.webhookService.procesarWebhookMercadoPago(webhookData);
  }

  // ==================== UTILITIES ====================

  /**
   * Mapear estado de MercadoPago a estado interno
   *
   * @param estadoMP - Estado de MercadoPago
   * @returns Estado interno del sistema
   */
  mapearEstadoPago(estadoMP: string): EstadoPago {
    return this.stateMapper.mapearEstadoPago(estadoMP);
  }

  /**
   * Verificar si un pago fue exitoso
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si el pago fue exitoso
   */
  esPagoExitoso(estadoPago: EstadoPago): boolean {
    return this.stateMapper.esPagoExitoso(estadoPago);
  }

  /**
   * Verificar si un pago falló
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si el pago falló
   */
  esPagoFallido(estadoPago: EstadoPago): boolean {
    return this.stateMapper.esPagoFallido(estadoPago);
  }

  /**
   * Verificar si un pago permite reintentar
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si se puede reintentar
   */
  permiteReintentar(estadoPago: EstadoPago): boolean {
    return this.stateMapper.permiteReintentar(estadoPago);
  }
}
