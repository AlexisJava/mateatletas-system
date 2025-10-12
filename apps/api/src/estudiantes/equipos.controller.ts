import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

/**
 * Controller para endpoints de equipos
 * Gestiona la obtención de equipos disponibles
 */
@Controller('equipos')
@UseGuards(JwtAuthGuard)
export class EquiposController {
  constructor(private prisma: PrismaService) {}

  /**
   * GET /equipos - Obtener todos los equipos disponibles
   * @returns Lista de equipos
   */
  @Get()
  async findAll() {
    return this.prisma.equipo.findMany({
      orderBy: {
        nombre: 'asc',
      },
    });
  }
}
