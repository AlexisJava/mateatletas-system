import { Controller, Get, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Controller para Grupos Pedagógicos
 *
 * Endpoints públicos para obtener información de grupos (B1, B2, B3, etc.)
 */
@ApiTags('Grupos')
@Controller('grupos')
export class GruposController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * GET /api/grupos
   * Obtener lista de grupos pedagógicos activos
   */
  @Get()
  @ApiOperation({ summary: 'Listar grupos pedagógicos activos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de grupos activos',
    schema: {
      example: [
        {
          id: 'b5ac168d-1b44-4357-8e73-4339db2fa77c',
          codigo: 'B1',
          nombre: 'Básico 1',
          descripcion: 'Grupo básico nivel 1 - Fundamentos matemáticos iniciales',
          edad_minima: 6,
          edad_maxima: 7,
        },
      ],
    },
  })
  async getGrupos() {
    const grupos = await this.prisma.grupo.findMany({
      where: { activo: true },
      select: {
        id: true,
        codigo: true,
        nombre: true,
        descripcion: true,
        edad_minima: true,
        edad_maxima: true,
      },
      orderBy: { codigo: 'asc' },
    });

    return grupos;
  }
}
