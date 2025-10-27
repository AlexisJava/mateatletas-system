import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPlanificacion } from '@prisma/client';
import { PlanificacionWithCounts } from '../../domain/planificacion.repository.interface';

/**
 * DTO for Planification list item response
 *
 * Represents a planification in list views with aggregated counts.
 */
export class PlanificacionListItemDto {
  @ApiProperty({ example: 'cm123abc456' })
  id!: string;

  @ApiProperty({ example: 'b5ac168d-1b44-4357-8e73-4339db2fa77c' })
  grupo_id!: string;

  @ApiProperty({ example: 11, minimum: 1, maximum: 12 })
  mes!: number;

  @ApiProperty({ example: 2025 })
  anio!: number;

  @ApiProperty({ example: 'Planificación Noviembre - Suma y Resta' })
  titulo!: string;

  @ApiProperty({ example: 'Suma y resta con reagrupamiento' })
  tematica_principal!: string;

  @ApiProperty({
    enum: EstadoPlanificacion,
    example: EstadoPlanificacion.PUBLICADA,
  })
  estado!: EstadoPlanificacion;

  @ApiProperty({
    example: 12,
    description: 'Total de actividades en la planificación',
  })
  total_actividades!: number;

  @ApiProperty({
    example: 3,
    description: 'Total de asignaciones a docentes/grupos',
  })
  total_asignaciones!: number;

  @ApiPropertyOptional({ example: '2025-11-01T00:00:00.000Z' })
  fecha_publicacion!: Date | null;

  @ApiProperty({ example: '2025-10-24T10:30:00.000Z' })
  created_at!: Date;

  @ApiProperty({ example: '2025-10-24T10:30:00.000Z' })
  updated_at!: Date;

  /**
   * Map domain entity to DTO
   */
  static fromEntity(entity: PlanificacionWithCounts): PlanificacionListItemDto {
    const dto = new PlanificacionListItemDto();
    dto.id = entity.id;
    dto.grupo_id = entity.grupoId;
    dto.mes = entity.mes;
    dto.anio = entity.anio;
    dto.titulo = entity.titulo;
    dto.tematica_principal = entity.tematicaPrincipal;
    dto.estado = entity.estado;
    dto.total_actividades = entity.activityCount;
    dto.total_asignaciones = entity.assignmentCount;
    dto.fecha_publicacion = entity.fechaPublicacion;
    dto.created_at = entity.createdAt;
    dto.updated_at = entity.updatedAt;
    return dto;
  }
}

/**
 * DTO for paginated planification list response
 */
export class PlanificacionListResponseDto {
  @ApiProperty({ type: [PlanificacionListItemDto] })
  data!: PlanificacionListItemDto[];

  @ApiProperty({ example: 42 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 5 })
  total_pages!: number;
}
