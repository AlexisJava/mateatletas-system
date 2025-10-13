import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para crear una nueva ruta curricular
 */
export class CrearRutaDto {
  /**
   * Nombre de la ruta curricular
   * @example "Trigonometría"
   */
  @IsString()
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  nombre!: string;

  /**
   * Color representativo de la ruta (hex)
   * @example "#FF6B6B"
   */
  @IsString()
  @IsOptional()
  color?: string;

  /**
   * Descripción de la ruta curricular
   * @example "Estudio de funciones trigonométricas y sus aplicaciones"
   */
  @IsString()
  @IsOptional()
  descripcion?: string;
}
