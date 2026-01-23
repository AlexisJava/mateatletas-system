import { IsString, IsOptional, IsInt } from 'class-validator';

/**
 * DTO para iniciar un contador compartido
 *
 * NOTA: @IsOptional() por bug de ValidationPipe en WebSockets
 * https://github.com/nestjs/nest/issues/5267
 * ValidationPipe rechaza silenciosamente (sin callback) cuando falla,
 * por eso la validación de rangos se hace en el handler que sí retorna callback.
 */
export class IniciarContadorDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsInt()
  @IsOptional()
  // Validación de rango (1-3600) se hace en handler para retornar callback con error
  segundos?: number;

  @IsString()
  @IsOptional()
  // MaxLength se valida en handler
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
