import {
  IsString,
  IsNotEmpty,
  Matches,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

/**
 * DTO para crear un nuevo equipo
 * Define los datos requeridos y sus validaciones
 */
export class CreateEquipoDto {
  /**
   * Nombre del equipo
   * Debe ser único en el sistema
   * Ejemplos: "Fénix", "Dragón", "Tigre", "Águila"
   */
  @IsString()
  @IsNotEmpty({ message: 'El nombre del equipo es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  nombre!: string;

  /**
   * Color primario del equipo en formato hexadecimal
   * Ejemplo: "#FF6B35"
   */
  @IsString()
  @IsNotEmpty({ message: 'El color primario es requerido' })
  @Matches(/^#[0-9A-F]{6}$/i, {
    message:
      'El color primario debe ser un código hexadecimal válido (ej: #FF6B35)',
  })
  color_primario!: string;

  /**
   * Color secundario del equipo en formato hexadecimal
   * Ejemplo: "#F7B801"
   */
  @IsString()
  @IsNotEmpty({ message: 'El color secundario es requerido' })
  @Matches(/^#[0-9A-F]{6}$/i, {
    message:
      'El color secundario debe ser un código hexadecimal válido (ej: #F7B801)',
  })
  color_secundario!: string;

  /**
   * URL del ícono del equipo
   * Opcional - puede agregarse después
   */
  @IsString()
  @IsOptional()
  icono_url?: string;
}
