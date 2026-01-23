import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { AulaVivaGateway } from '../src/aula-viva/aula-viva.gateway';
import { PresenciaService } from '../src/aula-viva/services/presencia.service';
import { ReaccionesService } from '../src/aula-viva/services/reacciones.service';
import { PulsoService } from '../src/aula-viva/services/pulso.service';
import { SelectorService } from '../src/aula-viva/services/selector.service';
import { ManosService } from '../src/aula-viva/services/manos.service';
import { ModeracionService } from '../src/aula-viva/services/moderacion.service';
import { QuizService } from '../src/aula-viva/services/quiz.service';
import { ContadorService } from '../src/aula-viva/services/contador.service';

/**
 * =============================================================================
 * SPRINT 3.2 - CONTADOR COMPARTIDO
 * Tests E2E para: Iniciar, Pausar, Reanudar, Cancelar contador
 * =============================================================================
 *
 * FILOSOFÍA: Black Box Testing
 * - Tests basados en REQUISITOS, no en implementación
 * - Verificamos comportamiento observable desde el cliente WebSocket
 *
 * CLASES DE EQUIVALENCIA:
 * - iniciar-contador: solo docente, segundos 1-3600
 * - pausar-contador: solo docente, guarda segundos restantes
 * - reanudar-contador: solo docente, continúa desde pausa
 * - cancelar-contador: solo docente, no emite terminado
 *
 * VALORES FRONTERA:
 * - segundos: min 1, max 3600
 */
