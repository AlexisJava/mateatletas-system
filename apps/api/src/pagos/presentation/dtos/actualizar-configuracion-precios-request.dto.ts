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
 * Sistema STEAM 2026:
 * - STEAM_LIBROS: $40.000/mes - Plataforma completa (Mate + Progra + Ciencias)
 * - STEAM_ASINCRONICO: $65.000/mes - Todo + clases grabadas
 * - STEAM_SINCRONICO: $95.000/mes - Todo + clases en vivo con docente
 *
 * Descuento familiar simplificado:
 * - 10% para segundo hermano en adelante
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
  // PRECIOS POR TIER STEAM (Sistema 2026)
  // =========================================================================

  @ApiProperty({
    description:
      'Precio mensual del Tier STEAM Libros (Plataforma completa: Mate + Progra + Ciencias)',
    example: 40000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message:
      'El precio de STEAM Libros debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioSteamLibros?: number;

  @ApiProperty({
    description:
      'Precio mensual del Tier STEAM Asincrónico (Todo + clases grabadas)',
    example: 65000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message:
      'El precio de STEAM Asincrónico debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioSteamAsincronico?: number;

  @ApiProperty({
    description:
      'Precio mensual del Tier STEAM Sincrónico (Todo + clases en vivo con docente)',
    example: 95000,
    required: false,
  })
  @IsOptional()
  @IsInt({
    message:
      'El precio de STEAM Sincrónico debe ser un número entero (sin centavos)',
  })
  @Min(0)
  @Type(() => Number)
  precioSteamSincronico?: number;

  // =========================================================================
  // DESCUENTO FAMILIAR SIMPLIFICADO
  // =========================================================================

  @ApiProperty({
    description:
      'Porcentaje de descuento para segundo hermano en adelante (10% por defecto)',
    example: 10,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  descuentoSegundoHermano?: number;

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
