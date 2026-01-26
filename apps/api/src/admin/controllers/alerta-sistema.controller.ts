import {
  Controller,
  Get,
  Post,
  Patch,
  Query,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Role, Roles } from '../../auth/decorators/roles.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { AuthUser } from '../../auth/interfaces';
import { ParseIdPipe } from '../../common/pipes';
import { AlertaSistemaService } from '../services/alerta-sistema.service';
import { TipoAlertaAdmin, PrioridadNotificacion } from '@prisma/client';

/**
 * Controller para alertas del sistema (solo Admin)
 * Ruta base: /admin/alertas-sistema
 */
@ApiTags('Admin - Alertas del Sistema')
@ApiBearerAuth()
@Controller('admin/alertas-sistema')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class AlertaSistemaController {
  constructor(private readonly alertaSistemaService: AlertaSistemaService) {}

  /**
   * GET /admin/alertas-sistema - Listar alertas con filtros
   */
  @Get()
  @ApiOperation({ summary: 'Listar alertas del sistema' })
  @ApiResponse({ status: 200, description: 'Lista de alertas' })
  @ApiQuery({
    name: 'soloNoResueltas',
    required: false,
    type: Boolean,
    description: 'Filtrar solo alertas no resueltas (default: true)',
  })
  @ApiQuery({
    name: 'tipo',
    required: false,
    enum: TipoAlertaAdmin,
    description: 'Filtrar por tipo de alerta',
  })
  @ApiQuery({
    name: 'prioridad',
    required: false,
    enum: PrioridadNotificacion,
    description: 'Filtrar por prioridad',
  })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async listar(
    @Query('soloNoResueltas') soloNoResueltas?: string,
    @Query('tipo') tipo?: TipoAlertaAdmin,
    @Query('prioridad') prioridad?: PrioridadNotificacion,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.alertaSistemaService.listar({
      soloNoResueltas: soloNoResueltas !== 'false',
      tipo,
      prioridad,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  /**
   * GET /admin/alertas-sistema/count - Conteo para badge
   */
  @Get('count')
  @ApiOperation({ summary: 'Obtener conteo de alertas no resueltas' })
  @ApiResponse({
    status: 200,
    description: 'Conteo de alertas',
    schema: {
      properties: {
        total: { type: 'number' },
        porPrioridad: {
          type: 'object',
          properties: {
            CRITICA: { type: 'number' },
            ALTA: { type: 'number' },
            MEDIA: { type: 'number' },
            BAJA: { type: 'number' },
          },
        },
      },
    },
  })
  async contarNoResueltas() {
    return this.alertaSistemaService.contarNoResueltas();
  }

  /**
   * PATCH /admin/alertas-sistema/:id/resolver - Resolver una alerta
   */
  @Patch(':id/resolver')
  @ApiOperation({ summary: 'Marcar una alerta como resuelta' })
  @ApiResponse({ status: 200, description: 'Alerta resuelta' })
  @ApiResponse({ status: 404, description: 'Alerta no encontrada' })
  async resolver(
    @Param('id', ParseIdPipe) id: string,
    @GetUser() user: AuthUser,
  ) {
    return this.alertaSistemaService.resolver(id, user.id);
  }

  /**
   * POST /admin/alertas-sistema/resolver-multiples - Resolver varias alertas
   */
  @Post('resolver-multiples')
  @ApiOperation({ summary: 'Resolver múltiples alertas a la vez' })
  @ApiResponse({ status: 200, description: 'Alertas resueltas' })
  async resolverMultiples(
    @Body() body: { alertaIds: string[] },
    @GetUser() user: AuthUser,
  ) {
    return this.alertaSistemaService.resolverMultiples(body.alertaIds, user.id);
  }
}