describe('Sprint 3.2 E2E - Contador Compartido (AulaVivaGateway)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let contadorService: ContadorService;
  let clienteDocente: Socket | undefined;
  let clienteEstudiante: Socket | undefined;

  const PORT = 3857; // Puerto único para este test
  const JWT_SECRET = 'test-secret-for-sprint3-contador-e2e';

  // Datos de usuarios de prueba
  const docenteData = {
    sub: 'docente-contador-001',
    nombre: 'Prof. Martínez',
    rol: 'DOCENTE',
  };

  const estudianteData = {
    sub: 'estudiante-contador-001',
    nombre: 'Carlos Ruiz',
    rol: 'ESTUDIANTE',
  };

  // CUIDs de prueba únicos para cada test
  const TEST_CUIDS = {
    contador1: 'ctest0sprint3contador001',
    contador2: 'ctest0sprint3contador002',
    contador3: 'ctest0sprint3contador003',
    contador4: 'ctest0sprint3contador004',
    contador5: 'ctest0sprint3contador005',
    contador6: 'ctest0sprint3contador006',
    contador7: 'ctest0sprint3contador007',
    contador8: 'ctest0sprint3contador008',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
      ],
      providers: [
        AulaVivaGateway,
        PresenciaService,
        ReaccionesService,
        PulsoService,
        SelectorService,
        ManosService,
        ModeracionService,
        QuizService,
        ContadorService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    contadorService = moduleFixture.get<ContadorService>(ContadorService);

    await app.init();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app?.close();
  });

  afterEach(async () => {
    // Limpiar todos los timers para evitar que Jest quede colgado
    contadorService.limpiarTodo();

    if (clienteDocente?.connected) clienteDocente.disconnect();
    if (clienteEstudiante?.connected) clienteEstudiante.disconnect();
    clienteDocente = undefined;
    clienteEstudiante = undefined;
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  // ===========================================================================
  // HELPERS
  // ===========================================================================

  const generarToken = (payload: {
    sub: string;
    nombre: string;
    rol: string;
  }): string => {
    return jwtService.sign(payload);
  };

  const crearCliente = (token: string): Promise<Socket> => {
    return new Promise((resolve, reject) => {
      const cliente = io(`http://localhost:${PORT}/aula-viva`, {
        auth: { token },
        transports: ['websocket'],
        forceNew: true,
      });

      cliente.on('connect', () => resolve(cliente));
      cliente.on('connect_error', (err) => reject(err));
      setTimeout(() => reject(new Error('Timeout conectando cliente')), 5000);
    });
  };

  const unirseSala = (
    cliente: Socket,
    claseGrupoId: string,
  ): Promise<{ exito: boolean; salaId: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de unirse-sala'));
      }, 3000);

      cliente.emit(
        'unirse-sala',
        { claseGrupoId },
        (response: { exito: boolean; salaId: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const iniciarContador = (
    cliente: Socket,
    salaId: string,
    segundos: number,
    mensaje?: string,
  ): Promise<{ exito: boolean; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de iniciar-contador'));
      }, 3000);

      cliente.emit(
        'iniciar-contador',
        { salaId, segundos, mensaje },
        (response: { exito: boolean; error?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const pausarContador = (
    cliente: Socket,
    salaId: string,
  ): Promise<{
    exito: boolean;
    segundosRestantes?: number;
    error?: string;
  }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de pausar-contador'));
      }, 3000);

      cliente.emit(
        'pausar-contador',
        { salaId },
        (response: {
          exito: boolean;
          segundosRestantes?: number;
          error?: string;
        }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const reanudarContador = (
    cliente: Socket,
    salaId: string,
  ): Promise<{ exito: boolean; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de reanudar-contador'));
      }, 3000);

      cliente.emit(
        'reanudar-contador',
        { salaId },
        (response: { exito: boolean; error?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const cancelarContador = (
    cliente: Socket,
    salaId: string,
  ): Promise<{ exito: boolean; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de cancelar-contador'));
      }, 3000);

      cliente.emit(
        'cancelar-contador',
        { salaId },
        (response: { exito: boolean; error?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  // ===========================================================================
  // TESTS: iniciar-contador
  // ===========================================================================

  describe('iniciar-contador', () => {
    it('should_allow_docente_to_start_contador', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador1);

      // Act
      const result = await iniciarContador(
        clienteDocente,
        salaId,
        30,
        'Tiempo para resolver',
      );

      // Assert
      expect(result.exito).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('should_reject_estudiante_starting_contador', async () => {
      // Arrange
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const { salaId } = await unirseSala(
        clienteEstudiante,
        TEST_CUIDS.contador2,
      );

      // Act
      const result = await iniciarContador(clienteEstudiante, salaId, 30);

      // Assert
      expect(result.exito).toBe(false);
      expect(result.error).toContain('Solo el docente');
    });

    it('should_broadcast_contador_iniciado_to_all_participants', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador3);
      await unirseSala(clienteEstudiante, TEST_CUIDS.contador3);

      // Setup listener for broadcast
      const broadcastPromise = new Promise<{
        segundos: number;
        mensaje?: string;
        timestampInicio: string;
      }>((resolve) => {
        clienteEstudiante!.on('contador-iniciado', (data) => resolve(data));
      });

      // Act
      await iniciarContador(clienteDocente, salaId, 60, 'Piensen bien');

      // Assert
      const broadcast = await broadcastPromise;
      expect(broadcast.segundos).toBe(60);
      expect(broadcast.mensaje).toBe('Piensen bien');
      expect(broadcast.timestampInicio).toBeDefined();
    });

    it('should_reject_second_contador_while_one_is_active', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador4);

      // Act - Iniciar primero
      const first = await iniciarContador(clienteDocente, salaId, 30);
      expect(first.exito).toBe(true);

      // Act - Intentar segundo
      const second = await iniciarContador(clienteDocente, salaId, 20);

      // Assert
      expect(second.exito).toBe(false);
      expect(second.error).toContain('Ya hay un contador activo');
    });

    it('should_reject_invalid_seconds_range', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador5);

      // Act - segundos = 0
      const zeroResult = await iniciarContador(clienteDocente, salaId, 0);
      expect(zeroResult.exito).toBe(false);
      expect(zeroResult.error).toContain('entre 1 y 3600');

      // Act - segundos > 3600
      const overResult = await iniciarContador(clienteDocente, salaId, 3601);
      expect(overResult.exito).toBe(false);
      expect(overResult.error).toContain('entre 1 y 3600');
    });
  });

  // ===========================================================================
  // TESTS: pausar-contador
  // ===========================================================================

  describe('pausar-contador', () => {
    it('should_pause_and_return_remaining_seconds', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador6);
      await iniciarContador(clienteDocente, salaId, 30);

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Act
      const result = await pausarContador(clienteDocente, salaId);

      // Assert
      expect(result.exito).toBe(true);
      expect(result.segundosRestantes).toBeDefined();
      expect(result.segundosRestantes).toBeLessThanOrEqual(30);
      expect(result.segundosRestantes).toBeGreaterThan(0);
    });

    it('should_reject_estudiante_pausing', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador7);
      await unirseSala(clienteEstudiante, TEST_CUIDS.contador7);
      await iniciarContador(clienteDocente, salaId, 30);

      // Act
      const result = await pausarContador(clienteEstudiante, salaId);

      // Assert
      expect(result.exito).toBe(false);
      expect(result.error).toContain('Solo el docente');
    });

    it('should_broadcast_contador_pausado', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.contador8);
      await unirseSala(clienteEstudiante, TEST_CUIDS.contador8);
      await iniciarContador(clienteDocente, salaId, 30);

      // Setup listener
      const broadcastPromise = new Promise<{ segundosRestantes: number }>(
        (resolve) => {
          clienteEstudiante!.on('contador-pausado', (data) => resolve(data));
        },
      );

      // Act
      await pausarContador(clienteDocente, salaId);

      // Assert
      const broadcast = await broadcastPromise;
      expect(broadcast.segundosRestantes).toBeDefined();
      expect(broadcast.segundosRestantes).toBeLessThanOrEqual(30);
    });
  });

  // ===========================================================================
  // TESTS: reanudar-contador
  // ===========================================================================

  describe('reanudar-contador', () => {
    it('should_resume_paused_contador', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const salaId = `clase:${TEST_CUIDS.contador1}resume`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador1 + 'resume' },
          () => resolve(),
        );
      });

      await iniciarContador(clienteDocente, salaId, 30);
      await pausarContador(clienteDocente, salaId);

      // Act
      const result = await reanudarContador(clienteDocente, salaId);

      // Assert
      expect(result.exito).toBe(true);
    });

    it('should_reject_resume_when_not_paused', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const salaId = `clase:${TEST_CUIDS.contador2}resume`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador2 + 'resume' },
          () => resolve(),
        );
      });

      // No contador exists
      const result = await reanudarContador(clienteDocente, salaId);

      // Assert
      expect(result.exito).toBe(false);
      expect(result.error).toContain('No hay contador pausado');
    });
  });

  // ===========================================================================
  // TESTS: cancelar-contador
  // ===========================================================================

  describe('cancelar-contador', () => {
    it('should_cancel_active_contador', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      const salaId = `clase:${TEST_CUIDS.contador3}cancel`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador3 + 'cancel' },
          () => resolve(),
        );
      });

      await iniciarContador(clienteDocente, salaId, 30);

      // Act
      const result = await cancelarContador(clienteDocente, salaId);

      // Assert
      expect(result.exito).toBe(true);
    });

    it('should_broadcast_contador_cancelado', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const salaId = `clase:${TEST_CUIDS.contador4}cancel`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador4 + 'cancel' },
          () => resolve(),
        );
      });
      await new Promise<void>((resolve) => {
        clienteEstudiante!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador4 + 'cancel' },
          () => resolve(),
        );
      });

      await iniciarContador(clienteDocente, salaId, 30);

      // Setup listener
      const broadcastPromise = new Promise<Record<string, never>>((resolve) => {
        clienteEstudiante!.on('contador-cancelado', (data) => resolve(data));
      });

      // Act
      await cancelarContador(clienteDocente, salaId);

      // Assert
      const broadcast = await broadcastPromise;
      expect(broadcast).toEqual({});
    });

    it('should_not_emit_terminado_after_cancel', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const salaId = `clase:${TEST_CUIDS.contador5}cancel`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador5 + 'cancel' },
          () => resolve(),
        );
      });
      await new Promise<void>((resolve) => {
        clienteEstudiante!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador5 + 'cancel' },
          () => resolve(),
        );
      });

      // Setup listener for terminado (should NOT fire)
      let terminadoReceived = false;
      clienteEstudiante!.on('contador-terminado', () => {
        terminadoReceived = true;
      });

      // Start with short duration
      await iniciarContador(clienteDocente, salaId, 1); // 1 segundo
      await cancelarContador(clienteDocente, salaId);

      // Wait longer than the original duration
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Assert
      expect(terminadoReceived).toBe(false);
    });
  });

  // ===========================================================================
  // TESTS: contador-terminado (auto-completion)
  // ===========================================================================

  describe('contador-terminado', () => {
    it('should_emit_terminado_when_time_expires', async () => {
      // Arrange
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante = await crearCliente(generarToken(estudianteData));
      const salaId = `clase:${TEST_CUIDS.contador6}term`;
      await new Promise<void>((resolve) => {
        clienteDocente!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador6 + 'term' },
          () => resolve(),
        );
      });
      await new Promise<void>((resolve) => {
        clienteEstudiante!.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador6 + 'term' },
          () => resolve(),
        );
      });

      // Setup listener
      const terminadoPromise = new Promise<Record<string, never>>((resolve) => {
        clienteEstudiante!.on('contador-terminado', (data) => resolve(data));
      });

      // Act - Start 1 second contador
      await iniciarContador(clienteDocente, salaId, 1);

      // Assert - Should receive terminado within ~1.5 seconds
      const broadcast = await Promise.race([
        terminadoPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
      ]);

      expect(broadcast).toEqual({});
    });
  });

  // ===========================================================================
  // TESTS: Room isolation
  // ===========================================================================

  describe('aislamiento entre salas', () => {
    it('should_isolate_contadores_between_rooms', async () => {
      // Arrange - Two docentes in different rooms
      const docenteA = await crearCliente(
        generarToken({ ...docenteData, sub: 'docente-a' }),
      );
      const docenteB = await crearCliente(
        generarToken({ ...docenteData, sub: 'docente-b' }),
      );

      const salaA = `clase:${TEST_CUIDS.contador7}iso`;
      const salaB = `clase:${TEST_CUIDS.contador8}iso`;

      await new Promise<void>((resolve) => {
        docenteA.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador7 + 'iso' },
          () => resolve(),
        );
      });
      await new Promise<void>((resolve) => {
        docenteB.emit(
          'unirse-sala',
          { claseGrupoId: TEST_CUIDS.contador8 + 'iso' },
          () => resolve(),
        );
      });

      // Act - Start contador in room A
      const resultA = await iniciarContador(
        docenteA,
        salaA,
        30,
        'Room A timer',
      );

      // Assert - Room A has contador
      expect(resultA.exito).toBe(true);

      // Act - Room B should be able to start its own contador
      const resultB = await iniciarContador(
        docenteB,
        salaB,
        60,
        'Room B timer',
      );

      // Assert - Room B also has its own contador
      expect(resultB.exito).toBe(true);

      // Cleanup
      docenteA.disconnect();
      docenteB.disconnect();
    });
  });
});
