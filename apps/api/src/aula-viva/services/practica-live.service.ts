import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { NodoService, NodoArbol } from '../../contenidos/services/nodo.service';
import { EstadoContenido } from '@prisma/client';
import {
  TipoPregunta,
  PreguntaPublica,
  PracticaIniciadaPayload,
  RespuestaRegistradaPayload,
  ProgresoEstudiante,
  ProgresoPayload,
  EstudianteCompletoPayload,
  PracticaPausadaPayload,
  ResultadoIndividual,
  PracticaCerradaPayload,
} from '../dto/practica-live.dto';

/**
 * Pregunta interna con respuesta correcta
 */
interface PreguntaInterna {
  nodoId: string;
  index: number;
  enunciado: string;
  tipo: TipoPregunta;
  opciones?: string[];
  respuestaCorrecta: string | string[];
  puntaje: number;
}

/**
 * Respuesta de un estudiante a una pregunta
 */
interface RespuestaEstudiante {
  preguntaIndex: number;
  respuesta: string | string[];
  correcta: boolean;
  puntos: number;
  tiempoSeg: number;
  timestamp: Date;
}

/**
 * Estado interno de práctica en una sala
 */
interface PracticaState {
  salaId: string;
  contenidoId: string;
  titulo: string;
  preguntas: PreguntaInterna[];
  tiempoLimiteSeg: number | null;
  timestampInicio: Date;
  timestampPausa: Date | null;
  tiempoAcumuladoPausa: number;
  pausada: boolean;
  timeoutId?: ReturnType<typeof setTimeout>;
  respuestas: Map<string, RespuestaEstudiante[]>;
  estudiantesCompletados: Set<string>;
  docenteId: string;
  docenteNombre: string;
}

/**
 * Resultado de operaciones del servicio
 */
interface OperationResult<T = void> {
  exito: boolean;
  error?: string;
  result?: T;
}

/**
 * Service para gestionar prácticas en vivo con dashboard de progreso
 *
 * Permite que un docente habilite ejercicios de práctica que los
 * estudiantes resuelven en tiempo real mientras el docente ve
 * el progreso de cada uno en un dashboard.
 *
 * Responsabilidades:
 * - Iniciar/cerrar sesión de práctica
 * - Registrar respuestas de estudiantes
 * - Calcular progreso en tiempo real
 * - Manejar tiempo límite (opcional)
 * - Pausar/reanudar práctica
 * - Calcular resultados finales
 *
 * El estado se mantiene en memoria (Map por salaId).
 */
