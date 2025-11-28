import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { TierNombre } from '@prisma/client';
import { TiersService } from './tiers.service';

/**
 * Controller para gestión de Tiers - Sistema Mateatletas 2026
 *
 * Endpoints públicos para consultar información de tiers.
 * Los endpoints de cambio de tier están en el módulo de inscripciones.
 */
@Controller('tiers')
export class TiersController {
  constructor(private readonly tiersService: TiersService) {}

  /**
   * GET /tiers
   * Lista todos los tiers activos ordenados por precio
   */
  @Get()
  async findAll() {
    return this.tiersService.findAll();
  }

  /**
   * GET /tiers/nombre/:nombre
   * Obtiene un tier por su nombre (ARCADE, ARCADE_PLUS, PRO)
   */
  @Get('nombre/:nombre')
  async findByNombre(
    @Param('nombre', new ParseEnumPipe(TierNombre)) nombre: TierNombre,
  ) {
    return this.tiersService.findByNombre(nombre);
  }

  /**
   * GET /tiers/:id
   * Obtiene un tier por su ID
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.tiersService.findOne(id);
  }
}
