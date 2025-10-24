import { IsOptional, IsString, IsInt, IsEnum, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPlanificacion } from '@prisma/client';
import { Type } from 'class-transformer';

/**
 * DTO for querying planifications
 *
 * Validates query parameters for GET /api/planificaciones endpoint.
 * All fields are optional to allow flexible filtering.
 */
export class GetPlanificacionesQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by group code',
    example: 'B1',
  })
  @IsOptional()
  @IsString()
  codigo_grupo?: string;

  @ApiPropertyOptional({
    description: 'Filter by month (1-12)',
    example: 11,
    minimum: 1,
    maximum: 12,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @ApiPropertyOptional({
    description: 'Filter by year',
    example: 2025,
    minimum: 2024,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  anio?: number;

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: EstadoPlanificacion,
    example: EstadoPlanificacion.PUBLICADA,
  })
  @IsOptional()
  @IsEnum(EstadoPlanificacion)
  estado?: EstadoPlanificacion;

  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
