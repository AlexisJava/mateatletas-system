import { IsString, MinLength, MaxLength } from 'class-validator';

/**
 * DTO para agregar un seguimiento a una observación
 *
 * Reglas de negocio:
 * - RN-013: contenido mínimo 5 caracteres
 * - RN-012: No se puede agregar seguimiento a observación Cerrada (validar en service)
 * - RN-011: Agregar seguimiento cambia estado a EnSeguimiento si estaba Abierta (en service)
 */
export class CreateSeguimientoDto {
  @IsString({ message: 'contenido debe ser un string' })
  @MinLength(5, { message: 'Seguimiento debe tener al menos 5 caracteres' })
  @MaxLength(1000, { message: 'Seguimiento no puede exceder 1000 caracteres' })
  contenido: string;
}
