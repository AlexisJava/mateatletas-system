import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  Max,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  CategoriaStudio,
  MundoTipo,
  CasaTipo,
  TierNombre,
  TipoExperienciaStudio,
  MateriaStudio,
} from '@prisma/client';

/**
 * DTO para crear un nuevo curso en Studio
 * Todos los campos del wizard de 6 pasos
 */
export class CrearCursoDto {
  // ─────────────────────────────────────────────────────────────────────────
  // PASO 1: Categoría
  // ─────────────────────────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Categoría del curso',
    enum: CategoriaStudio,
    example: 'EXPERIENCIA',
  })
  @IsEnum(CategoriaStudio, {
    message: 'La categoría debe ser EXPERIENCIA o CURRICULAR',
  })
  categoria!: CategoriaStudio;

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 2a: Casa (edad)
  // ─────────────────────────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Casa objetivo (rango de edad)',
    enum: CasaTipo,
    example: 'VERTEX',
  })
  @IsEnum(CasaTipo, {
    message: 'La casa debe ser QUANTUM, VERTEX o PULSAR',
  })
  casa!: CasaTipo;

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 2b: Mundo
  // ─────────────────────────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Mundo STEAM al que pertenece',
    enum: MundoTipo,
    example: 'CIENCIAS',
  })
  @IsEnum(MundoTipo, {
    message: 'El mundo debe ser MATEMATICA, PROGRAMACION o CIENCIAS',
  })
  mundo!: MundoTipo;

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 3: Tipo específico
  // ─────────────────────────────────────────────────────────────────────────

  @ApiPropertyOptional({
    description: 'Tipo de experiencia (solo si categoria = EXPERIENCIA)',
    enum: TipoExperienciaStudio,
    example: 'NARRATIVO',
  })
  @IsOptional()
  @IsEnum(TipoExperienciaStudio, {
    message:
      'El tipo de experiencia debe ser: NARRATIVO, EXPEDICION, LABORATORIO, SIMULACION, PROYECTO o DESAFIO',
  })
  tipoExperiencia?: TipoExperienciaStudio;

  @ApiPropertyOptional({
    description: 'Materia curricular (solo si categoria = CURRICULAR)',
    enum: MateriaStudio,
    example: 'FISICA',
  })
  @IsOptional()
  @IsEnum(MateriaStudio, {
    message:
      'La materia debe ser: MATEMATICA_ESCOLAR, FISICA, QUIMICA o PROGRAMACION',
  })
  materia?: MateriaStudio;

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 4: Detalles
  // ─────────────────────────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Nombre del curso',
    example: 'La Química de Harry Potter',
    minLength: 3,
    maxLength: 200,
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(200, { message: 'El nombre no puede superar los 200 caracteres' })
  nombre!: string;

  @ApiProperty({
    description: 'Descripción del curso',
    example: 'Aprende química básica preparando pociones mágicas en Hogwarts',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'La descripción debe ser un texto' })
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(10, {
    message: 'La descripción debe tener al menos 10 caracteres',
  })
  @MaxLength(2000, {
    message: 'La descripción no puede superar los 2000 caracteres',
  })
  descripcion!: string;

  @ApiProperty({
    description: 'Estética base del curso',
    example: 'Harry Potter',
    maxLength: 100,
  })
  @IsString({ message: 'La estética base debe ser un texto' })
  @IsNotEmpty({ message: 'La estética base es requerida' })
  @MaxLength(100, {
    message: 'La estética base no puede superar los 100 caracteres',
  })
  esteticaBase!: string;

  @ApiPropertyOptional({
    description: 'Variante de la estética',
    example: 'Hogwarts',
    maxLength: 100,
  })
  @IsOptional()
  @IsString({ message: 'La variante debe ser un texto' })
  @MaxLength(100, {
    message: 'La variante no puede superar los 100 caracteres',
  })
  esteticaVariante?: string;

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 5: Duración y Tier
  // ─────────────────────────────────────────────────────────────────────────

  @ApiProperty({
    description: 'Cantidad de semanas del curso',
    example: 8,
    minimum: 1,
    maximum: 12,
  })
  @Type(() => Number)
  @IsInt({ message: 'La cantidad de semanas debe ser un número entero' })
  @Min(1, { message: 'El curso debe tener al menos 1 semana' })
  @Max(12, { message: 'El curso no puede tener más de 12 semanas' })
  cantidadSemanas!: number;

  @ApiProperty({
    description: 'Actividades por semana',
    example: 3,
    minimum: 1,
    maximum: 5,
  })
  @Type(() => Number)
  @IsInt({ message: 'Las actividades por semana deben ser un número entero' })
  @Min(1, { message: 'Debe haber al menos 1 actividad por semana' })
  @Max(5, { message: 'No puede haber más de 5 actividades por semana' })
  actividadesPorSemana!: number;

  @ApiProperty({
    description: 'Tier mínimo requerido para acceder',
    enum: TierNombre,
    example: 'ARCADE',
  })
  @IsEnum(TierNombre, {
    message: 'El tier debe ser: ARCADE, ARCADE_PLUS o PRO',
  })
  tierMinimo!: TierNombre;
}
