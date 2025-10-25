import {
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
  MinLength,
  IsEnum,
  IsObject,
} from 'class-validator';
import { Type } from 'class-transformer';
import { NivelDificultad } from '@prisma/client';

export class CreateActividadDto {
  @Type(() => Number)
  @IsInt({ message: 'semana debe ser un número entero' })
  @Min(1, { message: 'semana debe estar entre 1 y 4' })
  @Max(4, { message: 'semana debe estar entre 1 y 4' })
  semana!: number;

  @IsOptional()
  @IsString({ message: 'titulo debe ser un texto' })
  @MinLength(3, { message: 'titulo debe tener al menos 3 caracteres' })
  titulo?: string;

  @IsString({ message: 'descripcion debe ser un texto' })
  @MinLength(3, { message: 'descripcion debe tener al menos 3 caracteres' })
  descripcion!: string;

  @IsString({ message: 'componente debe ser un texto' })
  @MinLength(2, { message: 'componente debe tener al menos 2 caracteres' })
  componente!: string;

  @IsOptional()
  @IsObject({ message: 'props debe ser un objeto' })
  props?: Record<string, unknown>;

  @IsOptional()
  @IsEnum(NivelDificultad, {
    message: 'nivel_dificultad debe ser BASICO, INTERMEDIO, AVANZADO u OLIMPICO',
  })
  nivel_dificultad?: NivelDificultad;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'tiempo_estimado_minutos debe ser un número entero' })
  @Min(1, { message: 'tiempo_estimado_minutos debe ser mayor o igual a 1' })
  tiempo_estimado_minutos?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'puntos_gamificacion debe ser un número entero' })
  @Min(0, { message: 'puntos_gamificacion debe ser mayor o igual a 0' })
  puntos_gamificacion?: number;

  @IsOptional()
  @IsString({ message: 'instrucciones_docente debe ser un texto' })
  instrucciones_docente?: string;

  @IsOptional()
  @IsString({ message: 'instrucciones_estudiante debe ser un texto' })
  instrucciones_estudiante?: string;

  @IsOptional()
  @IsObject({ message: 'recursos_url debe ser un objeto' })
  recursos_url?: Record<string, unknown> | null;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'orden debe ser un número entero' })
  @Min(1, { message: 'orden debe ser mayor o igual a 1' })
  orden?: number;
}
