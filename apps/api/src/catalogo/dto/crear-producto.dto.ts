import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsPositive,
  ValidateIf,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  TipoProducto,
  CasaTipo,
  MundoTipo,
  SubtipoMundo,
  NivelOlimpiada,
} from '@prisma/client';

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
    example: TipoProducto.Curso,
  })
  @IsEnum(TipoProducto, {
    message:
      'El tipo debe ser: Evento, Digital, Fisico, Curso, Servicio, Bundle o Certificacion',
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

  @ApiPropertyOptional({
    description: 'Subcategoría del producto para agrupación',
    example: 'Matemáticas',
    type: String,
  })
  @IsString({ message: 'La subcategoría debe ser un texto' })
  @IsOptional()
  subcategoria?: string;

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
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: '[Solo Cursos] Fecha de fin del curso en formato ISO',
    example: '2026-07-31',
    type: String,
    format: 'date',
  })
  @ValidateIf((o: CrearProductoDto) => o.tipo === 'Curso')
  @IsDateString({}, { message: 'La fecha de fin debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de fin es requerida para cursos' })
  fechaFin?: string;

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
  cupoMaximo?: number;

  // --- Campos específicos para tipo Servicio Y Curso ---
  // Los cursos PUEDEN tener duración en meses (ej: "Exploradores Matemáticos de 9 meses")
  // O pueden tener fechas específicas (fechaInicio + fechaFin)

  @ApiPropertyOptional({
    description: '[Servicios y Cursos] Duración en meses',
    example: 1,
    type: Number,
    minimum: 1,
  })
  @ValidateIf(
    (o: CrearProductoDto) => o.tipo === 'Servicio' || o.tipo === 'Curso',
  )
  @IsInt({ message: 'La duración debe ser un número entero de meses' })
  @Min(1, { message: 'La duración debe ser al menos 1 mes' })
  @IsOptional()
  duracionMeses?: number;

  // --- Campos Sistema Casa/Mundo 2026 ---

  @ApiPropertyOptional({
    description: 'Casa pedagógica del producto (QUANTUM, VERTEX, PULSAR)',
    enum: CasaTipo,
    example: 'QUANTUM',
  })
  @IsEnum(CasaTipo, {
    message: 'La casa debe ser: QUANTUM, VERTEX o PULSAR',
  })
  @IsOptional()
  casa?: CasaTipo;

  @ApiPropertyOptional({
    description: 'Mundo del producto (MATEMATICA, PROGRAMACION, CIENCIAS)',
    enum: MundoTipo,
    example: 'MATEMATICA',
  })
  @IsEnum(MundoTipo, {
    message: 'El mundo debe ser: MATEMATICA, PROGRAMACION o CIENCIAS',
  })
  @IsOptional()
  mundo?: MundoTipo;

  @ApiPropertyOptional({
    description: 'Subtipo del mundo (GENERAL u OLIMPICA)',
    enum: SubtipoMundo,
    example: 'GENERAL',
  })
  @IsEnum(SubtipoMundo, {
    message: 'El subtipo debe ser: GENERAL u OLIMPICA',
  })
  @IsOptional()
  subtipoMundo?: SubtipoMundo;

  @ApiPropertyOptional({
    description: 'Nivel de olimpiada (solo para subtipo OLIMPICA)',
    enum: NivelOlimpiada,
    example: 'NANDU_N1',
  })
  @IsEnum(NivelOlimpiada, {
    message: 'El nivel debe ser: NANDU_N1, NANDU_N2, OMA_N1, OMA_N2 u OMA_N3',
  })
  @IsOptional()
  nivelOlimpiada?: NivelOlimpiada;

  @ApiPropertyOptional({
    description: 'Edad mínima requerida para el producto',
    example: 6,
    type: Number,
    minimum: 4,
    maximum: 99,
  })
  @IsInt({ message: 'La edad mínima debe ser un número entero' })
  @Min(4, { message: 'La edad mínima debe ser al menos 4' })
  @Max(99, { message: 'La edad mínima no puede ser mayor a 99' })
  @IsOptional()
  edadMinima?: number;

  @ApiPropertyOptional({
    description: 'Edad máxima permitida para el producto',
    example: 9,
    type: Number,
    minimum: 4,
    maximum: 99,
  })
  @IsInt({ message: 'La edad máxima debe ser un número entero' })
  @Min(4, { message: 'La edad máxima debe ser al menos 4' })
  @Max(99, { message: 'La edad máxima no puede ser mayor a 99' })
  @IsOptional()
  edadMaxima?: number;

  @ApiPropertyOptional({
    description: 'Si el producto permite excepciones de edad',
    example: false,
    type: Boolean,
    default: false,
  })
  @IsBoolean({ message: 'permiteExcepciones debe ser verdadero o falso' })
  @IsOptional()
  permiteExcepciones?: boolean;

  @ApiPropertyOptional({
    description: 'Si el producto es visible en la landing pública',
    example: true,
    type: Boolean,
    default: true,
  })
  @IsBoolean({ message: 'visibleEnLanding debe ser verdadero o falso' })
  @IsOptional()
  visibleEnLanding?: boolean;

  @ApiPropertyOptional({
    description: 'Orden de display en listados',
    example: 0,
    type: Number,
    default: 0,
  })
  @IsInt({ message: 'El orden debe ser un número entero' })
  @Min(0, { message: 'El orden no puede ser negativo' })
  @IsOptional()
  ordenDisplay?: number;
}
