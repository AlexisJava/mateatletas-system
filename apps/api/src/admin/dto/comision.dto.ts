import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsArray,
  ValidateIf,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { EstadoInscripcionComision } from '@prisma/client';

/**
 * DTO para crear una comisión de un producto
 */
export class CreateComisionDto {
  @ApiProperty({
    description: 'Nombre de la comisión',
    example: 'Turno Mañana - QUANTUM',
  })
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @ApiPropertyOptional({
    description: 'Descripción de la comisión',
    example: 'Grupo de la mañana para niños de 6-9 años',
  })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({
    description: 'ID del producto al que pertenece',
    example: 'clxyz123abc',
  })
  @IsString()
  @IsNotEmpty()
  productoId!: string;

  @ApiPropertyOptional({
    description:
      'ID de la casa asignada (QUANTUM/VERTEX/PULSAR). Enviar null para desasignar.',
    example: 'clxyz456def',
  })
  @IsString()
  @ValidateIf((o: CreateComisionDto) => o.casaId !== null)
  @IsOptional()
  casaId?: string | null;

  @ApiPropertyOptional({
    description: 'ID del docente a cargo. Enviar null para desasignar.',
    example: 'clxyz789ghi',
  })
  @IsString()
  @ValidateIf((o: CreateComisionDto) => o.docenteId !== null)
  @IsOptional()
  docenteId?: string | null;

  @ApiPropertyOptional({
    description: 'Cupo máximo de estudiantes',
    example: 25,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  cupoMaximo?: number;

  @ApiPropertyOptional({
    description: 'Horario en texto libre',
    example: 'Lun-Vie 9:00-12:00',
  })
  @IsString()
  @IsOptional()
  horario?: string;

  @ApiPropertyOptional({
    description: 'Fecha de inicio de la comisión',
    example: '2026-01-06',
  })
  @IsDateString()
  @IsOptional()
  fechaInicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de la comisión',
    example: '2026-01-31',
  })
  @IsDateString()
  @IsOptional()
  fechaFin?: string;

  @ApiPropertyOptional({
    description: 'Si la comisión está activa',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;

  @ApiPropertyOptional({
    description:
      'ID de la planificación específica para esta comisión (override de la del producto). Enviar null para usar la del producto.',
    example: 'clxyzplanif123',
  })
  @IsString()
  @ValidateIf((o: CreateComisionDto) => o.planificacionId !== null)
  @IsOptional()
  planificacionId?: string | null;
}

/**
 * DTO para actualizar una comisión
 */
export class UpdateComisionDto extends PartialType(CreateComisionDto) {}

/**
 * DTO para filtrar comisiones
 */
export class FiltrosComisionDto {
  @ApiPropertyOptional({
    description: 'Filtrar por producto',
  })
  @IsString()
  @IsOptional()
  productoId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por casa',
  })
  @IsString()
  @IsOptional()
  casaId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por docente',
  })
  @IsString()
  @IsOptional()
  docenteId?: string;

  @ApiPropertyOptional({
    description: 'Filtrar solo activas',
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
}

/**
 * DTO para inscribir estudiantes a una comisión
 */
export class InscribirEstudiantesDto {
  @ApiProperty({
    description: 'IDs de los estudiantes a inscribir',
    example: ['clxyz111', 'clxyz222'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  estudiantesIds!: string[];

  @ApiPropertyOptional({
    description: 'Estado inicial de la inscripción',
    enum: EstadoInscripcionComision,
    default: EstadoInscripcionComision.Pendiente,
  })
  @IsEnum(EstadoInscripcionComision)
  @IsOptional()
  estado?: EstadoInscripcionComision;
}

/**
 * DTO para actualizar estado de inscripción
 */
export class ActualizarInscripcionDto {
  @ApiProperty({
    description: 'Nuevo estado de la inscripción',
    enum: EstadoInscripcionComision,
  })
  @IsEnum(EstadoInscripcionComision)
  estado!: EstadoInscripcionComision;

  @ApiPropertyOptional({
    description: 'Notas sobre el cambio',
  })
  @IsString()
  @IsOptional()
  notas?: string;
}
