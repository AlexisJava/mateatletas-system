import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  MinLength,
} from 'class-validator';

export class CreateDocenteDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  password!: string;

  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsString({ message: 'El apellido debe ser un texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido!: string;

  @IsString({ message: 'El título debe ser un texto' })
  @IsOptional()
  titulo?: string;

  @IsString({ message: 'La biografía debe ser un texto' })
  @IsOptional()
  bio?: string;

  @IsString({ message: 'La biografía debe ser un texto' })
  @IsOptional()
  biografia?: string; // Alias para bio

  @IsArray({ message: 'Las especialidades deben ser un array' })
  @IsString({ each: true, message: 'Cada especialidad debe ser texto' })
  @IsOptional()
  especialidades?: string[];
}
