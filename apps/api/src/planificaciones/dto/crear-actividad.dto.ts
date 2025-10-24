import { IsString, IsInt, IsEnum, IsObject, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { NivelDificultad } from '@prisma/client';

export class CrearActividadDto {
  @ApiProperty({ example: 'planif-123-xyz', description: 'ID de la planificación' })
  @IsString()
  planificacion_id!: string;

  @ApiProperty({ example: 1, description: 'Número de semana (1-4)', minimum: 1 })
  @IsInt()
  @Min(1)
  semana_numero!: number;

  @ApiProperty({ example: 'La Aventura de los Números Perdidos', description: 'Título de la actividad semanal' })
  @IsString()
  titulo!: string;

  @ApiProperty({ example: 'Los estudiantes deberán encontrar los números perdidos...', description: 'Descripción de la actividad' })
  @IsString()
  descripcion!: string;

  @ApiProperty({
    example: 'PlanificacionNoviembre2025Nivel1',
    description: 'Nombre del componente React a cargar',
  })
  @IsString()
  componente_nombre!: string;

  @ApiProperty({
    example: { tema: 'espacial', nivel: 1 },
    description: 'Configuración personalizada del componente',
  })
  @IsObject()
  componente_props!: Record<string, any>;

  @ApiProperty({ example: 'BASICO', enum: NivelDificultad })
  @IsEnum(NivelDificultad)
  nivel_dificultad!: NivelDificultad;

  @ApiProperty({ example: 75, description: 'Duración estimada en minutos' })
  @IsInt()
  @Min(1)
  tiempo_estimado_minutos!: number;

  @ApiProperty({ example: 100, description: 'Puntos de gamificación por completar' })
  @IsInt()
  @Min(0)
  puntos_gamificacion!: number;

  @ApiProperty({ example: 'Instrucciones para el docente...', description: 'Instrucciones para el docente' })
  @IsString()
  instrucciones_docente!: string;

  @ApiProperty({ example: 'Instrucciones para el estudiante...', description: 'Instrucciones para el estudiante' })
  @IsString()
  instrucciones_estudiante!: string;

  @ApiProperty({ example: 1, description: 'Orden de la actividad', minimum: 1 })
  @IsInt()
  @Min(1)
  orden!: number;
}
