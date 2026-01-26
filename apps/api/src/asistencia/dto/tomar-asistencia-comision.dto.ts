import {
  IsString,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para un item individual de asistencia en comisión
 */
export class AsistenciaComisionItemDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 'cmh3iy3dd0000xw0awic6dep9',
  })
  @IsString()
  estudianteId!: string;

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
    description: 'Observaciones opcionales sobre el estudiante',
    example: 'Excelente participación',
    required: false,
  })
  @IsOptional()
  @IsString()
  observacion?: string;
}

/**
 * DTO para tomar asistencia de múltiples estudiantes en una comisión
 */
export class TomarAsistenciaComisionDto {
  @ApiProperty({
    description: 'ID de la comisión',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  @IsString()
  comisionId!: string;

  @ApiProperty({
    description: 'Fecha de la sesión en formato ISO (YYYY-MM-DD)',
    example: '2025-10-27',
  })
  @IsDateString()
  fecha!: string;

  @ApiProperty({
    description: 'Array de asistencias de estudiantes',
    type: [AsistenciaComisionItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AsistenciaComisionItemDto)
  asistencias!: AsistenciaComisionItemDto[];
}

/**
 * Response del endpoint de asistencia comisión batch
 */
export interface AsistenciaComisionBatchResponse {
  success: boolean;
  registrosCreados: number;
  registrosActualizados: number;
  estudiantes: Array<{
    estudianteId: string;
    nombre: string;
    apellido: string;
    estado: EstadoAsistencia;
    observacion: string | null;
  }>;
  mensaje: string;
}
