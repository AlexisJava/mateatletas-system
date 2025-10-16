import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  IsPositive,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { TipoProducto } from '@prisma/client';

/**
 * DTO para crear un nuevo producto en el catálogo
 * Los campos requeridos varían según el tipo de producto
 */
export class CrearProductoDto {
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  precio!: number;

  @IsEnum(TipoProducto, {
    message: 'El tipo debe ser: Suscripcion, Curso o RecursoDigital',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo!: TipoProducto;

  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  @IsOptional()
  activo?: boolean;

  // --- Campos específicos para tipo Curso ---
  // Soportamos tanto snake_case (BD) como camelCase (JS/TS convention)

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser una fecha válida' },
  )
  @IsNotEmpty({ message: 'La fecha de inicio es requerida para cursos' })
  fecha_inicio?: string;

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsDateString(
    {},
    { message: 'La fecha de inicio debe ser una fecha válida' },
  )
  @IsOptional()
  fechaInicio?: string; // Alias camelCase

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida para cursos' })
  fecha_fin?: string;

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsOptional()
  fechaFin?: string; // Alias camelCase

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(1, { message: 'El cupo máximo debe ser al menos 1' })
  @IsNotEmpty({ message: 'El cupo máximo es requerido para cursos' })
  cupo_maximo?: number;

  @ValidateIf((o) => o.tipo === 'Curso')
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(1, { message: 'El cupo máximo debe ser al menos 1' })
  @IsOptional()
  cupoMaximo?: number; // Alias camelCase

  // --- Campos específicos para tipo Suscripcion Y Curso ---
  // Los cursos PUEDEN tener duración en meses (ej: "Exploradores Matemáticos de 9 meses")
  // O pueden tener fechas específicas (fecha_inicio + fecha_fin)

  @ValidateIf((o) => o.tipo === 'Suscripcion' || o.tipo === 'Curso')
  @IsInt({ message: 'La duración debe ser un número entero de meses' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @IsOptional()
  duracion_meses?: number;

  // Alias camelCase para duracion_meses
  @ValidateIf((o) => o.tipo === 'Suscripcion' || o.tipo === 'Curso')
  @IsInt({ message: 'La duración debe ser un número entero de meses' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @IsOptional()
  duracionMeses?: number;
}
