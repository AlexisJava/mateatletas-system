import { Controller, Get, Post, Put, Delete, Body, Param, HttpStatus, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PrismaService } from '../../core/database/prisma.service';
import { IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO para crear un nuevo grupo pedagógico
 */
export class CreateGrupoDto {
  @IsString()
  codigo: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  edad_minima?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  edad_maxima?: number;

  @IsOptional()
  @IsString()
  sector_id?: string;
}

/**
 * DTO para actualizar un grupo pedagógico
 */
export class UpdateGrupoDto {
  @IsOptional()
  @IsString()
  codigo?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  edad_minima?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(99)
  edad_maxima?: number;

  @IsOptional()
  @IsString()
  sector_id?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}

/**
 * Controller para Grupos Pedagógicos
 *
 * CRUD completo para gestionar grupos pedagógicos (B1, B2, Roblox, Ajedrez, etc.)
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
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { codigo: 'asc' },
    });

    return grupos;
  }

  /**
   * POST /api/grupos
   * Crear un nuevo grupo pedagógico
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Crear nuevo grupo pedagógico' })
  @ApiBody({ type: CreateGrupoDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Grupo creado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Ya existe un grupo con ese código',
  })
  async createGrupo(@Body() dto: CreateGrupoDto) {
    // Verificar si ya existe un grupo con el mismo código
    const existente = await this.prisma.grupo.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existente) {
      throw new Error(`Ya existe un grupo con el código "${dto.codigo}"`);
    }

    const grupo = await this.prisma.grupo.create({
      data: {
        codigo: dto.codigo,
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        edad_minima: dto.edad_minima,
        edad_maxima: dto.edad_maxima,
        sector_id: dto.sector_id,
        activo: true,
      },
    });

    return grupo;
  }

  /**
   * PUT /api/grupos/:id
   * Actualizar un grupo pedagógico
   */
  @Put(':id')
  @ApiOperation({ summary: 'Actualizar grupo pedagógico' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiBody({ type: UpdateGrupoDto })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grupo actualizado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Grupo no encontrado',
  })
  async updateGrupo(@Param('id') id: string, @Body() dto: UpdateGrupoDto) {
    // Verificar que existe
    const existente = await this.prisma.grupo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new Error(`Grupo con ID "${id}" no encontrado`);
    }

    // Si se está cambiando el código, verificar que no exista otro grupo con ese código
    if (dto.codigo && dto.codigo !== existente.codigo) {
      const otroGrupo = await this.prisma.grupo.findUnique({
        where: { codigo: dto.codigo },
      });

      if (otroGrupo) {
        throw new Error(`Ya existe otro grupo con el código "${dto.codigo}"`);
      }
    }

    const grupo = await this.prisma.grupo.update({
      where: { id },
      data: dto,
    });

    return grupo;
  }

  /**
   * DELETE /api/grupos/:id
   * Eliminar (desactivar) un grupo pedagógico
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Eliminar grupo pedagógico' })
  @ApiParam({ name: 'id', description: 'ID del grupo' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Grupo desactivado exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Grupo no encontrado',
  })
  async deleteGrupo(@Param('id') id: string) {
    // Verificar que existe
    const existente = await this.prisma.grupo.findUnique({
      where: { id },
    });

    if (!existente) {
      throw new Error(`Grupo con ID "${id}" no encontrado`);
    }

    // Soft delete: marcar como inactivo en vez de eliminar
    const grupo = await this.prisma.grupo.update({
      where: { id },
      data: { activo: false },
    });

    return {
      message: 'Grupo desactivado exitosamente',
      grupo,
    };
  }
}
