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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { ParseIdPipe } from '../common/pipes';

/**
 * Controller para notificaciones de TUTORES
 * Endpoints bajo /tutor/notificaciones
 */
@ApiTags('Tutor - Notificaciones')
@ApiBearerAuth()
@Controller('tutor/notificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.TUTOR)
export class TutorNotificacionesController {
  constructor(private readonly notificacionesService: NotificacionesService) {}

  /**
   * GET /tutor/notificaciones
   * Listar notificaciones del tutor autenticado
   */
  @Get()
  @ApiOperation({ summary: 'Listar notificaciones del tutor' })
  @ApiQuery({ name: 'soloNoLeidas', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 20 })
  @ApiResponse({ status: 200, description: 'Notificaciones obtenidas' })
  @ApiResponse({ status: 401, description: 'No autenticado' })
  async findAll(
    @GetUser('id') tutorId: string,
    @Query('soloNoLeidas') soloNoLeidas?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    const filtrarNoLeidas = soloNoLeidas === 'true';
    return this.notificacionesService.findAllTutor(
      tutorId,
      filtrarNoLeidas,
      page,
      limit,
    );
  }

  /**
   * GET /tutor/notificaciones/count
   * Contador de notificaciones no leídas
   */
  @Get('count')
  @ApiOperation({ summary: 'Contar notificaciones no leídas' })
  @ApiResponse({ status: 200, description: 'Contador obtenido' })
  async countNoLeidas(@GetUser('id') tutorId: string) {
    const count = await this.notificacionesService.countNoLeidasTutor(tutorId);
    return { count };
  }

  /**
   * PATCH /tutor/notificaciones/:id/leer
   * Marcar una notificación como leída
   */
  @Patch(':id/leer')
  @ApiOperation({ summary: 'Marcar notificación como leída' })
  @ApiResponse({ status: 200, description: 'Notificación marcada como leída' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async marcarComoLeida(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') tutorId: string,
  ) {
    return this.notificacionesService.marcarComoLeida(
      id,
      'tutor' as const,
      tutorId,
    );
  }

  /**
   * PATCH /tutor/notificaciones/leer-todas
   * Marcar todas las notificaciones como leídas
   */
  @Patch('leer-todas')
  @ApiOperation({ summary: 'Marcar todas las notificaciones como leídas' })
  @ApiResponse({ status: 200, description: 'Notificaciones marcadas' })
  async marcarTodasComoLeidas(@GetUser('id') tutorId: string) {
    const result = await this.notificacionesService.marcarTodasComoLeidas(
      'tutor' as const,
      tutorId,
    );
    return {
      message: 'Todas las notificaciones marcadas como leídas',
      count: result.count,
    };
  }

  /**
   * DELETE /tutor/notificaciones/:id
   * Eliminar una notificación
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar una notificación' })
  @ApiResponse({ status: 200, description: 'Notificación eliminada' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  async remove(
    @Param('id', ParseIdPipe) id: string,
    @GetUser('id') tutorId: string,
  ) {
    await this.notificacionesService.remove(id, 'tutor' as const, tutorId);
    return { message: 'Notificación eliminada correctamente' };
  }
}
