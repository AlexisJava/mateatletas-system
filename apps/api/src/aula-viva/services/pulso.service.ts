import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';

/**
 * Estado de un pulso
 */
export interface Pulso {
  id: string;
  pregunta: string;
  opciones: string[];
  activo: boolean;
  creadoPor: string;
  creadoEn: Date;
  /** Mapa de odooId -> índice de opción seleccionada */
  respuestas: Map<string, number>;
}

/**
 * Estadísticas agregadas de un pulso
 */
export interface PulsoStats {
  id: string;
  pregunta: string;
  opciones: string[];
  activo: boolean;
  /** Conteo por cada opción */
  conteos: number[];
  totalRespuestas: number;
  /** Porcentajes por opción (0-100) */
  porcentajes: number[];
}

/**
 * Resultado de crear un pulso
 */
export interface CrearPulsoResult {
  exito: boolean;
  error?: string;
  pulso?: {
    id: string;
    pregunta: string;
    opciones: string[];
  };
}

/**
 * Resultado de responder un pulso
 */
export interface ResponderPulsoResult {
  exito: boolean;
  error?: string;
  stats?: PulsoStats;
}

/**
 * Resultado de cerrar un pulso
 */
export interface CerrarPulsoResult {
  exito: boolean;
  error?: string;
  resultadosFinales?: PulsoStats;
}

/**
 * Servicio para gestionar pulsos/encuestas en tiempo real
 *
 * Características:
 * - Un pulso activo por sala a la vez
 * - Una respuesta por usuario por pulso
 * - Estadísticas agregadas en tiempo real
 */
@Injectable()
export class PulsoService {
  private readonly logger = new Logger(PulsoService.name);

  /** Máximo de opciones permitidas */
  private readonly MAX_OPCIONES = 6;

  /** Mínimo de opciones requeridas */
  private readonly MIN_OPCIONES = 2;

  /** Máximo de caracteres en pregunta */
  private readonly MAX_PREGUNTA_LENGTH = 200;

  /** Máximo de caracteres por opción */
  private readonly MAX_OPCION_LENGTH = 100;

  /**
   * Estructura: salaId -> Pulso activo
   * Solo un pulso activo por sala
   */
  private pulsosActivos: Map<string, Pulso> = new Map();

  /**
   * Crea un nuevo pulso en una sala
   * Solo el docente puede crear pulsos
   */
  crearPulso(
    salaId: string,
    odooIdDocente: string,
    pregunta: string,
    opciones: string[],
  ): CrearPulsoResult {
    // Validar que no hay un pulso activo
    const pulsoExistente = this.pulsosActivos.get(salaId);
    if (pulsoExistente?.activo) {
      return {
        exito: false,
        error:
          'Ya hay un pulso activo en esta sala. Ciérralo antes de crear otro.',
      };
    }

    // Validar pregunta
    if (!pregunta || pregunta.trim().length === 0) {
      return { exito: false, error: 'La pregunta no puede estar vacía' };
    }

    if (pregunta.length > this.MAX_PREGUNTA_LENGTH) {
      return {
        exito: false,
        error: `La pregunta no puede exceder ${this.MAX_PREGUNTA_LENGTH} caracteres`,
      };
    }

    // Validar opciones
    if (opciones.length < this.MIN_OPCIONES) {
      return {
        exito: false,
        error: `Se requieren al menos ${this.MIN_OPCIONES} opciones`,
      };
    }

    if (opciones.length > this.MAX_OPCIONES) {
      return {
        exito: false,
        error: `No se permiten más de ${this.MAX_OPCIONES} opciones`,
      };
    }

    // Validar cada opción
    for (const opcion of opciones) {
      if (!opcion || opcion.trim().length === 0) {
        return { exito: false, error: 'Las opciones no pueden estar vacías' };
      }
      if (opcion.length > this.MAX_OPCION_LENGTH) {
        return {
          exito: false,
          error: `Las opciones no pueden exceder ${this.MAX_OPCION_LENGTH} caracteres`,
        };
      }
    }

    // Crear el pulso
    const pulso: Pulso = {
      id: randomUUID(),
      pregunta: pregunta.trim(),
      opciones: opciones.map((o) => o.trim()),
      activo: true,
      creadoPor: odooIdDocente,
      creadoEn: new Date(),
      respuestas: new Map(),
    };

    this.pulsosActivos.set(salaId, pulso);

    this.logger.log(
      `Pulso creado en sala ${salaId}: "${pregunta.substring(0, 50)}..."`,
    );

    return {
      exito: true,
      pulso: {
        id: pulso.id,
        pregunta: pulso.pregunta,
        opciones: pulso.opciones,
      },
    };
  }

