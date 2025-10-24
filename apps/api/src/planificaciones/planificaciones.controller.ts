import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlanificacionesService } from './planificaciones.service';
import { CrearPlanificacionDto } from './dto/crear-planificacion.dto';
import { CrearActividadDto } from './dto/crear-actividad.dto';
import { AsignarPlanificacionDto } from './dto/asignar-planificacion.dto';
import { ActualizarProgresoDto } from './dto/actualizar-progreso.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';

@ApiTags('Planificaciones')
@Controller('planificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PlanificacionesController {
  constructor(private readonly planificacionesService: PlanificacionesService) {}

  // ============================================================================
  // ADMIN ENDPOINTS
  // ============================================================================

  @Post()
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Crear nueva planificación mensual (Admin)' })
  async crearPlanificacion(@Request() req: any, @Body() dto: CrearPlanificacionDto) {
    return this.planificacionesService.crearPlanificacion(req.user.sub, dto);
  }

  @Get()
  @Roles(Role.Admin, Role.Tutor, Role.Docente)
  @ApiOperation({ summary: 'Obtener todas las planificaciones' })
  async obtenerPlanificaciones(
    @Query('codigo_grupo') codigoGrupo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
    @Query('estado') estado?: string,
  ) {
    const filters: any = {};
    if (codigoGrupo) filters.codigo_grupo = codigoGrupo;
    if (mes) filters.mes = parseInt(mes);
    if (anio) filters.anio = parseInt(anio);
    if (estado) filters.estado = estado;

    return this.planificacionesService.obtenerPlanificaciones(filters);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.Tutor, Role.Docente)
  @ApiOperation({ summary: 'Obtener detalle de una planificación' })
  async obtenerPlanificacion(@Param('id') id: string) {
    return this.planificacionesService.obtenerPlanificacion(id);
  }

  @Put(':id/publicar')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Publicar una planificación (Admin)' })
  async publicarPlanificacion(@Param('id') id: string) {
    return this.planificacionesService.publicarPlanificacion(id);
  }

  @Post('actividades')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Crear actividad semanal dentro de una planificación (Admin)' })
  async crearActividad(@Body() dto: CrearActividadDto) {
    return this.planificacionesService.crearActividad(dto);
  }

  @Get(':planificacionId/actividades')
  @Roles(Role.Admin, Role.Tutor, Role.Docente)
  @ApiOperation({ summary: 'Obtener actividades de una planificación' })
  async obtenerActividades(@Param('planificacionId') planificacionId: string) {
    return this.planificacionesService.obtenerActividades(planificacionId);
  }

  // ============================================================================
  // DOCENTE ENDPOINTS
  // ============================================================================

  @Post('asignar')
  @Roles(Role.Docente, Role.Admin)
  @ApiOperation({ summary: 'Asignar planificación a un grupo (Docente)' })
  async asignarPlanificacion(@Body() dto: AsignarPlanificacionDto) {
    return this.planificacionesService.asignarPlanificacion(dto);
  }

  @Get('docente/mis-planificaciones')
  @Roles(Role.Docente)
  @ApiOperation({ summary: 'Obtener planificaciones asignadas del docente' })
  async obtenerPlanificacionesDocente(@Request() req: any) {
    // Obtener el docente_id del usuario autenticado
    const docente = await this.planificacionesService['prisma'].docente.findUnique({
      where: { id: req.user.sub },
      select: { id: true },
    });

    if (!docente) {
      return [];
    }

    return this.planificacionesService.obtenerPlanificacionesDocente(docente.id);
  }

  // ============================================================================
  // ESTUDIANTE ENDPOINTS
  // ============================================================================

  @Get('estudiante/mis-planificaciones')
  @Roles(Role.Estudiante)
  @ApiOperation({ summary: 'Obtener planificaciones disponibles para el estudiante' })
  async obtenerPlanificacionesEstudiante(@Request() req: any) {
    // Obtener el estudiante_id del usuario autenticado
    const estudiante = await this.planificacionesService['prisma'].estudiante.findUnique({
      where: { id: req.user.sub },
      select: { id: true },
    });

    if (!estudiante) {
      return [];
    }

    return this.planificacionesService.obtenerPlanificacionesEstudiante(estudiante.id);
  }

  @Post('progreso')
  @Roles(Role.Estudiante)
  @ApiOperation({ summary: 'Actualizar progreso del estudiante en una actividad' })
  async actualizarProgreso(@Body() dto: ActualizarProgresoDto) {
    return this.planificacionesService.actualizarProgreso(dto);
  }

  @Get('estudiante/:planificacionId/progreso')
  @Roles(Role.Estudiante, Role.Docente, Role.Tutor, Role.Admin)
  @ApiOperation({ summary: 'Obtener progreso del estudiante en una planificación' })
  async obtenerProgresoEstudiante(
    @Request() req: any,
    @Param('planificacionId') planificacionId: string,
  ) {
    // Si es estudiante, usar su propio ID
    let estudianteId: string;

    if (req.user.role === 'estudiante') {
      const estudiante = await this.planificacionesService['prisma'].estudiante.findUnique({
        where: { id: req.user.sub },
        select: { id: true },
      });
      estudianteId = estudiante?.id || '';
    } else {
      // Si es docente/tutor/admin, podría pasar el ID del estudiante por query
      // Por ahora retornamos error - se puede extender
      throw new Error('Funcionalidad de ver progreso de otros estudiantes por implementar');
    }

    return this.planificacionesService.obtenerProgresoEstudiante(estudianteId, planificacionId);
  }
}
