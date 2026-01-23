import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO para crear un pulso/encuesta
 *
 * NOTA: Validaciones de frontera (MaxLength, ArrayMinSize, etc.) se hacen
 * manualmente en el handler porque ValidationPipe en WebSockets no llama
 * el callback de acknowledgement cuando falla la validación.
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class CrearPulsoDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsOptional()
  pregunta?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  opciones?: string[];
}

/**
 * DTO para responder a un pulso
 *
 * NOTA: Validaciones de frontera se hacen manualmente en el handler
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class ResponderPulsoDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsOptional()
  pulsoId?: string;

  @IsInt()
  @IsOptional()
  opcionIndex?: number;
}

/**
 * DTO para cerrar un pulso
 */
export class CerrarPulsoDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;

  @IsString()
  @IsNotEmpty()
  pulsoId: string;
}
