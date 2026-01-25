/**
 * ============================================================================
 * VERANO ADMIN DTOs - Request/Response para endpoints Admin de Verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md (sección 4.3)
 */

import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DecisionVeranoInput } from '../../tutor/dto/verano.dto';

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * Query para GET /admin/verano/decisiones
 */
export class GetDecisionesVeranoQueryDto {
  @ApiPropertyOptional({
    description: 'Filtrar por tipo de decisión',
    enum: ['COLONIA', 'CONTINUIDAD', 'PENDIENTE', 'BAJA'],
  })
  @IsString()
  @IsOptional()
  filtro?: 'COLONIA' | 'CONTINUIDAD' | 'PENDIENTE' | 'BAJA';
}

/**
 * POST /admin/verano/forzar-decision
 * Admin override para forzar decisión de un estudiante
 */
export class ForzarDecisionVeranoDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 'clx1234567890abcdef12345',
  })
  @IsString()
  @IsNotEmpty()
  estudianteId: string;

  @ApiProperty({
    description: 'Decisión a forzar',
    enum: DecisionVeranoInput,
    example: 'COLONIA',
  })
  @IsEnum(DecisionVeranoInput)
  decision: DecisionVeranoInput;

  @ApiProperty({
    description: 'Motivo del override (requerido para auditoría)',
    example: 'Beca especial aprobada por dirección',
  })
  @IsString()
  @IsNotEmpty()
  motivo: string;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Cupo de un grupo de Colonia
 */
export class CupoGrupoColoniaDto {
  @ApiProperty({ description: 'ID del grupo' })
  grupoId: string;

  @ApiProperty({ description: 'Nombre del grupo' })
  nombre: string;

  @ApiProperty({ description: 'Cupo total del grupo' })
  cupoTotal: number;

  @ApiProperty({ description: 'Cupo ocupado actualmente' })
  cupoOcupado: number;

  @ApiProperty({ description: 'Cupo disponible' })
  disponible: number;
}

/**
 * Response para GET /admin/verano/resumen
 */
export class ResumenVeranoResponseDto {
  @ApiProperty({ description: 'Total de estudiantes con suscripción activa' })
  totalEstudiantes: number;

  @ApiProperty({ description: 'Estudiantes que eligieron Colonia' })
  decidieronColonia: number;

  @ApiProperty({ description: 'Estudiantes que eligieron Continuidad' })
  decidieronContinuidad: number;

  @ApiProperty({ description: 'Estudiantes que no respondieron' })
  noRespondieron: number;

  @ApiProperty({ description: 'Fecha límite para decidir' })
  fechaLimite: string;

  @ApiProperty({
    description: 'Cupos por grupo de Colonia',
    type: [CupoGrupoColoniaDto],
  })
  cuposColoniaPorGrupo: CupoGrupoColoniaDto[];
}

/**
 * Decisión individual de un estudiante (para listado admin)
 */
export class DecisionEstudianteDto {
  @ApiProperty({ description: 'ID del estudiante' })
  estudianteId: string;

  @ApiProperty({ description: 'Nombre completo del estudiante' })
  nombre: string;

  @ApiProperty({ description: 'Nombre del tutor' })
  tutor: string;

  @ApiProperty({ description: 'Decisión tomada' })
  decision: string;

  @ApiPropertyOptional({ description: 'Fecha de la decisión' })
  fechaDecision?: string;
}

/**
 * Response para POST /admin/verano/procesar-bajas
 */
export class ProcesarBajasResponseDto {
  @ApiProperty({ description: 'Cantidad de suscripciones procesadas' })
  procesados: number;

  @ApiProperty({
    description: 'IDs de estudiantes dados de baja',
    type: [String],
  })
  dadosDeBaja: string[];
}

/**
 * Response para POST /admin/verano/restaurar-suscripciones
 */
export class RestaurarSuscripcionesResponseDto {
  @ApiProperty({ description: 'Cantidad de suscripciones restauradas' })
  restaurados: number;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  mensaje: string;
}

/**
 * Response para POST /admin/verano/forzar-decision
 */
export class ForzarDecisionResponseDto {
  @ApiProperty({ description: 'Si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  mensaje: string;
}
