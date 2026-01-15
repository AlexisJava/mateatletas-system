import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Query,
  Param,
  UseGuards,
  NotFoundException,
  Headers,
  Req,
  Logger,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ParseIdPipe } from '../../../common/pipes';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagosService } from '../services/pagos.service';
import { VerificacionMorosidadService } from '../../services/verificacion-morosidad.service';
import { PagosManagementFacadeService } from '../../services/pagos-management-facade.service';
import { WebhookPaymentQueueService } from '../../services/webhook-payment-queue.service';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';
import { CrearInscripcionMensualRequestDto } from '../dtos/crear-inscripcion-mensual-request.dto';
import { ObtenerMetricasDashboardRequestDto } from '../dtos/obtener-metricas-dashboard-request.dto';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles, Role } from '../../../auth/decorators/roles.decorator';
import { GetUser } from '../../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../../auth/interfaces';
import { MercadoPagoWebhookGuard } from '../../guards/mercadopago-webhook.guard';
import { Public } from '../../../auth/decorators/public.decorator';
import { PrometheusService } from '../../../observability/metrics';

/**
 * PagosController - Presentation Layer
 *
 * Endpoints REST para el módulo de pagos
 *
 * Responsabilidades:
 * - Definir rutas HTTP
 * - Validar entrada con DTOs (class-validator automático)
 * - Delegar lógica al Service
 * - Manejar respuestas HTTP
 * - Documentación Swagger
 */
@ApiTags('Pagos')
@Controller('pagos')
export class PagosController {
  private readonly logger = new Logger(PagosController.name);

  constructor(
    private readonly pagosService: PagosService,
    private readonly verificacionMorosidadService: VerificacionMorosidadService,
    private readonly pagosFacade: PagosManagementFacadeService,
    private readonly webhookQueueService: WebhookPaymentQueueService,
    private readonly metricsService: PrometheusService,
  ) {}

  /**
   * POST /pagos/calcular-precio
   * Calcula el precio de actividades según reglas de negocio
   */
  @Post('calcular-precio')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Calcular precio de actividades',
    description: `
      Calcula el precio total considerando:
      - Cantidad de estudiantes (hermanos)
      - Cantidad de actividades por estudiante
      - Descuentos aplicables (múltiples actividades, hermanos, AACREA)
      - Prioridades de descuentos (hermanos múltiple > hermanos básico > múltiples actividades > AACREA)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Cálculo exitoso con desglose completo',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos de entrada inválidos',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante, tutor o producto no encontrado',
  })
  async calcularPrecio(@Body() dto: CalcularPrecioRequestDto) {
    return await this.pagosService.calcularPrecio(dto);
  }

  /**
   * POST /pagos/configuracion/actualizar
   * Actualiza la configuración de precios (solo admins)
   */
  @Post('configuracion/actualizar')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Actualizar configuración de precios',
    description: `
      Actualiza los precios base y configuración del sistema.
      Automáticamente guarda historial de cambios para auditoría.

