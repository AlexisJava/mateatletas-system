import {
  IsOptional,
  IsString,
  IsBoolean,
  IsEnum,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoClaseGrupo } from '@prisma/client';

/**
 * DTO para filtros de listado de ClaseGrupos
 *
 * NOTA: Usamos camelCase para consistencia con el frontend (JavaScript conventions)
 */
export class FiltrosClaseGruposDto {
  @ApiPropertyOptional({
    description: 'Filtrar por año lectivo',
    example: 2025,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  anioLectivo?: number;

  @ApiPropertyOptional({
    description: 'Filtrar por estado activo/inactivo',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  activo?: boolean;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del docente',
    example: 'clxxx123',
  })
  @IsOptional()
  @IsString()
  docenteId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por tipo de grupo',
    enum: TipoClaseGrupo,
  })
  @IsOptional()
  @IsEnum(TipoClaseGrupo)
  tipo?: TipoClaseGrupo;

  @ApiPropertyOptional({
    description: 'Filtrar por ID del grupo padre',
    example: 'clxxx456',
  })
  @IsOptional()
  @IsString()
  grupoId?: string;

  @ApiPropertyOptional({
    description:
      'Filtrar por ID del producto (para listar horarios de un Club)',
    example: 'clxxx789',
  })
  @IsOptional()
  @IsString()
  productoId?: string;
}
