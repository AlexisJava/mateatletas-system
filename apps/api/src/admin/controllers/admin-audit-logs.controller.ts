import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { AuditLogService } from '../../audit/audit-log.service';
import {
  FiltrosAuditLogsDto,
  AuditLogsListResponse,
  AuditLogsStatsResponse,
  AuditLogItem,
} from '../dto/audit-logs.dto';

/**
 * Controller para visualización de Audit Logs
 *
 * Permite a admins:
 * - Ver logs de auditoría del sistema
 * - Filtrar por usuario, acción, categoría, severidad
 * - Ver estadísticas de logs
 * - Ver historial de una entidad específica
 *
 * @see AuditLogService para la lógica de negocio
 */
@ApiTags('Admin - Audit Logs')
@ApiBearerAuth()
@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminAuditLogsController {
  constructor(private readonly auditLogService: AuditLogService) {}

  /**
   * Obtener estadísticas de audit logs
   * GET /api/admin/audit-logs/stats
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de audit logs',
    description:
      'Retorna conteo por categoría, severidad, acciones top, y totales',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de audit logs',
    type: AuditLogsStatsResponse,
  })
  async getStats(): Promise<AuditLogsStatsResponse> {
    // Obtener conteos por categoría, severidad y acción
    const [byCategory, bySeverity, topActions, total, recentLog] =
      await Promise.all([
        this.auditLogService.countGroupedBy('category'),
        this.auditLogService.countGroupedBy('severity'),
        this.auditLogService.countGroupedBy('action'),
        this.auditLogService.countTotal(),
        this.auditLogService.findLogs({ limit: 1 }),
      ]);

    const recent = recentLog[0];
    return {
      byCategory,
      bySeverity,
      topActions: this.getTopN(topActions, 10),
      total,
      totalCritical: bySeverity['critical'] ?? 0,
      mostRecent: recent
        ? {
            id: recent.id,
            timestamp: recent.timestamp,
            action: recent.action,
          }
        : null,
    };
  }

  /**
   * Listar audit logs con filtros
   * GET /api/admin/audit-logs
   */
  @Get()
  @ApiOperation({
    summary: 'Listar audit logs',
    description:
      'Lista paginada de audit logs con filtros opcionales por usuario, acción, categoría, severidad y fechas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de audit logs',
    type: AuditLogsListResponse,
  })
  async list(
    @Query() filters: FiltrosAuditLogsDto,
  ): Promise<AuditLogsListResponse> {
    const {
      limit = 50,
      offset = 0,
      startDate,
      endDate,
      ...restFilters
    } = filters;

    // Limitar máximo a 100 por request
    const safeLimit = Math.min(limit, 100);

    const items = await this.auditLogService.findLogs({
      ...restFilters,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: safeLimit + 1, // Pedimos uno más para saber si hay más
    });

    // Si tenemos más items que el límite, hay más páginas
    const hasMore = items.length > safeLimit;
    const resultItems = hasMore ? items.slice(0, safeLimit) : items;

    // Obtener total para paginación
    const total = await this.countWithFilters({
      ...restFilters,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });

    return {
      items: resultItems as AuditLogItem[],
      total,
      limit: safeLimit,
      offset,
      hasMore,
    };
  }

  /**
   * Obtener historial de una entidad específica
   * GET /api/admin/audit-logs/entity/:entityType/:entityId
   */
  @Get('entity/:entityType/:entityId')
  @ApiOperation({
    summary: 'Historial de una entidad',
    description:
      'Retorna todos los logs relacionados con una entidad específica',
  })
  @ApiParam({
    name: 'entityType',
    description: 'Tipo de entidad',
    example: 'Pago',
  })
  @ApiParam({ name: 'entityId', description: 'ID de la entidad' })
  @ApiResponse({ status: 200, description: 'Historial de la entidad' })
  async getEntityHistory(
    @Param('entityType') entityType: string,
    @Param('entityId', ParseIdPipe) entityId: string,
  ) {
    return this.auditLogService.getEntityHistory(entityType, entityId);
  }

  /**
   * Obtener logs de un usuario específico
   * GET /api/admin/audit-logs/user/:userId
   */
  @Get('user/:userId')
  @ApiOperation({
    summary: 'Logs de un usuario',
    description: 'Retorna todos los logs de un usuario específico',
  })
  @ApiParam({ name: 'userId', description: 'ID del usuario' })
  @ApiResponse({ status: 200, description: 'Logs del usuario' })
  async getUserLogs(@Param('userId', ParseIdPipe) userId: string) {
    return this.auditLogService.getUserLogs(userId);
  }

  /**
   * Obtener detalle de un log específico
   * GET /api/admin/audit-logs/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de audit log',
    description: 'Retorna toda la información de un log específico',
  })
  @ApiParam({ name: 'id', description: 'ID del audit log' })
  @ApiResponse({ status: 200, description: 'Detalle del log' })
  @ApiResponse({ status: 404, description: 'Log no encontrado' })
  async getById(@Param('id', ParseIdPipe) id: string) {
    const log = await this.auditLogService.getById(id);
    if (!log) {
      return { error: 'Log no encontrado', id };
    }
    return log;
  }

  // Helpers privados

  private getTopN(
    obj: Record<string, number>,
    n: number,
  ): Record<string, number> {
    const entries = Object.entries(obj);
    entries.sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, n);
    return Object.fromEntries(top);
  }

  private async countWithFilters(filters: {
    userId?: string;
    userEmail?: string;
    action?: string;
    entityType?: string;
    category?: string;
    severity?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<number> {
    // Obtener todos los logs con los filtros (máx 10000 para contar)
    const logs = await this.auditLogService.findLogs({
      ...filters,
      limit: 10000,
    });
    return logs.length;
  }
}
