import { IsString, IsInt, IsBoolean, IsOptional, Min, MaxLength } from 'class-validator';

/**
 * DTO para crear un nuevo módulo dentro de un curso
 * Implementa validaciones basadas en mejores prácticas de Ed-Tech
 */
export class CreateModuloDto {
  @IsString()
  @MaxLength(200, { message: 'El título no puede exceder 200 caracteres' })
  titulo!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  descripcion?: string;

  @IsInt()
  @Min(1, { message: 'El orden debe ser mayor a 0' })
  orden!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  duracion_estimada_minutos?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  puntos_totales?: number;

  @IsOptional()
  @IsBoolean()
  publicado?: boolean;
}
