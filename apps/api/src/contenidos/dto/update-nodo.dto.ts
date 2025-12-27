import { IsString, IsOptional, IsInt, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para actualizar un nodo existente
 * Nota: El título no se puede cambiar en nodos bloqueados (Teoría, Práctica, Evaluación)
 */
export class UpdateNodoDto {
  /**
   * Nuevo título del nodo
   * No aplica a nodos con bloqueado=true
   */
  @ApiPropertyOptional({
    description: 'Nuevo título del nodo (no aplica a nodos estructurales)',
    example: 'Fracciones equivalentes',
    minLength: 1,
  })
  @IsOptional()
  @IsString({ message: 'El título debe ser un string' })
  @MinLength(1, { message: 'El título no puede estar vacío' })
  titulo?: string;

  /**
   * Contenido JSON del nodo
   * Solo aplica a nodos hoja (sin hijos)
   */
  @ApiPropertyOptional({
    description: 'Contenido JSON del nodo',
    example: '{"type":"doc","content":[{"type":"paragraph"}]}',
  })
  @IsOptional()
  @IsString({ message: 'El contenidoJson debe ser un string' })
  contenidoJson?: string;

  /**
   * Nuevo orden del nodo entre sus hermanos
   */
  @ApiPropertyOptional({
    description: 'Nuevo orden del nodo entre hermanos',
    example: 2,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  @Type(() => Number)
  orden?: number;
}
