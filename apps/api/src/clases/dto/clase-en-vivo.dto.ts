import { ApiProperty } from '@nestjs/swagger';

/**
 * Response DTO para operaciones de clase en vivo
 */
export class ClaseEnVivoResponseDto {
  @ApiProperty({
    description: 'ID del ClaseGrupo',
    example: 'cmh6d8pqn0001xwd0wf5sv4d8',
  })
  id!: string;

  @ApiProperty({
    description: 'Nombre del grupo de clase',
    example: 'Grupo Lunes 16:00 - Básico 1',
  })
  nombre!: string;

  @ApiProperty({
    description: 'Estado actual de la clase',
    enum: ['Programada', 'EnVivo', 'Finalizada', 'Cancelada'],
    example: 'EnVivo',
  })
  estado_clase!: string;

  @ApiProperty({
    description:
      'Timestamp de cuando se inició la clase (null si no ha iniciado)',
    example: '2025-01-06T14:00:00.000Z',
    nullable: true,
  })
  iniciada_en!: Date | null;

  @ApiProperty({
    description:
      'Timestamp de cuando finalizó la clase (null si no ha finalizado)',
    example: null,
    nullable: true,
  })
  finalizada_en!: Date | null;

  @ApiProperty({
    description: 'Nombre de la sala en LiveKit',
    example: 'clase-grupo-cmh6d8pqn0001xwd0wf5sv4d8',
    nullable: true,
  })
  livekit_room_name!: string | null;
}

/**
 * Response DTO para iniciar clase
 */
export class IniciarClaseResponseDto extends ClaseEnVivoResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Clase iniciada exitosamente',
  })
  mensaje!: string;
}

/**
 * Response DTO para finalizar clase
 */
export class FinalizarClaseResponseDto extends ClaseEnVivoResponseDto {
  @ApiProperty({
    description: 'Mensaje de confirmación',
    example: 'Clase finalizada exitosamente',
  })
  mensaje!: string;

  @ApiProperty({
    description: 'Duración total de la clase en minutos',
    example: 45,
  })
  duracion_minutos!: number;
}
