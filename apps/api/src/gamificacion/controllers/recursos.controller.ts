import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ParseIdPipe } from '../../common/pipes';
import { RecursosService } from '../services/recursos.service';
import { RachaService } from '../services/racha.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles, Role } from '../../auth/decorators/roles.decorator';

@Controller('gamificacion/recursos')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ESTUDIANTE, Role.TUTOR, Role.DOCENTE, Role.ADMIN)
export class RecursosController {
  constructor(
    private recursosService: RecursosService,
    private rachaService: RachaService,
  ) {}

  /**
   * GET /gamificacion/recursos/:estudianteId
   * Obtener recursos completos con nivel
   */
  @Get(':estudianteId')
  async obtenerRecursos(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    const recursos =
      await this.recursosService.obtenerRecursosConNivel(estudianteId);
    const racha = await this.rachaService.obtenerEstadisticas(estudianteId);

    return {
      ...recursos,
      racha,
    };
  }

  /**
   * GET /gamificacion/recursos/:estudianteId/historial
   * Obtener historial de transacciones
   */
  @Get(':estudianteId/historial')
  async obtenerHistorial(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    return this.recursosService.obtenerHistorial(estudianteId);
  }

  /**
   * POST /gamificacion/recursos/:estudianteId/racha
   * Registrar actividad del día (actualiza racha)
   */
  @Post(':estudianteId/racha')
  async registrarActividad(
    @Param('estudianteId', ParseIdPipe) estudianteId: string,
  ) {
    return this.rachaService.registrarActividad(estudianteId);
  }

  /**
   * GET /gamificacion/recursos/:estudianteId/racha
   * Obtener estadísticas de racha
   */
  @Get(':estudianteId/racha')
  async obtenerRacha(@Param('estudianteId', ParseIdPipe) estudianteId: string) {
    return this.rachaService.obtenerEstadisticas(estudianteId);
  }
}
