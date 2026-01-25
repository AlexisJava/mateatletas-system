/**
 * ============================================================================
 * ADMIN VERANO CONTROLLER - Endpoints administrativos de verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md (sección 4.3)
 *
 * Endpoints:
 * - GET /admin/verano/resumen - Dashboard resumen
 * - GET /admin/verano/decisiones - Listar decisiones con filtro
 * - POST /admin/verano/procesar-bajas - Procesar no-respuestas como BAJA
 * - POST /admin/verano/restaurar-suscripciones - Restaurar montos en marzo
 * - POST /admin/verano/forzar-decision - Override admin de decisión
 */

import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/types/auth-user.type';

import { VeranoAdminService } from '../services/verano-admin.service';
import {
  ResumenVeranoResponseDto,
  DecisionEstudianteDto,
  ProcesarBajasResponseDto,
  RestaurarSuscripcionesResponseDto,
  ForzarDecisionResponseDto,
  ForzarDecisionVeranoDto,
  GetDecisionesVeranoQueryDto,
} from '../dto/verano-admin.dto';

@ApiTags('Admin - Verano')
@Controller('admin/verano')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class AdminVeranoController {
  constructor(private readonly veranoAdmin: VeranoAdminService) {}

  /**
   * GET /admin/verano/resumen
   *
   * Dashboard de verano para administradores
   */
  @Get('resumen')
  @ApiOperation({
    summary: 'Resumen de verano',
    description: `
      Retorna estadísticas del estado de verano para el dashboard admin.

      Incluye:
      - Total de estudiantes activos
      - Cuántos eligieron Colonia
      - Cuántos eligieron Continuidad
      - Cuántos no respondieron
      - Cupos disponibles por grupo de Colonia
    `,
  })
  @ApiResponse({
    status: 200,
    description: 'Resumen obtenido',
    type: ResumenVeranoResponseDto,
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de admin' })
  async getResumen(): Promise<ResumenVeranoResponseDto> {
    return this.veranoAdmin.getResumen();
  }

  /**
   * GET /admin/verano/decisiones
   *
   * Lista todas las decisiones de verano con filtro opcional
   */
  @Get('decisiones')
  @ApiOperation({
    summary: 'Listar decisiones de verano',
    description: `
      Lista todas las decisiones de verano de estudiantes.

      Filtros disponibles:
      - COLONIA: Solo estudiantes que eligieron Colonia
      - CONTINUIDAD: Solo estudiantes que eligieron Continuidad
      - PENDIENTE: Estudiantes que no han decidido
    `,
  })
  @ApiQuery({
    name: 'filtro',
    required: false,
    enum: ['COLONIA', 'CONTINUIDAD', 'PENDIENTE', 'BAJA'],
    description: 'Filtrar por tipo de decisión',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de decisiones',
    type: [DecisionEstudianteDto],
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de admin' })
  async getDecisiones(
    @Query() query: GetDecisionesVeranoQueryDto,
  ): Promise<DecisionEstudianteDto[]> {
    return this.veranoAdmin.getDecisiones(query);
  }

  /**
   * POST /admin/verano/procesar-bajas
   *
   * Procesa estudiantes que no respondieron como BAJA
   */
  @Post('procesar-bajas')
  @ApiOperation({
    summary: 'Procesar bajas automáticas',
    description: `
      Procesa todos los estudiantes que no respondieron en el período de decisión.

      IMPORTANTE:
      - Solo ejecutar después del 5 de diciembre
      - Los estudiantes sin decisión o con PENDIENTE son dados de baja
      - Sus inscripciones se cancelan y pierden el cupo
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Bajas procesadas',
    type: ProcesarBajasResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'El período de decisión no ha terminado',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de admin' })
  async procesarBajas(): Promise<ProcesarBajasResponseDto> {
    return this.veranoAdmin.procesarBajas();
  }

  /**
   * POST /admin/verano/restaurar-suscripciones
   *
   * Restaura los montos originales de suscripciones en marzo
   */
  @Post('restaurar-suscripciones')
  @ApiOperation({
    summary: 'Restaurar suscripciones',
    description: `
      Restaura los montos originales de todas las suscripciones familiares.

      IMPORTANTE:
      - Solo ejecutar en marzo
      - Restaura el monto mensual original guardado
      - Cambia estado de CONTINUIDAD a ACTIVA
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Suscripciones restauradas',
    type: RestaurarSuscripcionesResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Solo se puede ejecutar en marzo',
  })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de admin' })
  async restaurarSuscripciones(): Promise<RestaurarSuscripcionesResponseDto> {
    return this.veranoAdmin.restaurarSuscripciones();
  }

  /**
   * POST /admin/verano/forzar-decision
   *
   * Override administrativo para forzar una decisión
   */
  @Post('forzar-decision')
  @ApiOperation({
    summary: 'Forzar decisión de verano',
    description: `
      Permite a un administrador forzar la decisión de verano de un estudiante.

      Casos de uso:
      - Becas especiales aprobadas por dirección
      - Corrección de errores
      - Situaciones excepcionales

      IMPORTANTE: Requiere motivo para auditoría.
    `,
  })
  @ApiResponse({
    status: 201,
    description: 'Decisión forzada',
    type: ForzarDecisionResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Decisión inválida' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  @ApiResponse({ status: 403, description: 'No tiene rol de admin' })
  @ApiResponse({ status: 404, description: 'Estudiante no encontrado' })
  async forzarDecision(
    @GetUser() user: AuthUser,
    @Body() dto: ForzarDecisionVeranoDto,
  ): Promise<ForzarDecisionResponseDto> {
    return this.veranoAdmin.forzarDecision(dto, user.id);
  }
}
