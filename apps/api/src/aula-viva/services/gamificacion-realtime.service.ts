import { Injectable, Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { PresenciaService } from './presencia.service';

/**
 * Payload para notificación de puntos otorgados
 */
export interface PuntosOtorgadosPayload {
  puntos: number;
  tipoAccion: string;
  contexto?: string;
  docenteNombre: string;
  xpTotal: number;
  timestamp: string;
}

/**
 * Payload para notificación de nivel subido
 */
export interface NivelSubidoPayload {
  nivelAnterior: number;
  nivelNuevo: number;
  xpTotal: number;
  recompensas?: Record<string, unknown>;
  timestamp: string;
}

/**
 * Payload para notificación de logro desbloqueado
 */
export interface LogroDesbloqueadoPayload {
  logroCodigo: string;
  logroNombre: string;
  logroIcono?: string;
  recompensas?: { xp?: number };
  timestamp: string;
}

/**
 * Payload para broadcast de puntos de casa
 */
export interface CasaPuntosPayload {
  casaId: string;
  casaNombre: string;
  estudianteId: string;
  estudianteNombre: string;
  xpGanado: number;
  xpTotalEstudiante: number;
  timestamp: string;
}

/**
 * Servicio para enviar notificaciones de gamificación en tiempo real
 *
 * Sigue el patrón de interfaz limpia recomendado para desacoplar
 * la lógica de negocio del manejo de WebSockets.
 *
 * @see https://www.lorenstew.art/blog/nestjs-websockets-real-time
 * @see https://medium.com/@marufpulok98/building-a-production-ready-real-time-notification-system
 */
@Injectable()
export class GamificacionRealtimeService {
  private readonly logger = new Logger(GamificacionRealtimeService.name);
  private server: Server | null = null;

  constructor(private readonly presenciaService: PresenciaService) {}

  /**
   * Configura la referencia al servidor Socket.IO
   * Debe llamarse desde el gateway después de la inicialización
   */
  setServer(server: Server): void {
    this.server = server;
    this.logger.log('Socket.IO server configurado para notificaciones');
  }

  /**
   * Notifica a un estudiante que recibió puntos (privado)
   * Sprint 3.3: Solo el estudiante ve esta notificación
   */
  notificarPuntosOtorgados(
    estudianteId: string,
    payload: PuntosOtorgadosPayload,
  ): boolean {
    if (!this.server) {
      this.logger.warn(
        'Server no configurado, notificación no enviada (puntos)',
      );
      return false;
    }

    const socketIds = this.presenciaService.getSocketsByUserId(estudianteId);

    if (socketIds.length === 0) {
      this.logger.debug(
        `Estudiante ${estudianteId} no conectado, notificación no enviada`,
      );
      return false;
    }

    // Enviar a todos los sockets del estudiante (múltiples tabs/dispositivos)
    for (const socketId of socketIds) {
      this.server.to(socketId).emit('puntos-otorgados', payload);
    }

    this.logger.log(
      `Notificación puntos enviada a estudiante ${estudianteId} (${socketIds.length} sockets)`,
    );
    return true;
  }

  /**
   * Notifica a un estudiante que subió de nivel (privado)
   * Sprint 3.4: Animación de level-up
   */
  notificarNivelUp(estudianteId: string, payload: NivelSubidoPayload): boolean {
    if (!this.server) {
      this.logger.warn(
        'Server no configurado, notificación no enviada (nivel)',
      );
      return false;
    }

    const socketIds = this.presenciaService.getSocketsByUserId(estudianteId);

    if (socketIds.length === 0) {
      this.logger.debug(
        `Estudiante ${estudianteId} no conectado para nivel-up`,
      );
      return false;
    }

    for (const socketId of socketIds) {
      this.server.to(socketId).emit('nivel-subido', payload);
    }

    this.logger.log(
      `Notificación nivel-up enviada a estudiante ${estudianteId}: nivel ${payload.nivelNuevo}`,
    );
    return true;
  }

  /**
   * Notifica a un estudiante que desbloqueó un logro (privado)
   * Sprint 3.4: Animación de logro
   */
  notificarLogroDesbloqueado(
    estudianteId: string,
    payload: LogroDesbloqueadoPayload,
  ): boolean {
    if (!this.server) {
      this.logger.warn(
        'Server no configurado, notificación no enviada (logro)',
      );
      return false;
    }

    const socketIds = this.presenciaService.getSocketsByUserId(estudianteId);

    if (socketIds.length === 0) {
      this.logger.debug(`Estudiante ${estudianteId} no conectado para logro`);
      return false;
    }

    for (const socketId of socketIds) {
      this.server.to(socketId).emit('logro-desbloqueado', payload);
    }

    this.logger.log(
      `Notificación logro enviada a estudiante ${estudianteId}: ${payload.logroCodigo}`,
    );
    return true;
  }

  /**
   * Broadcast de puntos de casa a todos los estudiantes conectados de esa casa
   * Sprint 3.5: Actualización en tiempo real del ranking de casa
   */
  broadcastCasaPuntos(casaRoom: string, payload: CasaPuntosPayload): boolean {
    if (!this.server) {
      this.logger.warn('Server no configurado, broadcast no enviado (casa)');
      return false;
    }

    // Emitir a todos en el room de la casa
    this.server.to(casaRoom).emit('casa-puntos-actualizado', payload);

    this.logger.log(
      `Broadcast casa ${payload.casaNombre}: +${payload.xpGanado} XP por ${payload.estudianteNombre}`,
    );
    return true;
  }

  /**
   * Verifica si un estudiante está conectado
   */
  isEstudianteConectado(estudianteId: string): boolean {
    return this.presenciaService.getSocketsByUserId(estudianteId).length > 0;
  }
}
