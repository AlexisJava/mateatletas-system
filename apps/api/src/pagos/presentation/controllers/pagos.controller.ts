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
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagosService } from '../services/pagos.service';
import { PagosTutorService } from '../services/pagos-tutor.service';
import { VerificacionMorosidadService } from '../../services/verificacion-morosidad.service';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';
import { CrearInscripcionMensualRequestDto } from '../dtos/crear-inscripcion-mensual-request.dto';
import { ObtenerMetricasDashboardRequestDto } from '../dtos/obtener-metricas-dashboard-request.dto';
import { CrearPreferenciaSuscripcionRequestDto } from '../dtos/crear-preferencia-suscripcion-request.dto';
import { CrearPreferenciaCursoRequestDto } from '../dtos/crear-preferencia-curso-request.dto';
import { MercadoPagoWebhookDto } from '../../dto/mercadopago-webhook.dto';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { Roles, Role } from '../../../auth/decorators/roles.decorator';
import { GetUser } from '../../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../../auth/interfaces';
import { MercadoPagoWebhookGuard } from '../../guards/mercadopago-webhook.guard';

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
  constructor(
    private readonly pagosService: PagosService,
    private readonly pagosTutorService: PagosTutorService,
    private readonly verificacionMorosidadService: VerificacionMorosidadService,
  ) {}

  /**
   * POST /pagos/suscripcion
   * Genera preferencia de pago para una membresía del tutor autenticado
   */
  @Post('suscripcion')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor)
  async crearPreferenciaSuscripcion(
    @Body() body: CrearPreferenciaSuscripcionRequestDto,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosTutorService.crearPreferenciaSuscripcion(
      user.id,
      body.productoId,
    );
  }

  /**
   * POST /pagos/curso
   * Genera preferencia de pago para inscripción a curso
   */
  @Post('curso')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor)
  async crearPreferenciaCurso(
    @Body() body: CrearPreferenciaCursoRequestDto,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosTutorService.crearPreferenciaCurso(
      user.id,
      body.estudianteId,
      body.productoId,
    );
  }

  /**
   * GET /pagos/membresia
   * Obtiene la membresía actual del tutor autenticado
   */
  @Get('membresia')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor)
  async obtenerMembresiaActual(@GetUser() user: AuthUser) {
    const membresia = await this.pagosTutorService.obtenerMembresiaActual(
      user.id,
    );

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    return membresia;
  }

  /**
   * GET /pagos/membresia/:id/estado
   * Detalle del estado de una membresía específica
   */
  @Get('membresia/:id/estado')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor)
  async obtenerEstadoMembresia(
    @Param('id') membresiaId: string,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosTutorService.obtenerEstadoMembresia(
      user.id,
      membresiaId,
    );
  }

  /**
   * POST /pagos/mock/activar-membresia/:id
   * Permite activar manualmente una membresía en entornos de prueba
   */
  @Post('mock/activar-membresia/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor, Role.Admin)
  async activarMembresiaManual(
    @Param('id') membresiaId: string,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosTutorService.activarMembresiaManual(
      user.id,
      membresiaId,
    );
  }

  /**
   * GET /pagos/inscripciones
   * Listado de inscripciones a cursos para el tutor autenticado
   */
  @Get('inscripciones')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Tutor)
  async obtenerInscripciones(@GetUser() user: AuthUser) {
    return await this.pagosTutorService.obtenerInscripcionesTutor(user.id);
  }

  /**
   * POST /pagos/calcular-precio
   * Calcula el precio de actividades según reglas de negocio
   */
  @Post('calcular-precio')
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
    return await this.pagosService.obtenerConfiguracion();
  }

  /**
   * GET /pagos/historial-cambios
   * Obtiene el historial de cambios de precios
   */
  @Get('historial-cambios')
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
    return await this.pagosService.obtenerHistorialCambios();
  }

  /**
   * GET /pagos/inscripciones/pendientes
   * Obtiene inscripciones pendientes con información de estudiantes
   */
  @Get('inscripciones/pendientes')
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
    return await this.pagosService.obtenerInscripcionesPendientes();
  }

  /**
   * GET /pagos/estudiantes-descuentos
   * Obtiene estudiantes con descuentos aplicados
   */
  @Get('estudiantes-descuentos')
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
    return await this.pagosService.obtenerEstudiantesConDescuentos();
  }

  /**
   * POST /pagos/webhook
   * Webhook de MercadoPago para notificaciones de pago
   *
   * IMPORTANTE:
   * - Este endpoint es llamado automáticamente por MercadoPago cuando hay cambios en pagos
   * - Está protegido con MercadoPagoWebhookGuard que valida la firma HMAC
   * - Procesa automáticamente membresías y cursos pagados
   * - NO requiere autenticación JWT (es un webhook externo)
   */
  @Post('webhook')
  @UseGuards(MercadoPagoWebhookGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Webhook de MercadoPago',
    description: `
      Recibe notificaciones de MercadoPago sobre cambios en pagos.

      Flujo:
      1. MercadoPago envía notificación cuando hay un cambio (pago aprobado, rechazado, etc.)
      2. Guard valida firma HMAC para seguridad
      3. Service consulta detalles del pago a MercadoPago
      4. Se actualiza el estado de membresía o inscripción en la DB

      Casos manejados:
      - payment.created, payment.updated → Procesa pago
      - Aprobado → Activa membresía/inscripción
      - Rechazado → Marca como fallido
      - Pendiente → Marca como pendiente

      Security:
      - Validación de firma HMAC con secret de MercadoPago
      - Solo acepta notificaciones auténticas de MercadoPago
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook procesado exitosamente',
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
    @Headers('x-request-id') requestId: string,
  ) {
    return await this.pagosService.procesarWebhookMercadoPago(webhookData);
  }

  /**
   * GET /pagos/morosidad/tutor/:tutorId
   * Verifica el estado de morosidad de un tutor
   */
  @Get('morosidad/tutor/:tutorId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.Admin, Role.Tutor)
  @ApiOperation({ summary: 'Verificar morosidad de un tutor' })
  @ApiResponse({ status: 200, description: 'Estado de morosidad obtenido' })
  async verificarMorosidadTutor(
    @Param('tutorId') tutorId: string,
    @GetUser() user: AuthUser,
  ) {
    // Si es tutor, solo puede ver su propia información
    if (user.role === 'tutor' && user.id !== tutorId) {
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
  @Roles(Role.Admin)
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
  @Roles(Role.Admin, Role.Tutor)
  @ApiOperation({
    summary: 'Verificar acceso de estudiante según estado de pagos',
  })
  @ApiResponse({ status: 200, description: 'Estado de acceso del estudiante' })
  async verificarAccesoEstudiante(@Param('estudianteId') estudianteId: string) {
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
  @Roles(Role.Admin, Role.Tutor)
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
    @Param('estudianteId') estudianteId: string,
    @GetUser() user: AuthUser,
  ) {
    return await this.pagosService.registrarPagoManual(estudianteId, user.id);
  }
}
