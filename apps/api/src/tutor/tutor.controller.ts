import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TutorService } from './tutor.service';
import { GetMisInscripcionesDto } from './dto/get-mis-inscripciones.dto';
import { GetDashboardResumenDto } from './dto/get-dashboard-resumen.dto';
import { GetProximasClasesDto } from './dto/get-proximas-clases.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

/**
 * TutorController
 *
 * Endpoints específicos para tutores autenticados
 * Todos los endpoints:
 * - Requieren autenticación JWT
 * - Requieren rol de tutor
 * - Obtienen tutorId del token (NO del cliente)
 */
@ApiTags('Tutor')
@Controller('tutor')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR)
@ApiBearerAuth()
export class TutorController {
  constructor(private readonly tutorService: TutorService) {}

  /**
   * GET /tutor/mis-inscripciones
   *
   * Obtiene las inscripciones mensuales del tutor autenticado
   * El tutorId viene del JWT token, NO del cliente (seguro)
   */
  @Get('mis-inscripciones')
  @ApiOperation({
    summary: 'Obtener mis inscripciones mensuales',
    description: `
      Retorna las inscripciones mensuales del tutor autenticado con resumen financiero.

      El tutorId se obtiene automáticamente del token JWT (seguro).

      Filtros opcionales:
      - periodo: YYYY-MM (ej: 2025-01)
      - estadoPago: Pendiente | Pagado | Vencido

      Respuesta incluye:
      - Lista de inscripciones
      - Resumen: total pendiente, pagado, cantidad, estudiantes únicos
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Inscripciones obtenidas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene rol de tutor',
  })
  async getMisInscripciones(
    @GetUser() user: AuthUser,
    @Query() query: GetMisInscripcionesDto,
  ) {
    // user.id viene del JWT - SEGURO
    // NO confiamos en ningún dato del cliente para el tutorId
    return this.tutorService.getMisInscripciones(
      user.id,
      query.periodo,
      query.estadoPago,
    );
  }

  /**
   * GET /tutor/dashboard-resumen
   *
   * Obtiene el resumen completo del dashboard del tutor autenticado
   * Incluye: métricas, alertas, pagos pendientes y clases de hoy
   */
  @Get('dashboard-resumen')
  @ApiOperation({
    summary: 'Obtener resumen del dashboard',
    description: `
      Retorna el resumen completo del dashboard del tutor autenticado.

      El tutorId se obtiene automáticamente del token JWT (seguro).

      Respuesta incluye:
      - Métricas: total hijos, clases del mes, total pagado año, asistencia promedio
      - Alertas: pagos vencidos, pagos por vencer, clases hoy, asistencias bajas
      - Pagos pendientes: lista de pagos pendientes con fecha de vencimiento
      - Clases de hoy: lista de clases programadas para hoy
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen del dashboard obtenido exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene rol de tutor',
  })
  async getDashboardResumen(
    @GetUser() user: AuthUser,
    @Query() _query: GetDashboardResumenDto,
  ) {
    return this.tutorService.getDashboardResumen(user.id);
  }

  /**
   * GET /tutor/proximas-clases
   *
   * Obtiene las próximas N clases de todos los hijos del tutor
   */
  @Get('proximas-clases')
  @ApiOperation({
    summary: 'Obtener próximas clases',
    description: `
      Retorna las próximas N clases de todos los hijos del tutor.

      El tutorId se obtiene automáticamente del token JWT (seguro).

      Query params opcionales:
      - limit: Cantidad máxima de clases (default: 5, máximo: 50)

      Respuesta incluye:
      - Lista de clases ordenadas por fecha/hora
      - Info completa: estudiante, docente, ruta curricular
      - Flags: esHoy, esManana, puedeUnirse
      - Label de fecha amigable (HOY, MAÑANA, LUN 15/02)
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Próximas clases obtenidas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene rol de tutor',
  })
  async getProximasClases(
    @GetUser() user: AuthUser,
    @Query() query: GetProximasClasesDto,
  ) {
    return this.tutorService.getProximasClases(user.id, query.limit);
  }

  /**
   * GET /tutor/alertas
   *
   * Obtiene todas las alertas activas del tutor
   */
  @Get('alertas')
  @ApiOperation({
    summary: 'Obtener alertas activas',
    description: `
      Retorna todas las alertas activas del tutor autenticado.

      El tutorId se obtiene automáticamente del token JWT (seguro).

      Tipos de alertas:
      - Pagos vencidos (prioridad alta)
      - Pagos por vencer en los próximos 7 días (prioridad alta/media)
      - Clases programadas para hoy (prioridad media)
      - Asistencias bajas < 70% (prioridad alta/media)

      Las alertas se ordenan automáticamente por prioridad (alta -> media -> baja).
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Alertas obtenidas exitosamente',
  })
  @ApiResponse({
    status: 401,
    description: 'No autenticado',
  })
  @ApiResponse({
    status: 403,
    description: 'No tiene rol de tutor',
  })
  async getAlertas(@GetUser() user: AuthUser) {
    return this.tutorService.obtenerAlertas(user.id);
  }
}
