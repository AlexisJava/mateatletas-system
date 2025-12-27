import { IsArray, ValidateNested, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Item individual para reordenar un nodo
 */
export class NodoOrdenItemDto {
  @ApiProperty({
    description: 'ID del nodo a reordenar',
    example: 'clxx123abc...',
  })
  @IsString({ message: 'El nodoId debe ser un string (CUID)' })
  nodoId!: string;

  @ApiProperty({
    description: 'Nueva posición del nodo (0-indexed)',
    example: 0,
    minimum: 0,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  @Type(() => Number)
  orden!: number;
}

/**
 * DTO para reordenar múltiples nodos de un contenido
 * Permite cambiar el orden de los nodos en un solo request
 */
export class ReordenarNodosDto {
  @ApiProperty({
    description: 'Lista de nodos con sus nuevas posiciones',
    type: [NodoOrdenItemDto],
    example: [
      { nodoId: 'clxx123', orden: 0 },
      { nodoId: 'clxx456', orden: 1 },
    ],
  })
  @IsArray({ message: 'El campo orden debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => NodoOrdenItemDto)
  orden!: NodoOrdenItemDto[];
}
