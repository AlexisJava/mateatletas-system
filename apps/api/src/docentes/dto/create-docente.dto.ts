import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
  IsObject,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class CreateDocenteDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email!: string;

  @IsString({ message: 'La contraseña debe ser un texto' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

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

  @IsString({ message: 'El teléfono debe ser un texto' })
  @IsOptional()
  telefono?: string;

  @IsArray({ message: 'Las especialidades deben ser un array' })
  @IsString({ each: true, message: 'Cada especialidad debe ser texto' })
  @IsOptional()
  especialidades?: string[];

  @IsInt({ message: 'La experiencia debe ser un número entero' })
  @Min(0, { message: 'La experiencia no puede ser negativa' })
  @Max(50, { message: 'La experiencia no puede ser mayor a 50 años' })
  @IsOptional()
  experiencia_anos?: number;

  @IsObject({ message: 'La disponibilidad horaria debe ser un objeto' })
  @IsOptional()
  disponibilidad_horaria?: Record<string, string[]>;

  @IsArray({ message: 'El nivel educativo debe ser un array' })
  @IsString({ each: true, message: 'Cada nivel educativo debe ser texto' })
  @IsOptional()
  nivel_educativo?: string[];

  @IsString({ message: 'El estado debe ser un texto' })
  @IsOptional()
  estado?: string;
}
