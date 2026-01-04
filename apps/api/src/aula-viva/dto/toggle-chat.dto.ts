import { IsString, IsBoolean } from 'class-validator';

/**
 * DTO para habilitar/deshabilitar el chat de una sala
 * Solo puede ser usado por docentes
 */
export class ToggleChatDto {
  @IsString({ message: 'salaId debe ser un string' })
  salaId!: string;

  @IsBoolean({ message: 'habilitado debe ser un boolean' })
  habilitado!: boolean;
}
