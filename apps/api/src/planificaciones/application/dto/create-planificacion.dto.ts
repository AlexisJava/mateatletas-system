import {
  IsIn,
  IsInt,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  Min,
  Max,
  MinLength,
} from 'class-validator';

/**
 * DTO para crear una nueva Planificación Mensual
 *
 * Validaciones:
 * - codigo_grupo: B1, B2, B3
 * - mes: 1-12
 * - anio: >= 2020
 * - titulo: string no vacío
 * - tematica_principal: string no vacío
 * - descripcion: opcional
 * - objetivos_aprendizaje: array opcional
 * - notas_docentes: opcional
 */
export class CreatePlanificacionDto {
  @IsString({ message: 'codigo_grupo debe ser un texto' })
  @IsIn(['B1', 'B2', 'B3'], {
    message: 'codigo_grupo debe ser uno de los valores válidos: B1, B2, B3',
  })
  @IsNotEmpty({ message: 'codigo_grupo es requerido' })
  codigo_grupo: string;

  @IsInt({ message: 'mes debe ser un número entero' })
  @Min(1, { message: 'mes debe estar entre 1 y 12' })
  @Max(12, { message: 'mes debe estar entre 1 y 12' })
  @IsNotEmpty({ message: 'mes es requerido' })
  mes: number;

  @IsInt({ message: 'anio debe ser un número entero' })
  @Min(2020, { message: 'anio debe ser mayor o igual a 2020' })
  @IsNotEmpty({ message: 'anio es requerido' })
  anio: number;

  @IsString({ message: 'titulo debe ser un texto' })
  @IsNotEmpty({ message: 'titulo es requerido' })
  @MinLength(3, { message: 'titulo debe tener al menos 3 caracteres' })
  titulo: string;

  @IsString({ message: 'descripcion debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsString({ message: 'tematica_principal debe ser un texto' })
  @IsNotEmpty({ message: 'tematica_principal es requerida' })
  @MinLength(3, { message: 'tematica_principal debe tener al menos 3 caracteres' })
  tematica_principal: string;

  @IsArray({ message: 'objetivos_aprendizaje debe ser un array' })
  @IsString({ each: true, message: 'cada objetivo debe ser un texto' })
  @IsOptional()
  objetivos_aprendizaje?: string[];

  @IsString({ message: 'notas_docentes debe ser un texto' })
  @IsOptional()
  notas_docentes?: string;
}
