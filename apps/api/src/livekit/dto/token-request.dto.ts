import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para solicitar un token de LiveKit
 * Debe proporcionar exactamente uno de: claseGrupoId o comisionId
 * La validación de exclusividad se realiza en el servicio
 */
export class TokenRequestDto {
  @ApiPropertyOptional({
    description: 'ID del ClaseGrupo (club semanal)',
    example: 'clk123abc',
    type: String,
  })
  @IsString({ message: 'claseGrupoId debe ser un texto' })
  @IsOptional()
  claseGrupoId?: string;

  @ApiPropertyOptional({
    description: 'ID de la Comisión (taller/colonia)',
    example: 'clk456def',
    type: String,
  })
  @IsString({ message: 'comisionId debe ser un texto' })
  @IsOptional()
  comisionId?: string;
}

/**
 * Response DTO para token de LiveKit
 */
export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT token para conectar a LiveKit',
    type: String,
  })
  token!: string;

  @ApiProperty({
    description: 'URL WebSocket de LiveKit',
    example: 'wss://mateatletasdashboard-802f8cky.livekit.cloud',
    type: String,
  })
  wsUrl!: string;

  @ApiProperty({
    description: 'Nombre de la sala',
    example: 'clase-grupo-clk123abc',
    type: String,
  })
  roomName!: string;
}
