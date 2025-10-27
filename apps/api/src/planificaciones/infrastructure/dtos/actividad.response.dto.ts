import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { NivelDificultad } from '@prisma/client';
import { ActividadEntity } from '../../domain/actividad.entity';

export class ActividadResponseDto {
  @ApiProperty({ example: 'act_123' })
  id!: string;

  @ApiProperty({ example: 'plan_123' })
  planificacionId!: string;

  @ApiProperty({ example: 1, minimum: 1, maximum: 4 })
  semana!: number;

  @ApiProperty({ example: 'Semana 1: Tablas del 2' })
  titulo!: string;

  @ApiProperty({ example: 'Actividad de práctica de tablas de multiplicar' })
  descripcion!: string;

  @ApiProperty({ example: 'JuegoTablasMultiplicar' })
  componente!: string;

  @ApiProperty({ type: Object, example: { tablas: [2, 3, 4] } })
  props!: Record<string, unknown>;

  @ApiProperty({ enum: NivelDificultad, example: NivelDificultad.BASICO })
  nivelDificultad!: NivelDificultad;

  @ApiProperty({ example: 30 })
  tiempoEstimadoMinutos!: number;

  @ApiProperty({ example: 20 })
  puntosGamificacion!: number;

  @ApiProperty({ example: 'Guía paso a paso para el docente' })
  instruccionesDocente!: string;

  @ApiProperty({ example: 'Completar el juego 2 veces' })
  instruccionesEstudiante!: string;

  @ApiPropertyOptional({
    type: Object,
    example: [{ tipo: 'pdf', titulo: 'Guía', url: 'https://...' }],
  })
  recursosUrl!: Record<string, unknown> | null;

  @ApiProperty({ example: 1 })
  orden!: number;

  @ApiProperty({ example: '2025-01-05T12:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2025-01-05T12:00:00.000Z' })
  updatedAt!: Date;

  static fromEntity(entity: ActividadEntity): ActividadResponseDto {
    const dto = new ActividadResponseDto();
    dto.id = entity.id;
    dto.planificacionId = entity.planificacionId;
    dto.semana = entity.semanaNumero;
    dto.titulo = entity.titulo;
    dto.descripcion = entity.descripcion;
    dto.componente = entity.componenteNombre;
    dto.props = entity.componenteProps;
    dto.nivelDificultad = entity.nivelDificultad;
    dto.tiempoEstimadoMinutos = entity.tiempoEstimadoMinutos;
    dto.puntosGamificacion = entity.puntosGamificacion;
    dto.instruccionesDocente = entity.instruccionesDocente;
    dto.instruccionesEstudiante = entity.instruccionesEstudiante;
    dto.recursosUrl = entity.recursosUrl ?? null;
    dto.orden = entity.orden;
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }
}
