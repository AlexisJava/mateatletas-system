import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AulaVivaGateway } from '../src/aula-viva/aula-viva.gateway';
import { PresenciaService } from '../src/aula-viva/services/presencia.service';
import { ReaccionesService } from '../src/aula-viva/services/reacciones.service';
import { PulsoService } from '../src/aula-viva/services/pulso.service';
import { SelectorService } from '../src/aula-viva/services/selector.service';
import { ManosService } from '../src/aula-viva/services/manos.service';
import { ModeracionService } from '../src/aula-viva/services/moderacion.service';
import { QuizService } from '../src/aula-viva/services/quiz.service';
import { ContadorService } from '../src/aula-viva/services/contador.service';
import { GamificacionRealtimeService } from '../src/aula-viva/services/gamificacion-realtime.service';
import { GamificacionRealtimeListener } from '../src/aula-viva/listeners/gamificacion-realtime.listener';
import { TeoriaSyncService } from '../src/aula-viva/services/teoria-sync.service';
import { PracticaLiveService } from '../src/aula-viva/services/practica-live.service';
import { NodoService } from '../src/contenidos/services/nodo.service';
import { PrismaService } from '../src/core/database/prisma.service';
import { EstadoContenido, CasaTipo, MundoTipo } from '@prisma/client';

/**
 * =============================================================================
 * SPRINT 4.1-4.2 E2E - TEORÍA SINCRONIZADA Y PRÁCTICA EN VIVO
 * Tests E2E para WebSocket de contenido educativo en tiempo real
 * =============================================================================
 *
 * FILOSOFÍA: Black Box Testing - JUECES, NO CÓMPLICES
 * - Tests basados en REQUISITOS, no en implementación
 * - Si un test falla, investigamos ANTES de modificar
 * - Verificamos comportamiento observable desde el cliente WebSocket
 *
 * EVENTOS TESTEADOS:
 * Sprint 4.1 - Teoría Sincronizada:
 * - teoria:iniciar → teoria:iniciada (broadcast)
 * - teoria:cambiar-slide → teoria:slide-cambiado (broadcast)
 * - teoria:cerrar → teoria:cerrada (broadcast)
 *
 * Sprint 4.2 - Práctica en Vivo:
 * - practica:iniciar → practica:iniciada (broadcast)
 * - practica:responder → practica:respuesta-registrada (privado)
 * - practica:solicitar-progreso → practica:progreso (privado docente)
 * - practica:pausar → practica:pausada (broadcast)
 * - practica:reanudar → practica:reanudada (broadcast)
 * - practica:cerrar → practica:cerrada (broadcast)
 *
 * RUN: yarn workspace api test -- --testPathPattern="sprint4-teoria-practica" --runInBand
 */
