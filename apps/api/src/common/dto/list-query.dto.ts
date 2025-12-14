import { IntersectionType } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from './pagination.dto';
import { DateFilterQueryDto } from './date-filter-query.dto';

/**
 * DTO combinado para listados con paginación, filtros de fecha y búsqueda
 * Útil para endpoints de listados generales
 */
export class ListQueryDto extends IntersectionType(
  PaginationDto,
  DateFilterQueryDto,
) {
  @ApiPropertyOptional({ description: 'Término de búsqueda', maxLength: 100 })
  @IsOptional()
  @IsString()
  @MaxLength(100, {
    message: 'El término de búsqueda no puede exceder 100 caracteres',
  })
  search?: string;
}
