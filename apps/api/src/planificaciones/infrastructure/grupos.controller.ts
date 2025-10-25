import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { PrismaService } from '../../core/database/prisma.service';
import { IsString, IsOptional, IsInt, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO para crear un nuevo grupo pedagógico
 */
export class CreateGrupoDto {
  @IsString()
  codigo!: string;

  @IsString()
  nombre!: string;

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
   * Obtener lista de grupos pedagógicos
   *
   * @param activo - Filtrar por estado: 'true', 'false', o undefined (todos)
   */
  @Get()
  @ApiOperation({ summary: 'Listar grupos pedagógicos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de grupos',
    schema: {
      example: [
        {
          id: 'b5ac168d-1b44-4357-8e73-4339db2fa77c',
          codigo: 'B1',
          nombre: 'Básico 1',
          descripcion: 'Grupo básico nivel 1 - Fundamentos matemáticos iniciales',
          edad_minima: 6,
          edad_maxima: 7,
          activo: true,
        },
      ],
    },
  })
  async getGrupos(@Query('activo') activo?: string) {
    // Construir el where dinámicamente
    const where: any = {};

    // Si activo es 'true' o 'false', filtrar por ese estado
    // Si no se pasa o es cualquier otra cosa, traer todos
    if (activo === 'true') {
      where.activo = true;
    } else if (activo === 'false') {
      where.activo = false;
    }
    // Si activo es undefined o cualquier otro valor, no agregamos filtro (traemos todos)

    const grupos = await this.prisma.grupo.findMany({
      where,
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
    if (
      dto.edad_minima !== undefined &&
      dto.edad_maxima !== undefined &&
      dto.edad_minima > dto.edad_maxima
    ) {
      throw new BadRequestException('La edad mínima no puede ser mayor que la edad máxima');
    }

    // Verificar si ya existe un grupo con el mismo código
    const existente = await this.prisma.grupo.findUnique({
      where: { codigo: dto.codigo },
    });

    if (existente) {
      throw new ConflictException(`Ya existe un grupo con el código "${dto.codigo}"`);
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
      throw new NotFoundException(`Grupo con ID "${id}" no encontrado`);
    }

    // Si se está cambiando el código, verificar que no exista otro grupo con ese código
    if (dto.codigo && dto.codigo !== existente.codigo) {
      const otroGrupo = await this.prisma.grupo.findUnique({
        where: { codigo: dto.codigo },
      });

      if (otroGrupo) {
        throw new ConflictException(`Ya existe otro grupo con el código "${dto.codigo}"`);
      }
    }

    const edadMinima = dto.edad_minima ?? existente.edad_minima ?? undefined;
    const edadMaxima = dto.edad_maxima ?? existente.edad_maxima ?? undefined;

    if (edadMinima !== undefined && edadMaxima !== undefined && edadMinima > edadMaxima) {
      throw new BadRequestException('La edad mínima no puede ser mayor que la edad máxima');
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
      throw new NotFoundException(`Grupo con ID "${id}" no encontrado`);
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

  /**
   * GET /api/grupos/:id/planificaciones
   * Obtener todas las planificaciones de un grupo pedagógico
   */
  @Get(':id/planificaciones')
  @ApiOperation({ summary: 'Obtener planificaciones de un grupo' })
  @ApiParam({ name: 'id', description: 'ID del grupo pedagógico' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Planificaciones obtenidas exitosamente' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Grupo no encontrado' })
  async getPlanificacionesByGrupo(
    @Param('id') id: string,
    @Query('anio') anio?: string,
  ) {
    // Verificar que el grupo existe
    const grupo = await this.prisma.grupo.findUnique({
      where: { id },
    });

    if (!grupo) {
      throw new NotFoundException(`Grupo con ID "${id}" no encontrado`);
    }

    const where: { grupo_id: string; anio?: number } = {
      grupo_id: id,
    };

    if (anio) {
      const parsedYear = parseInt(anio, 10);

      if (Number.isNaN(parsedYear)) {
        throw new BadRequestException('El parámetro "anio" debe ser un número válido');
      }

      where.anio = parsedYear;
    }

    const planificaciones = await this.prisma.planificacionMensual.findMany({
      where,
      include: {
        grupo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
          },
        },
        _count: {
          select: {
            actividades: true,
          },
        },
      },
      orderBy: [
        { anio: 'desc' },
        { mes: 'asc' },
      ],
    });

    return planificaciones;
  }
}
