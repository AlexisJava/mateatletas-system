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
import { QuizPublico, QuizResultado } from '../src/aula-viva/dto/quiz.dto';

/**
 * =============================================================================
 * SPRINT 3.1 - QUIZ EN VIVO (ESTILO KAHOOT)
 * Tests E2E para: Crear Quiz, Responder Quiz, Cerrar Quiz
 * =============================================================================
 *
 * FILOSOFÍA: Black Box Testing
 * - Tests basados en REQUISITOS, no en implementación
 * - Verificamos comportamiento observable desde el cliente WebSocket
 *
 * CLASES DE EQUIVALENCIA:
 * - quiz:crear: solo docente, opciones 2-6, tiempo 5-120s
 * - quiz:responder: solo estudiante, una sola vez, puntos por velocidad
 * - quiz:cerrar: ranking ordenado, distribución de respuestas
 *
 * VALORES FRONTERA:
 * - opciones: min 2, max 6
 * - tiempo: min 5s, max 120s
 * - respuestaCorrecta: 0 a opciones.length-1
 */
describe('Sprint 3.1 E2E - Quiz en Vivo (AulaVivaGateway)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let clienteDocente: Socket | undefined;
  let clienteEstudianteA: Socket | undefined;
  let clienteEstudianteB: Socket | undefined;
  let clienteEstudianteC: Socket | undefined;

  const PORT = 3849; // Puerto diferente al de sprint2
  const JWT_SECRET = 'test-secret-for-sprint3-quiz-e2e';

  // Datos de usuarios de prueba
  const docenteData = {
    sub: 'docente-quiz-001',
    nombre: 'Prof. García',
    rol: 'DOCENTE',
  };

  const estudianteAData = {
    sub: 'estudiante-quiz-001',
    nombre: 'María López',
    rol: 'ESTUDIANTE',
  };

  const estudianteBData = {
    sub: 'estudiante-quiz-002',
    nombre: 'Juan Pérez',
    rol: 'ESTUDIANTE',
  };

  const estudianteCData = {
    sub: 'estudiante-quiz-003',
    nombre: 'Laura Sánchez',
    rol: 'ESTUDIANTE',
  };

  // CUIDs de prueba únicos para cada test
  const TEST_CUIDS = {
    quiz1: 'ctest0sprint3quiz00000001',
    quiz2: 'ctest0sprint3quiz00000002',
    quiz3: 'ctest0sprint3quiz00000003',
    quiz4: 'ctest0sprint3quiz00000004',
    quiz5: 'ctest0sprint3quiz00000005',
    quiz6: 'ctest0sprint3quiz00000006',
    quiz7: 'ctest0sprint3quiz00000007',
    quiz8: 'ctest0sprint3quiz00000008',
    quiz9: 'ctest0sprint3quiz00000009',
    quiz10: 'ctest0sprint3quiz00000010',
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

  const crearQuiz = (
    cliente: Socket,
    salaId: string,
    pregunta: string,
    opciones: string[],
    respuestaCorrecta: number,
    tiempoSeg = 20,
  ): Promise<{ exito: boolean; quiz?: QuizPublico; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de quiz:crear'));
      }, 3000);

      cliente.emit(
        'quiz:crear',
        { salaId, pregunta, opciones, respuestaCorrecta, tiempoSeg },
        (response: { exito: boolean; quiz?: QuizPublico; error?: string }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const responderQuiz = (
    cliente: Socket,
    salaId: string,
    quizId: string,
    opcionIndex: number,
  ): Promise<{ exito: boolean; puntosObtenidos?: number; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de quiz:responder'));
      }, 3000);

      cliente.emit(
        'quiz:responder',
        { salaId, quizId, opcionIndex },
        (response: {
          exito: boolean;
          puntosObtenidos?: number;
          error?: string;
        }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const cerrarQuiz = (
    cliente: Socket,
    salaId: string,
    quizId: string,
  ): Promise<{ exito: boolean; resultado?: QuizResultado; error?: string }> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout esperando respuesta de quiz:cerrar'));
      }, 3000);

      cliente.emit(
        'quiz:cerrar',
        { salaId, quizId },
        (response: {
          exito: boolean;
          resultado?: QuizResultado;
          error?: string;
        }) => {
          clearTimeout(timeout);
          resolve(response);
        },
      );
    });
  };

  const esperarEvento = <T>(
    cliente: Socket,
    evento: string,
    timeoutMs = 3000,
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout esperando evento: ${evento}`));
      }, timeoutMs);

      cliente.once(evento, (data: T) => {
        clearTimeout(timeout);
        resolve(data);
      });
    });
  };

  // ===========================================================================
  // TESTS: quiz:crear
  // ===========================================================================

  describe('quiz:crear', () => {
    it('should_allow_docente_to_create_quiz', async () => {
      const salaId = TEST_CUIDS.quiz1;
      clienteDocente = await crearCliente(generarToken(docenteData));
      await unirseSala(clienteDocente, salaId);

      const response = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿Cuánto es 2 + 2?',
        ['3', '4', '5', '6'],
        1, // respuesta correcta: índice 1 = "4"
      );

      expect(response.exito).toBe(true);
      expect(response.quiz).toBeDefined();
      expect(response.quiz!.id).toMatch(/^quiz-\d+$/);
      expect(response.quiz!.pregunta).toBe('¿Cuánto es 2 + 2?');
      expect(response.quiz!.opciones).toEqual(['3', '4', '5', '6']);
      expect(response.quiz!.tiempoSeg).toBe(20);
      expect(response.quiz!.timestampInicio).toBeDefined();
    });

    it('should_reject_estudiante_creating_quiz', async () => {
      const salaId = TEST_CUIDS.quiz2;
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));
      await unirseSala(clienteEstudianteA, salaId);

      const response = await crearQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        '¿Cuánto es 2 + 2?',
        ['3', '4', '5', '6'],
        1,
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('Solo docentes');
    });

    it('should_broadcast_quiz_to_all_participants', async () => {
      const salaId = TEST_CUIDS.quiz3;

      // Conectar docente y estudiante
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);

      // Estudiante escucha el evento
      const quizPromise = esperarEvento<QuizPublico>(
        clienteEstudianteA,
        'quiz:nuevo',
      );

      // Docente crea quiz
      await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿Capital de Francia?',
        ['Madrid', 'París', 'Roma'],
        1,
      );

      // Verificar que estudiante recibió el quiz
      const quizRecibido = await quizPromise;
      expect(quizRecibido.pregunta).toBe('¿Capital de Francia?');
      expect(quizRecibido.opciones).toEqual(['Madrid', 'París', 'Roma']);
    });

    it('should_not_include_correct_answer_in_broadcast', async () => {
      const salaId = TEST_CUIDS.quiz4;

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);

      const quizPromise = esperarEvento<
        QuizPublico & { respuestaCorrecta?: number }
      >(clienteEstudianteA, 'quiz:nuevo');

      await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4'],
        1,
      );

      const quizRecibido = await quizPromise;

      // La respuesta correcta NO debe estar en el broadcast
      expect(quizRecibido.respuestaCorrecta).toBeUndefined();
      expect('respuestaCorrecta' in quizRecibido).toBe(false);
    });

    it('should_reject_quiz_with_less_than_2_options', async () => {
      const salaId = TEST_CUIDS.quiz5;
      clienteDocente = await crearCliente(generarToken(docenteData));
      await unirseSala(clienteDocente, salaId);

      const response = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿Pregunta?',
        ['Solo una opción'], // Menos de 2
        0,
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('2-6 opciones');
    });

    it('should_reject_invalid_correct_answer_index', async () => {
      const salaId = TEST_CUIDS.quiz6;
      clienteDocente = await crearCliente(generarToken(docenteData));
      await unirseSala(clienteDocente, salaId);

      const response = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿Pregunta?',
        ['A', 'B', 'C'],
        5, // Índice fuera de rango (max sería 2)
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('Respuesta correcta inválida');
    });
  });

  // ===========================================================================
  // TESTS: quiz:responder
  // ===========================================================================

  describe('quiz:responder', () => {
    it('should_allow_estudiante_to_respond', async () => {
      const salaId = TEST_CUIDS.quiz7;

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);

      // Crear quiz
      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4', '5'],
        1, // Respuesta correcta: "4"
        30, // 30 segundos
      );

      // Estudiante responde correctamente
      const response = await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1, // Elige "4" (correcto)
      );

      expect(response.exito).toBe(true);
      expect(response.puntosObtenidos).toBeDefined();
      expect(response.puntosObtenidos).toBeGreaterThan(0); // Respuesta correcta = puntos
    });

    it('should_reject_docente_responding', async () => {
      const salaId = TEST_CUIDS.quiz8;

      clienteDocente = await crearCliente(generarToken(docenteData));
      await unirseSala(clienteDocente, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4'],
        1,
      );

      // Docente intenta responder
      const response = await responderQuiz(
        clienteDocente,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('Solo estudiantes');
    });

    it('should_reject_duplicate_response', async () => {
      const salaId = TEST_CUIDS.quiz9;

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4'],
        1,
        30,
      );

      // Primera respuesta
      await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      // Segunda respuesta (debe fallar)
      const response = await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        0,
      );

      expect(response.exito).toBe(false);
      expect(response.error).toContain('Ya respondiste');
    });

    it('should_award_more_points_for_faster_response', async () => {
      const salaId = TEST_CUIDS.quiz10;

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));
      clienteEstudianteB = await crearCliente(generarToken(estudianteBData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);
      await unirseSala(clienteEstudianteB, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4'],
        1,
        30, // 30 segundos
      );

      // Estudiante A responde inmediatamente
      const responseA = await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1, // Correcto
      );

      // Esperar 1 segundo
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Estudiante B responde después
      const responseB = await responderQuiz(
        clienteEstudianteB,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1, // Correcto
      );

      // A debería tener más puntos que B por responder más rápido
      expect(responseA.puntosObtenidos).toBeGreaterThan(
        responseB.puntosObtenidos!,
      );
    });
  });

  // ===========================================================================
  // TESTS: quiz:cerrar
  // ===========================================================================

  describe('quiz:cerrar', () => {
    it('should_return_results_sorted_by_points', async () => {
      const salaId = 'ctest0sprint3quizclose001';

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));
      clienteEstudianteB = await crearCliente(generarToken(estudianteBData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);
      await unirseSala(clienteEstudianteB, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4', '5'],
        1, // "4" es correcto
        30,
      );

      // A responde correcto
      await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      // B responde incorrecto
      await responderQuiz(
        clienteEstudianteB,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        0, // Incorrecto
      );

      // Cerrar quiz
      const closeResponse = await cerrarQuiz(
        clienteDocente,
        `clase:${salaId}`,
        createResponse.quiz!.id,
      );

      expect(closeResponse.exito).toBe(true);
      expect(closeResponse.resultado).toBeDefined();

      const resultado = closeResponse.resultado!;
      expect(resultado.resultados.length).toBe(2);

      // El primero debería ser A (puntos > 0), segundo B (puntos = 0)
      expect(resultado.resultados[0].puntos).toBeGreaterThan(0);
      expect(resultado.resultados[1].puntos).toBe(0);
    });

    it('should_include_answer_distribution', async () => {
      const salaId = 'ctest0sprint3quizclose002';

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));
      clienteEstudianteB = await crearCliente(generarToken(estudianteBData));
      clienteEstudianteC = await crearCliente(generarToken(estudianteCData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);
      await unirseSala(clienteEstudianteB, salaId);
      await unirseSala(clienteEstudianteC, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿Pregunta?',
        ['A', 'B', 'C'],
        1,
        30,
      );

      // A elige opción 0
      await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        0,
      );

      // B elige opción 1
      await responderQuiz(
        clienteEstudianteB,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      // C elige opción 1 también
      await responderQuiz(
        clienteEstudianteC,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      const closeResponse = await cerrarQuiz(
        clienteDocente,
        `clase:${salaId}`,
        createResponse.quiz!.id,
      );

      expect(closeResponse.resultado!.distribucion).toEqual([1, 2, 0]);
      // 1 eligió A, 2 eligieron B, 0 eligieron C
    });

    it('should_broadcast_results_to_all', async () => {
      const salaId = 'ctest0sprint3quizclose003';

      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudianteA = await crearCliente(generarToken(estudianteAData));

      await unirseSala(clienteDocente, salaId);
      await unirseSala(clienteEstudianteA, salaId);

      const createResponse = await crearQuiz(
        clienteDocente,
        `clase:${salaId}`,
        '¿2 + 2?',
        ['3', '4'],
        1,
        30,
      );

      await responderQuiz(
        clienteEstudianteA,
        `clase:${salaId}`,
        createResponse.quiz!.id,
        1,
      );

      // Estudiante escucha el evento de resultado
      const resultadoPromise = esperarEvento<QuizResultado>(
        clienteEstudianteA,
        'quiz:resultado',
      );

      // Docente cierra
      await cerrarQuiz(
        clienteDocente,
        `clase:${salaId}`,
        createResponse.quiz!.id,
      );

      // Verificar que estudiante recibió el resultado
      const resultado = await resultadoPromise;
      expect(resultado.quizId).toBe(createResponse.quiz!.id);
      expect(resultado.respuestaCorrecta).toBe(1); // Ahora sí se revela
      expect(resultado.resultados.length).toBe(1);
    });
  });

  // ===========================================================================
  // TESTS: Aislamiento entre salas
  // ===========================================================================

  describe('aislamiento', () => {
    it('should_isolate_quizzes_between_rooms', async () => {
      const salaA = 'ctest0sprint3quizisolate1';
      const salaB = 'ctest0sprint3quizisolate2';

      // Dos docentes en salas diferentes
      clienteDocente = await crearCliente(generarToken(docenteData));
      const docenteB = await crearCliente(
        generarToken({ ...docenteData, sub: 'docente-quiz-002' }),
      );

      await unirseSala(clienteDocente, salaA);
      await unirseSala(docenteB, salaB);

      // Crear quiz en sala A
      const quizA = await crearQuiz(
        clienteDocente,
        `clase:${salaA}`,
        'Quiz A',
        ['1', '2'],
        0,
      );

      // Crear quiz en sala B
      const quizB = await crearQuiz(
        docenteB,
        `clase:${salaB}`,
        'Quiz B',
        ['X', 'Y'],
        1,
      );

      expect(quizA.exito).toBe(true);
      expect(quizB.exito).toBe(true);
      expect(quizA.quiz!.id).not.toBe(quizB.quiz!.id);

      // Limpiar
      docenteB.disconnect();
    });
  });
});
