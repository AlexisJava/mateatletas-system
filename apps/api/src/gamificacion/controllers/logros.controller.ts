import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Body,
  Patch,
} from '@nestjs/common';
import { LogrosService } from '../services/logros.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('gamificacion/logros')
@UseGuards(JwtAuthGuard)
export class LogrosController {
  constructor(private logrosService: LogrosService) {}

  /**
   * GET /gamificacion/logros
   * Obtener todos los logros (con filtros opcionales)
   */
  @Get()
  async obtenerLogros(
    @Query('categoria') categoria?: string,
    @Query('rareza') rareza?: string,
  ) {
    return this.logrosService.obtenerLogros({
      categoria,
      rareza,
      activo: true,
    });
  }

  /**
   * GET /gamificacion/logros/estudiante/:estudianteId
   * Obtener logros desbloqueados por estudiante
   */
  @Get('estudiante/:estudianteId')
  async obtenerLogrosEstudiante(@Param('estudianteId') estudianteId: string) {
    return this.logrosService.obtenerLogrosEstudiante(estudianteId);
  }

  /**
   * GET /gamificacion/logros/estudiante/:estudianteId/progreso
   * Obtener progreso general de logros
   */
  @Get('estudiante/:estudianteId/progreso')
  async obtenerProgreso(@Param('estudianteId') estudianteId: string) {
    const [progreso, porCategoria, porRareza] = await Promise.all([
      this.logrosService.obtenerProgresoLogros(estudianteId),
      this.logrosService.obtenerLogrosPorCategoria(estudianteId),
      this.logrosService.obtenerEstadisticasRareza(estudianteId),
    ]);

    return {
      general: progreso,
      por_categoria: porCategoria,
      por_rareza: porRareza,
    };
  }

  /**
   * GET /gamificacion/logros/estudiante/:estudianteId/no-vistos
   * Obtener logros no vistos (notificaciones)
   */
  @Get('estudiante/:estudianteId/no-vistos')
  async obtenerLogrosNoVistos(@Param('estudianteId') estudianteId: string) {
    return this.logrosService.obtenerLogrosNoVistos(estudianteId);
  }

  /**
   * PATCH /gamificacion/logros/estudiante/:estudianteId/:logroId/visto
   * Marcar logro como visto
   */
  @Patch('estudiante/:estudianteId/:logroId/visto')
  async marcarLogroVisto(
    @Param('estudianteId') estudianteId: string,
    @Param('logroId') logroId: string,
  ) {
    await this.logrosService.marcarLogroVisto(estudianteId, logroId);
    return { success: true };
  }

  /**
   * POST /gamificacion/logros/desbloquear
   * Desbloquear logro manualmente (admin/test)
   */
  @Post('desbloquear')
  async desbloquearLogro(
    @Body() body: { estudianteId: string; codigoLogro: string },
  ) {
    return this.logrosService.desbloquearLogro(
      body.estudianteId,
      body.codigoLogro,
    );
  }
}
