import { Injectable, Logger } from '@nestjs/common';

/**
 * Representa una mano levantada por un estudiante
 */
export interface ManoLevantada {
  odooId: string;
  nombre: string;
  salaId: string;
  timestamp: Date;
}

/**
 * Servicio para gestionar el sistema de "levantar la mano" en clases en vivo
 *
 * Reglas de negocio:
 * - Solo 1 mano levantada por estudiante a la vez (por sala)
 * - Lista ordenada por timestamp (FIFO - primero en levantar, primero en la cola)
 * - Al dar palabra, la mano baja automáticamente
 */
@Injectable()
export class ManosService {
  private readonly logger = new Logger(ManosService.name);

  /**
   * Estructura: salaId -> Map<odooId, ManoLevantada>
   * Usamos Map para O(1) lookup por odooId
   */
  private manosLevantadas: Map<string, Map<string, ManoLevantada>> = new Map();

  /**
   * Levanta la mano de un estudiante en una sala
   * Si ya tiene la mano levantada, actualiza el timestamp (re-levantar)
   *
   * @returns La mano levantada con su timestamp
   */
  levantarMano(salaId: string, odooId: string, nombre: string): ManoLevantada {
    const manosSala = this.getOrCreateManosSala(salaId);

    // Si ya tiene mano levantada, la mantenemos (no actualizar timestamp para mantener FIFO)
    const manoExistente = manosSala.get(odooId);
    if (manoExistente) {
      this.logger.debug(
        `${nombre} ya tiene la mano levantada en sala ${salaId}`,
      );
      return manoExistente;
    }

    const mano: ManoLevantada = {
      odooId,
      nombre,
      salaId,
      timestamp: new Date(),
    };

    manosSala.set(odooId, mano);
    this.logger.log(`${nombre} levantó la mano en sala ${salaId}`);

    return mano;
  }

  /**
   * Baja la mano de un estudiante en una sala
   *
   * @returns true si se bajó la mano, false si no tenía la mano levantada
   */
  bajarMano(salaId: string, odooId: string): boolean {
    const manosSala = this.manosLevantadas.get(salaId);
    if (!manosSala) {
      return false;
    }

    const teniaLaMano = manosSala.delete(odooId);

    if (teniaLaMano) {
      this.logger.log(`Mano bajada: ${odooId} en sala ${salaId}`);
    }

    // Limpiar sala si no quedan manos
    if (manosSala.size === 0) {
      this.manosLevantadas.delete(salaId);
    }

    return teniaLaMano;
  }

  /**
   * Obtiene todas las manos levantadas en una sala, ordenadas por timestamp (FIFO)
   */
  getManosLevantadas(salaId: string): ManoLevantada[] {
    const manosSala = this.manosLevantadas.get(salaId);
    if (!manosSala) {
      return [];
    }

    return Array.from(manosSala.values()).sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );
  }

  /**
   * Da la palabra a un estudiante (baja su mano automáticamente)
   *
   * @returns La información de la mano que se bajó, o undefined si no tenía la mano levantada
   */
  darPalabra(salaId: string, odooId: string): ManoLevantada | undefined {
    const manosSala = this.manosLevantadas.get(salaId);
    if (!manosSala) {
      return undefined;
    }

    const mano = manosSala.get(odooId);
    if (!mano) {
      return undefined;
    }

    // Bajar la mano automáticamente
    manosSala.delete(odooId);
    this.logger.log(`Palabra otorgada a ${mano.nombre} en sala ${salaId}`);

    // Limpiar sala si no quedan manos
    if (manosSala.size === 0) {
      this.manosLevantadas.delete(salaId);
    }

    return mano;
  }

  /**
   * Verifica si un estudiante tiene la mano levantada en una sala
   */
  tieneManoLevantada(salaId: string, odooId: string): boolean {
    return this.manosLevantadas.get(salaId)?.has(odooId) ?? false;
  }

  /**
   * Cuenta cuántas manos están levantadas en una sala
   */
  contarManosLevantadas(salaId: string): number {
    return this.manosLevantadas.get(salaId)?.size ?? 0;
  }

  /**
   * Baja todas las manos de una sala (útil al terminar la clase)
   */
  bajarTodasLasManos(salaId: string): void {
    this.manosLevantadas.delete(salaId);
    this.logger.log(`Todas las manos bajadas en sala ${salaId}`);
  }

  /**
   * Remueve todas las manos de un usuario específico de todas las salas
   * (útil cuando un estudiante se desconecta)
   */
  removerManosPorUsuario(odooId: string): string[] {
    const salasAfectadas: string[] = [];

    for (const [salaId, manosSala] of this.manosLevantadas.entries()) {
      if (manosSala.delete(odooId)) {
        salasAfectadas.push(salaId);

        // Limpiar sala si no quedan manos
        if (manosSala.size === 0) {
          this.manosLevantadas.delete(salaId);
        }
      }
    }

    return salasAfectadas;
  }

  private getOrCreateManosSala(salaId: string): Map<string, ManoLevantada> {
    let manosSala = this.manosLevantadas.get(salaId);
    if (!manosSala) {
      manosSala = new Map();
      this.manosLevantadas.set(salaId, manosSala);
    }
    return manosSala;
  }
}
