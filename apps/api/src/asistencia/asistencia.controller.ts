import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { EstadoAsistencia } from '@prisma/client';
import { AsistenciaService } from './asistencia.service';
import { AsistenciaReportesService } from './asistencia-reportes.service';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { FiltrarAsistenciaDto } from './dto/filtrar-asistencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { AuthUser } from '../auth/interfaces';

@Controller('asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciaController {
  constructor(
    private readonly asistenciaService: AsistenciaService,
    private readonly reportesService: AsistenciaReportesService,
  ) {}

  /**
   * Marcar asistencia de un estudiante en una clase
   * POST /api/asistencia/clases/:claseId/estudiantes/:estudianteId
   * Rol: Docente
   */
  @Post('clases/:claseId/estudiantes/:estudianteId')
  @Roles(Role.DOCENTE)
  async marcarAsistencia(
    @Param('claseId') claseId: string,
    @Param('estudianteId') estudianteId: string,
    @Body() dto: MarcarAsistenciaDto,
    @GetUser() user: AuthUser,
  ) {
    return this.asistenciaService.marcarAsistencia(
      claseId,
      estudianteId,
      dto,
      user.id,
    );
  }

  /**
   * Obtener lista de asistencia de una clase (roster)
   * GET /api/asistencia/clases/:claseId
   * Rol: Docente, Admin
   */
  @Get('clases/:claseId')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async obtenerAsistenciaClase(
    @Param('claseId') claseId: string,
    @GetUser() user: AuthUser,
  ) {
    // Si es docente, verificar que es el titular
    const docenteId = user.role === Role.DOCENTE ? user.id : undefined;
    return this.asistenciaService.obtenerAsistenciaClase(claseId, docenteId);
  }

  /**
   * Obtener estadísticas de asistencia de una clase
   * GET /api/asistencia/clases/:claseId/estadisticas
   * Rol: Docente, Admin
   */
  @Get('clases/:claseId/estadisticas')
  @Roles(Role.DOCENTE, Role.ADMIN)
  async obtenerEstadisticasClase(@Param('claseId') claseId: string) {
    return this.reportesService.obtenerEstadisticasClase(claseId);
  }

  /**
   * Obtener historial de asistencia de un estudiante
   * GET /api/asistencia/estudiantes/:estudianteId
   * Rol: Tutor, Docente, Admin
   */
  @Get('estudiantes/:estudianteId')
  @Roles(Role.TUTOR, Role.DOCENTE, Role.ADMIN)
  async obtenerHistorialEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Query() filtros: FiltrarAsistenciaDto,
  ) {
    return this.reportesService.obtenerHistorialEstudiante(
      estudianteId,
      filtros,
    );
  }

  /**
   * Obtener resumen de asistencia del docente
   * GET /api/asistencia/docente/resumen
   * Rol: Docente
   */
  @Get('docente/resumen')
  @Roles(Role.DOCENTE)
  async obtenerResumenDocente(@GetUser() user: AuthUser) {
    return this.reportesService.obtenerResumenDocente(user.id);
  }

  /**
   * Obtener todas las observaciones del docente
   * GET /api/asistencia/docente/observaciones
   * Rol: Docente
   */
  @Get('docente/observaciones')
  @Roles(Role.DOCENTE)
  async obtenerObservacionesDocente(
    @GetUser() user: AuthUser,
    @Query('estudianteId') estudianteId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reportesService.obtenerObservacionesDocente(user.id, {
      estudianteId,
      fechaDesde,
      fechaHasta,
      limit: limit ? parseInt(limit) : 20,
    });
  }

  /**
   * Obtener reportes y gráficos del docente
   * GET /api/asistencia/docente/reportes
   * Rol: Docente
   */
  @Get('docente/reportes')
  @Roles(Role.DOCENTE)
  async obtenerReportesDocente(@GetUser() user: AuthUser) {
    return this.reportesService.obtenerReportesDocente(user.id);
  }

  /**
   * T080 - Registro Automático de Asistencia
   * Auto-registro de asistencia cuando estudiante entra a videollamada
   * POST /api/asistencia
   * Rol: Estudiante
   */
  @Post()
  @Roles(Role.ESTUDIANTE)
  async autoRegistrarAsistencia(
    @Body() dto: { claseId: string; presente: boolean },
    @GetUser() user: AuthUser,
  ) {
    // El estudianteId se obtiene del usuario autenticado
    const estudianteId = user.id;

    const estado = dto.presente
      ? EstadoAsistencia.Presente
      : EstadoAsistencia.Ausente;

    const asistenciaDto: MarcarAsistenciaDto = {
      estado,
    };

    return this.asistenciaService.marcarAsistencia(
      dto.claseId,
      estudianteId,
      asistenciaDto,
      null, // No es marcado por un docente, es auto-registro
    );
  }

  /**
   * Tomar asistencia de múltiples estudiantes en ClaseGrupo (batch)
   * POST /api/asistencia/clase-grupo/batch
   * Rol: Docente
   *
   * Usado en el modo "Clase en Vivo" del portal docente
   * Permite tomar asistencia de todos los estudiantes en una sola request
   */
  @Post('clase-grupo/batch')
  @Roles(Role.DOCENTE)
  async tomarAsistenciaBatch(
    @Body() dto: import('./dto/tomar-asistencia-batch.dto').TomarAsistenciaBatchDto,
    @GetUser() user: AuthUser,
  ) {
    return this.asistenciaService.tomarAsistenciaClaseGrupoBatch(
      dto.claseGrupoId,
      dto.fecha,
      dto.asistencias,
      user.id,
    );
  }
}
