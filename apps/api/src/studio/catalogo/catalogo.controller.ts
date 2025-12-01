import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ComponenteCatalogo } from '@prisma/client';
import { CatalogoService } from './catalogo.service';
import { ToggleComponenteDto } from './dto/toggle-componente.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Role } from '../../domain/constants/roles.constants';

@Controller('studio/catalogo')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CatalogoController {
  constructor(private readonly catalogoService: CatalogoService) {}

  @Get()
  @Roles(Role.ADMIN)
  async listar(): Promise<ComponenteCatalogo[]> {
    return this.catalogoService.listar();
  }

  @Get('habilitados')
  @Roles(Role.ADMIN)
  async listarHabilitados(): Promise<ComponenteCatalogo[]> {
    return this.catalogoService.listarHabilitados();
  }

  @Get(':tipo')
  @Roles(Role.ADMIN)
  async obtenerPorTipo(
    @Param('tipo') tipo: string,
  ): Promise<ComponenteCatalogo> {
    return this.catalogoService.obtenerPorTipo(tipo);
  }

  @Patch(':tipo/toggle')
  @Roles(Role.ADMIN)
  async toggle(
    @Param('tipo') tipo: string,
    @Body() dto: ToggleComponenteDto,
  ): Promise<ComponenteCatalogo> {
    return this.catalogoService.toggle(tipo, dto.habilitado);
  }
}
