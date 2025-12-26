import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CasaTipo, MundoTipo, EstadoContenido } from '@prisma/client';

/**
 * DTO para filtrar y paginar la lista de contenidos
 * Usado en endpoints de admin para listar/buscar contenidos
 */
export class QueryContenidosDto {
  /**
   * Filtrar por estado del contenido
   */
  @ApiPropertyOptional({
    description: 'Filtrar por estado',
    enum: EstadoContenido,
    example: EstadoContenido.BORRADOR,
  })
  @IsOptional()
  @IsEnum(EstadoContenido, {
    message: 'El estado debe ser: BORRADOR, PUBLICADO o ARCHIVADO',
  })
  estado?: EstadoContenido;

  /**
   * Filtrar por casa objetivo
   */
  @ApiPropertyOptional({
    description: 'Filtrar por casa',
    enum: CasaTipo,
    example: CasaTipo.QUANTUM,
  })
  @IsOptional()
  @IsEnum(CasaTipo, {
    message: 'La casa debe ser: QUANTUM, VERTEX o PULSAR',
  })
  casaTipo?: CasaTipo;

  /**
   * Filtrar por mundo/materia
   */
  @ApiPropertyOptional({
    description: 'Filtrar por mundo/materia',
    enum: MundoTipo,
    example: MundoTipo.MATEMATICA,
  })
  @IsOptional()
  @IsEnum(MundoTipo, {
    message: 'El mundo debe ser: MATEMATICA, PROGRAMACION o CIENCIAS',
  })
  mundoTipo?: MundoTipo;

  /**
   * Número de página (paginación)
   */
  @ApiPropertyOptional({
    description: 'Número de página (paginación)',
    example: 1,
    minimum: 1,
    default: 1,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'La página debe ser un número entero' })
  @Min(1, { message: 'La página mínima es 1' })
  @Type(() => Number)
  page?: number = 1;

  /**
   * Cantidad de elementos por página
   */
  @ApiPropertyOptional({
    description: 'Cantidad de elementos por página',
    example: 10,
    minimum: 1,
    maximum: 50,
    default: 10,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El límite debe ser un número entero' })
  @Min(1, { message: 'El límite mínimo es 1' })
  @Max(50, { message: 'El límite máximo es 50 elementos por página' })
  @Type(() => Number)
  limit?: number = 10;

  /**
   * Calcula el offset para Prisma skip
   */
  get skip(): number {
    const page = this.page ?? 1;
    const limit = this.limit ?? 10;
    return (page - 1) * limit;
  }

  /**
   * Alias para limit (para Prisma take)
   */
  get take(): number {
    return this.limit ?? 10;
  }
}
