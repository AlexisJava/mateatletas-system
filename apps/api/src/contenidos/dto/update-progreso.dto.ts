import { IsInt, Min, IsOptional, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar el progreso de un estudiante en un contenido
 * Se usa cuando el estudiante navega por los slides o completa la lección
 */
export class UpdateProgresoDto {
  /**
   * Índice del slide actual (0-based)
   */
  @ApiProperty({
    description: 'Índice del slide actual (0-based)',
    example: 2,
    minimum: 0,
    type: Number,
  })
  @IsInt({ message: 'El slide actual debe ser un número entero' })
  @Min(0, { message: 'El slide mínimo es 0' })
  @Type(() => Number)
  slideActual!: number;

  /**
   * Tiempo adicional a sumar en segundos
   * Representa el tiempo transcurrido desde la última actualización
   */
  @ApiPropertyOptional({
    description: 'Tiempo adicional en segundos a sumar al total',
    example: 30,
    minimum: 0,
    type: Number,
  })
  @IsOptional()
  @IsInt({ message: 'El tiempo adicional debe ser un número entero' })
  @Min(0, { message: 'El tiempo adicional no puede ser negativo' })
  @Type(() => Number)
  tiempoAdicionalSegundos?: number;

  /**
   * Marca si el estudiante completó toda la lección
   * Una vez marcado como true, no se revierte
   */
  @ApiPropertyOptional({
    description: 'Indica si el estudiante completó la lección',
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean({ message: 'El campo completado debe ser un booleano' })
  completado?: boolean;
}
