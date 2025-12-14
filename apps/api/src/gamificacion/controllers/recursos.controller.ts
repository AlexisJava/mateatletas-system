import {
  Controller,
  Get,
  Post,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RecursosService } from '../services/recursos.service';
import { RachaService } from '../services/racha.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('gamificacion/recursos')
@UseGuards(JwtAuthGuard)
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
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
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
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    return this.recursosService.obtenerHistorial(estudianteId);
  }

  /**
   * POST /gamificacion/recursos/:estudianteId/racha
   * Registrar actividad del día (actualiza racha)
   */
  @Post(':estudianteId/racha')
  async registrarActividad(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    return this.rachaService.registrarActividad(estudianteId);
  }

  /**
   * GET /gamificacion/recursos/:estudianteId/racha
   * Obtener estadísticas de racha
   */
  @Get(':estudianteId/racha')
  async obtenerRacha(
    @Param('estudianteId', ParseUUIDPipe) estudianteId: string,
  ) {
    return this.rachaService.obtenerEstadisticas(estudianteId);
  }
}
