import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EstadoPlanificacion } from '@prisma/client';
import {
  PlanificacionWithCounts,
  PaginatedResult,
  PlanificacionDetail,
} from '../../domain/planificacion.repository.interface';
import { ActividadResponseDto } from './actividad.response.dto';

class PlanificacionGrupoDto {
  @ApiProperty({ example: 'grupo_123' })
  id!: string;

  @ApiProperty({ example: 'B1' })
  codigo!: string;

  @ApiProperty({ example: 'Básico 1' })
  nombre!: string;

  static fromEntity(entity: { id: string; codigo: string; nombre: string }): PlanificacionGrupoDto {
    const dto = new PlanificacionGrupoDto();
    dto.id = entity.id;
    dto.codigo = entity.codigo;
    dto.nombre = entity.nombre;
    return dto;
  }
}

export class PlanificacionListItemResponseDto {
  @ApiProperty({ example: 'plan_123' })
  id!: string;

  @ApiProperty({ example: 'grupo_123' })
  grupoId!: string;

  @ApiPropertyOptional({ example: 'B1' })
  codigoGrupo?: string;

  @ApiPropertyOptional({ type: () => PlanificacionGrupoDto })
  grupo?: PlanificacionGrupoDto;

  @ApiProperty({ example: 3, minimum: 1, maximum: 12 })
  mes!: number;

  @ApiProperty({ example: 2025 })
  anio!: number;

  @ApiProperty({ example: 'Multiplicaciones - Marzo 2025' })
  titulo!: string;

  @ApiProperty({ example: 'Plan mensual de multiplicaciones con gamificación' })
  descripcion!: string;

  @ApiProperty({ example: 'Multiplicaciones' })
  tematicaPrincipal!: string;

  @ApiProperty({ type: [String], example: ['Resolver multiplicaciones hasta 10x10'] })
  objetivosAprendizaje!: string[];

  @ApiProperty({ enum: EstadoPlanificacion, example: EstadoPlanificacion.BORRADOR })
  estado!: EstadoPlanificacion;

  @ApiProperty({ example: 'admin_123' })
  createdByAdminId!: string;

  @ApiPropertyOptional({ example: 'Notas adicionales para docentes' })
  notasDocentes!: string | null;

  @ApiPropertyOptional({ example: '2025-02-28T12:00:00.000Z' })
  fechaPublicacion!: Date | null;

  @ApiProperty({ example: '2025-02-01T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-02-10T12:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 4 })
  activityCount!: number;

  @ApiProperty({ example: 2 })
  assignmentCount!: number;

  static fromEntity(entity: PlanificacionWithCounts): PlanificacionListItemResponseDto {
    const dto = new PlanificacionListItemResponseDto();
    dto.id = entity.id;
    dto.grupoId = entity.grupoId;
    dto.codigoGrupo = entity.codigoGrupo;
    dto.grupo = entity.grupo ? PlanificacionGrupoDto.fromEntity(entity.grupo) : undefined;
    dto.mes = entity.mes;
    dto.anio = entity.anio;
    dto.titulo = entity.titulo;
    dto.descripcion = entity.descripcion;
    dto.tematicaPrincipal = entity.tematicaPrincipal;
    dto.objetivosAprendizaje = entity.objetivosAprendizaje;
    dto.estado = entity.estado;
    dto.createdByAdminId = entity.createdByAdminId;
    dto.notasDocentes = entity.notasDocentes;
    dto.fechaPublicacion = entity.fechaPublicacion;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    dto.activityCount = entity.activityCount;
    dto.assignmentCount = entity.assignmentCount;
    return dto;
  }
}

export class PlanificacionListResponseDto {
  @ApiProperty({ type: [PlanificacionListItemResponseDto] })
  data!: PlanificacionListItemResponseDto[];

  @ApiProperty({ example: 20 })
  total!: number;

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 10 })
  limit!: number;

  @ApiProperty({ example: 2 })
  totalPages!: number;

  static fromResult(
    result: PaginatedResult<PlanificacionWithCounts>,
  ): PlanificacionListResponseDto {
    const dto = new PlanificacionListResponseDto();
    dto.data = result.data.map(PlanificacionListItemResponseDto.fromEntity);
    dto.total = result.total;
    dto.page = result.page;
    dto.limit = result.limit;
    dto.totalPages = result.totalPages;
    return dto;
  }
}

export class PlanificacionDetailResponseDto extends PlanificacionListItemResponseDto {
  @ApiProperty({ type: [ActividadResponseDto] })
  actividades!: ActividadResponseDto[];

  static fromDetail(detail: PlanificacionDetail): PlanificacionDetailResponseDto {
    const dto = new PlanificacionDetailResponseDto();
    Object.assign(dto, PlanificacionListItemResponseDto.fromEntity(detail));
    dto.actividades = detail.actividades.map(ActividadResponseDto.fromEntity);
    return dto;
  }
}
