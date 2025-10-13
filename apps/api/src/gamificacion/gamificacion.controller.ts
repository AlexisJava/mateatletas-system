import { Controller, Get, Post, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { GamificacionService } from './gamificacion.service';

/**
 * Controlador de Gamificación
 * Endpoints para logros, puntos, ranking y progreso de estudiantes
 */
@Controller('gamificacion')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GamificacionController {
  constructor(private readonly gamificacionService: GamificacionService) {}

  /**
   * GET /gamificacion/dashboard/:estudianteId
   * Dashboard completo del estudiante con stats
   */
  @Get('dashboard/:estudianteId')
  async getDashboard(@Param('estudianteId') estudianteId: string) {
    return this.gamificacionService.getDashboardEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/logros/:estudianteId
   * Todos los logros (desbloqueados y bloqueados)
   */
  @Get('logros/:estudianteId')
  async getLogros(@Param('estudianteId') estudianteId: string) {
    return this.gamificacionService.getLogrosEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/puntos/:estudianteId
   * Puntos totales y por ruta curricular
   */
  @Get('puntos/:estudianteId')
  async getPuntos(@Param('estudianteId') estudianteId: string) {
    return this.gamificacionService.getPuntosEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/ranking/:estudianteId
   * Ranking del estudiante (equipo y global)
   */
  @Get('ranking/:estudianteId')
  async getRanking(@Param('estudianteId') estudianteId: string) {
    return this.gamificacionService.getRankingEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/progreso/:estudianteId
   * Progreso por ruta curricular
   */
  @Get('progreso/:estudianteId')
  async getProgreso(@Param('estudianteId') estudianteId: string) {
    return this.gamificacionService.getProgresoEstudiante(estudianteId);
  }

  /**
   * POST /gamificacion/logros/:logroId/desbloquear
   * Desbloquear un logro manualmente (admin/testing)
   */
  @Post('logros/:logroId/desbloquear')
  async desbloquearLogro(
    @Param('logroId') logroId: string,
    @Request() req: any,
  ) {
    return this.gamificacionService.desbloquearLogro(req.user.id, logroId);
  }
}
