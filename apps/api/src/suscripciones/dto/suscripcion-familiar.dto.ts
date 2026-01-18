/**
 * DTOs para Suscripciones Familiares 2026
 *
 * Incluye validación completa con class-validator para:
 * - Crear suscripción familiar
 * - Agregar inscripciones
 * - Dar de baja inscripciones
 * - Simulación de monto
 * - Filtros de admin
 *
 * NOTA: Los IDs son CUIDs (no UUIDs) generados por Prisma
 */
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  IsEmail,
  ValidateNested,
  ArrayMinSize,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TierNombre } from '@prisma/client';

// ============================================================================
// INSCRIPCIÓN DE ACTIVIDAD (Nested DTO)
// ============================================================================

/**
 * DTO para una inscripción de actividad dentro de una suscripción familiar
 */
export class InscripcionActividadDto {
  @ApiProperty({
    description: 'ID del estudiante (CUID)',
    example: 'clxyz123abc456def',
  })
  @IsString({ message: 'El estudianteId debe ser un string' })
  @IsNotEmpty({ message: 'El estudianteId es requerido' })
  @MinLength(20, { message: 'El estudianteId no tiene formato válido' })
  estudianteId!: string;

  @ApiProperty({
    description: 'ID del producto (CUID)',
    example: 'clxyz789ghi012jkl',
  })
  @IsString({ message: 'El productoId debe ser un string' })
  @IsNotEmpty({ message: 'El productoId es requerido' })
  @MinLength(20, { message: 'El productoId no tiene formato válido' })
  productoId!: string;

  @ApiPropertyOptional({
    description: 'ID del grupo de clase (para Clubs)',
    example: 'clxyz345mno678pqr',
  })
  @IsString({ message: 'El claseGrupoId debe ser un string' })
  @MinLength(20, { message: 'El claseGrupoId no tiene formato válido' })
  @IsOptional()
  claseGrupoId?: string;

  @ApiPropertyOptional({
    description: 'ID de la comisión (para cursos temporales)',
    example: 'clxyz901stu234vwx',
  })
  @IsString({ message: 'El comisionId debe ser un string' })
  @MinLength(20, { message: 'El comisionId no tiene formato válido' })
  @IsOptional()
  comisionId?: string;

  @ApiPropertyOptional({
    description:
      'Tier específico de esta inscripción (MODELO 2026). Si no se especifica, usa el tier de la suscripción.',
    enum: TierNombre,
    example: 'STEAM_SINCRONICO',
  })
  @IsEnum(TierNombre, {
    message:
      'El tier debe ser: STEAM_LIBROS, STEAM_ASINCRONICO o STEAM_SINCRONICO',
  })
  @IsOptional()
  tier?: TierNombre;
}

// ============================================================================
// CREAR SUSCRIPCIÓN FAMILIAR
// ============================================================================

/**
 * DTO para crear una nueva suscripción familiar
 */
export class CrearSuscripcionFamiliarDto {
  @ApiProperty({
    description: 'Tier de la suscripción',
    enum: TierNombre,
    example: 'SINCRONICO',
  })
  @IsEnum(TierNombre, {
    message: 'El tier debe ser: ASINCRONICO, SINCRONICO o HIBRIDO',
  })
  @IsNotEmpty({ message: 'El tier es requerido' })
  tier!: TierNombre;

