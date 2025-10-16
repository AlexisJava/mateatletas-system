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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
  @ApiProperty({
    description: 'Nombre del estudiante (solo letras y espacios)',
    example: 'María Laura',
    maxLength: 100,
    type: String,
  })
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
  @ApiProperty({
    description: 'Apellido del estudiante (solo letras y espacios)',
    example: 'González Díaz',
    maxLength: 100,
    type: String,
  })
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
  @ApiProperty({
    description: 'Fecha de nacimiento en formato ISO (estudiante debe tener entre 4 y 18 años)',
    example: '2015-06-15',
    type: String,
    format: 'date',
  })
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  @IsValidAge(4, 18, { message: 'El estudiante debe tener entre 4 y 18 años' })
  fecha_nacimiento!: string;

  /**
   * Nivel escolar del estudiante
   */
  @ApiProperty({
    description: 'Nivel escolar del estudiante',
    example: 'Primaria',
    enum: ['Primaria', 'Secundaria', 'Universidad'],
    type: String,
  })
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
  @ApiPropertyOptional({
    description: 'URL HTTPS de la foto del estudiante',
    example: 'https://cloudinary.com/photos/student123.jpg',
    type: String,
  })
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
  @ApiPropertyOptional({
    description: 'UUID del equipo al que pertenece el estudiante',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsOptional()
  @IsString({ message: 'El ID del equipo debe ser un texto' })
  @IsUUID('4', { message: 'El ID del equipo debe ser un UUID válido' })
  @Trim()
  equipo_id?: string;
}
