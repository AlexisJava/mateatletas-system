import { IsOptional, IsDateString } from 'class-validator';

/**
 * DTO para asignar una tarea a un grupo
 * El body es opcional - si no se envía, se asigna sin fecha límite
 */
export class AsignarTareaDto {
  /**
   * Fecha límite opcional para la tarea
   * Formato: ISO 8601 (ej: "2026-01-20T23:59:59.000Z")
   */
  @IsOptional()
  @IsDateString()
  fechaLimite?: string;
}
