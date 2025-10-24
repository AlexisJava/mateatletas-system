import { IsString, IsBoolean, IsOptional, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AsignarPlanificacionDto {
  @ApiProperty({ example: 'planif-123-xyz', description: 'ID de la planificación mensual' })
  @IsString()
  planificacion_id!: string;

  @ApiProperty({ example: 'clase-grupo-abc', description: 'ID del clase grupo' })
  @IsString()
  clase_grupo_id!: string;

  @ApiProperty({ example: 'docente-xyz', description: 'ID del docente' })
  @IsString()
  docente_id!: string;

  @ApiProperty({ example: true, default: true, required: false })
  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @ApiProperty({ example: 'Esta semana trabajaremos con fracciones...', required: false })
  @IsOptional()
  @IsString()
  mensaje_docente?: string;

  @ApiProperty({ example: '2025-11-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  fecha_inicio_custom?: string;
}
