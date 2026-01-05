import { IsEnum } from 'class-validator';
import { EstadoObservacion } from '@prisma/client';

/**
 * DTO para cambiar el estado de una observación
 *
 * Reglas de negocio:
 * - RN-020: Solo autor, ADMIN o PEDAGOGIA pueden cambiar estado
 * - RN-021: Transiciones válidas según diagrama de estados
 * - RN-022: Al marcar Resuelta, se registra automáticamente timestamp
 * - RN-023: Estado Cerrada es terminal, no se puede reabrir
 */
export class UpdateEstadoDto {
  @IsEnum(EstadoObservacion, {
    message: `estado debe ser uno de: ${Object.values(EstadoObservacion).join(', ')}`,
  })
  estado: EstadoObservacion;
}