@Injectable()
export class PracticaLiveService {
  private readonly logger = new Logger(PracticaLiveService.name);
  private practicaPorSala: Map<string, PracticaState> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly nodoService: NodoService,
  ) {}

  /**
   * Inicia una sesión de práctica en vivo
   */
  async iniciarPractica(
    salaId: string,
    contenidoId: string,
    docenteId: string,
    docenteNombre: string,
    tiempoLimiteSeg?: number,
    onTimeout?: () => void,
  ): Promise<OperationResult<PracticaIniciadaPayload>> {
    // Verificar si ya hay práctica activa
    const existente = this.practicaPorSala.get(salaId);
    if (existente) {
      return {
        exito: false,
        error: 'Ya hay una práctica activa en esta sala',
      };
    }

    // Obtener contenido y verificar que está publicado
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      select: {
        id: true,
        titulo: true,
        estado: true,
      },
    });

    if (!contenido) {
      return {
        exito: false,
        error: 'Contenido no encontrado',
      };
    }

    if (contenido.estado !== EstadoContenido.PUBLICADO) {
      return {
        exito: false,
        error: 'El contenido debe estar publicado para compartir',
      };
    }

    // Obtener árbol de nodos
    let arbol: NodoArbol[];
    try {
      arbol = await this.nodoService.getArbol(contenidoId);
    } catch {
      return {
        exito: false,
        error: 'Error al obtener nodos del contenido',
      };
    }

    // Extraer preguntas del árbol
    const preguntas = this.extraerPreguntas(arbol);

    if (preguntas.length === 0) {
      return {
        exito: false,
        error: 'El contenido no tiene preguntas para practicar',
      };
    }

    // Crear estado
    const state: PracticaState = {
      salaId,
      contenidoId,
      titulo: contenido.titulo,
      preguntas,
      tiempoLimiteSeg: tiempoLimiteSeg ?? null,
      timestampInicio: new Date(),
      timestampPausa: null,
      tiempoAcumuladoPausa: 0,
      pausada: false,
      respuestas: new Map(),
      estudiantesCompletados: new Set(),
      docenteId,
      docenteNombre,
    };

    // Si hay tiempo límite, programar timeout
    if (tiempoLimiteSeg && onTimeout) {
      state.timeoutId = setTimeout(() => {
        const practica = this.practicaPorSala.get(salaId);
        if (practica && !practica.pausada) {
          onTimeout();
        }
      }, tiempoLimiteSeg * 1000);
    }

    this.practicaPorSala.set(salaId, state);
    this.logger.log(
      `Práctica iniciada en sala ${salaId}: "${contenido.titulo}" (${preguntas.length} preguntas)`,
    );

    // Crear payload público (sin respuestas correctas)
    const preguntasPublicas: PreguntaPublica[] = preguntas.map((p) => ({
      index: p.index,
      enunciado: p.enunciado,
      tipo: p.tipo,
      opciones: p.opciones,
      puntaje: p.puntaje,
    }));

    const payload: PracticaIniciadaPayload = {
      contenidoId: state.contenidoId,
      titulo: state.titulo,
      preguntas: preguntasPublicas,
      tiempoLimiteSeg: state.tiempoLimiteSeg,
      docenteNombre: state.docenteNombre,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Registra la respuesta de un estudiante
   */
  registrarRespuesta(
    salaId: string,
    odooId: string,
    nombre: string,
    preguntaIndex: number,
    respuesta: string | string[],
  ): OperationResult<{
    respuestaPayload: RespuestaRegistradaPayload;
    completado: boolean;
    completadoPayload?: EstudianteCompletoPayload;
  }> {
    const state = this.practicaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay práctica activa en esta sala',
      };
    }

    if (state.pausada) {
      return {
        exito: false,
        error: 'La práctica está pausada',
      };
    }

    // Verificar que la pregunta existe
    const pregunta = state.preguntas.find((p) => p.index === preguntaIndex);
    if (!pregunta) {
      return {
        exito: false,
        error: 'Pregunta no encontrada',
      };
    }

    // Obtener o crear array de respuestas del estudiante
    let respuestasEstudiante = state.respuestas.get(odooId);
    if (!respuestasEstudiante) {
      respuestasEstudiante = [];
      state.respuestas.set(odooId, respuestasEstudiante);
    }

    // Verificar que no haya respondido ya esta pregunta
    const yaRespondida = respuestasEstudiante.some(
      (r) => r.preguntaIndex === preguntaIndex,
    );
    if (yaRespondida) {
      return {
        exito: false,
        error: 'Ya respondiste esta pregunta',
      };
    }

    // Calcular tiempo de respuesta
    const tiempoSeg = this.calcularTiempoTranscurrido(state);

    // Verificar si es correcta
    const esCorrecta = this.verificarRespuesta(pregunta, respuesta);
    const puntos = esCorrecta ? pregunta.puntaje : 0;

    // Registrar respuesta
    const nuevaRespuesta: RespuestaEstudiante = {
      preguntaIndex,
      respuesta,
      correcta: esCorrecta,
      puntos,
      tiempoSeg,
      timestamp: new Date(),
    };
    respuestasEstudiante.push(nuevaRespuesta);

    this.logger.debug(
      `Respuesta de ${odooId} en sala ${salaId}: pregunta ${preguntaIndex}, ${esCorrecta ? 'correcta' : 'incorrecta'}`,
    );

    // Payload de respuesta
    const respuestaPayload: RespuestaRegistradaPayload = {
      preguntaIndex,
      correcta: esCorrecta,
      puntos,
      feedback: esCorrecta ? '¡Correcto!' : 'Incorrecto',
      timestamp: new Date().toISOString(),
    };

    // Verificar si completó todas las preguntas
    const completado =
      respuestasEstudiante.length >= state.preguntas.length &&
      !state.estudiantesCompletados.has(odooId);

    let completadoPayload: EstudianteCompletoPayload | undefined;

    if (completado) {
      state.estudiantesCompletados.add(odooId);

      const correctas = respuestasEstudiante.filter((r) => r.correcta).length;
      const incorrectas = respuestasEstudiante.length - correctas;
      const puntajeTotal = respuestasEstudiante.reduce(
        (sum, r) => sum + r.puntos,
        0,
      );

      completadoPayload = {
        odooId,
        nombre,
        correctas,
        incorrectas,
        puntajeTotal,
        tiempoSeg,
        posicion: state.estudiantesCompletados.size,
        timestamp: new Date().toISOString(),
      };
    }

    return {
      exito: true,
      result: {
        respuestaPayload,
        completado,
        completadoPayload,
      },
    };
  }

  /**
   * Obtiene el progreso actual de todos los estudiantes
   */
  getProgreso(salaId: string): OperationResult<ProgresoPayload> {
    const state = this.practicaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay práctica activa en esta sala',
      };
    }

    const progreso: ProgresoEstudiante[] = [];

    for (const [odooId, respuestas] of state.respuestas) {
      const correctas = respuestas.filter((r) => r.correcta).length;
      const incorrectas = respuestas.length - correctas;
      const puntajeTotal = respuestas.reduce((sum, r) => sum + r.puntos, 0);
      const completado = state.estudiantesCompletados.has(odooId);

      // Calcular última actividad
      const ultimaRespuesta = respuestas[respuestas.length - 1];
      const tiempoTranscurrido = ultimaRespuesta?.tiempoSeg ?? 0;

      // Determinar estado
      let estado: 'resolviendo' | 'completado' | 'inactivo' = 'resolviendo';
      if (completado) {
        estado = 'completado';
      } else if (
        Date.now() - (ultimaRespuesta?.timestamp.getTime() ?? 0) >
        60000
      ) {
        estado = 'inactivo';
      }

      progreso.push({
        odooId,
        nombre: odooId, // El nombre se debe obtener del PresenciaService en el gateway
        estado,
        preguntaActual: respuestas.length,
        totalPreguntas: state.preguntas.length,
        correctas,
        incorrectas,
        puntajeTotal,
        tiempoTranscurridoSeg: tiempoTranscurrido,
      });
    }

    // Ordenar por progreso (preguntas respondidas, luego por puntaje)
    progreso.sort((a, b) => {
      if (a.estado === 'completado' && b.estado !== 'completado') return -1;
      if (b.estado === 'completado' && a.estado !== 'completado') return 1;
      if (a.preguntaActual !== b.preguntaActual) {
        return b.preguntaActual - a.preguntaActual;
      }
      return b.puntajeTotal - a.puntajeTotal;
    });

    const tiempoRestanteSeg = this.calcularTiempoRestante(state);

    const payload: ProgresoPayload = {
      progreso,
      tiempoRestanteSeg,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Pausa la práctica
   */
  pausarPractica(salaId: string): OperationResult<PracticaPausadaPayload> {
    const state = this.practicaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay práctica activa en esta sala',
      };
    }

    if (state.pausada) {
      return {
        exito: false,
        error: 'La práctica ya está pausada',
      };
    }

    state.pausada = true;
    state.timestampPausa = new Date();

    // Cancelar timeout si existe
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
      state.timeoutId = undefined;
    }

    this.logger.log(`Práctica pausada en sala ${salaId}`);

    const tiempoRestanteSeg = this.calcularTiempoRestante(state);

    const payload: PracticaPausadaPayload = {
      tiempoRestanteSeg,
      timestamp: new Date().toISOString(),
    };

    return { exito: true, result: payload };
  }

  /**
   * Reanuda la práctica pausada
   */
  reanudarPractica(
    salaId: string,
    onTimeout?: () => void,
  ): OperationResult<{ tiempoRestanteSeg: number | null }> {
    const state = this.practicaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay práctica activa en esta sala',
      };
    }

    if (!state.pausada) {
      return {
        exito: false,
        error: 'La práctica no está pausada',
      };
    }

    // Calcular tiempo acumulado de pausa
    if (state.timestampPausa) {
      const tiempoPausado = Date.now() - state.timestampPausa.getTime();
      state.tiempoAcumuladoPausa += tiempoPausado;
    }

    state.pausada = false;
    state.timestampPausa = null;

    // Re-programar timeout si hay tiempo límite
    const tiempoRestanteSeg = this.calcularTiempoRestante(state);
    if (tiempoRestanteSeg !== null && tiempoRestanteSeg > 0 && onTimeout) {
      state.timeoutId = setTimeout(() => {
        const practica = this.practicaPorSala.get(salaId);
        if (practica && !practica.pausada) {
          onTimeout();
        }
      }, tiempoRestanteSeg * 1000);
    }

    this.logger.log(`Práctica reanudada en sala ${salaId}`);

    return {
      exito: true,
      result: { tiempoRestanteSeg },
    };
  }

  /**
   * Cierra la práctica y retorna resultados finales
   */
  cerrarPractica(salaId: string): OperationResult<PracticaCerradaPayload> {
    const state = this.practicaPorSala.get(salaId);
    if (!state) {
      return {
        exito: false,
        error: 'No hay práctica activa en esta sala',
      };
    }

    // Cancelar timeout si existe
    if (state.timeoutId) {
      clearTimeout(state.timeoutId);
    }

    // Calcular resultados
    const resultados: ResultadoIndividual[] = [];

    for (const [odooId, respuestas] of state.respuestas) {
      const correctas = respuestas.filter((r) => r.correcta).length;
      const incorrectas = respuestas.length - correctas;
      const puntajeTotal = respuestas.reduce((sum, r) => sum + r.puntos, 0);
      const ultimaRespuesta = respuestas[respuestas.length - 1];

      resultados.push({
        odooId,
        nombre: odooId, // El nombre se actualiza en el gateway
        correctas,
        incorrectas,
        puntajeTotal,
        tiempoSeg: ultimaRespuesta?.tiempoSeg ?? 0,
        posicion: 0, // Se calcula abajo
      });
    }

    // Ordenar por puntaje y asignar posiciones
    resultados.sort((a, b) => {
      if (b.puntajeTotal !== a.puntajeTotal) {
        return b.puntajeTotal - a.puntajeTotal;
      }
      return a.tiempoSeg - b.tiempoSeg; // Desempate por tiempo
    });

    resultados.forEach((r, i) => {
      r.posicion = i + 1;
    });

    // Calcular promedio de correctas
    const totalCorrectas = resultados.reduce((sum, r) => sum + r.correctas, 0);
    const promedioCorrectas =
      resultados.length > 0 ? totalCorrectas / resultados.length : 0;

    const payload: PracticaCerradaPayload = {
      contenidoId: state.contenidoId,
      titulo: state.titulo,
      totalPreguntas: state.preguntas.length,
      totalEstudiantes: resultados.length,
      promedioCorrectas: Math.round(promedioCorrectas * 100) / 100,
      resultados,
      timestamp: new Date().toISOString(),
    };

    // Limpiar estado
    this.practicaPorSala.delete(salaId);
    this.logger.log(`Práctica cerrada en sala ${salaId}`);

    return { exito: true, result: payload };
  }

  /**
   * Obtiene el estado de práctica activa
   */
  getPracticaActiva(salaId: string): PracticaState | undefined {
    return this.practicaPorSala.get(salaId);
  }

  /**
   * Limpia el estado de una sala
   */
  limpiarSala(salaId: string): void {
    const state = this.practicaPorSala.get(salaId);
    if (state?.timeoutId) {
      clearTimeout(state.timeoutId);
    }
    this.practicaPorSala.delete(salaId);
    this.logger.debug(`Estado de práctica limpiado para sala ${salaId}`);
  }

  /**
   * Limpia TODO el estado (solo para tests)
   */
  clearAll(): void {
    for (const [, state] of this.practicaPorSala) {
      if (state.timeoutId) {
        clearTimeout(state.timeoutId);
      }
    }
    this.practicaPorSala.clear();
    this.logger.debug('Todo el estado de práctica limpiado');
  }

  /**
   * Extrae preguntas del árbol de nodos
   */
  private extraerPreguntas(arbol: NodoArbol[]): PreguntaInterna[] {
    const preguntas: PreguntaInterna[] = [];
    let index = 0;

    const procesarNodo = (nodo: NodoArbol): void => {
      // Procesar hijos recursivamente
      if (nodo.hijos && nodo.hijos.length > 0) {
        for (const hijo of nodo.hijos) {
          procesarNodo(hijo);
        }
        return;
      }

      // Solo procesar nodos hoja con contenidoJson
      if (!nodo.contenidoJson) return;

      let contenido: Record<string, unknown>;
      try {
        contenido = JSON.parse(nodo.contenidoJson) as Record<string, unknown>;
      } catch {
        return;
      }

      // Verificar si es una pregunta
      const tipo = contenido.tipo as string | undefined;
      if (
        tipo !== 'opcion-multiple' &&
        tipo !== 'verdadero-falso' &&
        tipo !== 'respuesta-corta'
      ) {
        return;
      }

      const enunciado = (contenido.enunciado as string) ?? nodo.titulo ?? '';
      const opciones = contenido.opciones as string[] | undefined;
      const respuestaCorrecta = contenido.respuestaCorrecta as
        | string
        | string[]
        | undefined;
      const puntaje = (contenido.puntaje as number) ?? 10;

      if (!respuestaCorrecta) {
        this.logger.warn(
          `Pregunta ${nodo.id} sin respuestaCorrecta, omitiendo`,
        );
        return;
      }

      preguntas.push({
        nodoId: nodo.id,
        index,
        enunciado,
        tipo: tipo as TipoPregunta,
        opciones,
        respuestaCorrecta,
        puntaje,
      });

      index++;
    };

    for (const nodo of arbol) {
      procesarNodo(nodo);
    }

    return preguntas;
  }

  /**
   * Verifica si una respuesta es correcta
   */
  private verificarRespuesta(
    pregunta: PreguntaInterna,
    respuesta: string | string[],
  ): boolean {
    const correcta = pregunta.respuestaCorrecta;

    // Normalizar respuestas para comparación
    const normalizar = (s: string) => s.toLowerCase().trim();

    if (Array.isArray(correcta)) {
      // Múltiples respuestas correctas posibles
      if (Array.isArray(respuesta)) {
        // Comparar arrays (para respuestas múltiples)
        const respNorm = respuesta.map(normalizar).sort();
        const corrNorm = correcta.map(normalizar).sort();
        return (
          respNorm.length === corrNorm.length &&
          respNorm.every((r, i) => r === corrNorm[i])
        );
      }
      // Una respuesta, verificar si está en las correctas
      return correcta.some((c) => normalizar(c) === normalizar(respuesta));
    } else {
      // Una sola respuesta correcta
      if (Array.isArray(respuesta)) {
        const primeraRespuesta = respuesta[0];
        return (
          respuesta.length === 1 &&
          primeraRespuesta !== undefined &&
          normalizar(primeraRespuesta) === normalizar(correcta)
        );
      }
      return normalizar(respuesta) === normalizar(correcta);
    }
  }

  /**
   * Calcula tiempo transcurrido considerando pausas
   */
  private calcularTiempoTranscurrido(state: PracticaState): number {
    const ahora = state.pausada ? state.timestampPausa! : new Date();
    const tiempoTotal = ahora.getTime() - state.timestampInicio.getTime();
    const tiempoEfectivo = tiempoTotal - state.tiempoAcumuladoPausa;
    return Math.round(tiempoEfectivo / 1000);
  }

  /**
   * Calcula tiempo restante
   */
  private calcularTiempoRestante(state: PracticaState): number | null {
    if (!state.tiempoLimiteSeg) return null;

    const transcurrido = this.calcularTiempoTranscurrido(state);
    return Math.max(0, state.tiempoLimiteSeg - transcurrido);
  }
}
