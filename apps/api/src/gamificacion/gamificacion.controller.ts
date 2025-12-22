import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  Body,
  UseGuards,
  Request,
  ForbiddenException,
} from '@nestjs/common';
import { IsString, IsOptional, IsNotEmpty, IsIn } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GamificacionService } from './gamificacion.service';
import { RequestWithAuthUser } from '../auth/interfaces';
import { TipoAccionPuntos } from './puntos.service';

/**
 * Tipos de acciones válidas para otorgar puntos
 */
const TIPOS_ACCION_VALIDOS: TipoAccionPuntos[] = [
  'ASISTENCIA',
  'PARTICIPACION',
  'LOGRO',
  'BONUS',
  'TAREA_COMPLETADA',
  'QUIZ_APROBADO',
  'AYUDA_COMPANERO',
];

/**
 * DTOs para las peticiones
 */
export class OtorgarPuntosDto {
  @IsString()
  @IsNotEmpty()
  estudianteId!: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(TIPOS_ACCION_VALIDOS)
  tipoAccion!: TipoAccionPuntos;

  @IsString()
  @IsOptional()
  claseId?: string;

  @IsString()
  @IsOptional()
  contexto?: string;
}

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
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async getDashboard(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
    @Request() req: RequestWithAuthUser,
  ) {
    // Validar que el estudiante solo pueda ver su propio dashboard
    // o que sea un tutor/docente/admin
    const user = req.user;
    if (user.role === Role.ESTUDIANTE && user.id !== estudianteId) {
      throw new ForbiddenException(
        'No tienes permiso para acceder a este estudiante',
      );
    }

    return this.gamificacionService.getDashboardEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/logros/:estudianteId
   * Todos los logros (desbloqueados y bloqueados)
   */
  @Get('logros/:estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async getLogros(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.gamificacionService.getLogrosEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/puntos/:estudianteId
   * Puntos totales y por ruta curricular
   */
  @Get('puntos/:estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async getPuntos(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.gamificacionService.getPuntosEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/ranking/:estudianteId
   * Ranking del estudiante (casa y global)
   */
  @Get('ranking/:estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async getRanking(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.gamificacionService.getRankingEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/progreso/:estudianteId
   * Progreso por clase del estudiante
   */
  @Get('progreso/:estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  getProgreso(@Param('estudianteId', ParseUUIDPipe) estudianteId: string) {
    return this.gamificacionService.getProgresoEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/acciones
   * Obtener lista de tipos de acciones puntuables disponibles (para docentes)
   */
  @Get('acciones')
  @Roles(Role.DOCENTE, Role.ADMIN)
  getTiposAccion() {
    return this.gamificacionService.getTiposAccion();
  }

  /**
   * GET /gamificacion/historial/:estudianteId
   * Historial de puntos obtenidos por un estudiante
   */
  @Get('historial/:estudianteId')
  @Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async getHistorial(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    return this.gamificacionService.getHistorialPuntos(estudianteId);
  }

  /**
   * POST /gamificacion/puntos
   * Otorgar puntos a un estudiante (solo docentes y admins)
   */
  @Post('puntos')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async otorgarPuntos(
    @Body() dto: OtorgarPuntosDto,
    @Request() req: RequestWithAuthUser,
  ) {
    return this.gamificacionService.otorgarPuntos(
      req.user.id,
      dto.estudianteId,
      dto.tipoAccion,
      dto.claseId,
      dto.contexto,
    );
  }

  /**
   * POST /gamificacion/logros/:logroId/desbloquear
   * Desbloquear un logro manualmente (admin/testing)
   */
  @Post('logros/:logroId/desbloquear')
  @Roles(Role.ADMIN)
  desbloquearLogro(
    @Param('logroId', ParseUUIDPipe) logroId: string,
    @Request() req: RequestWithAuthUser,
  ) {
    return this.gamificacionService.desbloquearLogro(req.user.id, logroId);
  }
}