  @ApiPropertyOptional({
    description: 'Inscripciones iniciales de actividades',
    type: [InscripcionActividadDto],
  })
  @IsArray({ message: 'inscripciones debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => InscripcionActividadDto)
  @IsOptional()
  inscripciones?: InscripcionActividadDto[];

  @ApiPropertyOptional({
    description: 'Token de tarjeta generado por MercadoPago Bricks',
    example: 'card_token_123',
  })
  @IsString({ message: 'cardTokenId debe ser un string' })
  @IsOptional()
  cardTokenId?: string;

  @ApiPropertyOptional({
    description: 'Email del pagador (requerido si cardTokenId presente)',
    example: 'tutor@example.com',
  })
  @IsEmail({}, { message: 'payerEmail debe ser un email válido' })
  @IsOptional()
  payerEmail?: string;
}

// ============================================================================
// AGREGAR INSCRIPCIONES
// ============================================================================

/**
 * DTO para agregar inscripciones a una suscripción existente
 */
export class AgregarInscripcionesDto {
  @ApiProperty({
    description: 'Lista de inscripciones a agregar',
    type: [InscripcionActividadDto],
  })
  @IsArray({ message: 'inscripciones debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe agregar al menos una inscripción' })
  @ValidateNested({ each: true })
  @Type(() => InscripcionActividadDto)
  @IsNotEmpty({ message: 'inscripciones es requerido' })
  inscripciones!: InscripcionActividadDto[];
}

// ============================================================================
// BAJA DE INSCRIPCIONES
// ============================================================================

/**
 * DTO para dar de baja inscripciones
 */
export class BajaInscripcionesDto {
  @ApiProperty({
    description: 'IDs de las inscripciones a dar de baja (CUIDs)',
    type: [String],
    example: ['clxyz123abc456def', 'clxyz789ghi012jkl'],
  })
  @IsArray({ message: 'inscripcionIds debe ser un array' })
  @ArrayMinSize(1, { message: 'Debe especificar al menos una inscripción' })
  @IsString({
    each: true,
    message: 'Cada inscripcionId debe ser un string',
  })
  @IsNotEmpty({ message: 'inscripcionIds es requerido' })
  inscripcionIds!: string[];

  @ApiProperty({
    description: 'Motivo de la baja',
    example: 'Cambio de horarios',
  })
  @IsString({ message: 'motivo debe ser un string' })
  @IsNotEmpty({ message: 'motivo es requerido' })
  motivo!: string;
}

// ============================================================================
// SIMULAR MONTO (Query)
// ============================================================================

/**
 * DTO para query de simulación de monto
 */
export class SimularMontoQueryDto {
  @ApiProperty({
    description: 'IDs de productos separados por coma',
    example: 'uuid-1,uuid-2,uuid-3',
  })
  @IsString({ message: 'productoIds debe ser un string' })
  @IsNotEmpty({ message: 'productoIds es requerido' })
  productoIds!: string;
}

// ============================================================================
// CAMBIAR HORARIO
// ============================================================================

/**
 * DTO para cambiar el horario (ClaseGrupo) de una inscripción
 */
export class CambiarHorarioDto {
  @ApiProperty({
    description: 'ID de la inscripción a modificar (CUID)',
    example: 'clxyz123abc456def',
  })
  @IsString({ message: 'El inscripcionId debe ser un string' })
  @IsNotEmpty({ message: 'El inscripcionId es requerido' })
  @MinLength(20, { message: 'El inscripcionId no tiene formato válido' })
  inscripcionId!: string;

  @ApiProperty({
    description: 'ID del nuevo ClaseGrupo (CUID)',
    example: 'clxyz789ghi012jkl',
  })
  @IsString({ message: 'El nuevoClaseGrupoId debe ser un string' })
  @IsNotEmpty({ message: 'El nuevoClaseGrupoId es requerido' })
  @MinLength(20, { message: 'El nuevoClaseGrupoId no tiene formato válido' })
  nuevoClaseGrupoId!: string;
}

// ============================================================================
// CAMBIAR PRODUCTO
// ============================================================================

/**
 * DTO para cambiar el producto de una inscripción
 */
export class CambiarProductoDto {
  @ApiProperty({
    description: 'ID de la inscripción a modificar (CUID)',
    example: 'clxyz123abc456def',
  })
  @IsString({ message: 'El inscripcionId debe ser un string' })
  @IsNotEmpty({ message: 'El inscripcionId es requerido' })
  @MinLength(20, { message: 'El inscripcionId no tiene formato válido' })
  inscripcionId!: string;

  @ApiProperty({
    description: 'ID del nuevo producto (CUID)',
    example: 'clxyz789ghi012jkl',
  })
  @IsString({ message: 'El nuevoProductoId debe ser un string' })
  @IsNotEmpty({ message: 'El nuevoProductoId es requerido' })
  @MinLength(20, { message: 'El nuevoProductoId no tiene formato válido' })
  nuevoProductoId!: string;

  @ApiPropertyOptional({
    description: 'ID del ClaseGrupo del nuevo producto (CUID)',
    example: 'clxyz345mno678pqr',
  })
  @IsString({ message: 'El nuevoClaseGrupoId debe ser un string' })
  @MinLength(20, { message: 'El nuevoClaseGrupoId no tiene formato válido' })
  @IsOptional()
  nuevoClaseGrupoId?: string;

  @ApiPropertyOptional({
    description: 'ID de la comisión del nuevo producto (CUID)',
    example: 'clxyz901stu234vwx',
  })
  @IsString({ message: 'El nuevaComisionId debe ser un string' })
  @MinLength(20, { message: 'El nuevaComisionId no tiene formato válido' })
  @IsOptional()
  nuevaComisionId?: string;
}

// ============================================================================
// CAMBIAR TIER
// ============================================================================

/**
 * DTO para cambiar el tier de la suscripción (toda la familia)
 * @deprecated Usar CambiarTierInscripcionDto para cambiar tier por inscripción
 */
export class CambiarTierDto {
  @ApiProperty({
    description: 'Nuevo tier de la suscripción',
    enum: TierNombre,
    example: 'STEAM_SINCRONICO',
  })
  @IsEnum(TierNombre, {
    message:
      'El tier debe ser: STEAM_LIBROS, STEAM_ASINCRONICO o STEAM_SINCRONICO',
  })
  @IsNotEmpty({ message: 'El nuevoTier es requerido' })
  nuevoTier!: TierNombre;
}

/**
 * DTO para cambiar el tier de una inscripción específica (MODELO 2026)
 *
 * Permite cambiar el tier de una inscripción individual sin afectar
 * las demás inscripciones de la familia.
 */
export class CambiarTierInscripcionDto {
  @ApiProperty({
    description: 'Nuevo tier para esta inscripción',
    enum: TierNombre,
    example: 'STEAM_SINCRONICO',
  })
  @IsEnum(TierNombre, {
    message:
      'El tier debe ser: STEAM_LIBROS, STEAM_ASINCRONICO o STEAM_SINCRONICO',
  })
  @IsNotEmpty({ message: 'El nuevoTier es requerido' })
  nuevoTier!: TierNombre;
}

// ============================================================================
// ADMIN: FILTROS
// ============================================================================

/**
 * DTO para filtros de listado admin
 */
export class AdminFiltrosDto {
  @ApiPropertyOptional({
    description: 'Filtrar por estado de suscripción',
    example: 'ACTIVA',
  })
  @IsString({ message: 'estado debe ser un string' })
  @IsOptional()
  estado?: string;

  @ApiPropertyOptional({
    description: 'Número de página (default 1)',
    example: 1,
  })
  @IsOptional()
  page?: number;

  @ApiPropertyOptional({
    description: 'Resultados por página (default 20)',
    example: 20,
  })
  @IsOptional()
  limit?: number;
}
