import { IsString, IsNotEmpty, IsBoolean } from 'class-validator';

/**
 * DTO para indicar si un usuario está hablando
 *
 * Evento: hablando (Client → Server)
 * Integración con Voice Activity Detection (VAD) de LiveKit
 *
 * El cliente envía este evento cuando detecta actividad de voz:
 * - activo: true cuando empieza a hablar
 * - activo: false cuando deja de hablar
 */
export class HablandoDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsBoolean({ message: 'activo debe ser un boolean' })
  activo!: boolean;
}
