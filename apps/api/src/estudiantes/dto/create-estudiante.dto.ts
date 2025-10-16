import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsIn,
  IsOptional,
  IsUrl,
  MaxLength,
  IsUUID,
  Matches,
} from 'class-validator';
import { Trim } from '../../common/decorators/trim.decorator';
import { Capitalize } from '../../common/decorators/capitalize.decorator';
import { IsValidAge } from '../../common/validators/is-valid-age.validator';

/**
 * DTO para crear un nuevo estudiante
 * Valida todos los campos requeridos y opcionales
 * Incluye validación avanzada y sanitización automática
 */
export class CreateEstudianteDto {
  /**
   * Nombre del estudiante
   * Se capitaliza automáticamente
   */
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede superar los 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El nombre solo puede contener letras y espacios',
  })
  @Trim()
  @Capitalize()
  nombre!: string;

  /**
   * Apellido del estudiante
   * Se capitaliza automáticamente
   */
  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  @MaxLength(100, { message: 'El apellido no puede superar los 100 caracteres' })
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, {
    message: 'El apellido solo puede contener letras y espacios',
  })
  @Trim()
  @Capitalize()
  apellido!: string;

  /**
   * Fecha de nacimiento del estudiante
   * Debe tener entre 4 y 18 años
   */
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsValidAge(4, 18, { message: 'El estudiante debe tener entre 4 y 18 años' })
  fecha_nacimiento!: string;

  /**
   * Nivel escolar del estudiante
   */
  @IsString({ message: 'El nivel escolar debe ser un texto' })
  @IsIn(['Primaria', 'Secundaria', 'Universidad'], {
    message: 'El nivel escolar debe ser: Primaria, Secundaria o Universidad',
  })
  @Trim()
  nivel_escolar!: string;

  /**
   * URL de la foto del estudiante (opcional)
   * Debe ser HTTPS para seguridad
   */
  @IsOptional()
  @IsString({ message: 'La URL de la foto debe ser un texto' })
  @IsUrl({ require_protocol: true, protocols: ['https'] }, {
    message: 'La foto debe ser una URL HTTPS válida',
  })
  @Trim()
  foto_url?: string;

  /**
   * ID del equipo al que pertenece (opcional)
   */
  @IsOptional()
  @IsString({ message: 'El ID del equipo debe ser un texto' })
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  @Trim()
  equipo_id?: string;
}
