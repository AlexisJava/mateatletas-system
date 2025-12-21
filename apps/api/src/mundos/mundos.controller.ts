import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MundoTipo } from '@prisma/client';
import { MundosService } from './mundos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controlador REST para gestionar Mundos STEAM
 * Sistema de mundos Mateatletas
 *
 * Rutas disponibles:
 * - GET /api/mundos - Listar los 3 mundos
 * - GET /api/mundos/:id - Detalle de un mundo
 * - GET /api/mundos/tipo/:tipo - Obtener mundo por tipo
 */
@Controller('mundos')
@UseGuards(JwtAuthGuard)
export class MundosController {
  constructor(private readonly mundosService: MundosService) {}

  /**
   * Listar todos los mundos activos
   * GET /api/mundos
   *
   * @returns Lista de los 3 mundos ordenados
   */
  @Get()
  findAll(): ReturnType<MundosService['findAll']> {
    return this.mundosService.findAll();
  }

  /**
   * Obtener mundo por tipo
   * GET /api/mundos/tipo/:tipo
   *
   * IMPORTANTE: Esta ruta debe ir ANTES de /:id
   */
  @Get('tipo/:tipo')
  findByTipo(
    @Param('tipo') tipo: MundoTipo,
  ): ReturnType<MundosService['findByTipo']> {
    return this.mundosService.findByTipo(tipo);
  }

  /**
   * Obtener detalle de un mundo
   * GET /api/mundos/:id
   */
  @Get(':id')
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): ReturnType<MundosService['findOne']> {
    return this.mundosService.findOne(id);
  }
}
