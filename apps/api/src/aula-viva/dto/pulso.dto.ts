import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  IsInt,
  Min,
} from 'class-validator';

/**
 * DTO para crear un pulso/encuesta
 */
export class CrearPulsoDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  pregunta: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(6)
  @IsString({ each: true })
  @MaxLength(100, { each: true })
  opciones: string[];
}

/**
 * DTO para responder a un pulso
 */
export class ResponderPulsoDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;

  @IsString()
  @IsNotEmpty()
  pulsoId: string;

  @IsInt()
  @Min(0)
  opcionIndex: number;
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
