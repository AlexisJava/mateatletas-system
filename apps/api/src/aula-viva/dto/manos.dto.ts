import { IsString, IsNotEmpty } from 'class-validator';

/**
 * DTO para levantar la mano en una sala
 *
 * Evento: levantar-mano (Client → Server)
 * Solo ESTUDIANTE puede usar este evento
 */
export class LevantarManoDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;
}

/**
 * DTO para bajar la mano en una sala
 *
 * Evento: bajar-mano (Client → Server)
 * Solo ESTUDIANTE puede usar este evento
 */
export class BajarManoDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;
}

/**
 * DTO para dar la palabra a un estudiante
 *
 * Evento: dar-palabra (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class DarPalabraDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsString({ message: 'odooIdEstudiante debe ser un string' })
  @IsNotEmpty({ message: 'odooIdEstudiante es requerido' })
  odooIdEstudiante!: string;
}
