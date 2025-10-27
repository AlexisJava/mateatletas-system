import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsInt, Min, Max, IsString } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO HTTP para obtener métricas del dashboard
 * Presentation Layer - Validación con class-validator
 */
export class ObtenerMetricasDashboardRequestDto {
  @ApiProperty({
    description:
      'Año para consultar métricas (opcional, por defecto año actual)',
    example: 2025,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2024)
  @Max(2100)
  anio?: number;

  @ApiProperty({
    description:
      'Mes para consultar métricas (opcional, por defecto mes actual)',
    example: 1,
    minimum: 1,
    maximum: 12,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  mes?: number;

  @ApiProperty({
    description:
      'ID del tutor para filtrar métricas (opcional, si no se envía muestra todas)',
    example: 'tutor-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsString()
  tutorId?: string;
}
