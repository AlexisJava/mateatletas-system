import { Injectable, Logger } from '@nestjs/common';
import {
  CrearQuizDto,
  QuizResultado,
  ResultadoEstudiante,
} from '../dto/quiz.dto';

/**
 * Estado interno de un quiz activo
 */
interface QuizState {
  id: string;
  salaId: string;
  estado: 'activo' | 'cerrado';
  pregunta: string;
  opciones: string[];
  respuestaCorrecta: number;
  tiempoSeg: number;
  timestampInicio: Date;
  respuestas: Map<
    string,
    {
      opcionIndex: number;
      tiempoRespuestaSeg: number;
    }
  >;
}

@Injectable()
export class QuizService {
  private readonly logger = new Logger(QuizService.name);
  private quizPorSala: Map<string, QuizState> = new Map();

  /**
   * Crea un nuevo quiz en la sala
   */
  crearQuiz(salaId: string, data: CrearQuizDto): QuizState {
    const existente = this.quizPorSala.get(salaId);
    if (existente && existente.estado === 'activo') {
      throw new Error('Ya hay un quiz activo en esta sala');
    }

    const quiz: QuizState = {
      id: `quiz-${Date.now()}`,
      salaId,
      estado: 'activo',
      pregunta: data.pregunta!,
      opciones: data.opciones!,
      respuestaCorrecta: data.respuestaCorrecta!,
      tiempoSeg: data.tiempoSeg ?? 20,
      timestampInicio: new Date(),
      respuestas: new Map(),
    };

    this.quizPorSala.set(salaId, quiz);
    this.logger.log(`Quiz creado en sala ${salaId}: ${quiz.id}`);

    return quiz;
  }

  /**
   * Registra la respuesta de un estudiante
   */
  responderQuiz(
    salaId: string,
    quizId: string,
    odooId: string,
    opcionIndex: number,
  ): { exito: boolean; error?: string; puntosObtenidos?: number } {
    const quiz = this.quizPorSala.get(salaId);

    if (!quiz || quiz.id !== quizId) {
      return { exito: false, error: 'Quiz no encontrado' };
    }
    if (quiz.estado !== 'activo') {
      return { exito: false, error: 'Quiz cerrado' };
    }
    if (quiz.respuestas.has(odooId)) {
      return { exito: false, error: 'Ya respondiste' };
    }

    const tiempoRespuestaSeg =
      (Date.now() - quiz.timestampInicio.getTime()) / 1000;

    if (tiempoRespuestaSeg > quiz.tiempoSeg) {
      return { exito: false, error: 'Tiempo agotado' };
    }

    const esCorrecta = opcionIndex === quiz.respuestaCorrecta;
    const puntosObtenidos = this.calcularPuntos(
      quiz.tiempoSeg,
      tiempoRespuestaSeg,
      esCorrecta,
    );

    quiz.respuestas.set(odooId, { opcionIndex, tiempoRespuestaSeg });

    this.logger.debug(
      `Respuesta de ${odooId} en quiz ${quizId}: opción ${opcionIndex}, ${puntosObtenidos} pts`,
    );

    return { exito: true, puntosObtenidos };
  }

  /**
   * Cierra el quiz y calcula resultados
   */
  cerrarQuiz(salaId: string, quizId: string): QuizResultado {
    const quiz = this.quizPorSala.get(salaId);
    if (!quiz || quiz.id !== quizId) {
      throw new Error('Quiz no encontrado');
    }

    quiz.estado = 'cerrado';

    const resultados: ResultadoEstudiante[] = [];
    for (const [odooId, resp] of quiz.respuestas) {
      const esCorrecta = resp.opcionIndex === quiz.respuestaCorrecta;
      const puntos = this.calcularPuntos(
        quiz.tiempoSeg,
        resp.tiempoRespuestaSeg,
        esCorrecta,
      );
      resultados.push({
        odooId,
        opcionIndex: resp.opcionIndex,
        esCorrecta,
        puntos,
        tiempoSeg: resp.tiempoRespuestaSeg,
      });
    }

    resultados.sort((a, b) => b.puntos - a.puntos);

    this.logger.log(`Quiz ${quizId} cerrado. ${resultados.length} respuestas.`);

    return {
      quizId: quiz.id,
      pregunta: quiz.pregunta,
      opciones: quiz.opciones,
      respuestaCorrecta: quiz.respuestaCorrecta,
      totalRespuestas: quiz.respuestas.size,
      resultados,
      distribucion: this.calcularDistribucion(quiz),
    };
  }

  /**
   * Obtiene el quiz activo de una sala (si existe)
   */
  getQuizActivo(salaId: string): QuizState | undefined {
    const quiz = this.quizPorSala.get(salaId);
    return quiz?.estado === 'activo' ? quiz : undefined;
  }

  /**
   * Limpia el estado de una sala
   */
  limpiarSala(salaId: string): void {
    this.quizPorSala.delete(salaId);
    this.logger.debug(`Estado de quiz limpiado para sala ${salaId}`);
  }

  /**
   * Calcula puntos basado en velocidad (estilo Kahoot)
   * Más rápido = más puntos
   */
  private calcularPuntos(
    tiempoTotal: number,
    tiempoRespuesta: number,
    esCorrecta: boolean,
  ): number {
    if (!esCorrecta) return 0;
    const BASE = 1000;
    const porcentaje = 1 - tiempoRespuesta / tiempoTotal;
    return Math.round(BASE * Math.max(0, porcentaje));
  }

  /**
   * Calcula cuántos estudiantes eligieron cada opción
   */
  private calcularDistribucion(quiz: QuizState): number[] {
    const dist: number[] = Array.from(
      { length: quiz.opciones.length },
      () => 0,
    );
    for (const resp of quiz.respuestas.values()) {
      const idx = resp.opcionIndex;
      if (idx >= 0 && idx < dist.length) {
        dist[idx] = (dist[idx] ?? 0) + 1;
      }
    }
    return dist;
  }
}
