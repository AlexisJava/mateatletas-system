import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para enviar un mensaje de chat en una sala
 *
 * Nota: La validación de longitud máxima (2000 chars) se hace en el handler
 * para poder devolver un callback con error estructurado al cliente WebSocket.
 */
export class EnviarMensajeDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId no puede estar vacío' })
  salaId!: string;

  @IsString({ message: 'contenido debe ser un string' })
  contenido!: string;
}
