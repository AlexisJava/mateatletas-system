import { IsInt, Min, IsOptional, IsBoolean, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar el progreso de un estudiante en un contenido
 * Se usa cuando el estudiante navega por los nodos o completa la lección
 */
export class UpdateProgresoDto {
  /**
   * ID del nodo actual donde está el estudiante
   */
  @ApiPropertyOptional({
    description: 'ID del nodo actual donde está el estudiante',
    example: 'clxx123...',
    type: String,
  })
  @IsOptional()
  @IsString({ message: 'El nodo actual debe ser un string (CUID)' })
  nodoActualId?: string;

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
