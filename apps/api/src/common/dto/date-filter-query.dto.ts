import { IsOptional, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO genérico para filtros de fecha
 * Usar en endpoints que filtran por rango de fechas
 */
export class DateFilterQueryDto {
  @ApiPropertyOptional({
    description: 'Fecha inicio (ISO 8601)',
    example: '2025-01-01',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'fechaInicio debe ser una fecha válida ISO 8601' },
  )
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha fin (ISO 8601)',
    example: '2025-12-31',
  })
  @IsOptional()
  @IsDateString({}, { message: 'fechaFin debe ser una fecha válida ISO 8601' })
  fechaFin?: string;
}
