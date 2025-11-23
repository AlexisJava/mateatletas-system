import { IsEmail, IsString, MinLength, IsArray, ArrayMinSize, ValidateNested, IsNumber, Min, Max, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class EstudianteInscripcionDto {
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsNumber()
  @Min(5)
  @Max(17)
  edad: number;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CourseSelectionDto)
  cursosSeleccionados: CourseSelectionDto[];
}

export class CourseSelectionDto {
  @IsString()
  id: string; // course ID como 'mat-juegos-desafios'

  @IsString()
  name: string;

  @IsString()
  area: string;

  @IsString()
  instructor: string;

  @IsString()
  dayOfWeek: string;

  @IsString()
  timeSlot: string;

  @IsString()
  color: string;

  @IsString()
  icon: string;
}

export class CreateInscriptionDto {
  // Datos del tutor
  @IsString()
  @MinLength(2)
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^[0-9]{10,15}$/)
  telefono: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[A-Z])(?=.*[0-9])/, {
    message: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un número',
  })
  password: string;

  @IsOptional()
  @IsString()
  dni?: string;

  // Datos de los estudiantes
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EstudianteInscripcionDto)
  estudiantes: EstudianteInscripcionDto[];
}
