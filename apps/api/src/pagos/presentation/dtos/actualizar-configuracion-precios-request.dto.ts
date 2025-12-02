import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsInt,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO de Request para actualizar configuración de precios
 * Presentation Layer - Validación HTTP con class-validator
 *
 * Sistema de Tiers 2026:
 * - Arcade: $30.000/mes - 1 mundo async
 * - Arcade+: $60.000/mes - 3 mundos async
 * - Pro: $75.000/mes - 1 mundo async + 1 mundo sync con docente
 *
 * Descuentos familiares:
 * - 2do hermano: 12%
 * - 3er hermano en adelante: 20%
 *
 * IMPORTANTE:
 * - Los precios en ARS DEBEN ser números enteros (sin centavos)
 * - Los porcentajes pueden tener decimales
 * - Se convertirán a Decimal en el Service antes de llamar al Use Case
 */
export class ActualizarConfiguracionPreciosRequestDto {
  @ApiProperty({
    description: 'ID del administrador que realiza el cambio',
    example: 'clt1abc123',
  })
  @IsString()
  adminId!: string;

  // =========================================================================
  // PRECIOS POR TIER (Sistema 2026)
  // =========================================================================

  @ApiProperty({
    description: 'Precio mensual del Tier Arcade (1 mundo async, sin docente)',
    example: 30000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: 'El precio de Arcade debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioArcade?: number;

  @ApiProperty({
    description:
      'Precio mensual del Tier Arcade+ (3 mundos async, sin docente)',
    example: 60000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: 'El precio de Arcade+ debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioArcadePlus?: number;

  @ApiProperty({
    description:
      'Precio mensual del Tier Pro (1 mundo async + 1 mundo sync con docente)',
    example: 75000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message: 'El precio de Pro debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioPro?: number;

  // =========================================================================
  // DESCUENTOS FAMILIARES
  // =========================================================================

  @ApiProperty({
    description: 'Porcentaje de descuento para el 2do hermano',
    example: 12,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  descuentoHermano2?: number;

  @ApiProperty({
    description: 'Porcentaje de descuento para el 3er hermano en adelante',
    example: 20,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  descuentoHermano3Mas?: number;

  // =========================================================================
  // CONFIGURACIÓN DE NOTIFICACIONES
  // =========================================================================

  @ApiProperty({
    description: 'Día de vencimiento (1-31)',
    example: 15,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  @Type(() => Number)
  diaVencimiento?: number;

  @ApiProperty({
    description: 'Días antes del vencimiento para recordatorio',
    example: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(30)
  @Type(() => Number)
  diasAntesRecordatorio?: number;

  @ApiProperty({
    description: 'Estado de las notificaciones',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  notificacionesActivas?: boolean;

  // =========================================================================
  // AUDITORÍA
  // =========================================================================

  @ApiProperty({
    description: 'Motivo del cambio (para auditoría)',
    example: 'Ajuste de precios para ciclo 2026',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivoCambio?: string;
}
