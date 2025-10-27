import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  MaxLength,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoAsistencia } from '@prisma/client';

/**
 * DTO para registrar una asistencia individual
 */
export class RegistrarAsistenciaItemDto {
  @ApiProperty({
    description: 'ID del estudiante',
    example: 'clxxx123',
  })
  @IsString()
  @IsNotEmpty()
  estudiante_id!: string;

  @ApiProperty({
    description: 'Estado de la asistencia',
    enum: EstadoAsistencia,
    example: EstadoAsistencia.Presente,
  })
  @IsEnum(EstadoAsistencia)
  estado!: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Observaciones sobre la asistencia',
    example: 'Llegó 10 minutos tarde por tráfico',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Feedback personalizado para el estudiante',
    example: 'Excelente participación en clase',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;
}

/**
 * DTO para registrar asistencias de una fecha específica
 */
export class RegistrarAsistenciasDto {
  @ApiProperty({
    description: 'Fecha de la clase en formato ISO 8601',
    example: '2025-10-26T19:30:00.000Z',
  })
  @IsDateString()
  fecha!: string;

  @ApiProperty({
    description: 'Lista de asistencias a registrar',
    type: [RegistrarAsistenciaItemDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegistrarAsistenciaItemDto)
  asistencias!: RegistrarAsistenciaItemDto[];
}

/**
 * DTO para actualizar una asistencia individual
 */
export class ActualizarAsistenciaDto {
  @ApiPropertyOptional({
    description: 'Nuevo estado de la asistencia',
    enum: EstadoAsistencia,
  })
  @IsOptional()
  @IsEnum(EstadoAsistencia)
  estado?: EstadoAsistencia;

  @ApiPropertyOptional({
    description: 'Nuevas observaciones',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  observaciones?: string;

  @ApiPropertyOptional({
    description: 'Nuevo feedback para el estudiante',
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  feedback?: string;
}

/**
 * DTO para filtros de historial de asistencias
 */
export class FiltrosHistorialAsistenciasDto {
  @ApiPropertyOptional({
    description: 'Fecha de inicio del rango (ISO 8601)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_desde?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin del rango (ISO 8601)',
    example: '2025-12-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  fecha_hasta?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por estudiante específico',
    example: 'clxxx123',
  })
  @IsOptional()
  @IsString()
  estudiante_id?: string;
}
