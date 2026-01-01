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
  producto_id!: string;

  @ApiPropertyOptional({
    description:
      'ID de la casa asignada (QUANTUM/VERTEX/PULSAR). Enviar null para desasignar.',
    example: 'clxyz456def',
  })
  @IsString()
  @ValidateIf((o: CreateComisionDto) => o.casa_id !== null)
  @IsOptional()
  casa_id?: string | null;

  @ApiPropertyOptional({
    description: 'ID del docente a cargo. Enviar null para desasignar.',
    example: 'clxyz789ghi',
  })
  @IsString()
  @ValidateIf((o: CreateComisionDto) => o.docente_id !== null)
  @IsOptional()
  docente_id?: string | null;

  @ApiPropertyOptional({
    description: 'Cupo máximo de estudiantes',
    example: 25,
  })
  @IsInt()
  @Min(1)
  @IsOptional()
  cupo_maximo?: number;

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
  fecha_inicio?: string;

  @ApiPropertyOptional({
    description: 'Fecha de fin de la comisión',
    example: '2026-01-31',
  })
  @IsDateString()
  @IsOptional()
  fecha_fin?: string;

  @ApiPropertyOptional({
    description: 'Si la comisión está activa',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  activo?: boolean;
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
  producto_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por casa',
  })
  @IsString()
  @IsOptional()
  casa_id?: string;

  @ApiPropertyOptional({
    description: 'Filtrar por docente',
  })
  @IsString()
  @IsOptional()
  docente_id?: string;

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
  estudiantes_ids!: string[];

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
