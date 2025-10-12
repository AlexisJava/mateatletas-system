import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsIn,
  IsOptional,
  IsUrl,
} from 'class-validator';

/**
 * DTO para crear un nuevo estudiante
 * Valida todos los campos requeridos y opcionales
 */
export class CreateEstudianteDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsDateString()
  fecha_nacimiento!: string;

  @IsString()
  @IsIn(['Primaria', 'Secundaria', 'Universidad'])
  nivel_escolar!: string;

  @IsString()
  @IsOptional()
  @IsUrl()
  foto_url?: string;

  @IsString()
  @IsOptional()
  equipo_id?: string;
}
