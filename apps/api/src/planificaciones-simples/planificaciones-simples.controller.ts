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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
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
  @Roles('admin')
  async listarPlanificaciones(
    @Query('estado') estado?: string,
    @Query('grupo_codigo') grupo_codigo?: string,
    @Query('mes') mes?: string,
    @Query('anio') anio?: string,
  ) {
    const filtros: any = {};
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
   * GET /api/planificaciones/:codigo/progreso
   * Obtener progreso del estudiante en una planificación
   */
  @Get(':codigo/progreso')
  @Roles('estudiante')
  async obtenerProgreso(@Param('codigo') codigo: string, @Request() req: any) {
    const estudianteId = req.user.sub;
    return this.service.obtenerProgreso(estudianteId, codigo);
  }

  /**
   * PUT /api/planificaciones/:codigo/progreso
   * Guardar estado del juego
   */
  @Put(':codigo/progreso')
  @Roles('estudiante')
  async guardarEstado(
    @Param('codigo') codigo: string,
    @Request() req: any,
    @Body() body: { estado_guardado: any },
  ) {
    const estudianteId = req.user.sub;
    return this.service.guardarEstado(estudianteId, codigo, body.estado_guardado);
  }

  /**
   * POST /api/planificaciones/:codigo/progreso/avanzar
   * Avanzar a la siguiente semana
   */
  @Post(':codigo/progreso/avanzar')
  @Roles('estudiante')
  async avanzarSemana(@Param('codigo') codigo: string, @Request() req: any) {
    const estudianteId = req.user.sub;
    return this.service.avanzarSemana(estudianteId, codigo);
  }

  /**
   * POST /api/planificaciones/:codigo/progreso/completar-semana
   * Completar semana con puntos
   */
  @Post(':codigo/progreso/completar-semana')
  @Roles('estudiante')
  async completarSemana(
    @Param('codigo') codigo: string,
    @Request() req: any,
    @Body() body: { semana: number; puntos: number },
  ) {
    const estudianteId = req.user.sub;
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
  @Roles('estudiante')
  async registrarTiempo(
    @Param('codigo') codigo: string,
    @Request() req: any,
    @Body() body: { minutos: number },
  ) {
    const estudianteId = req.user.sub;
    return this.service.registrarTiempo(estudianteId, codigo, body.minutos);
  }

  // ============================================================================
  // ENDPOINTS ADMIN ESPECÍFICOS (van al final)
  // ============================================================================

  /**
   * GET /api/planificaciones/:codigo/detalle
   * Obtener detalle completo de planificación (Admin)
   */
  @Get(':codigo/detalle')
  @Roles('admin')
  async obtenerDetalle(@Param('codigo') codigo: string) {
    return this.service.obtenerDetallePlanificacion(codigo);
  }

  /**
   * POST /api/planificaciones/:codigo/asignar
   * Asignar planificación a docente (Admin)
   */
  @Post(':codigo/asignar')
  @Roles('admin')
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
