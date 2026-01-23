import {
  IsString,
  IsArray,
  IsInt,
  IsOptional,
  IsNotEmpty,
} from 'class-validator';

/**
 * DTO para crear un quiz en vivo
 *
 * NOTA: Validaciones de frontera (MaxLength, ArrayMinSize, etc.) se hacen
 * manualmente en el handler porque ValidationPipe en WebSockets no llama
 * el callback de acknowledgement cuando falla la validación.
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class CrearQuizDto {
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

  @IsInt()
  @IsOptional()
  respuestaCorrecta?: number;

  @IsInt()
  @IsOptional()
  tiempoSeg?: number;
}

/**
 * DTO para responder a un quiz
 *
 * NOTA: Validaciones de frontera se hacen manualmente en el handler
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class ResponderQuizDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsOptional()
  quizId?: string;

  @IsInt()
  @IsOptional()
  opcionIndex?: number;
}

/**
 * DTO para cerrar un quiz
 */
export class CerrarQuizDto {
  @IsString()
  @IsNotEmpty()
  salaId: string;

  @IsString()
  @IsNotEmpty()
  quizId: string;
}

// ============================================
// TIPOS DE RESPUESTA (no son DTOs, son interfaces)
// ============================================

export interface QuizPublico {
  id: string;
  pregunta: string;
  opciones: string[];
  tiempoSeg: number;
  timestampInicio: string;
}

export interface ResultadoEstudiante {
  odooId: string;
  opcionIndex: number;
  esCorrecta: boolean;
  puntos: number;
  tiempoSeg: number;
}

export interface QuizResultado {
  quizId: string;
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  totalRespuestas: number;
  resultados: ResultadoEstudiante[];
  distribucion: number[];
}