      IMPORTANTE: Solo administradores pueden ejecutar esta operación.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración actualizada exitosamente',
  })
  @ApiResponse({
    status: 400,
    description:
      'Datos de entrada inválidos (precios negativos, porcentajes fuera de rango, etc)',
  })
  @ApiResponse({
    status: 404,
    description: 'Configuración no encontrada',
  })
  @ApiResponse({
    status: 403,
    description: 'No autorizado (requiere rol de administrador)',
  })
  async actualizarConfiguracion(
    @Body() dto: ActualizarConfiguracionPreciosRequestDto,
  ) {
    return await this.pagosService.actualizarConfiguracionPrecios(dto);
  }

  /**
   * POST /pagos/inscripciones/crear
   * Crea inscripciones mensuales para estudiantes
   */
  @Post('inscripciones/crear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Crear inscripciones mensuales',
    description: `
      Crea inscripciones mensuales para estudiantes con cálculo automático de precios.

      Proceso:
      1. Calcula precios con descuentos aplicables
      2. Valida que no existan inscripciones duplicadas
      3. Crea inscripciones en estado Pendiente
      4. Retorna resumen completo

      Todas las inscripciones inician con estado "Pendiente".
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Inscripciones creadas exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos inválidos o inscripción duplicada',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante, tutor o producto no encontrado',
  })
  async crearInscripciones(@Body() dto: CrearInscripcionMensualRequestDto) {
    return await this.pagosService.crearInscripcionMensual(dto);
  }

  /**
   * GET /pagos/dashboard/metricas
   * Obtiene métricas agregadas para el dashboard
   */
  @Get('dashboard/metricas')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener métricas del dashboard',
    description: `
      Obtiene métricas agregadas para el dashboard de pagos:

      - Métricas generales del mes actual (ingresos, pendientes, inscripciones, tasa de cobro)
      - Comparación con el mes anterior (cambios porcentuales)
      - Evolución mensual de últimos 6 meses (para gráficos)
      - Distribución por estados de pago (Pagado, Pendiente, Vencido)

      Los parámetros son opcionales. Si no se envían, usa mes y año actual.
      Si se envía tutorId, filtra las métricas para ese tutor específicamente.
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Métricas obtenidas exitosamente',
  })
  @ApiResponse({
    status: 400,
    description: 'Parámetros inválidos (mes fuera de rango, año inválido)',
  })
  async obtenerMetricasDashboard(
    @Query() dto: ObtenerMetricasDashboardRequestDto,
  ) {
    return await this.pagosService.obtenerMetricasDashboard(dto);
  }

  /**
   * GET /pagos/configuracion
   * Obtiene la configuración de precios actual
   */
  @Get('configuracion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener configuración de precios actual',
    description: 'Retorna la configuración singleton de precios del sistema',
  })
  @ApiResponse({
    status: 200,
    description: 'Configuración obtenida exitosamente',
  })
  async obtenerConfiguracion() {
    return await this.pagosFacade.obtenerConfiguracion();
  }

  /**
   * GET /pagos/historial-cambios
   * Obtiene el historial de cambios de precios
   */
  @Get('historial-cambios')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener historial de cambios de precios',
    description:
      'Retorna los últimos cambios en la configuración de precios para auditoría',
  })
  @ApiResponse({
    status: 200,
    description: 'Historial obtenido exitosamente',
  })
  async obtenerHistorialCambios() {
    return await this.pagosFacade.obtenerHistorialCambios();
  }

  /**
   * GET /pagos/inscripciones/pendientes
   * Obtiene inscripciones pendientes con información de estudiantes
   */
  @Get('inscripciones/pendientes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener inscripciones pendientes',
    description:
      'Retorna inscripciones con estado Pendiente incluyendo datos del estudiante y producto',
  })
  @ApiResponse({
    status: 200,
    description: 'Inscripciones pendientes obtenidas exitosamente',
  })
  async obtenerInscripcionesPendientes() {
    return await this.pagosFacade.obtenerInscripcionesPendientes();
  }

  /**
   * GET /pagos/estudiantes-descuentos
   * Obtiene estudiantes con descuentos aplicados
   */
  @Get('estudiantes-descuentos')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Obtener estudiantes con descuentos',
    description: 'Retorna estudiantes agrupados con sus descuentos aplicados',
  })
  @ApiResponse({
    status: 200,
    description: 'Estudiantes con descuentos obtenidos exitosamente',
  })
  async obtenerEstudiantesConDescuentos() {
    return await this.pagosFacade.obtenerEstudiantesConDescuentos();
  }

  /**
   * POST /pagos/webhook
   * Webhook de MercadoPago para notificaciones de pago (ASYNC)
   *
   * IMPORTANTE:
   * - Este endpoint es llamado automáticamente por MercadoPago cuando hay cambios en pagos
   * - Está protegido con MercadoPagoWebhookGuard que valida la firma HMAC
   * - Encola el webhook para procesamiento async (respuesta rápida <100ms)
   * - NO requiere autenticación JWT (es un webhook externo)
   *
   * SPRINT 1 - MEJORAS:
   * - Async Processing: Encola en BullMQ, responde 200 OK inmediatamente
   * - Dead Letter Queue: Webhooks fallidos se guardan para reprocesamiento
   * - Secret Rotation: Soporta múltiples secrets durante rotación
   */
  @Public()
  @Post('webhook')
  @UseGuards(MercadoPagoWebhookGuard)
  @Throttle({ default: { limit: 300, ttl: 60000 } }) // 300 req/min por IP (más permisivo para MercadoPago)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de MercadoPago (Async)',
    description: `
      Recibe notificaciones de MercadoPago sobre cambios en pagos.

      Flujo ASYNC (Sprint 1):
      1. MercadoPago envía notificación cuando hay un cambio (pago aprobado, rechazado, etc.)
      2. Guard valida firma HMAC (soporta rotación de secrets)
      3. Webhook se encola en BullMQ para procesamiento en background
      4. Responde 200 OK inmediatamente (<100ms)
      5. Worker procesa el webhook async con reintentos automáticos
      6. Si falla 5 veces, se mueve a Dead Letter Queue para revisión manual

      Casos manejados:
      - payment.created, payment.updated → Procesa pago
      - Aprobado → Activa membresía/inscripción
      - Rechazado → Marca como fallido
      - Pendiente → Marca como pendiente

      Security:
      - Validación de firma HMAC con secret de MercadoPago
      - Soporta múltiples secrets para rotación segura
      - IP Whitelisting de MercadoPago
      - Solo acepta notificaciones auténticas
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook encolado exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'Firma HMAC inválida o webhook no autorizado',
  })
  @ApiResponse({
    status: 400,
    description: 'Datos del webhook inválidos',
  })
  async procesarWebhook(
    @Body() webhookData: MercadoPagoWebhookDto,
    @Headers('x-signature') _signature: string,
    @Headers('x-request-id') _requestId: string,
    @Req() req: Request,
  ) {
    const webhookType = webhookData.type;

    // Extraer IP del cliente para logging/debugging
    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      req.socket.remoteAddress ||
      'unknown';

    // Encolar webhook para procesamiento async
    const result = await this.webhookQueueService.enqueueWebhook(
      webhookData,
      clientIp,
    );

    if (!result.success) {
      // Registrar métrica de webhook rechazado por error de encolado
      this.metricsService.recordWebhookReceived(webhookType, 'rejected');

      // Si falla el encolado, intentar procesar sincrónicamente como fallback
      this.logger.warn(`⚠️ Fallback a procesamiento síncrono: ${result.error}`);
      return await this.pagosFacade.procesarWebhookMercadoPago(webhookData);
    }

    // Registrar métrica de webhook encolado exitosamente
    this.metricsService.recordWebhookReceived(webhookType, 'queued');

    // Responder inmediatamente (MercadoPago no reintentará)
    this.logger.log(
      `✅ Webhook encolado: correlationId=${result.correlationId}, ` +
        `jobId=${result.jobId}, paymentId=${webhookData.data.id}`,
    );

    return {
      received: true,
      action: 'queued',
      correlationId: result.correlationId,
      jobId: result.jobId,
    };
  }

  /**
   * GET /pagos/morosidad/tutor/:tutorId
   * Verifica el estado de morosidad de un tutor
   */
  @Get('morosidad/tutor/:tutorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TUTOR)
  @ApiOperation({ summary: 'Verificar morosidad de un tutor' })
  @ApiResponse({ status: 200, description: 'Estado de morosidad obtenido' })
  async verificarMorosidadTutor(
    @Param('tutorId', ParseIdPipe) tutorId: string,
    @GetUser() user: AuthUser,
  ) {
    // Si es tutor, solo puede ver su propia información
    if (user.role === Role.TUTOR && user.id !== tutorId) {
      throw new NotFoundException(
        'No tienes permiso para ver esta información',
      );
    }

    return await this.verificacionMorosidadService.verificarMorosidadTutor(
      tutorId,
    );
  }

  /**
   * GET /pagos/morosidad/estudiantes
   * Obtiene todos los estudiantes morosos (solo admin)
   */
  @Get('morosidad/estudiantes')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Obtener lista de estudiantes morosos' })
  @ApiResponse({ status: 200, description: 'Lista de estudiantes morosos' })
  async obtenerEstudiantesMorosos() {
    return await this.verificacionMorosidadService.obtenerEstudiantesMorosos();
  }

  /**
   * GET /pagos/morosidad/estudiante/:estudianteId
   * Verifica si un estudiante puede acceder a la plataforma
   */
  @Get('morosidad/estudiante/:estudianteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TUTOR)
  @ApiOperation({
    summary: 'Verificar acceso de estudiante según estado de pagos',
  })
  @ApiResponse({ status: 200, description: 'Estado de acceso del estudiante' })
  async verificarAccesoEstudiante(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    return await this.verificacionMorosidadService.verificarAccesoEstudiante(
      estudianteId,
    );
  }

  /**
   * POST /pagos/registrar-pago-manual/:estudianteId
   * Registra un pago manual para un estudiante
   * Detecta automáticamente el monto adeudado del periodo actual y lo marca como pagado
   */
  @Post('registrar-pago-manual/:estudianteId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.TUTOR)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Registrar pago manual de un estudiante',
    description: `
      Registra un pago manual para un estudiante del periodo actual.
      Automáticamente detecta el monto adeudado y lo marca como pagado.

      Proceso:
      1. Busca inscripciones mensuales pendientes del estudiante en el periodo actual
      2. Calcula el total adeudado
      3. Registra el pago con método "Manual"
      4. Marca las inscripciones como "Pagado"
      5. Retorna el resumen del pago registrado
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Pago registrado exitosamente',
  })
  @ApiResponse({
    status: 404,
    description: 'Estudiante no encontrado o sin inscripciones pendientes',
  })
  async registrarPagoManual(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosFacade.registrarPagoManual({
      estudianteId,
      tutorId: user.id,
    });
  }
}