  /**
   * Registra la respuesta de un estudiante
   * Cada estudiante solo puede responder una vez por pulso
   */
  responderPulso(
    salaId: string,
    pulsoId: string,
    odooIdEstudiante: string,
    opcionIndex: number,
  ): ResponderPulsoResult {
    const pulso = this.pulsosActivos.get(salaId);

    // Validar que existe el pulso
    if (!pulso) {
      return { exito: false, error: 'No hay un pulso activo en esta sala' };
    }

    // Validar que es el pulso correcto
    if (pulso.id !== pulsoId) {
      return { exito: false, error: 'El pulso ya no está disponible' };
    }

    // Validar que el pulso está activo
    if (!pulso.activo) {
      return { exito: false, error: 'El pulso ya fue cerrado' };
    }

    // Validar índice de opción
    if (opcionIndex < 0 || opcionIndex >= pulso.opciones.length) {
      return { exito: false, error: 'Opción inválida' };
    }

    // Verificar si ya respondió (permitir cambiar respuesta)
    const yaRespondio = pulso.respuestas.has(odooIdEstudiante);

    // Registrar/actualizar respuesta
    pulso.respuestas.set(odooIdEstudiante, opcionIndex);

    this.logger.debug(
      `Respuesta ${yaRespondio ? 'actualizada' : 'registrada'} en pulso ${pulsoId}: opción ${opcionIndex}`,
    );

    // Calcular y retornar stats actualizadas
    return {
      exito: true,
      stats: this.calcularStats(pulso),
    };
  }

  /**
   * Cierra un pulso y retorna los resultados finales
   * Solo el docente que lo creó puede cerrarlo
   */
  cerrarPulso(
    salaId: string,
    pulsoId: string,
    odooIdDocente: string,
  ): CerrarPulsoResult {
    const pulso = this.pulsosActivos.get(salaId);

    // Validar que existe el pulso
    if (!pulso) {
      return { exito: false, error: 'No hay un pulso en esta sala' };
    }

    // Validar que es el pulso correcto
    if (pulso.id !== pulsoId) {
      return { exito: false, error: 'El pulso no existe' };
    }

    // Validar que el docente es el creador
    if (pulso.creadoPor !== odooIdDocente) {
      return {
        exito: false,
        error: 'Solo el docente que creó el pulso puede cerrarlo',
      };
    }

    // Validar que está activo
    if (!pulso.activo) {
      return { exito: false, error: 'El pulso ya está cerrado' };
    }

    // Cerrar el pulso
    pulso.activo = false;

    this.logger.log(
      `Pulso cerrado en sala ${salaId}: ${pulso.respuestas.size} respuestas`,
    );

    return {
      exito: true,
      resultadosFinales: this.calcularStats(pulso),
    };
  }

  /**
   * Obtiene el pulso activo de una sala (si existe)
   */
  getPulsoActivo(salaId: string): Pulso | undefined {
    const pulso = this.pulsosActivos.get(salaId);
    return pulso?.activo ? pulso : undefined;
  }

  /**
   * Obtiene las estadísticas actuales de un pulso
   */
  getStats(salaId: string): PulsoStats | undefined {
    const pulso = this.pulsosActivos.get(salaId);
    if (!pulso) return undefined;
    return this.calcularStats(pulso);
  }

  /**
   * Limpia el pulso de una sala (cuando termina la clase)
   */
  limpiarSala(salaId: string): void {
    this.pulsosActivos.delete(salaId);
    this.logger.debug(`Pulso limpiado para sala ${salaId}`);
  }

  /**
   * Calcula estadísticas agregadas de un pulso
   */
  private calcularStats(pulso: Pulso): PulsoStats {
    const conteos: number[] = new Array<number>(pulso.opciones.length).fill(0);

    // Contar respuestas por opción
    for (const opcionIndex of pulso.respuestas.values()) {
      if (opcionIndex >= 0 && opcionIndex < conteos.length) {
        const currentValue = conteos[opcionIndex];
        if (currentValue !== undefined) {
          conteos[opcionIndex] = currentValue + 1;
        }
      }
    }

    const totalRespuestas = pulso.respuestas.size;

    // Calcular porcentajes
    const porcentajes = conteos.map((conteo) =>
      totalRespuestas > 0 ? Math.round((conteo / totalRespuestas) * 100) : 0,
    );

    return {
      id: pulso.id,
      pregunta: pulso.pregunta,
      opciones: pulso.opciones,
      activo: pulso.activo,
      conteos,
      totalRespuestas,
      porcentajes,
    };
  }
}
