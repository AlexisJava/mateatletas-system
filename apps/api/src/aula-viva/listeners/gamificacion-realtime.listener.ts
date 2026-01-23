import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  XpGainedEvent,
  EstudianteNivelUpEvent,
  LogroDesbloqueadoEvent,
  PuntosOtorgadosEnVivoEvent,
  CasaPuntosActualizadosEvent,
} from '../../common/events/domain-events';
import { GamificacionRealtimeService } from '../services/gamificacion-realtime.service';

/**
 * Listener que conecta los domain events de gamificación con
 * las notificaciones WebSocket en tiempo real.
 *
 * Implementa el patrón Event-Driven Architecture para desacoplar
 * la lógica de negocio del envío de notificaciones.
 *
 * @see https://docs.nestjs.com/techniques/events
 */
@Injectable()
export class GamificacionRealtimeListener {
  private readonly logger = new Logger(GamificacionRealtimeListener.name);

  constructor(
    private readonly gamificacionRealtime: GamificacionRealtimeService,
  ) {}

  /**
   * Sprint 3.3: Notificación privada cuando docente otorga puntos
   */
  @OnEvent('puntos.otorgados.envivo')
  handlePuntosOtorgadosEnVivo(event: PuntosOtorgadosEnVivoEvent): void {
    this.logger.debug(
      `Puntos en vivo: ${event.estudianteId} +${event.puntos} por ${event.docenteNombre}`,
    );

    this.gamificacionRealtime.notificarPuntosOtorgados(event.estudianteId, {
      puntos: event.puntos,
      tipoAccion: event.tipoAccion,
      contexto: event.contexto,
      docenteNombre: event.docenteNombre,
      xpTotal: event.xpTotal,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sprint 3.4: Notificación privada de XP ganado (opcional, para mostrar toast)
   */
  @OnEvent('xp.ganado')
  handleXpGanado(event: XpGainedEvent): void {
    // Solo logueamos, la notificación principal es en nivel-up
    this.logger.debug(
      `XP ganado: ${event.estudianteId} +${event.xpGanado} (${event.razon})`,
    );

    // No enviamos notificación por cada XP ganado para evitar spam
    // Solo notificamos en eventos significativos (nivel-up, logro)
  }

  /**
   * Sprint 3.4: Notificación privada de nivel subido
   */
  @OnEvent('estudiante.nivel-up')
  handleNivelUp(event: EstudianteNivelUpEvent): void {
    this.logger.log(
      `Nivel up: ${event.estudianteId} ${event.nivelAnterior} → ${event.nivelNuevo}`,
    );

    this.gamificacionRealtime.notificarNivelUp(event.estudianteId, {
      nivelAnterior: event.nivelAnterior,
      nivelNuevo: event.nivelNuevo,
      xpTotal: 0, // El XP total se puede calcular si es necesario
      recompensas: event.recompensas,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sprint 3.4: Notificación privada de logro desbloqueado
   */
  @OnEvent('logro.desbloqueado')
  handleLogroDesbloqueado(event: LogroDesbloqueadoEvent): void {
    this.logger.log(
      `Logro desbloqueado: ${event.estudianteId} - ${event.logroCodigo}`,
    );

    this.gamificacionRealtime.notificarLogroDesbloqueado(event.estudianteId, {
      logroCodigo: event.logroCodigo,
      logroNombre: event.logroNombre,
      recompensas: event.recompensas,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sprint 3.5: Broadcast de puntos de casa
   */
  @OnEvent('casa.puntos.actualizado')
  handleCasaPuntosActualizados(event: CasaPuntosActualizadosEvent): void {
    this.logger.debug(
      `Casa puntos: ${event.casaNombre} +${event.xpGanado} por ${event.estudianteNombre}`,
    );

    // Room de la casa: casa:{casaId}
    const casaRoom = `casa:${event.casaId}`;

    this.gamificacionRealtime.broadcastCasaPuntos(casaRoom, {
      casaId: event.casaId,
      casaNombre: event.casaNombre,
      estudianteId: event.estudianteId,
      estudianteNombre: event.estudianteNombre,
      xpGanado: event.xpGanado,
      xpTotalEstudiante: event.xpTotalEstudiante,
      timestamp: new Date().toISOString(),
    });
  }
}
