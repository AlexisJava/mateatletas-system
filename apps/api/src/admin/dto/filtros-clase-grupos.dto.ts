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
  anio_lectivo?: number;

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
  docente_id?: string;

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
  grupo_id?: string;
}
