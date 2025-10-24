import { IsString, IsBoolean, IsInt, IsObject, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ActualizarProgresoDto {
  @ApiProperty({ example: 'estudiante-abc', description: 'ID del estudiante' })
  @IsString()
  estudiante_id!: string;

  @ApiProperty({ example: 'actividad-xyz', description: 'ID de la actividad' })
  @IsString()
  actividad_id!: string;

  @ApiProperty({ example: 'asignacion-123', description: 'ID de la asignación' })
  @IsString()
  asignacion_id!: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  iniciado?: boolean;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @ApiProperty({ example: 150, description: 'Puntos obtenidos', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  puntos_obtenidos?: number;

  @ApiProperty({ example: 30, description: 'Tiempo total en minutos', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  tiempo_total_minutos?: number;

  @ApiProperty({ example: 3, description: 'Número de intentos', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  intentos?: number;

  @ApiProperty({ example: 200, description: 'Mejor puntaje logrado', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  mejor_puntaje?: number;

  @ApiProperty({
    example: { nivel: 5, vidas: 3 },
    description: 'Estado del juego para poder continuar después',
    required: false,
  })
  @IsOptional()
  @IsObject()
  estado_juego?: Record<string, any>;

  @ApiProperty({
    example: { respuestas: [true, false, true] },
    description: 'Detalle de respuestas para analytics',
    required: false,
  })
  @IsOptional()
  @IsObject()
  respuestas_detalle?: Record<string, any>;
}
