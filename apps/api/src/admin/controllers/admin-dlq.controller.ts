import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/interfaces';
import { ParseIdPipe } from '../../common/pipes/parse-id.pipe';
import { WebhookDLQService } from '../../pagos/services/webhook-dlq.service';
import {
  FiltrosDlqDto,
  ResolveDlqDto,
  DlqStatsResponse,
  DlqListResponse,
} from '../dto/dlq.dto';

/**
 * Controller para gestión de Dead Letter Queue (webhooks fallidos)
 *
 * Permite a admins:
 * - Ver webhooks que fallaron después de múltiples reintentos
 * - Marcar como resuelto (procesado manualmente)
 * - Marcar como abandonado (no se puede procesar)
 * - Limpiar registros antiguos
 *
 * @see WebhookDLQService para la lógica de negocio
 */
@ApiTags('Admin - Monitoring DLQ')
@ApiBearerAuth()
@Controller('admin/webhooks/dlq')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AdminDlqController {
  constructor(private readonly dlqService: WebhookDLQService) {}

  /**
   * Obtener estadísticas de la DLQ
   * GET /api/admin/webhooks/dlq/stats
   */
  @Get('stats')
  @ApiOperation({
    summary: 'Estadísticas de webhooks en DLQ',
    description:
      'Retorna conteo por estado, total pendientes, y el webhook pendiente más antiguo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estadísticas de la DLQ',
    type: DlqStatsResponse,
  })
  async getStats(): Promise<DlqStatsResponse> {
    return this.dlqService.getStats();
  }

  /**
   * Listar webhooks en DLQ con filtros
   * GET /api/admin/webhooks/dlq
   */
  @Get()
  @ApiOperation({
    summary: 'Listar webhooks fallidos',
    description:
      'Lista paginada de webhooks en DLQ con filtros opcionales por estado, paymentId, tipo, y fechas',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista paginada de webhooks fallidos',
    type: DlqListResponse,
  })
  async list(@Query() filters: FiltrosDlqDto): Promise<DlqListResponse> {
    const {
      limit = 50,
      offset = 0,
      fromDate,
      toDate,
      ...restFilters
    } = filters;

    // Limitar máximo a 100 por request
    const safeLimit = Math.min(limit, 100);

    return this.dlqService.listDLQ(
      {
        ...restFilters,
        fromDate: fromDate ? new Date(fromDate) : undefined,
        toDate: toDate ? new Date(toDate) : undefined,
      },
      safeLimit,
      offset,
    );
  }

  /**
   * Obtener detalle de un webhook específico
   * GET /api/admin/webhooks/dlq/:id
   */
  @Get(':id')
  @ApiOperation({
    summary: 'Obtener detalle de webhook fallido',
    description:
      'Retorna toda la información del webhook incluyendo payload y errores',
  })
  @ApiParam({ name: 'id', description: 'ID del registro en DLQ' })
  @ApiResponse({ status: 200, description: 'Detalle del webhook' })
  @ApiResponse({ status: 404, description: 'Webhook no encontrado' })
  async getById(@Param('id', ParseIdPipe) id: string) {
    const webhook = await this.dlqService.getById(id);
    if (!webhook) {
      return { error: 'Webhook no encontrado', id };
    }
    return webhook;
  }

  /**
   * Marcar webhook como resuelto
   * POST /api/admin/webhooks/dlq/:id/resolve
   */
  @Post(':id/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar webhook como resuelto',
    description:
      'Marca el webhook como resuelto exitosamente. Usar cuando el pago fue procesado manualmente.',
  })
  @ApiParam({ name: 'id', description: 'ID del registro en DLQ' })
  @ApiResponse({ status: 200, description: 'Webhook marcado como resuelto' })
  @ApiResponse({ status: 404, description: 'Webhook no encontrado' })
  async resolve(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: ResolveDlqDto,
    @GetUser() user: AuthUser,
  ) {
    return this.dlqService.markAsResolved(id, {
      resolvedBy: user.email,
      resolutionNotes: dto.resolutionNotes,
    });
  }

  /**
   * Marcar webhook como abandonado
   * POST /api/admin/webhooks/dlq/:id/abandon
   */
  @Post(':id/abandon')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Marcar webhook como abandonado',
    description:
      'Marca el webhook como abandonado (no se puede procesar). Usar cuando el webhook es inválido o irreparable.',
  })
  @ApiParam({ name: 'id', description: 'ID del registro en DLQ' })
  @ApiResponse({ status: 200, description: 'Webhook marcado como abandonado' })
  @ApiResponse({ status: 404, description: 'Webhook no encontrado' })
  async abandon(
    @Param('id', ParseIdPipe) id: string,
    @Body() dto: ResolveDlqDto,
    @GetUser() user: AuthUser,
  ) {
    return this.dlqService.markAsAbandoned(id, {
      resolvedBy: user.email,
      resolutionNotes: dto.resolutionNotes,
    });
  }

  /**
   * Limpiar registros antiguos
   * POST /api/admin/webhooks/dlq/cleanup
   */
  @Post('cleanup')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Limpiar webhooks resueltos/abandonados antiguos',
    description:
      'Elimina registros resueltos o abandonados con más de 30 días de antigüedad',
  })
  @ApiResponse({
    status: 200,
    description: 'Cantidad de registros eliminados',
    schema: {
      type: 'object',
      properties: {
        deletedCount: { type: 'number', example: 42 },
        message: {
          type: 'string',
          example: 'Se eliminaron 42 registros antiguos',
        },
      },
    },
  })
  async cleanup() {
    const deletedCount = await this.dlqService.cleanOldRecords();
    return {
      deletedCount,
      message: `Se eliminaron ${deletedCount} registros antiguos`,
    };
  }
}
