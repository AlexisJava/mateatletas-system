import { Injectable, Logger } from '@nestjs/common';
import type { RolAulaViva } from '../interfaces';

/**
 * Representa un participante conectado a una sala
 */
export interface Participante {
  odidentidadUsuario: string;
  odidentidadSala: string;
  socketId: string;
  nombre: string;
  rol: RolAulaViva;
  conectadoEn: Date;
}

/**
 * Servicio para gestionar la presencia de usuarios en salas de aula virtual
 *
 * Mantiene el estado en memoria de:
 * - Qué usuarios están conectados (por socketId)
 * - En qué salas están (un socket puede estar en múltiples salas)
 * - Metadatos de conexión
 *
 * Estructura de datos:
 * - socketToSalas: socketId -> Set<salaId> (salas donde está el socket)
 * - salaToSockets: salaId -> Map<socketId, Participante> (participantes por sala)
 */
@Injectable()
export class PresenciaService {
  private readonly logger = new Logger(PresenciaService.name);

  /** Mapa de socketId -> Set de salaIds donde está conectado */
  private socketToSalas: Map<string, Set<string>> = new Map();

  /** Mapa de salaId -> Map<socketId, Participante> */
  private salaToParticipantes: Map<string, Map<string, Participante>> =
    new Map();

  /**
   * Agrega un participante a una sala
   * Un mismo socket puede estar en múltiples salas
   */
  agregarParticipante(participante: Participante): void {
    const { socketId, odidentidadSala } = participante;

    // Agregar sala al set de salas del socket
    const salas = this.socketToSalas.get(socketId) ?? new Set<string>();
    salas.add(odidentidadSala);
    this.socketToSalas.set(socketId, salas);

    // Agregar participante a la sala
    const participantesSala =
      this.salaToParticipantes.get(odidentidadSala) ??
      new Map<string, Participante>();
    participantesSala.set(socketId, participante);
    this.salaToParticipantes.set(odidentidadSala, participantesSala);

    this.logger.log(
      `Participante ${participante.nombre} unido a sala ${odidentidadSala}`,
    );
  }

  /**
   * Remueve un participante de todas las salas por su socketId
   * @returns Array de salaIds donde estaba el participante
   */
  removerParticipante(socketId: string): string[] {
    const salas = this.socketToSalas.get(socketId);
    if (!salas || salas.size === 0) {
      return [];
    }

    const salasAfectadas: string[] = [];

    for (const salaId of salas) {
      const participantesSala = this.salaToParticipantes.get(salaId);
      if (participantesSala) {
        const participante = participantesSala.get(socketId);
        participantesSala.delete(socketId);

        if (participantesSala.size === 0) {
          this.salaToParticipantes.delete(salaId);
        }

        salasAfectadas.push(salaId);

        if (participante) {
          this.logger.log(
            `Participante ${participante.nombre} removido de sala ${salaId}`,
          );
        }
      }
    }

    this.socketToSalas.delete(socketId);

    return salasAfectadas;
  }

  /**
   * Remueve un participante de una sala específica
   * El socket permanece en otras salas si las tiene
   */
  removerParticipanteDeSala(socketId: string, salaId: string): void {
    // Remover de la sala
    const participantesSala = this.salaToParticipantes.get(salaId);
    if (participantesSala) {
      const participante = participantesSala.get(socketId);
      participantesSala.delete(socketId);

      if (participantesSala.size === 0) {
        this.salaToParticipantes.delete(salaId);
      }

      if (participante) {
        this.logger.log(
          `Participante ${participante.nombre} salió de sala ${salaId}`,
        );
      }
    }

    // Remover sala del tracking del socket
    const salas = this.socketToSalas.get(socketId);
    if (salas) {
      salas.delete(salaId);
      if (salas.size === 0) {
        this.socketToSalas.delete(socketId);
      }
    }
  }

  /**
   * Obtiene todos los participantes de una sala
   */
  getParticipantesDeSala(salaId: string): Participante[] {
    const participantesSala = this.salaToParticipantes.get(salaId);
    if (!participantesSala) {
      return [];
    }
    return Array.from(participantesSala.values());
  }

  /**
   * Obtiene un participante por socketId (de cualquier sala)
   */
  getParticipante(socketId: string): Participante | undefined {
    const salas = this.socketToSalas.get(socketId);
    if (!salas || salas.size === 0) {
      return undefined;
    }

    // Tomar el participante de la primera sala
    const primeraSala = salas.values().next().value as string;
    return this.salaToParticipantes.get(primeraSala)?.get(socketId);
  }

  /**
   * Obtiene todas las salas donde está un socket
   */
  getSalasDeSocket(socketId: string): string[] {
    const salas = this.socketToSalas.get(socketId);
    if (!salas) {
      return [];
    }
    return Array.from(salas);
  }

  /**
   * Cuenta participantes en una sala
   */
  contarParticipantesSala(salaId: string): number {
    return this.salaToParticipantes.get(salaId)?.size ?? 0;
  }

  /**
   * Verifica si un usuario ya está en una sala
   */
  usuarioEnSala(userId: string, salaId: string): boolean {
    const participantesSala = this.salaToParticipantes.get(salaId);
    if (!participantesSala) {
      return false;
    }

    for (const participante of participantesSala.values()) {
      if (participante.odidentidadUsuario === userId) {
        return true;
      }
    }

    return false;
  }
}
