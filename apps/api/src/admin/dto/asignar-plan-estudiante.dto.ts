import {
  IsString,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Estados de acceso del estudiante
 * Independiente del estado de pago del tutor
 */
export enum EstadoAccesoEstudiante {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  VENCIDO = 'VENCIDO',
  BECA = 'BECA',
}

/**
 * DTO para asignar plan directamente a un estudiante
 * Permite al admin configurar el plan de cada estudiante individualmente
 */
export class AsignarPlanEstudianteDto {
  @ApiProperty({
    description: 'ID del plan a asignar (null para heredar del tutor)',
    example: 'clxxxxx...',
    required: false,
  })
  @IsOptional()
  @IsString()
  plan_id?: string | null;

  @ApiPropertyOptional({
    description: 'Estado del acceso del estudiante',
    enum: EstadoAccesoEstudiante,
    default: EstadoAccesoEstudiante.ACTIVO,
  })
  @IsOptional()
  @IsEnum(EstadoAccesoEstudiante)
  estado_acceso?: EstadoAccesoEstudiante;

  @ApiPropertyOptional({
    description: 'Fecha de vencimiento del plan (para becas temporales)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_vencimiento_plan?: string | null;

  @ApiPropertyOptional({
    description: 'Notas administrativas sobre el plan',
    example: 'Beca 100% por olimpiada matemática 2026',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notas_plan?: string | null;
}
