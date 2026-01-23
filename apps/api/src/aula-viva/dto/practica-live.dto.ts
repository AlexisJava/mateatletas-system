import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  IsArray,
} from 'class-validator';
import { IsCuid } from '../../common/decorators/is-cuid.decorator';

/**
 * DTO para iniciar práctica en vivo
 *
 * El docente habilita un contenido de práctica con ejercicios
 * que los estudiantes resuelven en tiempo real mientras el
 * docente ve el progreso en un dashboard.
 *
 * NOTA: Validaciones de frontera se hacen manualmente en el handler
 * Ver: https://github.com/nestjs/nest/issues/5267
 */
export class IniciarPracticaDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsString()
  @IsCuid()
  @IsOptional()
  contenidoId?: string;

  @IsNumber()
  @IsOptional()
  @Min(30)
  @Max(3600)
  tiempoLimiteSeg?: number;
}

/**
 * DTO para que un estudiante responda una pregunta
 */
export class ResponderPreguntaDto {
  @IsString()
  @IsOptional()
  salaId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  preguntaIndex?: number;

  @IsString()
  @IsOptional()
  respuesta?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  respuestas?: string[];
}

/**
 * DTO para pausar/reanudar práctica
 */
export class PausarPracticaDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

/**
 * DTO para cerrar práctica
 */
export class CerrarPracticaDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

/**
 * DTO para solicitar progreso (docente)
 */
export class SolicitarProgresoDto {
  @IsString()
  @IsOptional()
  salaId?: string;
}

// ============================================
// TIPOS DE RESPUESTA (no son DTOs, son interfaces)
// ============================================

/**
 * Tipo de pregunta soportado
 */
export type TipoPregunta =
  | 'opcion-multiple'
  | 'verdadero-falso'
  | 'respuesta-corta';

/**
 * Pregunta para broadcast a estudiantes
 */
export interface PreguntaPublica {
  index: number;
  enunciado: string;
  tipo: TipoPregunta;
  opciones?: string[];
  puntaje: number;
}

/**
 * Payload cuando inicia práctica
 */
export interface PracticaIniciadaPayload {
  contenidoId: string;
  titulo: string;
  preguntas: PreguntaPublica[];
  tiempoLimiteSeg: number | null;
  docenteNombre: string;
  timestamp: string;
}

/**
 * Respuesta al estudiante cuando responde
 */
export interface RespuestaRegistradaPayload {
  preguntaIndex: number;
  correcta: boolean;
  puntos: number;
  feedback?: string;
  timestamp: string;
}

/**
 * Estado de progreso de un estudiante (para docente)
 */
export interface ProgresoEstudiante {
  odooId: string;
  nombre: string;
  estado: 'resolviendo' | 'completado' | 'inactivo';
  preguntaActual: number;
  totalPreguntas: number;
  correctas: number;
  incorrectas: number;
  puntajeTotal: number;
  tiempoTranscurridoSeg: number;
}

/**
 * Payload de progreso para docente
 */
export interface ProgresoPayload {
  progreso: ProgresoEstudiante[];
  tiempoRestanteSeg: number | null;
  timestamp: string;
}

/**
 * Payload cuando estudiante completa
 */
export interface EstudianteCompletoPayload {
  odooId: string;
  nombre: string;
  correctas: number;
  incorrectas: number;
  puntajeTotal: number;
  tiempoSeg: number;
  posicion: number;
  timestamp: string;
}

/**
 * Payload cuando práctica se pausa
 */
export interface PracticaPausadaPayload {
  tiempoRestanteSeg: number | null;
  timestamp: string;
}

/**
 * Resultado individual al cerrar
 */
export interface ResultadoIndividual {
  odooId: string;
  nombre: string;
  correctas: number;
  incorrectas: number;
  puntajeTotal: number;
  tiempoSeg: number;
  posicion: number;
}

/**
 * Payload cuando práctica se cierra
 */
export interface PracticaCerradaPayload {
  contenidoId: string;
  titulo: string;
  totalPreguntas: number;
  totalEstudiantes: number;
  promedioCorrectas: number;
  resultados: ResultadoIndividual[];
  timestamp: string;
}
