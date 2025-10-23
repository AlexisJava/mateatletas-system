import { Controller, Post, Get, Body, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PagosService } from '../services/pagos.service';
import { CalcularPrecioRequestDto } from '../dtos/calcular-precio-request.dto';
import { ActualizarConfiguracionPreciosRequestDto } from '../dtos/actualizar-configuracion-precios-request.dto';
import { CrearInscripcionMensualRequestDto } from '../dtos/crear-inscripcion-mensual-request.dto';
import { ObtenerMetricasDashboardRequestDto } from '../dtos/obtener-metricas-dashboard-request.dto';

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
  constructor(private readonly pagosService: PagosService) {}

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
    description: 'Datos de entrada inválidos (precios negativos, porcentajes fuera de rango, etc)',
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
  async crearInscripciones(
    @Body() dto: CrearInscripcionMensualRequestDto,
  ) {
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
    description: 'Retorna los últimos cambios en la configuración de precios para auditoría',
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
    description: 'Retorna inscripciones con estado Pendiente incluyendo datos del estudiante y producto',
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
}
