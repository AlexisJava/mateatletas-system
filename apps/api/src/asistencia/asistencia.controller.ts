import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AsistenciaService } from './asistencia.service';
import { MarcarAsistenciaDto } from './dto/marcar-asistencia.dto';
import { FiltrarAsistenciaDto } from './dto/filtrar-asistencia.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';

@Controller('asistencia')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AsistenciaController {
  constructor(private readonly asistenciaService: AsistenciaService) {}

  /**
   * Marcar asistencia de un estudiante en una clase
   * POST /api/asistencia/clases/:claseId/estudiantes/:estudianteId
   * Rol: Docente
   */
  @Post('clases/:claseId/estudiantes/:estudianteId')
  @Roles(Role.Docente)
  async marcarAsistencia(
    @Param('claseId') claseId: string,
    @Param('estudianteId') estudianteId: string,
    @Body() dto: MarcarAsistenciaDto,
    @GetUser() user: any,
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
  @Roles(Role.Docente, Role.Admin)
  async obtenerAsistenciaClase(
    @Param('claseId') claseId: string,
    @GetUser() user: any,
  ) {
    // Si es docente, verificar que es el titular
    const docenteId = user.role === Role.Docente ? user.id : undefined;
    return this.asistenciaService.obtenerAsistenciaClase(claseId, docenteId);
  }

  /**
   * Obtener estadísticas de asistencia de una clase
   * GET /api/asistencia/clases/:claseId/estadisticas
   * Rol: Docente, Admin
   */
  @Get('clases/:claseId/estadisticas')
  @Roles(Role.Docente, Role.Admin)
  async obtenerEstadisticasClase(@Param('claseId') claseId: string) {
    return this.asistenciaService.obtenerEstadisticasClase(claseId);
  }

  /**
   * Obtener historial de asistencia de un estudiante
   * GET /api/asistencia/estudiantes/:estudianteId
   * Rol: Tutor, Docente, Admin
   */
  @Get('estudiantes/:estudianteId')
  @Roles(Role.Tutor, Role.Docente, Role.Admin)
  async obtenerHistorialEstudiante(
    @Param('estudianteId') estudianteId: string,
    @Query() filtros: FiltrarAsistenciaDto,
  ) {
    return this.asistenciaService.obtenerHistorialEstudiante(
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
  @Roles(Role.Docente)
  async obtenerResumenDocente(@GetUser() user: any) {
    return this.asistenciaService.obtenerResumenDocente(user.id);
  }

  /**
   * Obtener todas las observaciones del docente
   * GET /api/asistencia/docente/observaciones
   * Rol: Docente
   */
  @Get('docente/observaciones')
  @Roles(Role.Docente)
  async obtenerObservacionesDocente(
    @GetUser() user: any,
    @Query('estudianteId') estudianteId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('limit') limit?: string,
  ) {
    return this.asistenciaService.obtenerObservacionesDocente(user.id, {
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
  @Roles(Role.Docente)
  async obtenerReportesDocente(@GetUser() user: any) {
    return this.asistenciaService.obtenerReportesDocente(user.id);
  }

  /**
   * T080 - Registro Automático de Asistencia
   * Auto-registro de asistencia cuando estudiante entra a videollamada
   * POST /api/asistencia
   * Rol: Estudiante
   */
  @Post()
  @Roles(Role.Estudiante)
  async autoRegistrarAsistencia(
    @Body() dto: { claseId: string; presente: boolean },
    @GetUser() user: any,
  ) {
    // El estudianteId se obtiene del usuario autenticado
    const estudianteId = user.estudiante?.id || user.id;

    return this.asistenciaService.marcarAsistencia(
      dto.claseId,
      estudianteId,
      { presente: dto.presente },
      null, // No es marcado por un docente, es auto-registro
    );
  }
}
