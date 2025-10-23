import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO de Request para actualizar configuración de precios
 * Presentation Layer - Validación HTTP con class-validator
 *
 * IMPORTANTE:
 * - Los precios en ARS DEBEN ser números enteros (sin centavos) para contabilidad
 * - Solo los porcentajes pueden tener decimales
 * - Se convertirán a Decimal en el Service antes de llamar al Use Case
 */
export class ActualizarConfiguracionPreciosRequestDto {
  @ApiProperty({
    description: 'ID del administrador que realiza el cambio',
    example: 'clt1abc123',
  })
  @IsString()
  adminId!: string;

  @ApiProperty({
    description: 'Nuevo precio de Club Matemáticas (debe ser entero, sin centavos)',
    example: 52000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio de Club Matemáticas debe ser un número entero (sin centavos)' })
  @Min(0)
  @Type(() => Number)
  precioClubMatematicas?: number;

  @ApiProperty({
    description: 'Nuevo precio de Cursos Especializados (debe ser entero, sin centavos)',
    example: 57000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio de Cursos Especializados debe ser un número entero (sin centavos)' })
  @Min(0)
  @Type(() => Number)
  precioCursosEspecializados?: number;

  @ApiProperty({
    description: 'Nuevo precio para múltiples actividades (debe ser entero, sin centavos)',
    example: 46000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio para múltiples actividades debe ser un número entero (sin centavos)' })
  @Min(0)
  @Type(() => Number)
  precioMultipleActividades?: number;

  @ApiProperty({
    description: 'Nuevo precio hermanos básico (debe ser entero, sin centavos)',
    example: 46000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio hermanos básico debe ser un número entero (sin centavos)' })
  @Min(0)
  @Type(() => Number)
  precioHermanosBasico?: number;

  @ApiProperty({
    description: 'Nuevo precio hermanos múltiple (debe ser entero, sin centavos)',
    example: 40000,
    required: false,
  })
  @IsOptional()
  @IsInt({ message: 'El precio hermanos múltiple debe ser un número entero (sin centavos)' })
  @Min(0)
  @Type(() => Number)
  precioHermanosMultiple?: number;

  @ApiProperty({
    description: 'Nuevo porcentaje de descuento AACREA',
    example: 25,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  @Type(() => Number)
  descuentoAacreaPorcentaje?: number;

  @ApiProperty({
    description: 'Estado del descuento AACREA',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  descuentoAacreaActivo?: boolean;

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

  @ApiProperty({
    description: 'Motivo del cambio (para auditoría)',
    example: 'Ajuste inflacionario trimestral',
    required: false,
  })
  @IsOptional()
  @IsString()
  motivoCambio?: string;
}
