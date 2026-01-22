import { Injectable, Logger } from '@nestjs/common';

/**
 * Tipos de reacciones disponibles
 */
export const TIPOS_REACCION = [
  'thumbsUp',
  'heart',
  'laugh',
  'celebrate',
  'thinking',
] as const;
export type TipoReaccion = (typeof TIPOS_REACCION)[number];

/**
 * Mapeo de tipos a emojis (para display)
 */
export const EMOJI_MAP: Record<TipoReaccion, string> = {
  thumbsUp: '👍',
  heart: '❤️',
  laugh: '😂',
  celebrate: '🎉',
  thinking: '🤔',
};

/**
 * Reacción agregada para broadcast
 */
export interface ReaccionAgregada {
  tipo: TipoReaccion;
  emoji: string;
  contador: number;
  ultimosUsuarios: { odooId: string; nombre: string }[];
}

/**
 * Resultado de enviar reacción
 */
export interface EnviarReaccionResult {
  exito: boolean;
  error?: string;
  reaccion?: ReaccionAgregada;
}

/**
 * Servicio para gestionar reacciones en tiempo real
 *
 * Características:
 * - Rate limiting: 1 reacción cada 2 segundos por usuario
 * - Agregación: Agrupa reacciones del mismo tipo
 * - Ventana de tiempo: Las reacciones se agregan en ventanas de 5 segundos
 */
@Injectable()
export class ReaccionesService {
  private readonly logger = new Logger(ReaccionesService.name);

  /** Rate limit en milisegundos (2 segundos) */
  private readonly RATE_LIMIT_MS = 2000;

  /** Ventana de agregación en milisegundos (5 segundos) */
  private readonly VENTANA_AGREGACION_MS = 5000;

  /** Máximo de usuarios mostrados en "últimos usuarios" */
  private readonly MAX_ULTIMOS_USUARIOS = 3;

  /**
   * Estructura: salaId -> odooId -> timestamp última reacción
   * Para rate limiting por usuario
   */
  private ultimaReaccion: Map<string, Map<string, number>> = new Map();

  /**
   * Estructura: salaId -> tipo -> { contador, usuarios[], timestampInicio }
   * Para agregación de reacciones
   */
  private reaccionesAgregadas: Map<
    string,
    Map<
      TipoReaccion,
      {
        contador: number;
        usuarios: { odooId: string; nombre: string }[];
        timestampInicio: number;
      }
    >
  > = new Map();

  /**
   * Envía una reacción con rate limiting
   *
   * @returns Resultado con la reacción agregada si fue exitoso
   */
  enviarReaccion(
    salaId: string,
    odooId: string,
    nombre: string,
    tipo: TipoReaccion,
  ): EnviarReaccionResult {
    // Validar tipo de reacción
    if (!TIPOS_REACCION.includes(tipo)) {
      return { exito: false, error: 'Tipo de reacción inválido' };
    }

    // Verificar rate limit
    const ahora = Date.now();
    const ultimasSala = this.ultimaReaccion.get(salaId);
    const ultimaUsuario = ultimasSala?.get(odooId);

    if (ultimaUsuario && ahora - ultimaUsuario < this.RATE_LIMIT_MS) {
      const esperarMs = this.RATE_LIMIT_MS - (ahora - ultimaUsuario);
      return {
        exito: false,
        error: `Espera ${Math.ceil(esperarMs / 1000)} segundo(s) para reaccionar de nuevo`,
      };
    }

    // Actualizar timestamp de última reacción
    if (!ultimasSala) {
      this.ultimaReaccion.set(salaId, new Map([[odooId, ahora]]));
    } else {
      ultimasSala.set(odooId, ahora);
    }

    // Agregar a la ventana de agregación
    const reaccion = this.agregarReaccion(salaId, tipo, odooId, nombre, ahora);

    this.logger.debug(
      `Reacción ${EMOJI_MAP[tipo]} de ${nombre} en sala ${salaId}`,
    );

    return { exito: true, reaccion };
  }

  /**
   * Agrega una reacción a la ventana de agregación actual
   */
  private agregarReaccion(
    salaId: string,
    tipo: TipoReaccion,
    odooId: string,
    nombre: string,
    ahora: number,
  ): ReaccionAgregada {
    let salaReacciones = this.reaccionesAgregadas.get(salaId);
    if (!salaReacciones) {
      salaReacciones = new Map();
      this.reaccionesAgregadas.set(salaId, salaReacciones);
    }

    let tipoReaccion = salaReacciones.get(tipo);

    // Si no existe o la ventana expiró, crear nueva
    if (
      !tipoReaccion ||
      ahora - tipoReaccion.timestampInicio > this.VENTANA_AGREGACION_MS
    ) {
      tipoReaccion = {
        contador: 0,
        usuarios: [],
        timestampInicio: ahora,
      };
      salaReacciones.set(tipo, tipoReaccion);
    }

    // Incrementar contador
    tipoReaccion.contador++;

    // Agregar usuario si no está ya (evitar duplicados en la misma ventana)
    const yaEsta = tipoReaccion.usuarios.some((u) => u.odooId === odooId);
    if (!yaEsta) {
      tipoReaccion.usuarios.push({ odooId, nombre });

      // Mantener solo los últimos N usuarios
      if (tipoReaccion.usuarios.length > this.MAX_ULTIMOS_USUARIOS) {
        tipoReaccion.usuarios.shift();
      }
    }

    return {
      tipo,
      emoji: EMOJI_MAP[tipo],
      contador: tipoReaccion.contador,
      ultimosUsuarios: [...tipoReaccion.usuarios],
    };
  }

  /**
   * Obtiene el conteo actual de reacciones por tipo en una sala
   */
  getConteoReacciones(salaId: string): Record<TipoReaccion, number> {
    const result: Record<TipoReaccion, number> = {
      thumbsUp: 0,
      heart: 0,
      laugh: 0,
      celebrate: 0,
      thinking: 0,
    };

    const salaReacciones = this.reaccionesAgregadas.get(salaId);
    if (!salaReacciones) return result;

    const ahora = Date.now();
    for (const [tipo, data] of salaReacciones.entries()) {
      // Solo contar si está dentro de la ventana
      if (ahora - data.timestampInicio <= this.VENTANA_AGREGACION_MS) {
        result[tipo] = data.contador;
      }
    }

    return result;
  }

  /**
   * Limpia las reacciones de una sala (cuando termina la clase)
   */
  limpiarSala(salaId: string): void {
    this.ultimaReaccion.delete(salaId);
    this.reaccionesAgregadas.delete(salaId);
    this.logger.debug(`Reacciones limpiadas para sala ${salaId}`);
  }

  /**
   * Verifica si un tipo de reacción es válido
   */
  esTipoValido(tipo: string): tipo is TipoReaccion {
    return TIPOS_REACCION.includes(tipo as TipoReaccion);
  }
}
