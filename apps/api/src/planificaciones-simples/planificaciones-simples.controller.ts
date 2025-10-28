import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, Role } from '../auth/decorators/roles.decorator';
import { RequestWithAuthUser } from '../auth/interfaces';
import { PlanificacionesSimplesService } from './planificaciones-simples.service';

/**
 * Controlador para endpoints de planificaciones simples
 *
 * Rutas Admin:
 * GET    /api/planificaciones - Listar planificaciones
 * GET    /api/planificaciones/:codigo - Detalle planificación
 * POST   /api/planificaciones/:codigo/asignar - Asignar a docente
 *
 * Rutas Estudiante:
 * GET    /api/planificaciones/:codigo/progreso - Obtener progreso
 * PUT    /api/planificaciones/:codigo/progreso - Guardar estado
 * POST   /api/planificaciones/:codigo/progreso/avanzar - Avanzar semana
 * POST   /api/planificaciones/:codigo/progreso/completar-semana - Completar semana
 * POST   /api/planificaciones/:codigo/progreso/tiempo - Registrar tiempo
 */
@Controller('planificaciones')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PlanificacionesSimplesController {
  constructor(private readonly service: PlanificacionesSimplesService) {}

  // ============================================================================
  // ENDPOINTS ADMIN
  // ============================================================================

  /**
   * GET /api/planificaciones
   * Listar todas las planificaciones (Admin)
   */
  @Get()
  @Roles(Role.Admin)
  async listarPlanificaciones(
    @Query('estado') estado?: string,
    @Query('grupo_codigo') grupo_codigo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const filtros: Record<string, string | number> = {};
    if (estado) filtros.estado = estado;
    if (grupo_codigo) filtros.grupo_codigo = grupo_codigo;
    if (mes) filtros.mes = parseInt(mes);
    if (anio) filtros.anio = parseInt(anio);

    return this.service.listarPlanificaciones(filtros);
  }

  // ============================================================================
  // ENDPOINTS ESTUDIANTE (van primero para evitar conflictos de routing)
  // ============================================================================

  /**
   * GET /api/planificaciones/mis-planificaciones
   * Obtener todas las planificaciones del estudiante autenticado
   */
  @Get('mis-planificaciones')
  @Roles(Role.Estudiante)
  async misPlanificaciones(@Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.service.obtenerPlanificacionesEstudiante(estudianteId);
  }

  /**
   * GET /api/planificaciones/:codigo/progreso
   * Obtener progreso del estudiante en una planificación
   */
  @Get(':codigo/progreso')
  @Roles(Role.Estudiante)
  async obtenerProgreso(@Param('codigo') codigo: string, @Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.service.obtenerProgreso(estudianteId, codigo);
  }

  /**
   * PUT /api/planificaciones/:codigo/progreso
   * Guardar estado del juego
   */
  @Put(':codigo/progreso')
  @Roles(Role.Estudiante)
  async guardarEstado(
    @Param('codigo') codigo: string,
    @Request() req: RequestWithAuthUser,
    @Body() body: { estado_guardado: Record<string, unknown> },
  ) {
    const estudianteId = req.user.id;
    return this.service.guardarEstado(
      estudianteId,
      codigo,
      body.estado_guardado,
    );
  }

  /**
   * POST /api/planificaciones/:codigo/progreso/avanzar
   * Avanzar a la siguiente semana
   */
  @Post(':codigo/progreso/avanzar')
  @Roles(Role.Estudiante)
  async avanzarSemana(@Param('codigo') codigo: string, @Request() req: RequestWithAuthUser) {
    const estudianteId = req.user.id;
    return this.service.avanzarSemana(estudianteId, codigo);
  }

  /**
   * POST /api/planificaciones/:codigo/progreso/completar-semana
   * Completar semana con puntos
   */
  @Post(':codigo/progreso/completar-semana')
  @Roles(Role.Estudiante)
  async completarSemana(
    @Param('codigo') codigo: string,
    @Request() req: RequestWithAuthUser,
    @Body() body: { semana: number; puntos: number },
  ) {
    const estudianteId = req.user.id;
    return this.service.completarSemana(
      estudianteId,
      codigo,
      body.semana,
      body.puntos,
    );
  }

  /**
   * POST /api/planificaciones/:codigo/progreso/tiempo
   * Registrar tiempo jugado
   */
  @Post(':codigo/progreso/tiempo')
  @Roles(Role.Estudiante)
  async registrarTiempo(
    @Param('codigo') codigo: string,
    @Request() req: RequestWithAuthUser,
    @Body() body: { minutos: number },
  ) {
    const estudianteId = req.user.id;
    return this.service.registrarTiempo(estudianteId, codigo, body.minutos);
  }

  // ============================================================================
  // ENDPOINTS DOCENTE
  // ============================================================================

  /**
   * GET /api/planificaciones/mis-asignaciones
   * Listar asignaciones del docente autenticado
   */
  @Get('mis-asignaciones')
  @Roles(Role.Docente)
  async misAsignaciones(@Request() req: RequestWithAuthUser) {
    const docenteId = req.user.id;
    return this.service.listarAsignacionesDocente(docenteId);
  }

  /**
   * POST /api/planificaciones/asignacion/:asignacionId/semana/:semana/activar
   * Activar una semana específica
   */
  @Post('asignacion/:asignacionId/semana/:semana/activar')
  @Roles(Role.Docente)
  async activarSemana(
    @Param('asignacionId') asignacionId: string,
    @Param('semana') semana: string,
    @Request() req: RequestWithAuthUser,
  ) {
    const docenteId = req.user.id;
    return this.service.activarSemana(
      asignacionId,
      docenteId,
      parseInt(semana),
    );
  }

  /**
   * POST /api/planificaciones/asignacion/:asignacionId/semana/:semana/desactivar
   * Desactivar una semana específica
   */
  @Post('asignacion/:asignacionId/semana/:semana/desactivar')
  @Roles(Role.Docente)
  async desactivarSemana(
    @Param('asignacionId') asignacionId: string,
    @Param('semana') semana: string,
    @Request() req: RequestWithAuthUser,
  ) {
    const docenteId = req.user.id;
    return this.service.desactivarSemana(
      asignacionId,
      docenteId,
      parseInt(semana),
    );
  }

  /**
   * GET /api/planificaciones/asignacion/:asignacionId/progreso
   * Ver progreso de estudiantes en una asignación
   */
  @Get('asignacion/:asignacionId/progreso')
  @Roles(Role.Docente)
  async verProgresoEstudiantes(
    @Param('asignacionId') asignacionId: string,
    @Request() req: RequestWithAuthUser,
  ) {
    const docenteId = req.user.id;
    return this.service.verProgresoEstudiantes(asignacionId, docenteId);
  }

  // ============================================================================
  // ENDPOINTS ADMIN ESPECÍFICOS (van al final)
  // ============================================================================

  /**
   * GET /api/planificaciones/:codigo/detalle
   * Obtener detalle completo de planificación (Admin)
   */
  @Get(':codigo/detalle')
  @Roles(Role.Admin)
  async obtenerDetalle(@Param('codigo') codigo: string) {
    return this.service.obtenerDetallePlanificacion(codigo);
  }

  /**
   * POST /api/planificaciones/:codigo/asignar
   * Asignar planificación a docente (Admin)
   */
  @Post(':codigo/asignar')
  @Roles(Role.Admin)
  async asignarPlanificacion(
    @Param('codigo') codigo: string,
    @Body() body: { docente_id: string; clase_grupo_id: string },
  ) {
    return this.service.asignarPlanificacion(
      codigo,
      body.docente_id,
      body.clase_grupo_id,
    );
  }
}
