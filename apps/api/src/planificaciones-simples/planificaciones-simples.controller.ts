import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
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
 * Rutas:
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
}
