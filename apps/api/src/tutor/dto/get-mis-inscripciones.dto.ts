import { IsString, IsOptional, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Estados de pago posibles para inscripciones
 */
export enum EstadoPagoFilter {
  PENDIENTE = 'Pendiente',
  PAGADO = 'Pagado',
  VENCIDO = 'Vencido',
}

/**
 * Query DTO para obtener inscripciones de un tutor
 * Los filtros son opcionales
 */
export class GetMisInscripcionesDto {
  @ApiProperty({
    description: 'Período en formato YYYY-MM (ej: 2025-01). Opcional.',
    example: '2025-01',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}$/, {
    message: 'El periodo debe tener formato YYYY-MM (ej: 2025-01)',
  })
  periodo?: string;

  @ApiProperty({
    description: 'Filtrar por estado de pago',
    enum: EstadoPagoFilter,
    required: false,
  })
  @IsOptional()
  @IsEnum(EstadoPagoFilter, {
    message: 'El estado de pago debe ser uno de: Pendiente, Pagado, Vencido',
  })
  estadoPago?: EstadoPagoFilter;
}
