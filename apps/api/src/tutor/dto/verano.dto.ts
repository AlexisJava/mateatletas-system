/**
 * ============================================================================
 * VERANO DTOs - Request/Response para endpoints de Verano
 * ============================================================================
 *
 * Spec: docs/spec_modelo_suscripciones_verano.md
 */

import {
  IsString,
  IsEnum,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Opciones de decisión de verano para el tutor
 * NOTA: BAJA no está en DecisionVerano del schema, pero es una opción válida
 * al momento de decidir. Internamente se traduce a cancelación.
 */
export enum DecisionVeranoInput {
  COLONIA = 'COLONIA',
  CONTINUIDAD = 'CONTINUIDAD',
  BAJA = 'BAJA',
}

// ============================================================================
// REQUEST DTOs
// ============================================================================

/**
 * POST /tutor/verano/decidir
 * Tomar decisión de verano para un estudiante
 */
export class DecidirVeranoDto {
  @ApiProperty({
    description: 'ID del estudiante para el que se toma la decisión',
    example: 'clx1234567890abcdef12345',
  })
  @IsString()
  @IsNotEmpty()
  estudianteId: string;

  @ApiProperty({
    description: 'Decisión de verano',
    enum: DecisionVeranoInput,
    example: 'COLONIA',
  })
  @IsEnum(DecisionVeranoInput)
  decision: DecisionVeranoInput;
}

/**
 * POST /tutor/verano/solicitar-colonia
 * Cambio tardío: de CONTINUIDAD a COLONIA (si hay cupo)
 */
export class SolicitarColoniaDto {
  @ApiProperty({
    description: 'ID del estudiante que solicita cambiar a Colonia',
    example: 'clx1234567890abcdef12345',
  })
  @IsString()
  @IsNotEmpty()
  estudianteId: string;

  @ApiPropertyOptional({
    description: 'ID del grupo de Colonia preferido (opcional)',
    example: 'clx1234567890abcdef67890',
  })
  @IsString()
  @IsOptional()
  grupoPreferidoId?: string;
}

/**
 * POST /tutor/verano/cancelar-colonia
 * Cambio tardío: de COLONIA a CONTINUIDAD (pierde matrícula)
 */
export class CancelarColoniaDto {
  @ApiProperty({
    description: 'ID del estudiante que cancela Colonia',
    example: 'clx1234567890abcdef12345',
  })
  @IsString()
  @IsNotEmpty()
  estudianteId: string;

  @ApiProperty({
    description:
      'Confirmación de que acepta perder la matrícula de $40k (NO reembolsable)',
    example: true,
  })
  @IsBoolean()
  confirmaPerderMatricula: boolean;
}

// ============================================================================
// RESPONSE DTOs
// ============================================================================

/**
 * Response para POST /tutor/verano/decidir
 */
export class DecidirVeranoResponseDto {
  @ApiProperty({ description: 'Si la operación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  mensaje: string;

  @ApiProperty({ description: 'Monto del próximo cobro en pesos' })
  montoProximoCobro: number;
}

/**
 * Response para POST /tutor/verano/solicitar-colonia
 */
export class SolicitarColoniaResponseDto {
  @ApiProperty({ description: 'Si la solicitud fue aprobada' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  mensaje: string;

  @ApiPropertyOptional({ description: 'ID del grupo de Colonia asignado' })
  cupoAsignado?: string;
}

/**
 * Response para POST /tutor/verano/cancelar-colonia
 */
export class CancelarColoniaResponseDto {
  @ApiProperty({ description: 'Si la cancelación fue exitosa' })
  success: boolean;

  @ApiProperty({ description: 'Mensaje descriptivo' })
  mensaje: string;
}

/**
 * Información de un estudiante para la decisión de verano
 */
export class EstudianteVeranoDto {
  @ApiProperty({ description: 'ID del estudiante' })
  id: string;

  @ApiProperty({ description: 'Nombre del estudiante' })
  nombre: string;

  @ApiProperty({
    description: 'Decisión actual (null si no decidió)',
    nullable: true,
  })
  decision: string | null;

  @ApiProperty({ description: 'Cupos disponibles en grupos de Colonia' })
  cuposColoniaDisponibles: number;
}

/**
 * Response para GET /tutor/verano/estado
 */
export class EstadoVeranoResponseDto {
  @ApiProperty({
    description: 'Si está dentro del período de decisión (15 nov - 5 dic)',
  })
  puedeDecidir: boolean;

  @ApiProperty({ description: 'Fecha límite para decidir' })
  fechaLimite: string;

  @ApiProperty({
    description: 'Lista de estudiantes con su estado de decisión',
    type: [EstudianteVeranoDto],
  })
  estudiantes: EstudianteVeranoDto[];
}
