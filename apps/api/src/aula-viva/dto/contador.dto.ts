import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
} from 'class-validator';

/**
 * DTO para iniciar un contador compartido
 *
 * NOTA: @IsOptional() por bug de ValidationPipe en WebSockets
 * https://github.com/nestjs/nest/issues/5267
 * Validación real se hace en el handler
 */
export class IniciarContadorDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsInt()
  @Min(1)
  @Max(3600)
  @IsOptional()
  segundos?: number;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  mensaje?: string;
}

/**
 * DTO para pausar/reanudar contador
 */
export class PausarContadorDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

/**
 * DTO para reanudar contador
 */
export class ReanudarContadorDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

/**
 * DTO para cancelar contador
 */
export class CancelarContadorDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

/**
 * Payload broadcast cuando inicia contador
 */
export interface ContadorIniciadoPayload {
  segundos: number;
  mensaje?: string;
  timestampInicio: string;
}

/**
 * Payload broadcast cuando pausa contador
 */
export interface ContadorPausadoPayload {
  segundosRestantes: number;
}

/**
 * Payload broadcast cuando reanuda contador
 */
export interface ContadorReanudadoPayload {
  segundosRestantes: number;
  timestampReanudacion: string;
}

/**
 * Estado del contador para respuesta
 */
export interface ContadorEstado {
  activo: boolean;
  pausado: boolean;
  segundosRestantes: number;
  mensaje?: string;
}