describe('Sprint 4.1-4.2 E2E - Teoría y Práctica en Vivo', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let prisma: PrismaService;
  let teoriaSyncService: TeoriaSyncService;
  let practicaLiveService: PracticaLiveService;
  let clienteDocente: Socket | undefined;
  let clienteEstudiante1: Socket | undefined;
  let clienteEstudiante2: Socket | undefined;

  const PORT = 3858; // Puerto único para este test
  const JWT_SECRET = 'test-secret-for-sprint4-teoria-practica-e2e';

  // IDs de prueba (CUIDs de 25 caracteres - OBLIGATORIO)
  // Regex /^c[a-z0-9]{24}$/ = 'c' (1) + 24 alfanuméricos = 25 TOTAL
  const TEST_CUIDS = {
    docente: 'ctest0sprint4docente00001', // 25 chars ✓
    estudiante1: 'ctest0sprint4student00001', // 25 chars ✓
    estudiante2: 'ctest0sprint4student00002', // 25 chars ✓
    claseGrupo: 'ctest0sprint4clasegr00001', // 25 chars ✓
    tutor: 'ctest0sprint4tutor0000001', // 25 chars ✓
    contenidoTeoria: 'ctest0sprint4contteor0001', // 25 chars ✓
    contenidoPractica: 'ctest0sprint4contprac0001', // 25 chars ✓
    nodoTeoria1: 'ctest0sprint4nodoteor0001', // 25 chars ✓
    nodoTeoria2: 'ctest0sprint4nodoteor0002', // 25 chars ✓
    nodoPregunta1: 'ctest0sprint4nodopreg0001', // 25 chars ✓
    nodoPregunta2: 'ctest0sprint4nodopreg0002', // 25 chars ✓
  };

  const docenteData = {
    sub: TEST_CUIDS.docente,
    nombre: 'Prof. Teoría',
    rol: 'DOCENTE',
  };

  const estudiante1Data = {
    sub: TEST_CUIDS.estudiante1,
    nombre: 'Ana García',
    rol: 'ESTUDIANTE',
  };

  const estudiante2Data = {
    sub: TEST_CUIDS.estudiante2,
    nombre: 'Pedro López',
    rol: 'ESTUDIANTE',
  };

  // ===========================================================================
  // SETUP
  // ===========================================================================

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        JwtModule.register({
          secret: JWT_SECRET,
          signOptions: { expiresIn: '1h' },
        }),
        EventEmitterModule.forRoot(),
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
        GamificacionRealtimeService,
        GamificacionRealtimeListener,
        TeoriaSyncService,
        PracticaLiveService,
        NodoService,
        PrismaService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    teoriaSyncService = moduleFixture.get<TeoriaSyncService>(TeoriaSyncService);
    practicaLiveService =
      moduleFixture.get<PracticaLiveService>(PracticaLiveService);

    await app.init();
    await app.listen(PORT);

    // Crear datos de prueba en DB
    await createTestDataInDB();
  });

  async function createTestDataInDB() {
    // Crear tutor primero (requerido para estudiantes)
    const existingTutor = await prisma.tutor.findUnique({
      where: { id: TEST_CUIDS.tutor },
    });
    if (!existingTutor) {
      await prisma.tutor.create({
        data: {
          id: TEST_CUIDS.tutor,
          nombre: 'Tutor',
          apellido: 'Test Sprint4',
          email: 'tutor_sprint4_test@test.com',
          passwordHash: 'not_used_in_ws_tests',
        },
      });
    }

    // Crear estudiantes
    for (const [id, nombre, apellido, username] of [
      [TEST_CUIDS.estudiante1, 'Ana', 'García', 'ana_sprint4_test'],
      [TEST_CUIDS.estudiante2, 'Pedro', 'López', 'pedro_sprint4_test'],
    ] as const) {
      const existing = await prisma.estudiante.findUnique({ where: { id } });
      if (!existing) {
        await prisma.estudiante.create({
          data: {
            id,
            nombre,
            apellido,
            username,
            passwordHash: 'not_used_in_ws_tests',
            edad: 10,
            nivelEscolar: '5to',
            tutorId: TEST_CUIDS.tutor,
          },
        });
      }
    }

    // Crear contenido de TEORÍA (slides)
    const existingTeoria = await prisma.contenido.findUnique({
      where: { id: TEST_CUIDS.contenidoTeoria },
    });
    if (!existingTeoria) {
      await prisma.contenido.create({
        data: {
          id: TEST_CUIDS.contenidoTeoria,
          titulo: 'Lección de Fracciones',
          descripcion: 'Teoría de fracciones para test',
          estado: EstadoContenido.PUBLICADO,
          casaTipo: CasaTipo.QUANTUM,
          mundoTipo: MundoTipo.MATEMATICA,
          duracionMinutos: 15,
          nodos: {
            create: [
              {
                id: TEST_CUIDS.nodoTeoria1,
                titulo: 'Introducción a Fracciones',
                orden: 0,
                bloqueado: false,
                contenidoJson: JSON.stringify({
                  tipo: 'slide',
                  contenido: 'Una fracción representa partes de un todo.',
                }),
              },
              {
                id: TEST_CUIDS.nodoTeoria2,
                titulo: 'Tipos de Fracciones',
                orden: 1,
                bloqueado: false,
                contenidoJson: JSON.stringify({
                  tipo: 'slide',
                  contenido: 'Fracciones propias e impropias.',
                }),
              },
            ],
          },
        },
      });
    }

    // Crear contenido de PRÁCTICA (preguntas)
    const existingPractica = await prisma.contenido.findUnique({
      where: { id: TEST_CUIDS.contenidoPractica },
    });
    if (!existingPractica) {
      await prisma.contenido.create({
        data: {
          id: TEST_CUIDS.contenidoPractica,
          titulo: 'Ejercicios de Fracciones',
          descripcion: 'Práctica de fracciones para test',
          estado: EstadoContenido.PUBLICADO,
          casaTipo: CasaTipo.QUANTUM,
          mundoTipo: MundoTipo.MATEMATICA,
          duracionMinutos: 10,
          nodos: {
            create: [
              {
                id: TEST_CUIDS.nodoPregunta1,
                titulo: 'Pregunta 1',
                orden: 0,
                bloqueado: false,
                contenidoJson: JSON.stringify({
                  tipo: 'opcion-multiple',
                  enunciado: '¿Cuánto es 1/2 + 1/2?',
                  opciones: ['1/4', '1/2', '1', '2'],
                  respuestaCorrecta: '1',
                  puntaje: 10,
                }),
              },
              {
                id: TEST_CUIDS.nodoPregunta2,
                titulo: 'Pregunta 2',
                orden: 1,
                bloqueado: false,
                contenidoJson: JSON.stringify({
                  tipo: 'verdadero-falso',
                  enunciado: '¿1/4 es mayor que 1/2?',
                  opciones: ['Verdadero', 'Falso'],
                  respuestaCorrecta: 'Falso',
                  puntaje: 10,
                }),
              },
            ],
          },
        },
      });
    }
  }

  afterAll(async () => {
    // Cleanup test data (orden importante por FKs)
    await prisma.nodoContenido.deleteMany({
      where: {
        id: {
          in: [
            TEST_CUIDS.nodoTeoria1,
            TEST_CUIDS.nodoTeoria2,
            TEST_CUIDS.nodoPregunta1,
            TEST_CUIDS.nodoPregunta2,
          ],
        },
      },
    });
    await prisma.contenido.deleteMany({
      where: {
        id: { in: [TEST_CUIDS.contenidoTeoria, TEST_CUIDS.contenidoPractica] },
      },
    });
    await prisma.estudiante.deleteMany({
      where: { id: { in: [TEST_CUIDS.estudiante1, TEST_CUIDS.estudiante2] } },
    });
    await prisma.tutor
      .delete({ where: { id: TEST_CUIDS.tutor } })
      .catch(() => {});
    await app?.close();
  });

  // Garantizar estado limpio ANTES de cada test
  beforeEach(() => {
    // Usar clearAll() para limpiar TODO el estado, independiente del formato de salaId
    teoriaSyncService.clearAll();
    practicaLiveService.clearAll();
  });

  afterEach(async () => {
    // Limpiar TODO el estado después de cada test
    teoriaSyncService.clearAll();
    practicaLiveService.clearAll();

    if (clienteDocente?.connected) clienteDocente.disconnect();
    if (clienteEstudiante1?.connected) clienteEstudiante1.disconnect();
    if (clienteEstudiante2?.connected) clienteEstudiante2.disconnect();
    clienteDocente = undefined;
    clienteEstudiante1 = undefined;
    clienteEstudiante2 = undefined;
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

  const emitirConRespuesta = <TPayload, TResponse>(
    cliente: Socket,
    evento: string,
    payload: TPayload,
    timeoutMs = 3000,
  ): Promise<TResponse> => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Timeout esperando respuesta de ${evento}`));
      }, timeoutMs);

      cliente.emit(evento, payload, (response: TResponse) => {
        clearTimeout(timeout);
        resolve(response);
      });
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

  const noDebeRecibirEvento = (
    cliente: Socket,
    evento: string,
    waitMs = 500,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      let received = false;
      const handler = () => {
        received = true;
      };
      cliente.once(evento, handler);
      setTimeout(() => {
        cliente.off(evento, handler);
        resolve(!received);
      }, waitMs);
    });
  };

  // ===========================================================================
  // SPRINT 4.1: TEORÍA SINCRONIZADA
  // ===========================================================================

  describe('Sprint 4.1: Teoría Sincronizada', () => {
    describe('teoria:iniciar', () => {
      it('should_broadcast_teoria_iniciada_when_docente_starts_teoria', async () => {
        // Setup: Conectar docente y estudiante
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Estudiante escucha el broadcast
        const teoriaPromise = esperarEvento<{
          contenidoId: string;
          titulo: string;
          nodos: unknown[];
          nodoActualId: string | null;
          docenteNombre: string;
        }>(clienteEstudiante1, 'teoria:iniciada');

        // Docente inicia teoría
        const response = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });

        expect(response.exito).toBe(true);

        // Verificar que estudiante recibió el broadcast
        const payload = await teoriaPromise;
        expect(payload.contenidoId).toBe(TEST_CUIDS.contenidoTeoria);
        expect(payload.titulo).toBe('Lección de Fracciones');
        expect(payload.nodos).toHaveLength(2);
        expect(payload.docenteNombre).toBe('Prof. Teoría');
      });

      it('should_reject_when_estudiante_tries_to_start_teoria', async () => {
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteEstudiante1,
          TEST_CUIDS.claseGrupo,
        );

        const response = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });

        expect(response.exito).toBe(false);
        expect(response.error).toContain('Solo docentes');
      });

      it('should_reject_when_contenido_does_not_exist', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );

        const response = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: 'ctest0sprint4noexist00001', // CUID válido pero no existe (25 chars)
        });

        expect(response.exito).toBe(false);
        expect(response.error).toContain('no encontrado');
      });

      it('should_reject_when_teoria_already_active', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );

        // Primera vez - debe funcionar
        const response1 = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });
        expect(response1.exito).toBe(true);

        // Segunda vez - debe rechazar
        const response2 = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });
        expect(response2.exito).toBe(false);
        expect(response2.error).toContain('Ya hay una teoría activa');
      });
    });

    describe('teoria:cambiar-slide', () => {
      it('should_broadcast_slide_change_to_all_in_sala', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar teoría primero
        await emitirConRespuesta(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });

        // Estudiante escucha cambio de slide
        const slidePromise = esperarEvento<{
          nodoId: string;
          timestamp: string;
        }>(clienteEstudiante1, 'teoria:slide-cambiado');

        // Docente cambia slide
        const response = await emitirConRespuesta<
          { salaId: string; nodoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:cambiar-slide', {
          salaId,
          nodoId: TEST_CUIDS.nodoTeoria2,
        });

        expect(response.exito).toBe(true);

        // Verificar broadcast
        const payload = await slidePromise;
        expect(payload.nodoId).toBe(TEST_CUIDS.nodoTeoria2);
        expect(payload.timestamp).toBeDefined();
      });

      it('should_reject_when_no_teoria_active', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );

        const response = await emitirConRespuesta<
          { salaId: string; nodoId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:cambiar-slide', {
          salaId,
          nodoId: TEST_CUIDS.nodoTeoria2,
        });

        expect(response.exito).toBe(false);
        expect(response.error).toContain('No hay teoría activa');
      });
    });

    describe('teoria:cerrar', () => {
      it('should_broadcast_teoria_cerrada_to_all_in_sala', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar teoría
        await emitirConRespuesta(clienteDocente, 'teoria:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoTeoria,
        });

        // Estudiante escucha cierre
        const cerradaPromise = esperarEvento<{ timestamp: string }>(
          clienteEstudiante1,
          'teoria:cerrada',
        );

        // Docente cierra teoría
        const response = await emitirConRespuesta<
          { salaId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'teoria:cerrar', { salaId });

        expect(response.exito).toBe(true);

        // Verificar broadcast
        const payload = await cerradaPromise;
        expect(payload.timestamp).toBeDefined();
      });
    });
  });

  // ===========================================================================
  // SPRINT 4.2: PRÁCTICA EN VIVO
  // ===========================================================================

  describe('Sprint 4.2: Práctica en Vivo', () => {
    describe('practica:iniciar', () => {
      it('should_broadcast_practica_iniciada_with_preguntas', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Estudiante escucha el broadcast
        const practicaPromise = esperarEvento<{
          contenidoId: string;
          titulo: string;
          preguntas: Array<{
            index: number;
            enunciado: string;
            tipo: string;
            opciones?: string[];
            puntaje: number;
          }>;
          tiempoLimiteSeg: number | null;
          docenteNombre: string;
        }>(clienteEstudiante1, 'practica:iniciada');

        // Docente inicia práctica
        const response = await emitirConRespuesta<
          { salaId: string; contenidoId: string; tiempoLimiteSeg?: number },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        expect(response.exito).toBe(true);

        // Verificar que estudiante recibió el broadcast
        const payload = await practicaPromise;
        expect(payload.contenidoId).toBe(TEST_CUIDS.contenidoPractica);
        expect(payload.titulo).toBe('Ejercicios de Fracciones');
        expect(payload.preguntas).toHaveLength(2);
        expect(payload.preguntas[0].enunciado).toContain('1/2 + 1/2');
        expect(payload.preguntas[0].tipo).toBe('opcion-multiple');
        // IMPORTANTE: NO debe incluir respuestaCorrecta
        expect(
          (payload.preguntas[0] as unknown as { respuestaCorrecta?: unknown })
            .respuestaCorrecta,
        ).toBeUndefined();
      });

      it('should_reject_when_estudiante_tries_to_start_practica', async () => {
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteEstudiante1,
          TEST_CUIDS.claseGrupo,
        );

        const response = await emitirConRespuesta<
          { salaId: string; contenidoId: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        expect(response.exito).toBe(false);
        expect(response.error).toContain('Solo docentes');
      });
    });

    describe('practica:responder', () => {
      it('should_send_feedback_to_estudiante_on_correct_answer', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Estudiante escucha feedback
        const feedbackPromise = esperarEvento<{
          preguntaIndex: number;
          correcta: boolean;
          puntos: number;
        }>(clienteEstudiante1, 'practica:respuesta-registrada');

        // Estudiante responde correctamente (1/2 + 1/2 = 1)
        const response = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        expect(response.exito).toBe(true);

        // Verificar feedback
        const feedback = await feedbackPromise;
        expect(feedback.preguntaIndex).toBe(0);
        expect(feedback.correcta).toBe(true);
        expect(feedback.puntos).toBe(10);
      });

      it('should_send_feedback_to_estudiante_on_wrong_answer', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Estudiante escucha feedback
        const feedbackPromise = esperarEvento<{
          preguntaIndex: number;
          correcta: boolean;
          puntos: number;
        }>(clienteEstudiante1, 'practica:respuesta-registrada');

        // Estudiante responde incorrectamente
        const response = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1/4', // Incorrecto
        });

        expect(response.exito).toBe(true);

        // Verificar feedback
        const feedback = await feedbackPromise;
        expect(feedback.correcta).toBe(false);
        expect(feedback.puntos).toBe(0);
      });

      it('should_reject_duplicate_answer_to_same_question', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Primera respuesta - debe funcionar
        const response1 = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });
        expect(response1.exito).toBe(true);

        // Segunda respuesta a la misma pregunta - debe rechazar
        const response2 = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '2',
        });
        expect(response2.exito).toBe(false);
        expect(response2.error).toContain('Ya respondiste');
      });

      it('should_reject_when_docente_tries_to_respond', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Docente intenta responder
        const response = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        expect(response.exito).toBe(false);
        expect(response.error).toContain('Solo estudiantes');
      });
    });

    describe('practica:solicitar-progreso', () => {
      it('should_return_progreso_to_docente', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Estudiante responde una pregunta
        await emitirConRespuesta(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        // Docente escucha progreso
        const progresoPromise = esperarEvento<{
          progreso: Array<{
            odooId: string;
            nombre: string;
            estado: string;
            preguntaActual: number;
            totalPreguntas: number;
            correctas: number;
          }>;
        }>(clienteDocente, 'practica:progreso');

        // Docente solicita progreso
        const response = await emitirConRespuesta<
          { salaId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:solicitar-progreso', { salaId });

        expect(response.exito).toBe(true);

        // Verificar progreso
        const payload = await progresoPromise;
        expect(payload.progreso).toHaveLength(1);
        expect(payload.progreso[0].odooId).toBe(TEST_CUIDS.estudiante1);
        expect(payload.progreso[0].preguntaActual).toBe(1);
        expect(payload.progreso[0].correctas).toBe(1);
      });
    });

    describe('practica:pausar y practica:reanudar', () => {
      it('should_broadcast_pausa_and_block_responses', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Estudiante escucha pausa
        const pausaPromise = esperarEvento<{
          tiempoRestanteSeg: number | null;
        }>(clienteEstudiante1, 'practica:pausada');

        // Docente pausa
        const pauseResponse = await emitirConRespuesta<
          { salaId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:pausar', { salaId });

        expect(pauseResponse.exito).toBe(true);
        await pausaPromise; // Verificar que llegó el broadcast

        // Estudiante intenta responder mientras pausado
        const responseWhilePaused = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        expect(responseWhilePaused.exito).toBe(false);
        expect(responseWhilePaused.error).toContain('pausada');
      });

      it('should_allow_responses_after_reanudar', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Pausar
        await emitirConRespuesta(clienteDocente, 'practica:pausar', { salaId });

        // Reanudar
        const reanudarResponse = await emitirConRespuesta<
          { salaId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:reanudar', { salaId });
        expect(reanudarResponse.exito).toBe(true);

        // Ahora estudiante puede responder
        const responseAfterResume = await emitirConRespuesta<
          { salaId: string; preguntaIndex: number; respuesta: string },
          { exito: boolean; error?: string }
        >(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        expect(responseAfterResume.exito).toBe(true);
      });
    });

    describe('practica:cerrar', () => {
      it('should_broadcast_resultados_finales', async () => {
        clienteDocente = await crearCliente(generarToken(docenteData));
        clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
        clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));
        const { salaId } = await unirseSala(
          clienteDocente,
          TEST_CUIDS.claseGrupo,
        );
        await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
        await unirseSala(clienteEstudiante2, TEST_CUIDS.claseGrupo);

        // Iniciar práctica
        await emitirConRespuesta(clienteDocente, 'practica:iniciar', {
          salaId,
          contenidoId: TEST_CUIDS.contenidoPractica,
        });

        // Estudiante1 responde correctamente
        await emitirConRespuesta(clienteEstudiante1, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1',
        });

        // Estudiante2 responde incorrectamente
        await emitirConRespuesta(clienteEstudiante2, 'practica:responder', {
          salaId,
          preguntaIndex: 0,
          respuesta: '1/4',
        });

        // Escuchar resultados
        const resultadosPromise = esperarEvento<{
          titulo: string;
          totalPreguntas: number;
          totalEstudiantes: number;
          promedioCorrectas: number;
          resultados: Array<{
            odooId: string;
            nombre: string;
            correctas: number;
            puntajeTotal: number;
            posicion: number;
          }>;
        }>(clienteEstudiante1, 'practica:cerrada');

        // Docente cierra práctica
        const cerrarResponse = await emitirConRespuesta<
          { salaId: string },
          { exito: boolean; error?: string }
        >(clienteDocente, 'practica:cerrar', { salaId });

        expect(cerrarResponse.exito).toBe(true);

        // Verificar resultados
        const payload = await resultadosPromise;
        expect(payload.titulo).toBe('Ejercicios de Fracciones');
        expect(payload.totalEstudiantes).toBe(2);
        expect(payload.resultados).toHaveLength(2);

        // Estudiante1 debería estar primero (respondió correctamente)
        const est1Result = payload.resultados.find(
          (r) => r.odooId === TEST_CUIDS.estudiante1,
        );
        const est2Result = payload.resultados.find(
          (r) => r.odooId === TEST_CUIDS.estudiante2,
        );

        expect(est1Result?.correctas).toBe(1);
        expect(est1Result?.puntajeTotal).toBe(10);
        expect(est2Result?.correctas).toBe(0);
        expect(est2Result?.puntajeTotal).toBe(0);
      });
    });
  });
});
