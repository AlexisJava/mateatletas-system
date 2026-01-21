import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsOptional,
  IsArray,
  MaxLength,
} from 'class-validator';

/**
 * Tipos de muteo disponibles
 */
export enum TipoMuteoEnum {
  CHAT = 'chat',
  AUDIO = 'audio',
  AMBOS = 'ambos',
}

/**
 * DTO para mutear a un participante
 *
 * Evento: mutear-participante (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class MutearParticipanteDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsString({ message: 'odooIdEstudiante debe ser un string' })
  @IsNotEmpty({ message: 'odooIdEstudiante es requerido' })
  odooIdEstudiante!: string;

  @IsEnum(TipoMuteoEnum, {
    message: 'tipo debe ser: chat, audio, o ambos',
  })
  tipo!: TipoMuteoEnum;
}

/**
 * DTO para desmutear a un participante
 *
 * Evento: desmutear-participante (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class DesmutearParticipanteDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsString({ message: 'odooIdEstudiante debe ser un string' })
  @IsNotEmpty({ message: 'odooIdEstudiante es requerido' })
  odooIdEstudiante!: string;
}

/**
 * DTO para mutear a todos los participantes
 *
 * Evento: mutear-todos (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class MutearTodosDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsEnum(TipoMuteoEnum, {
    message: 'tipo debe ser: chat, audio, o ambos',
  })
  tipo!: TipoMuteoEnum;

  @IsOptional()
  @IsArray({ message: 'excepto debe ser un array de strings' })
  @IsString({ each: true, message: 'cada elemento de excepto debe ser string' })
  excepto?: string[];
}

/**
 * DTO para desmutear a todos los participantes
 *
 * Evento: desmutear-todos (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class DesmutearTodosDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;
}

/**
 * DTO para expulsar a un participante
 *
 * Evento: expulsar-participante (Client → Server)
 * Solo DOCENTE puede usar este evento
 */
export class ExpulsarParticipanteDto {
  @IsString({ message: 'salaId debe ser un string' })
  @IsNotEmpty({ message: 'salaId es requerido' })
  salaId!: string;

  @IsString({ message: 'odooIdEstudiante debe ser un string' })
  @IsNotEmpty({ message: 'odooIdEstudiante es requerido' })
  odooIdEstudiante!: string;

  @IsOptional()
  @IsString({ message: 'motivo debe ser un string' })
  @MaxLength(500, { message: 'motivo no puede exceder 500 caracteres' })
  motivo?: string;
}
