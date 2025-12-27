import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para mover un nodo a otro padre
 * Permite reorganizar la estructura jerárquica del contenido
 */
export class MoverNodoDto {
  /**
   * ID del nuevo nodo padre
   * - Si es null: el nodo se mueve a la raíz (nivel de Teoría/Práctica/Evaluación)
   * - Si es un ID: el nodo se mueve como hijo de ese nodo
   *
   * Validaciones en el servicio:
   * - El nuevo padre debe existir y pertenecer al mismo contenido
   * - No se pueden crear ciclos (un nodo no puede ser hijo de sus descendientes)
   * - Los nodos bloqueados no se pueden mover
   */
  @ApiPropertyOptional({
    description:
      'ID del nuevo nodo padre. Null para mover a la raíz del contenido.',
    example: 'clxx456def...',
    nullable: true,
  })
  @ValidateIf((o: MoverNodoDto) => o.nuevoParentId !== null)
  @IsOptional()
  @IsString({ message: 'El nuevoParentId debe ser un string (CUID) o null' })
  nuevoParentId?: string | null;
}
