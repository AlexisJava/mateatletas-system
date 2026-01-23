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
import {
  TipoReaccion,
  ReaccionAgregada,
  PulsoCreadoEvent,
  PulsoStats,
  EstudianteSeleccionadoEvent,
  SelectorReseteadoEvent,
  BaseResponse,
} from '@mateatletas/contracts';

/**
 * =============================================================================
 * SPRINT 2 - INTERACTIVIDAD EN AULA VIVA
 * Tests E2E para: Reacciones, Pulso de Atención, Selector Aleatorio
 * =============================================================================
 *
 * FILOSOFÍA: Black Box Testing
 * - Tests basados en REQUISITOS, no en implementación
 * - Verificamos comportamiento observable desde el cliente WebSocket
 *
 * CLASES DE EQUIVALENCIA:
 * - Reacciones: tipos válidos (5), rate limiting (2s), agregación (ventana 5s)
 * - Pulso: creación (solo docente), respuesta (solo estudiante), estadísticas
 * - Selector: selección justa (sin repetir hasta completar ronda), reset
 *
 * VALORES FRONTERA:
 * - Reacciones: contador >= 1 (positivo)
 * - Pulso: pregunta max 200 chars, opciones min 2 max 6, opcionIndex válido
 * - Selector: 0 estudiantes, 1 estudiante, ronda completada
 */
