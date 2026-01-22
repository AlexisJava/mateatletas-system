import { IsString, IsNotEmpty, IsIn } from 'class-validator';
import { TIPOS_REACCION, TipoReaccion } from '../services/reacciones.service';

/**
 * DTO para enviar una reacción en tiempo real
 */
export class EnviarReaccionDto {
  @IsString()
  @IsNotEmpty()
  @IsIn(TIPOS_REACCION)
  tipo: TipoReaccion;
}
