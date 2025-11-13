import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { EstadoAsistencia } from '@prisma/client';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Trim } from '../../common/decorators/trim.decorator';

/**
 * DTO para registrar la asistencia de un estudiante individual
 */
export class AsistenciaEstudianteDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: '550e8400-e29b-41d4-a716-446655440000',
    type: String,
    format: 'uuid',
  })
  @IsString({ message: 'El ID del estudiante debe ser un texto' })
  @IsUUID('4', { message: 'El ID del estudiante debe ser un UUID válido' })
  @Trim()
  estudianteId!: string;

  @ApiProperty({
    description: 'Estado de asistencia del estudiante',
    enum: EstadoAsistencia,
    example: 'Presente',
    type: String,
  })
  @IsEnum(EstadoAsistencia, {
    message: 'El estado debe ser: Presente, Ausente, Tarde o Justificado',
  })
  estado!: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Observaciones sobre la asistencia',
    example: 'Llegó 10 minutos tarde',
    maxLength: 500,
    type: String,
  })
  @IsString({ message: 'Las observaciones deben ser un texto' })
  @IsOptional()
  @MaxLength(500, {
    message: 'Las observaciones no pueden superar los 500 caracteres',
  })
  @Trim()
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Puntos XP otorgados por asistencia (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100,
    type: Number,
  })
  @IsInt({ message: 'Los puntos deben ser un número entero' })
  @Min(0, { message: 'Los puntos no pueden ser negativos' })
  @Max(100, { message: 'Los puntos máximos por asistencia son 100' })
  @IsOptional()
  @Type(() => Number)
  puntosOtorgados?: number;
}

/**
 * DTO para registrar la asistencia de múltiples estudiantes a una clase
 */
export class RegistrarAsistenciaDto {
  @ApiProperty({
    description: 'Lista de asistencias de estudiantes',
    type: [AsistenciaEstudianteDto],
    isArray: true,
  })
  @IsArray({ message: 'Asistencias debe ser un array' })
  @ValidateNested({ each: true })
  @Type(() => AsistenciaEstudianteDto)
  asistencias!: AsistenciaEstudianteDto[];
}
