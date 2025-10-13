import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para actualizar una ruta curricular existente
 * Todos los campos son opcionales
 */
export class ActualizarRutaDto {
  /**
   * Nombre de la ruta curricular
   * @example "Lógica Matemática Avanzada"
   */
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @IsOptional()
  nombre?: string;

  /**
   * Color representativo de la ruta (hex)
   * @example "#4ECDC4"
   */
  @IsString()
  @IsOptional()
  color?: string;

  /**
   * Descripción de la ruta curricular
   * @example "Lógica proposicional y predicativa con aplicaciones"
   */
  @IsString()
  @IsOptional()
  descripcion?: string;
}
