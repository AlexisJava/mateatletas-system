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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TipoProducto } from '@prisma/client';

/**
 * DTO para crear un nuevo producto en el catálogo
 * Los campos requeridos varían según el tipo de producto
 */
export class CrearProductoDto {
  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Suscripción Premium Mensual',
    type: String,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example: 'Acceso ilimitado a todas las clases y recursos',
    type: String,
  })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'Precio del producto en pesos argentinos',
    example: 5000.0,
    type: Number,
    minimum: 0.01,
  })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  @IsNotEmpty({ message: 'El precio es requerido' })
  precio!: number;

  @ApiProperty({
    description: 'Tipo de producto',
    enum: TipoProducto,
    example: TipoProducto.Suscripcion,
  })
  @IsEnum(TipoProducto, {
    message: 'El tipo debe ser: Suscripcion, Curso o RecursoDigital',
  })
  @IsNotEmpty({ message: 'El tipo es requerido' })
  tipo!: TipoProducto;

  @ApiPropertyOptional({
    description: 'Si el producto está activo y disponible para compra',
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean({ message: 'El campo activo debe ser verdadero o falso' })
  @IsOptional()
  activo?: boolean;

  // --- Campos específicos para tipo Curso ---
  // Soportamos tanto snake_case (BD) como camelCase (JS/TS convention)

  @ApiPropertyOptional({
    description: '[Solo Cursos] Fecha de inicio del curso en formato ISO',
    example: '2025-11-01',
    type: String,
    format: 'date',
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida para cursos' })
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: '[Solo Cursos] Alias camelCase de fecha_inicio',
    example: '2025-11-01',
    type: String,
    format: 'date',
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de inicio debe ser una fecha válida' })
  @IsOptional()
  fechaInicio?: string; // Alias camelCase

  @ApiPropertyOptional({
    description: '[Solo Cursos] Fecha de fin del curso en formato ISO',
    example: '2026-07-31',
    type: String,
    format: 'date',
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida para cursos' })
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: '[Solo Cursos] Alias camelCase de fecha_fin',
    example: '2026-07-31',
    type: String,
    format: 'date',
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsOptional()
  fechaFin?: string; // Alias camelCase

  @ApiPropertyOptional({
    description: '[Solo Cursos] Cupo máximo de estudiantes para el curso',
    example: 30,
    type: Number,
    minimum: 1,
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(1, { message: 'El cupo máximo debe ser al menos 1' })
  @IsNotEmpty({ message: 'El cupo máximo es requerido para cursos' })
  cupo_maximo?: number;

  @ApiPropertyOptional({
    description: '[Solo Cursos] Alias camelCase de cupo_maximo',
    example: 30,
    type: Number,
    minimum: 1,
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsInt({ message: 'El cupo máximo debe ser un número entero' })
  @Min(1, { message: 'El cupo máximo debe ser al menos 1' })
  @IsOptional()
  cupoMaximo?: number; // Alias camelCase

  // --- Campos específicos para tipo Suscripcion Y Curso ---
  // Los cursos PUEDEN tener duración en meses (ej: "Exploradores Matemáticos de 9 meses")
  // O pueden tener fechas específicas (fecha_inicio + fecha_fin)

  @ApiPropertyOptional({
    description: '[Suscripciones y Cursos] Duración en meses',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @ValidateIf(
    (o: CrearProductoDto) => o.tipo === 'Suscripcion' || o.tipo === 'Curso',
  )
  @IsInt({ message: 'La duración debe ser un número entero de meses' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @IsOptional()
  duracion_meses?: number;

  @ApiPropertyOptional({
    description: '[Suscripciones y Cursos] Alias camelCase de duracion_meses',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @ValidateIf(
    (o: CrearProductoDto) => o.tipo === 'Suscripcion' || o.tipo === 'Curso',
  )
  @IsInt({ message: 'La duración debe ser un número entero de meses' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @IsOptional()
  duracionMeses?: number;
}
