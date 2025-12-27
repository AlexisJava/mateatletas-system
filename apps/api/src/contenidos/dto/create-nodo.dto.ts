import { IsString, IsOptional, IsInt, Min, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

/**
 * DTO para crear un nuevo nodo dentro de un contenido
 * Los nodos forman una estructura jerárquica de árbol
 */
export class CreateNodoDto {
  /**
   * Título del nodo (se muestra en el sidebar del editor)
   */
  @ApiProperty({
    description: 'Título del nodo',
    example: 'Introducción a las fracciones',
    minLength: 1,
  })
  @IsString({ message: 'El título debe ser un string' })
  @MinLength(1, { message: 'El título no puede estar vacío' })
  titulo!: string;

  /**
   * ID del nodo padre (opcional)
   * Si no se especifica, el nodo se crea como hijo de raíz
   * dentro de Teoría, Práctica o Evaluación
   */
  @ApiPropertyOptional({
    description: 'ID del nodo padre. Si no se especifica, se crea en la raíz.',
    example: 'clxx123abc...',
  })
  @IsOptional()
  @IsString({ message: 'El parentId debe ser un string (CUID)' })
  parentId?: string;

  /**
   * Contenido JSON del nodo (solo para nodos hoja)
   * Se parsea en el frontend como contenido del editor
   */
  @ApiPropertyOptional({
    description: 'Contenido JSON del nodo (solo para nodos sin hijos)',
    example: '{"type":"doc","content":[]}',
  })
  @IsOptional()
  @IsString({ message: 'El contenidoJson debe ser un string' })
  contenidoJson?: string;

  /**
   * Orden del nodo entre sus hermanos (opcional)
   * Si no se especifica, se agrega al final
   */
  @ApiPropertyOptional({
    description: 'Orden del nodo entre hermanos (0-indexed)',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden mínimo es 0' })
  @Type(() => Number)
  orden?: number;
}