describe('Sprint 2 E2E - Interactividad (AulaVivaGateway)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let clienteDocente: Socket | undefined;
  let clienteEstudianteA: Socket | undefined;
  let clienteEstudianteB: Socket | undefined;
  let clienteEstudianteC: Socket | undefined;

  const PORT = 3848;
  const JWT_SECRET = 'test-secret-for-sprint2-e2e';

  // Datos de usuarios de prueba
  const docenteData = {
    sub: 'docente-sprint2-001',
    nombre: 'Prof. Martínez',
    rol: 'DOCENTE',
  };

  const estudianteAData = {
    sub: 'estudiante-sprint2-001',
    nombre: 'Carlos Ruiz',
    rol: 'ESTUDIANTE',
  };

  const estudianteBData = {
    sub: 'estudiante-sprint2-002',
    nombre: 'Ana García',
    rol: 'ESTUDIANTE',
  };

  const estudianteCData = {
    sub: 'estudiante-sprint2-003',
    nombre: 'Luis Fernández',
    rol: 'ESTUDIANTE',
  };

  // CUIDs de prueba válidos (25 caracteres: c + 24 alfanuméricos)
  const TEST_CUIDS = {
    reacciones1: 'ctest0sprint2reacciones01',
    reacciones2: 'ctest0sprint2reacciones02',
    reacciones3: 'ctest0sprint2reacciones03',
    pulso1: 'ctest0sprint2pulso0000001',
    pulso2: 'ctest0sprint2pulso0000002',
    pulso3: 'ctest0sprint2pulso0000003',
    pulso4: 'ctest0sprint2pulso0000004',
    selector1: 'ctest0sprint2selector0001',
    selector2: 'ctest0sprint2selector0002',
    selector3: 'ctest0sprint2selector0003',
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
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    jwtService = moduleFixture.get<JwtService>(JwtService);

    await app.init();
    await app.listen(PORT);
  });

  afterAll(async () => {
    await app?.close();
  });

  afterEach(async () => {
    if (clienteDocente?.connected) clienteDocente.disconnect();
    if (clienteEstudianteA?.connected) clienteEstudianteA.disconnect();
    if (clienteEstudianteB?.connected) clienteEstudianteB.disconnect();
    if (clienteEstudianteC?.connected) clienteEstudianteC.disconnect();
    clienteDocente = undefined;
    clienteEstudianteA = undefined;
    clienteEstudianteB = undefined;
    clienteEstudianteC = undefined;
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

  const enviarReaccion = (
    cliente: Socket,
    salaId: string,
    tipo: TipoReaccion,
  ): Promise<BaseResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de enviar-reaccion'));
      }, 3000);

      cliente.emit(
        'enviar-reaccion',
        { salaId, tipo },
        (response: BaseResponse) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const crearPulso = (
    cliente: Socket,
    salaId: string,
    pregunta: string,
    opciones: string[],
  ): Promise<BaseResponse & { pulsoId?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de crear-pulso'));
      }, 3000);

      cliente.emit(
        'crear-pulso',
        { salaId, pregunta, opciones },
        (response: BaseResponse & { pulsoId?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const responderPulso = (
    cliente: Socket,
    salaId: string,
    pulsoId: string,
    opcionIndex: number,
  ): Promise<BaseResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de responder-pulso'));
      }, 3000);

      cliente.emit(
        'responder-pulso',
        { salaId, pulsoId, opcionIndex },
        (response: BaseResponse) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const cerrarPulso = (
    cliente: Socket,
    salaId: string,
    pulsoId: string,
  ): Promise<BaseResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de cerrar-pulso'));
      }, 3000);

      cliente.emit(
        'cerrar-pulso',
        { salaId, pulsoId },
        (response: BaseResponse) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const seleccionarAleatorio = (
    cliente: Socket,
    salaId: string,
  ): Promise<BaseResponse & { estudiante?: EstudianteSeleccionadoEvent }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(
          new Error('Timeout esperando respuesta de seleccionar-aleatorio'),
        );
      }, 3000);

      cliente.emit(
        'seleccionar-aleatorio',
        { salaId },
        (
          response: BaseResponse & { estudiante?: EstudianteSeleccionadoEvent },
        ) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const resetearSelector = (
    cliente: Socket,
    salaId: string,
  ): Promise<BaseResponse & { ronda?: number }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de resetear-selector'));
      }, 3000);

      cliente.emit(
        'resetear-selector',
        { salaId },
        (response: BaseResponse & { ronda?: number }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  // ===========================================================================
  // REACCIONES
  // ===========================================================================

  describe('Reacciones en tiempo real', () => {
    /**
     * CLASE DE EQUIVALENCIA: Tipo de reacción válido
     * Verificar que los 5 tipos de reacciones se aceptan y emiten correctamente
     */
    it('should_broadcast_reaction_with_correct_type_and_emoji', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(
        clienteDocente,
        TEST_CUIDS.reacciones1,
      );
      await unirseSala(clienteEstudianteA, TEST_CUIDS.reacciones1);

      const reaccionRecibida = new Promise<ReaccionAgregada>((resolve) => {
        clienteDocente!.on('reaccion', (data: ReaccionAgregada) => {
          resolve(data);
        });
      });

      // Estudiante envía reacción
      const response = await enviarReaccion(
        clienteEstudianteA,
        salaId,
        'thumbsUp',
      );

      expect(response.exito).toBe(true);

      const reaccion = await reaccionRecibida;
      expect(reaccion.tipo).toBe('thumbsUp');
      expect(reaccion.emoji).toBe('👍');
      expect(reaccion.contador).toBeGreaterThanOrEqual(1);
      expect(reaccion.ultimosUsuarios).toContainEqual(
        expect.objectContaining({
          odooId: estudianteAData.sub,
          nombre: estudianteAData.nombre,
        }),
      );
    });

    /**
     * CLASE DE EQUIVALENCIA: Tipo de reacción inválido
     * Verificar que tipos no válidos son rechazados
     */
    it('should_reject_invalid_reaction_type', async () => {
      const tokenEstudiante = generarToken(estudianteAData);
      clienteEstudianteA = await crearCliente(tokenEstudiante);
      const { salaId } = await unirseSala(
        clienteEstudianteA,
        TEST_CUIDS.reacciones2,
      );

      const response = await enviarReaccion(
        clienteEstudianteA,
        salaId,
        'invalidType' as TipoReaccion,
      );

      expect(response.exito).toBe(false);
    });

    /**
     * VALOR FRONTERA: Rate limiting (2 segundos)
     * Segundo envío dentro de 2 segundos debe ser rechazado
     */
    it('should_enforce_rate_limiting_for_same_user', async () => {
      const tokenEstudiante = generarToken(estudianteAData);
      clienteEstudianteA = await crearCliente(tokenEstudiante);
      const { salaId } = await unirseSala(
        clienteEstudianteA,
        TEST_CUIDS.reacciones3,
      );

      // Primera reacción - debe funcionar
      const response1 = await enviarReaccion(
        clienteEstudianteA,
        salaId,
        'heart',
      );
      expect(response1.exito).toBe(true);

      // Segunda reacción inmediata - debe ser rechazada
      const response2 = await enviarReaccion(
        clienteEstudianteA,
        salaId,
        'heart',
      );
      expect(response2.exito).toBe(false);
      expect(response2.error).toContain('Espera');
    });

    /**
     * TRANSICIÓN DE ESTADO: Agregación de reacciones
     * Múltiples usuarios enviando la misma reacción deben agregarse
     */
    it('should_aggregate_reactions_from_multiple_users', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);
      const tokenB = generarToken(estudianteBData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);
      clienteEstudianteB = await crearCliente(tokenB);

      const { salaId } = await unirseSala(
        clienteDocente,
        TEST_CUIDS.reacciones1,
      );
      await unirseSala(clienteEstudianteA, TEST_CUIDS.reacciones1);
      await unirseSala(clienteEstudianteB, TEST_CUIDS.reacciones1);

      const reacciones: ReaccionAgregada[] = [];
      clienteDocente!.on('reaccion', (data: ReaccionAgregada) => {
        reacciones.push(data);
      });

      // Estudiante A envía celebrate
      await enviarReaccion(clienteEstudianteA, salaId, 'celebrate');
      // Estudiante B envía celebrate (misma reacción)
      await enviarReaccion(clienteEstudianteB, salaId, 'celebrate');

      // Esperar a que se agreguen
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Obtener la ÚLTIMA reacción (después de que ambos estudiantes reaccionaron)
      // Nota: .find() retorna el primero, necesitamos el último para ver el contador agregado
      const ultimaReaccion = reacciones.findLast((r) => r.tipo === 'celebrate');
      expect(ultimaReaccion).toBeDefined();
      expect(ultimaReaccion!.contador).toBeGreaterThanOrEqual(2);
    });

    /**
     * AISLAMIENTO: Reacciones no cruzan salas
     */
    it('should_NOT_send_reactions_to_other_rooms', async () => {
      const tokenA = generarToken(estudianteAData);
      const tokenB = generarToken(estudianteBData);

      clienteEstudianteA = await crearCliente(tokenA);
      clienteEstudianteB = await crearCliente(tokenB);

      // A en sala 1, B en sala 2
      const { salaId } = await unirseSala(
        clienteEstudianteA,
        TEST_CUIDS.reacciones1,
      );
      await unirseSala(clienteEstudianteB, TEST_CUIDS.reacciones2);

      let reaccionRecibida = false;
      clienteEstudianteB!.on('reaccion', () => {
        reaccionRecibida = true;
      });

      await enviarReaccion(clienteEstudianteA, salaId, 'laugh');
      await new Promise((resolve) => setTimeout(resolve, 300));

      expect(reaccionRecibida).toBe(false);
    });
  });

  // ===========================================================================
  // PULSO DE ATENCIÓN
  // ===========================================================================

  describe('Pulso de Atención (Encuestas rápidas)', () => {
    /**
     * CLASE DE EQUIVALENCIA: Solo docente puede crear pulso
     */
    it('should_allow_docente_to_create_pulso', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);

      const pulsoCreadoPromise = new Promise<PulsoCreadoEvent>((resolve) => {
        clienteDocente!.on('pulso-creado', (data: PulsoCreadoEvent) => {
          resolve(data);
        });
      });

      const response = await crearPulso(
        clienteDocente,
        salaId,
        '¿Entendieron el concepto?',
        ['Sí', 'No', 'Más o menos'],
      );

      expect(response.exito).toBe(true);
      expect(response.pulsoId).toBeDefined();

      const pulso = await pulsoCreadoPromise;
      expect(pulso.pregunta).toBe('¿Entendieron el concepto?');
      expect(pulso.opciones).toHaveLength(3);
    });

    /**
     * CLASE DE EQUIVALENCIA: Estudiante NO puede crear pulso
     */
    it('should_reject_pulso_creation_by_estudiante', async () => {
      const tokenEstudiante = generarToken(estudianteAData);
      clienteEstudianteA = await crearCliente(tokenEstudiante);
      const { salaId } = await unirseSala(
        clienteEstudianteA,
        TEST_CUIDS.pulso2,
      );

      const response = await crearPulso(
        clienteEstudianteA,
        salaId,
        '¿Puedo crear pulso?',
        ['Sí', 'No'],
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('docente');
    });

    /**
     * VALOR FRONTERA: Pregunta máximo 200 caracteres
     */
    it('should_reject_pulso_with_question_exceeding_200_chars', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);

      const preguntaLarga = 'a'.repeat(201);
      const response = await crearPulso(clienteDocente, salaId, preguntaLarga, [
        'Sí',
        'No',
      ]);

      expect(response.exito).toBe(false);
    });

    /**
     * VALOR FRONTERA: Mínimo 2 opciones
     */
    it('should_reject_pulso_with_less_than_2_options', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);

      const response = await crearPulso(clienteDocente, salaId, '¿Pregunta?', [
        'Una sola',
      ]);

      expect(response.exito).toBe(false);
    });

    /**
     * VALOR FRONTERA: Máximo 6 opciones
     */
    it('should_reject_pulso_with_more_than_6_options', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);

      const response = await crearPulso(clienteDocente, salaId, '¿Pregunta?', [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
      ]);

      expect(response.exito).toBe(false);
    });

    /**
     * CLASE DE EQUIVALENCIA: Estudiante puede responder pulso activo
     */
    it('should_allow_estudiante_to_respond_to_active_pulso', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso3);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.pulso3);

      // Docente crea pulso
      const createResponse = await crearPulso(
        clienteDocente,
        salaId,
        '¿Listo?',
        ['Sí', 'No'],
      );
      const pulsoId = createResponse.pulsoId!;

      // Escuchar actualización de stats
      const statsPromise = new Promise<PulsoStats>((resolve) => {
        clienteDocente!.on('pulso-actualizado', (data: PulsoStats) => {
          resolve(data);
        });
      });

      // Estudiante responde
      const response = await responderPulso(
        clienteEstudianteA,
        salaId,
        pulsoId,
        0,
      );
      expect(response.exito).toBe(true);

      const stats = await statsPromise;
      expect(stats.totalRespuestas).toBe(1);
      expect(stats.conteos[0]).toBe(1);
    });

    /**
     * TRANSICIÓN DE ESTADO: No se puede responder pulso cerrado
     */
    it('should_reject_response_to_closed_pulso', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso4);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.pulso4);

      // Crear y cerrar pulso
      const createResponse = await crearPulso(
        clienteDocente,
        salaId,
        '¿Test?',
        ['A', 'B'],
      );
      const pulsoId = createResponse.pulsoId!;
      await cerrarPulso(clienteDocente, salaId, pulsoId);

      // Intentar responder
      const response = await responderPulso(
        clienteEstudianteA,
        salaId,
        pulsoId,
        0,
      );
      expect(response.exito).toBe(false);
      expect(response.error).toContain('cerrado');
    });

    /**
     * VALOR FRONTERA: opcionIndex fuera de rango
     */
    it('should_reject_invalid_option_index', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.pulso1);

      const createResponse = await crearPulso(clienteDocente, salaId, '¿?', [
        'Sí',
        'No',
      ]);
      const pulsoId = createResponse.pulsoId!;

      // Índice 5 cuando solo hay 2 opciones (0 y 1)
      const response = await responderPulso(
        clienteEstudianteA,
        salaId,
        pulsoId,
        5,
      );
      expect(response.exito).toBe(false);
    });
  });

  // ===========================================================================
  // SELECTOR ALEATORIO
  // ===========================================================================

  describe('Selector Aleatorio de Estudiantes', () => {
    /**
     * CLASE DE EQUIVALENCIA: Solo docente puede usar selector
     */
    it('should_allow_docente_to_select_random_student', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector1);

      const seleccionadoPromise = new Promise<EstudianteSeleccionadoEvent>(
        (resolve) => {
          clienteDocente!.on(
            'estudiante-seleccionado',
            (data: EstudianteSeleccionadoEvent) => {
              resolve(data);
            },
          );
        },
      );

      const response = await seleccionarAleatorio(clienteDocente, salaId);
      expect(response.exito).toBe(true);

      const seleccionado = await seleccionadoPromise;
      expect(seleccionado.odooId).toBe(estudianteAData.sub);
      expect(seleccionado.nombre).toBe(estudianteAData.nombre);
      expect(seleccionado.timestamp).toBeDefined();
      expect(seleccionado.restantes).toBeGreaterThanOrEqual(0);
      expect(typeof seleccionado.rondaCompletada).toBe('boolean');
    });

    /**
     * CLASE DE EQUIVALENCIA: Estudiante NO puede usar selector
     */
    it('should_reject_selection_by_estudiante', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenEstudiante = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenEstudiante);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector2);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector2);

      const response = await seleccionarAleatorio(clienteEstudianteA, salaId);
      expect(response.exito).toBe(false);
      expect(response.error).toContain('docente');
    });

    /**
     * VALOR FRONTERA: Selector con 0 estudiantes
     */
    it('should_handle_empty_room_gracefully', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);
      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector3);

      // Solo el docente, no hay estudiantes
      const response = await seleccionarAleatorio(clienteDocente, salaId);
      expect(response.exito).toBe(false);
      expect(response.error).toContain('estudiante');
    });

    /**
     * INVARIANTE: Selección justa - no repetir hasta completar ronda
     */
    it('should_not_repeat_students_until_round_complete', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);
      const tokenB = generarToken(estudianteBData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);
      clienteEstudianteB = await crearCliente(tokenB);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteB, TEST_CUIDS.selector1);

      const seleccionados: string[] = [];

      // Seleccionar hasta completar ronda (2 estudiantes)
      for (let i = 0; i < 2; i++) {
        const response = await seleccionarAleatorio(clienteDocente, salaId);
        if (response.exito && response.estudiante) {
          seleccionados.push(response.estudiante.odooId);
        }
      }

      // Verificar que ambos fueron seleccionados exactamente una vez
      expect(seleccionados).toHaveLength(2);
      expect(new Set(seleccionados).size).toBe(2); // Sin duplicados
    });

    /**
     * TRANSICIÓN DE ESTADO: Reset reinicia la ronda
     */
    it('should_reset_selector_and_start_new_round', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector1);

      // Seleccionar al único estudiante
      await seleccionarAleatorio(clienteDocente, salaId);

      // Escuchar evento de reset
      const resetPromise = new Promise<SelectorReseteadoEvent>((resolve) => {
        clienteDocente!.on(
          'selector-reseteado',
          (data: SelectorReseteadoEvent) => {
            resolve(data);
          },
        );
      });

      // Resetear
      const response = await resetearSelector(clienteDocente, salaId);
      expect(response.exito).toBe(true);
      expect(response.ronda).toBeGreaterThan(1);

      const resetEvent = await resetPromise;
      expect(resetEvent.ronda).toBeGreaterThan(1);
    });

    /**
     * VALOR FRONTERA: rondaCompletada cuando queda 0 estudiantes
     */
    it('should_mark_round_complete_when_all_selected', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector2);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector2);

      // Solo 1 estudiante, al seleccionarlo la ronda debe completarse
      const response = await seleccionarAleatorio(clienteDocente, salaId);

      expect(response.exito).toBe(true);
      expect(response.estudiante?.restantes).toBe(0);
      expect(response.estudiante?.rondaCompletada).toBe(true);
    });
  });

  // ===========================================================================
  // CASOS TRANSVERSALES
  // ===========================================================================

  describe('Casos transversales', () => {
    /**
     * PRECONDICIÓN: Usuario debe estar en sala para interactuar
     */
    it('should_reject_reaction_if_not_in_room', async () => {
      const tokenEstudiante = generarToken(estudianteAData);
      clienteEstudianteA = await crearCliente(tokenEstudiante);
      // No se une a ninguna sala

      const response = await enviarReaccion(
        clienteEstudianteA,
        'sala-inexistente',
        'heart',
      );
      expect(response.exito).toBe(false);
      expect(response.error).toContain('sala');
    });

    /**
     * PRECONDICIÓN: salaId vacío debe rechazarse
     */
    it('should_reject_empty_sala_id', async () => {
      const tokenDocente = generarToken(docenteData);
      clienteDocente = await crearCliente(tokenDocente);

      const response = await crearPulso(clienteDocente, '', '¿Test?', [
        'A',
        'B',
      ]);
      expect(response.exito).toBe(false);
    });

    /**
     * BROADCAST: Eventos llegan a todos en la sala
     */
    it('should_broadcast_pulso_creation_to_all_participants', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);
      const tokenB = generarToken(estudianteBData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);
      clienteEstudianteB = await crearCliente(tokenB);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.pulso1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.pulso1);
      await unirseSala(clienteEstudianteB, TEST_CUIDS.pulso1);

      const eventosRecibidos: PulsoCreadoEvent[] = [];

      clienteEstudianteA!.on('pulso-creado', (data: PulsoCreadoEvent) => {
        eventosRecibidos.push(data);
      });
      clienteEstudianteB!.on('pulso-creado', (data: PulsoCreadoEvent) => {
        eventosRecibidos.push(data);
      });

      await crearPulso(clienteDocente, salaId, '¿Todos ven esto?', [
        'Sí',
        'No',
      ]);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(eventosRecibidos.length).toBeGreaterThanOrEqual(2);
    });

    /**
     * BROADCAST: Selección aleatoria visible para todos
     */
    it('should_broadcast_student_selection_to_all_participants', async () => {
      const tokenDocente = generarToken(docenteData);
      const tokenA = generarToken(estudianteAData);
      const tokenB = generarToken(estudianteBData);

      clienteDocente = await crearCliente(tokenDocente);
      clienteEstudianteA = await crearCliente(tokenA);
      clienteEstudianteB = await crearCliente(tokenB);

      const { salaId } = await unirseSala(clienteDocente, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteA, TEST_CUIDS.selector1);
      await unirseSala(clienteEstudianteB, TEST_CUIDS.selector1);

      const eventosRecibidos: EstudianteSeleccionadoEvent[] = [];

      clienteEstudianteA!.on(
        'estudiante-seleccionado',
        (data: EstudianteSeleccionadoEvent) => {
          eventosRecibidos.push(data);
        },
      );
      clienteEstudianteB!.on(
        'estudiante-seleccionado',
        (data: EstudianteSeleccionadoEvent) => {
          eventosRecibidos.push(data);
        },
      );

      await seleccionarAleatorio(clienteDocente, salaId);
      await new Promise((resolve) => setTimeout(resolve, 200));

      expect(eventosRecibidos.length).toBeGreaterThanOrEqual(2);
    });
  });
});
