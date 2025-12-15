import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  EstudiantePrimerLoginEvent,
} from '../../common/events';
import { LogrosService } from '../services/logros.service';

/**
 * Event Listener para eventos de autenticación
 *
 * Este listener escucha eventos emitidos por AuthModule y ejecuta
 * lógica de gamificación sin que AuthModule dependa de GamificacionModule.
 *
 * Eventos que escucha:
 * - user.registered: Cuando un tutor se registra
 * - user.logged-in: Cuando un usuario hace login
 * - estudiante.primer-login: Cuando un estudiante hace su primer login
 *
 * Beneficios:
 * - Elimina la dependencia circular Auth ↔ Gamificación
 * - Desacopla módulos (Single Responsibility Principle)
 * - Permite agregar más listeners sin modificar AuthModule
 * - Facilita testing (se pueden mockear eventos)
 */
@Injectable()
export class AuthEventsListener {
  private readonly logger = new Logger(AuthEventsListener.name);

  constructor(private readonly logrosService: LogrosService) {}

  /**
   * Listener: Usuario registrado
   *
   * Se ejecuta cuando un tutor se registra exitosamente.
   *
   * Acciones:
   * - Asignar casa inicial (si aplica en el futuro)
   * - Otorgar logro de bienvenida (si aplica)
   */
  @OnEvent('user.registered')
  handleUserRegistered(event: UserRegisteredEvent) {
    this.logger.log(
      `Usuario registrado: ${event.userId} (${event.userType}) - ${event.email}`,
    );

    // TODO: Implementar lógica de bienvenida para tutores
    // Por ejemplo: otorgar logro "BIENVENIDO", asignar recursos iniciales, etc.
    // Esto se puede agregar en el futuro sin modificar AuthModule
  }

  /**
   * Listener: Usuario hizo login
   *
   * Se ejecuta cuando un usuario (tutor, docente, admin, estudiante) hace login.
   *
   * Acciones:
   * - Otorgar XP por login diario (solo estudiantes)
   * - Actualizar racha de login (solo estudiantes)
   * - Verificar logros de racha (solo estudiantes)
   */
  @OnEvent('user.logged-in')
  handleUserLoggedIn(event: UserLoggedInEvent) {
    this.logger.log(
      `Usuario ${event.userType} hizo login: ${event.userId} (${event.email})`,
    );

    // Solo ejecutar lógica de gamificación para estudiantes
    if (event.userType !== 'estudiante') {
      return;
    }

    // TODO: Implementar lógica de login diario
    // - Otorgar XP por login (verificar que sea el primer login del día)
    // - Actualizar racha de login
    // - Verificar logros de racha (ej: "7_DIAS_SEGUIDOS", "30_DIAS_SEGUIDOS")
  }

  /**
   * Listener: Estudiante hizo su primer login
   *
   * Se ejecuta cuando un estudiante hace login por primera vez
   * (detectado por no tener logros desbloqueados).
   *
   * Acciones:
   * - Otorgar logro "PRIMER_INGRESO"
   */
  @OnEvent('estudiante.primer-login')
  async handleEstudiantePrimerLogin(event: EstudiantePrimerLoginEvent) {
    this.logger.log(
      `Primer login detectado para estudiante: ${event.estudianteId} (${event.username})`,
    );

    try {
      await this.logrosService.desbloquearLogro(
        event.estudianteId,
        'PRIMER_INGRESO',
      );
      this.logger.log(
        `Logro PRIMER_INGRESO otorgado a estudiante ${event.estudianteId}`,
      );
    } catch (error) {
      // Log del error pero no fallar la operación de login
      this.logger.error(
        `Error al otorgar logro PRIMER_INGRESO a estudiante ${event.estudianteId}`,
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
