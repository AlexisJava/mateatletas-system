import {
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsDateString,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para un item individual de asistencia
 * Representa la asistencia de UN estudiante en una clase específica
 */
export class AsistenciaItemDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 'cmh3iy3dd0000xw0awic6dep9',
  })
  @IsString()
  estudiante_id!: string;

  @ApiProperty({
    description: 'Estado de asistencia del estudiante',
    enum: EstadoAsistencia,
    example: EstadoAsistencia.Presente,
  })
  @IsEnum(EstadoAsistencia, {
    message: 'Estado debe ser: Presente, Ausente o Justificado',
  })
  estado!: EstadoAsistencia;

  @ApiProperty({
    description: 'Observaciones opcionales sobre el estudiante en esta clase',
    example: 'Excelente participación en resolución de problemas',
    required: false,
  })
  @IsOptional()
  @IsString()
  observaciones?: string;
}

/**
 * DTO para tomar asistencia de múltiples estudiantes en una sola request
 * Usado en el modo "Clase en Vivo" del portal docente
 */
export class TomarAsistenciaBatchDto {
  @ApiProperty({
    description: 'ID del grupo de clase',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @IsString()
  clase_grupo_id!: string;

  @ApiProperty({
    description: 'Fecha de la clase en formato ISO (YYYY-MM-DD)',
    example: '2025-10-27',
  })
  @IsDateString()
  fecha!: string;

  @ApiProperty({
    description: 'Array de asistencias de estudiantes',
    type: [AsistenciaItemDto],
    minItems: 1,
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe incluir al menos un estudiante' })
  @ValidateNested({ each: true })
  @Type(() => AsistenciaItemDto)
  asistencias!: AsistenciaItemDto[];
}

/**
 * Response del endpoint de asistencia batch
 */
export interface AsistenciaBatchResponse {
  success: boolean;
  registrosCreados: number;
  registrosActualizados: number;
  estudiantes: Array<{
    estudianteId: string;
    nombre: string;
    apellido: string;
    estado: EstadoAsistencia;
    observaciones: string | null;
  }>;
  mensaje: string;
}
