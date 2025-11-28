import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { AuthEventsListener } from '../auth-events.listener';
import { LogrosService } from '../../services/logros.service';
import {
  UserRegisteredEvent,
  UserLoggedInEvent,
  EstudiantePrimerLoginEvent,
} from '../../../common/events';

describe('AuthEventsListener', () => {
  let listener: AuthEventsListener;
  let logrosService: jest.Mocked<LogrosService>;

  beforeEach(async () => {
    const mockLogrosService = {
      desbloquearLogro: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthEventsListener,
        {
          provide: LogrosService,
          useValue: mockLogrosService,
        },
      ],
    }).compile();

    listener = module.get<AuthEventsListener>(AuthEventsListener);
    logrosService = module.get(LogrosService);

    // Mock logger to avoid console spam
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handleUserRegistered', () => {
    it('debe loggear el evento de registro de tutor', async () => {
      const event = new UserRegisteredEvent(
        'tutor-123',
        'tutor',
        'tutor@example.com',
        'Juan',
        'Pérez',
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserRegistered(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario registrado: tutor-123 (tutor) - tutor@example.com',
      );
    });

    it('debe loggear el evento de registro de docente', async () => {
      const event = new UserRegisteredEvent(
        'docente-456',
        'docente',
        'docente@example.com',
        'María',
        'González',
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserRegistered(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario registrado: docente-456 (docente) - docente@example.com',
      );
    });

    it('debe loggear el evento de registro de admin', async () => {
      const event = new UserRegisteredEvent(
        'admin-789',
        'admin',
        'admin@example.com',
        'Carlos',
        'López',
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserRegistered(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario registrado: admin-789 (admin) - admin@example.com',
      );
    });
  });

  describe('handleUserLoggedIn', () => {
    it('debe loggear login de tutor sin ejecutar gamificación', async () => {
      const event = new UserLoggedInEvent(
        'tutor-123',
        'tutor',
        'tutor@example.com',
        false,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserLoggedIn(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario tutor hizo login: tutor-123 (tutor@example.com)',
      );
      expect(logrosService.desbloquearLogro).not.toHaveBeenCalled();
    });

    it('debe loggear login de docente sin ejecutar gamificación', async () => {
      const event = new UserLoggedInEvent(
        'docente-456',
        'docente',
        'docente@example.com',
        false,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserLoggedIn(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario docente hizo login: docente-456 (docente@example.com)',
      );
      expect(logrosService.desbloquearLogro).not.toHaveBeenCalled();
    });

    it('debe loggear login de admin sin ejecutar gamificación', async () => {
      const event = new UserLoggedInEvent(
        'admin-789',
        'admin',
        'admin@example.com',
        false,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserLoggedIn(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario admin hizo login: admin-789 (admin@example.com)',
      );
      expect(logrosService.desbloquearLogro).not.toHaveBeenCalled();
    });

    it('debe loggear login de estudiante', async () => {
      const event = new UserLoggedInEvent(
        'estudiante-101',
        'estudiante',
        'estudiante@example.com',
        false,
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserLoggedIn(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario estudiante hizo login: estudiante-101 (estudiante@example.com)',
      );
      // TODO: Cuando se implemente lógica de gamificación, agregar expects aquí
    });

    it('debe loggear primer login de estudiante', async () => {
      const event = new UserLoggedInEvent(
        'estudiante-101',
        'estudiante',
        'estudiante@example.com',
        true, // esPrimerLogin
      );

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleUserLoggedIn(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Usuario estudiante hizo login: estudiante-101 (estudiante@example.com)',
      );
      // TODO: Cuando se implemente lógica de gamificación, verificar otorgamiento de logro
    });
  });

  describe('handleEstudiantePrimerLogin', () => {
    it('debe otorgar logro PRIMER_INGRESO en primer login', async () => {
      const event = new EstudiantePrimerLoginEvent(
        'estudiante-101',
        'juanito_perez',
      );

      logrosService.desbloquearLogro.mockResolvedValue(undefined as never);

      const logSpy = jest.spyOn(Logger.prototype, 'log');

      await listener.handleEstudiantePrimerLogin(event);

      expect(logSpy).toHaveBeenCalledWith(
        'Primer login detectado para estudiante: estudiante-101 (juanito_perez)',
      );
      expect(logrosService.desbloquearLogro).toHaveBeenCalledWith(
        'estudiante-101',
        'PRIMER_INGRESO',
      );
      expect(logSpy).toHaveBeenCalledWith(
        'Logro PRIMER_INGRESO otorgado a estudiante estudiante-101',
      );
    });

    it('debe loggear error si falla desbloquear logro pero no debe fallar', async () => {
      const event = new EstudiantePrimerLoginEvent(
        'estudiante-101',
        'juanito_perez',
      );

      const error = new Error('Error al desbloquear logro');
      logrosService.desbloquearLogro.mockRejectedValue(error);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      // No debe lanzar error, solo loggear
      await expect(
        listener.handleEstudiantePrimerLogin(event),
      ).resolves.not.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error al otorgar logro PRIMER_INGRESO a estudiante estudiante-101',
        error.stack,
      );
    });

    it('debe loggear error incluso si el error no es una instancia de Error', async () => {
      const event = new EstudiantePrimerLoginEvent(
        'estudiante-101',
        'juanito_perez',
      );

      logrosService.desbloquearLogro.mockRejectedValue('String error' as never);

      const errorSpy = jest.spyOn(Logger.prototype, 'error');

      await expect(
        listener.handleEstudiantePrimerLogin(event),
      ).resolves.not.toThrow();

      expect(errorSpy).toHaveBeenCalledWith(
        'Error al otorgar logro PRIMER_INGRESO a estudiante estudiante-101',
        'String error',
      );
    });
  });

  describe('Integration scenarios', () => {
    it('debe manejar múltiples eventos de registro en secuencia', async () => {
      const events = [
        new UserRegisteredEvent(
          'tutor-1',
          'tutor',
          'tutor1@example.com',
          'Tutor',
          'Uno',
        ),
        new UserRegisteredEvent(
          'docente-1',
          'docente',
          'docente1@example.com',
          'Docente',
          'Uno',
        ),
        new UserRegisteredEvent(
          'admin-1',
          'admin',
          'admin1@example.com',
          'Admin',
          'Uno',
        ),
      ];

      for (const event of events) {
        await listener.handleUserRegistered(event);
      }

      // Verificar que no haya lanzado errores
      expect(true).toBe(true);
    });

    it('debe manejar múltiples eventos de login en secuencia', async () => {
      const events = [
        new UserLoggedInEvent('tutor-1', 'tutor', 'tutor1@example.com', false),
        new UserLoggedInEvent(
          'docente-1',
          'docente',
          'docente1@example.com',
          false,
        ),
        new UserLoggedInEvent(
          'estudiante-1',
          'estudiante',
          'estudiante1@example.com',
          true,
        ),
      ];

      for (const event of events) {
        await listener.handleUserLoggedIn(event);
      }

      expect(true).toBe(true);
    });

    it('debe manejar evento de primer login seguido de login normal', async () => {
      const estudianteId = 'estudiante-101';

      // Primer login
      const primerLoginEvent = new EstudiantePrimerLoginEvent(
        estudianteId,
        'juanito_perez',
      );
      logrosService.desbloquearLogro.mockResolvedValue(undefined as never);
      await listener.handleEstudiantePrimerLogin(primerLoginEvent);

      expect(logrosService.desbloquearLogro).toHaveBeenCalledTimes(1);

      // Login normal posterior
      const loginEvent = new UserLoggedInEvent(
        estudianteId,
        'estudiante',
        'juanito@example.com',
        false,
      );
      await listener.handleUserLoggedIn(loginEvent);

      // No debe llamar desbloquearLogro nuevamente
      expect(logrosService.desbloquearLogro).toHaveBeenCalledTimes(1);
    });
  });
});
