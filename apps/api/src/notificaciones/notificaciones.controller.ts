import {
  Controller,
  Get,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

/**
 * Controller para notificaciones de DOCENTES
 * Los otros roles tendrán sus propios controllers en sus módulos respectivos
 */
@ApiTags('Notificaciones Docentes')
@ApiBearerAuth()
@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.DOCENTE)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * GET /notificaciones
   * Obtener todas las notificaciones del docente autenticado
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del docente' })
  @ApiQuery({ name: 'soloNoLeidas', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  async findAll(
    @GetUser('id') docenteId: string,
    @Query('soloNoLeidas') soloNoLeidas?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const filtrarNoLeidas = soloNoLeidas === 'true';
    return this.notificacionesService.findAllDocente(
      docenteId,
      filtrarNoLeidas,
      page,
      limit,
    );
  }

  /**
   * GET /notificaciones/count
   * Obtener contador de notificaciones no leídas
   */
  @Get('count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  async countNoLeidas(@GetUser('id') docenteId: string) {
    const count =
      await this.notificacionesService.countNoLeidasDocente(docenteId);
    return { count };
  }

  /**
   * PATCH /notificaciones/:id/leer
   * Marcar una notificación específica como leída
   */
  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  async marcarComoLeida(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') docenteId: string,
  ) {
    return this.notificacionesService.marcarComoLeida(
      id,
      'docente' as const,
      docenteId,
    );
  }

  /**
   * PATCH /notificaciones/leer-todas
   * Marcar todas las notificaciones como leídas
   */
  @Patch('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  async marcarTodasComoLeidas(@GetUser('id') docenteId: string) {
    const result = await this.notificacionesService.marcarTodasComoLeidas(
      'docente' as const,
      docenteId,
    );
    return {
      message: 'Todas las notificaciones marcadas como leídas',
      count: result.count,
    };
  }

  /**
   * DELETE /notificaciones/:id
   * Eliminar una notificación
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  async remove(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') docenteId: string,
  ) {
    await this.notificacionesService.remove(id, 'docente' as const, docenteId);
    return { message: 'Notificación eliminada correctamente' };
  }
}
