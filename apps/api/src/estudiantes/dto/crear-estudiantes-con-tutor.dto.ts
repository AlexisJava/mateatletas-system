import {
  IsArray,
  IsString,
  IsNotEmpty,
  ValidateNested,
  IsEmail,
  IsOptional,
  Matches,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para crear un estudiante individual
 */
export class CrearEstudianteDto {
  @IsNotEmpty({ message: 'El nombre del estudiante es requerido' })
  @IsString({ message: 'El nombre debe ser un string' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido del estudiante es requerido' })
  @IsString({ message: 'El apellido debe ser un string' })
  apellido!: string;

  @IsNotEmpty({ message: 'La edad es requerida' })
  edad!: number;

  @IsNotEmpty({ message: 'El nivel escolar es requerido' })
  @IsString({ message: 'El nivel escolar debe ser un string' })
  nivel_escolar!: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;
}

/**
 * DTO para datos del tutor
 */
export class TutorDto {
  @IsNotEmpty({ message: 'El nombre del tutor es requerido' })
  @IsString({ message: 'El nombre debe ser un string' })
  nombre!: string;

  @IsNotEmpty({ message: 'El apellido del tutor es requerido' })
  @IsString({ message: 'El apellido debe ser un string' })
  apellido!: string;

  @IsOptional()
  @IsEmail({}, { message: 'El email debe ser válido' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'El DNI debe ser un string' })
  dni?: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser un string' })
  telefono?: string;
}

/**
 * DTO principal para crear estudiantes con tutor
 */
export class CrearEstudiantesConTutorDto {
  @IsArray({ message: 'Estudiantes debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe incluir al menos un estudiante' })
  @ValidateNested({ each: true })
  @Type(() => CrearEstudianteDto)
  estudiantes!: CrearEstudianteDto[];

  @IsNotEmpty({ message: 'Los datos del tutor son requeridos' })
  @ValidateNested()
  @Type(() => TutorDto)
  tutor!: TutorDto;

  @IsNotEmpty({ message: 'El ID del sector es requerido' })
  @IsString({ message: 'El sectorId debe ser un string' })
  @Matches(/^c[a-z0-9]{24}$/, {
    message: 'El sectorId debe ser un CUID válido',
  })
  sectorId!: string;
}

/**
 * Response con credenciales generadas
 */
export interface CredencialesGeneradas {
  tutor?: {
    username: string;
    password: string;
  };
  estudiantes: Array<{
    nombre: string;
    username: string;
    password: string;
  }>;
}
