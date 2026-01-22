import {
  IsOptional,
  IsEnum,
  IsString,
  IsDateString,
  IsBoolean,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  TipoObservacion,
  PrioridadObservacion,
  EstadoObservacion,
} from '@prisma/client';

/**
 * DTO para filtrar observaciones en consultas
 *
 * Reglas de negocio:
 * - RN-040: Docente solo ve sus propias observaciones (filtrar en service)
 * - RN-041: ADMIN y PEDAGOGIA ven todas las observaciones
 * - RN-042: Por defecto, ordenar por createdAt DESC
 * - RN-043: Filtros disponibles: tipo, prioridad, estado, fecha, estudiante, comisión
 */
export class FiltrarObservacionesDto {
  @IsOptional()
  @IsEnum(TipoObservacion, {
    message: `tipo debe ser uno de: ${Object.values(TipoObservacion).join(', ')}`,
  })
  tipo?: TipoObservacion;

  @IsOptional()
  @IsEnum(PrioridadObservacion, {
    message: `prioridad debe ser uno de: ${Object.values(PrioridadObservacion).join(', ')}`,
  })
  prioridad?: PrioridadObservacion;

  @IsOptional()
  @IsEnum(EstadoObservacion, {
    message: `estado debe ser uno de: ${Object.values(EstadoObservacion).join(', ')}`,
  })
  estado?: EstadoObservacion;

  @IsOptional()
  @IsString({ message: 'estudianteId debe ser un string' })
  estudianteId?: string;

  @IsOptional()
  @IsString({ message: 'comisionId debe ser un string' })
  comisionId?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaDesde debe ser una fecha válida ISO' })
  fechaDesde?: string;

  @IsOptional()
  @IsDateString({}, { message: 'fechaHasta debe ser una fecha válida ISO' })
  fechaHasta?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean({ message: 'requiereSeguimiento debe ser un booleano' })
  requiereSeguimiento?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit debe ser un número entero' })
  @Min(1, { message: 'limit debe ser al menos 1' })
  @Max(100, { message: 'limit no puede exceder 100' })
  limit?: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset debe ser un número entero' })
  @Min(0, { message: 'offset debe ser al menos 0' })
  offset?: number = 0;
}
