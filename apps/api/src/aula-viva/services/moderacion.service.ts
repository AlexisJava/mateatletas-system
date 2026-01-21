import { Injectable, Logger } from '@nestjs/common';

/**
 * Tipos de muteo disponibles
 */
export type TipoMuteo = 'chat' | 'audio' | 'ambos';

/**
 * Estado de moderación de un usuario en una sala
 */
export interface EstadoUsuarioModeracion {
  odooId: string;
  muteado: TipoMuteo | null;
  expulsadoEn: Date | null;
  motivoExpulsion?: string;
}

/**
 * Estado de moderación de una sala
 */
interface EstadoSalaModeracion {
  muteados: Map<string, TipoMuteo>; // odooId -> tipo de muteo
  expulsados: Map<string, { fecha: Date; motivo?: string }>; // odooId -> info expulsión
}

/**
 * Duración de la expulsión en milisegundos (24 horas)
 */
const DURACION_EXPULSION_MS = 24 * 60 * 60 * 1000;

/**
 * Servicio para gestionar la moderación en clases en vivo
 *
 * Funcionalidades:
 * - Mutear/desmutear participantes (chat, audio, o ambos)
 * - Mutear todos (excepto lista de excepciones)
 * - Expulsar participantes (no pueden volver por 24hs)
 *
 * Reglas de negocio:
 * - Solo DOCENTE puede mutear/expulsar (validado en gateway)
 * - Expulsado no puede volver a unirse por 24 horas
 * - El muteo es por sala (un usuario puede estar muteado en una sala y no en otra)
 */
@Injectable()
export class ModeracionService {
  private readonly logger = new Logger(ModeracionService.name);

  /**
   * Estructura: salaId -> EstadoSalaModeracion
   */
  private estadoPorSala: Map<string, EstadoSalaModeracion> = new Map();

  /**
   * Mutea a un participante en una sala
   */
  mutear(salaId: string, odooId: string, tipo: TipoMuteo): void {
    const estadoSala = this.getOrCreateEstadoSala(salaId);
    estadoSala.muteados.set(odooId, tipo);
    this.logger.log(`Usuario ${odooId} muteado (${tipo}) en sala ${salaId}`);
  }

  /**
   * Desmutea a un participante en una sala
   *
   * @returns true si estaba muteado y fue desmuteado, false si no estaba muteado
   */
  desmutear(salaId: string, odooId: string): boolean {
    const estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      return false;
    }

    const estabaMuteado = estadoSala.muteados.delete(odooId);
    if (estabaMuteado) {
      this.logger.log(`Usuario ${odooId} desmuteado en sala ${salaId}`);
    }

    return estabaMuteado;
  }

  /**
   * Mutea a todos los participantes de una sala, excepto los especificados
   *
   * @param excepto Lista de odooIds que NO deben ser muteados (ej: el docente)
   * @returns Lista de odooIds que fueron muteados
   */
  mutearTodos(
    salaId: string,
    tipo: TipoMuteo,
    excepto: string[],
    participantesEnSala: string[],
  ): string[] {
    const estadoSala = this.getOrCreateEstadoSala(salaId);
    const exceptoSet = new Set(excepto);
    const muteados: string[] = [];

    for (const odooId of participantesEnSala) {
      if (!exceptoSet.has(odooId)) {
        estadoSala.muteados.set(odooId, tipo);
        muteados.push(odooId);
      }
    }

    this.logger.log(
      `Todos muteados (${tipo}) en sala ${salaId}, excepto: ${excepto.join(', ')}`,
    );

    return muteados;
  }

  /**
   * Desmutea a todos los participantes de una sala
   *
   * @returns Lista de odooIds que fueron desmuteados
   */
  desmutearTodos(salaId: string): string[] {
    const estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      return [];
    }

    const desmuteados = Array.from(estadoSala.muteados.keys());
    estadoSala.muteados.clear();

    this.logger.log(`Todos desmuteados en sala ${salaId}`);

    return desmuteados;
  }

  /**
   * Expulsa a un participante de una sala
   * No podrá volver a unirse por 24 horas
   */
  expulsar(salaId: string, odooId: string, motivo?: string): void {
    const estadoSala = this.getOrCreateEstadoSala(salaId);
    estadoSala.expulsados.set(odooId, {
      fecha: new Date(),
      motivo,
    });

    // También remover de muteados (ya no es relevante)
    estadoSala.muteados.delete(odooId);

    this.logger.log(
      `Usuario ${odooId} expulsado de sala ${salaId}${motivo ? `: ${motivo}` : ''}`,
    );
  }

  /**
   * Verifica si un usuario está expulsado de una sala
   * La expulsión dura 24 horas
   *
   * @returns true si está expulsado (y la expulsión no ha expirado)
   */
  estaExpulsado(salaId: string, odooId: string): boolean {
    const estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      return false;
    }

    const expulsion = estadoSala.expulsados.get(odooId);
    if (!expulsion) {
      return false;
    }

    // Verificar si la expulsión ha expirado
    const ahora = Date.now();
    const expulsionTime = expulsion.fecha.getTime();
    if (ahora - expulsionTime > DURACION_EXPULSION_MS) {
      // Expulsión expirada, limpiar
      estadoSala.expulsados.delete(odooId);
      return false;
    }

    return true;
  }

  /**
   * Obtiene el motivo de expulsión de un usuario
   */
  getMotivoExpulsion(salaId: string, odooId: string): string | undefined {
    const estadoSala = this.estadoPorSala.get(salaId);
    return estadoSala?.expulsados.get(odooId)?.motivo;
  }

  /**
   * Verifica si un usuario está muteado en una sala
   *
   * @returns El tipo de muteo, o null si no está muteado
   */
  estaMuteado(salaId: string, odooId: string): TipoMuteo | null {
    const estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      return null;
    }

    return estadoSala.muteados.get(odooId) ?? null;
  }

  /**
   * Obtiene el estado de moderación de un usuario en una sala
   */
  getEstadoUsuario(salaId: string, odooId: string): EstadoUsuarioModeracion {
    const estadoSala = this.estadoPorSala.get(salaId);
    const expulsion = estadoSala?.expulsados.get(odooId);

    return {
      odooId,
      muteado: estadoSala?.muteados.get(odooId) ?? null,
      expulsadoEn: expulsion?.fecha ?? null,
      motivoExpulsion: expulsion?.motivo,
    };
  }

  /**
   * Obtiene todos los usuarios muteados en una sala
   */
  getMuteados(salaId: string): Array<{ odooId: string; tipo: TipoMuteo }> {
    const estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      return [];
    }

    return Array.from(estadoSala.muteados.entries()).map(([odooId, tipo]) => ({
      odooId,
      tipo,
    }));
  }

  /**
   * Limpia todo el estado de moderación de una sala
   * (útil cuando termina la clase)
   */
  limpiarSala(salaId: string): void {
    this.estadoPorSala.delete(salaId);
    this.logger.log(`Estado de moderación limpiado para sala ${salaId}`);
  }

  private getOrCreateEstadoSala(salaId: string): EstadoSalaModeracion {
    let estadoSala = this.estadoPorSala.get(salaId);
    if (!estadoSala) {
      estadoSala = {
        muteados: new Map(),
        expulsados: new Map(),
      };
      this.estadoPorSala.set(salaId, estadoSala);
    }
    return estadoSala;
  }
}
