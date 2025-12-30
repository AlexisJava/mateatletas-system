import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ParseIdPipe } from '../common/pipes';
import { CasaTipo } from '@prisma/client';
import { CasasService } from './casas.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DeterminarCasaDto } from './dto/determinar-casa.dto';

/**
 * Controlador REST para gestionar Casas
 * Sistema de casas Mateatletas 2026
 *
 * Rutas disponibles:
 * - GET /api/casas - Listar las 3 casas
 * - GET /api/casas/estadisticas - Estadísticas de todas las casas
 * - GET /api/casas/:id - Detalle de una casa
 * - GET /api/casas/:id/ranking - Ranking interno de una casa
 * - POST /api/casas/determinar - Determinar casa por edad
 */
@Controller('casas')
@UseGuards(JwtAuthGuard)
export class CasasController {
  constructor(private readonly casasService: CasasService) {}

  /**
   * Listar todas las casas
   * GET /api/casas
   *
   * @returns Lista de las 3 casas con conteo de estudiantes
   */
  @Get()
  findAll(): ReturnType<CasasService['findAll']> {
    return this.casasService.findAll();
  }

  /**
   * Obtener estadísticas de todas las casas
   * GET /api/casas/estadisticas
   *
   * IMPORTANTE: Esta ruta debe ir ANTES de /:id
   */
  @Get('estadisticas')
  getEstadisticas(): ReturnType<CasasService['getEstadisticas']> {
    return this.casasService.getEstadisticas();
  }

  /**
   * Determinar casa por edad
   * POST /api/casas/determinar
   *
   * Body: { edad: number }
   * @returns { casaTipo: CasaTipo }
   */
  @Post('determinar')
  @HttpCode(HttpStatus.OK)
  determinarCasa(@Body() dto: DeterminarCasaDto): { casaTipo: CasaTipo } {
    const casaTipo = this.casasService.determinarCasaPorEdad(dto.edad);
    return { casaTipo };
  }

  /**
   * Obtener detalle de una casa
   * GET /api/casas/:id
   */
  @Get(':id')
  findOne(
    @Param('id', ParseIdPipe) id: string,
  ): ReturnType<CasasService['findOne']> {
    return this.casasService.findOne(id);
  }

  /**
   * Obtener ranking interno de una casa
   * GET /api/casas/:id/ranking
   */
  @Get(':id/ranking')
  getRankingInterno(
    @Param('id', ParseIdPipe) id: string,
  ): ReturnType<CasasService['getRankingInterno']> {
    return this.casasService.getRankingInterno(id);
  }

  /**
   * Recalcular puntos de una casa
   * POST /api/casas/:id/recalcular-puntos
   */
  @Post(':id/recalcular-puntos')
  @HttpCode(HttpStatus.OK)
  recalcularPuntos(
    @Param('id', ParseIdPipe) id: string,
  ): ReturnType<CasasService['recalcularPuntos']> {
    return this.casasService.recalcularPuntos(id);
  }
}
