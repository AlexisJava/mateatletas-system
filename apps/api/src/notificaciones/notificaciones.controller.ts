import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.Docente)
export class NotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * GET /notificaciones
   * Obtener todas las notificaciones del docente autenticado
   * Query params: soloNoLeidas=true para filtrar solo no leídas
   */
  @Get()
  async findAll(
    @GetUser('id') docenteId: string,
    @Query('soloNoLeidas') soloNoLeidas?: string,
  ) {
    const filtrarNoLeidas = soloNoLeidas === 'true';
    return this.notificacionesService.findAll(docenteId, filtrarNoLeidas);
  }

  /**
   * GET /notificaciones/count
   * Obtener contador de notificaciones no leídas
   */
  @Get('count')
  async countNoLeidas(@GetUser('id') docenteId: string) {
    const count = await this.notificacionesService.countNoLeidas(docenteId);
    return { count };
  }

  /**
   * PATCH /notificaciones/:id/leer
   * Marcar una notificación específica como leída
   */
  @Patch(':id/leer')
  async marcarComoLeida(
    @Param('id') id: string,
    @GetUser('id') docenteId: string,
  ) {
    return this.notificacionesService.marcarComoLeida(id, docenteId);
  }

  /**
   * PATCH /notificaciones/leer-todas
   * Marcar todas las notificaciones como leídas
   */
  @Patch('leer-todas')
  async marcarTodasComoLeidas(@GetUser('id') docenteId: string) {
    const result =
      await this.notificacionesService.marcarTodasComoLeidas(docenteId);
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
  async remove(@Param('id') id: string, @GetUser('id') docenteId: string) {
    await this.notificacionesService.remove(id, docenteId);
    return { message: 'Notificación eliminada correctamente' };
  }
}
