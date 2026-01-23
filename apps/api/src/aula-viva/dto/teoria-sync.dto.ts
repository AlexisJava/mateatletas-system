import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { IsCuid } from '../../common/decorators/is-cuid.decorator';

/**
 * DTO para iniciar compartir teoría en vivo
 *
 * El docente selecciona un contenido de teoría y lo comparte
 * con todos los estudiantes de la sala en tiempo real.
 *
 * NOTA: Validaciones de frontera se hacen manualmente en el handler
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class IniciarTeoriaDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsCuid()
  @IsOptional()
  contenidoId?: string;
}

/**
 * DTO para cambiar el slide actual
 *
 * Cuando el docente navega a otro nodo/slide, todos los
 * estudiantes ven el cambio sincronizado.
 */
export class CambiarSlideDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsCuid()
  @IsOptional()
  nodoId?: string;
}

/**
 * DTO para sincronizar scroll del docente
 *
 * Permite sincronizar la posición de scroll del docente
 * con los estudiantes para contenido largo.
 */
export class SincronizarScrollDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(100)
  scrollPosition?: number;
}

/**
 * DTO para cerrar la teoría compartida
 */
export class CerrarTeoriaDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

// ============================================
// TIPOS DE RESPUESTA (no son DTOs, son interfaces)
// ============================================

/**
 * Nodo de contenido para broadcast
 */
export interface NodoTeoriaPublico {
  id: string;
  tipo: string;
  titulo: string | null;
  contenidoJson: Record<string, unknown>;
  orden: number;
}

/**
 * Estado de teoría para broadcast inicial
 */
export interface TeoriaIniciadaPayload {
  contenidoId: string;
  titulo: string;
  nodos: NodoTeoriaPublico[];
  nodoActualId: string | null;
  docenteNombre: string;
  timestamp: string;
}

/**
 * Payload cuando cambia el slide
 */
export interface SlideCambiadoPayload {
  nodoId: string;
  timestamp: string;
}

/**
 * Payload cuando se sincroniza scroll
 */
export interface ScrollSincronizadoPayload {
  scrollPosition: number;
  timestamp: string;
}
