import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { EventEmitter2, EventEmitterModule } from '@nestjs/event-emitter';
import { AulaVivaGateway } from '../src/aula-viva/aula-viva.gateway';
import { PresenciaService } from '../src/aula-viva/services/presencia.service';
import { ReaccionesService } from '../src/aula-viva/services/reacciones.service';
import { PulsoService } from '../src/aula-viva/services/pulso.service';
import { SelectorService } from '../src/aula-viva/services/selector.service';
import { ManosService } from '../src/aula-viva/services/manos.service';
import { ModeracionService } from '../src/aula-viva/services/moderacion.service';
import { QuizService } from '../src/aula-viva/services/quiz.service';
import { ContadorService } from '../src/aula-viva/services/contador.service';
import {
  GamificacionRealtimeService,
  PuntosOtorgadosPayload,
  NivelSubidoPayload,
  LogroDesbloqueadoPayload,
  CasaPuntosPayload,
} from '../src/aula-viva/services/gamificacion-realtime.service';
import { GamificacionRealtimeListener } from '../src/aula-viva/listeners/gamificacion-realtime.listener';
import {
  PuntosOtorgadosEnVivoEvent,
  EstudianteNivelUpEvent,
  LogroDesbloqueadoEvent,
  CasaPuntosActualizadosEvent,
} from '../src/common/events/domain-events';
import { PrismaService } from '../src/core/database/prisma.service';
import { CasaTipo } from '@prisma/client';

/**
 * =============================================================================
 * SPRINT 3.3-3.5 E2E - GAMIFICACIÓN EN TIEMPO REAL
 * Tests E2E para: Puntos en vivo, Nivel-Up, Logros, Casa
 * =============================================================================
 *
 * FILOSOFÍA: Black Box Testing
 * - Tests basados en REQUISITOS, no en implementación
 * - Verificamos comportamiento observable desde el cliente WebSocket
 *
 * EVENTOS TESTEADOS:
 * - puntos-otorgados (Sprint 3.3): notificación privada al estudiante
 * - nivel-subido (Sprint 3.4): notificación privada al subir de nivel
 * - logro-desbloqueado (Sprint 3.4): notificación privada de logro
 * - casa-puntos-actualizado (Sprint 3.5): broadcast a todos de la casa
 *
 * SETUP: DB real con factories
 * RUN: yarn workspace api test -- --testPathPattern="sprint3-gamificacion-realtime" --runInBand
 */
describe('Sprint 3.3-3.5 E2E - Gamificación Realtime (AulaVivaGateway)', () => {
  let app: INestApplication;
  let jwtService: JwtService;
  let eventEmitter: EventEmitter2;
  let prisma: PrismaService;
  let gamificacionRealtimeService: GamificacionRealtimeService;
  let clienteDocente: Socket | undefined;
  let clienteEstudiante1: Socket | undefined;
  let clienteEstudiante2: Socket | undefined;
  let clienteEstudianteOtraCasa: Socket | undefined;

  const PORT = 3857; // Puerto único para este test
  const JWT_SECRET = 'test-secret-for-sprint3-gamificacion-e2e';

  // IDs de prueba (CUIDs de 25 caracteres - OBLIGATORIO)
  // Regex /^c[a-z0-9]{24}$/ = 'c' (1) + 24 alfanuméricos = 25 TOTAL
  const TEST_CUIDS = {
    docente: 'ctest0gamif3docente000001', // 25 chars ✓
    estudiante1: 'ctest0gamif3student000001', // 25 chars ✓
    estudiante2: 'ctest0gamif3student000002', // 25 chars ✓
    estudianteOtraCasa: 'ctest0gamif3student000003', // 25 chars ✓
    claseGrupo: 'ctest0gamif3clasegr000001', // 25 chars ✓
    tutor: 'ctest0gamif3tutor00000001', // 25 chars ✓
    casaQuantum: '', // Se llenará desde DB
    casaVertex: '', // Se llenará desde DB
  };

  const docenteData = {
    sub: TEST_CUIDS.docente,
    nombre: 'Prof. García',
    rol: 'DOCENTE',
  };

  const estudiante1Data = {
    sub: TEST_CUIDS.estudiante1,
    nombre: 'María López',
    rol: 'ESTUDIANTE',
  };

  const estudiante2Data = {
    sub: TEST_CUIDS.estudiante2,
    nombre: 'Juan Pérez',
    rol: 'ESTUDIANTE',
  };

  const estudianteOtraCasaData = {
    sub: TEST_CUIDS.estudianteOtraCasa,
    nombre: 'Laura Sánchez',
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
        PrismaService,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    jwtService = moduleFixture.get<JwtService>(JwtService);
    eventEmitter = moduleFixture.get<EventEmitter2>(EventEmitter2);
    prisma = moduleFixture.get<PrismaService>(PrismaService);
    gamificacionRealtimeService =
      moduleFixture.get<GamificacionRealtimeService>(
        GamificacionRealtimeService,
      );

    await app.init();
    await app.listen(PORT);

    // IMPORTANTE: Configurar manualmente el server para GamificacionRealtimeService
    // En el contexto de test, afterInit() puede no ejecutarse correctamente
    // o puede ejecutarse antes de que el server esté completamente disponible.
    // Obtenemos la referencia al gateway y configuramos el server manualmente.
    const gateway = moduleFixture.get<AulaVivaGateway>(AulaVivaGateway);
    gamificacionRealtimeService.setServer(gateway.server);

    // Los decoradores @OnEvent funcionan correctamente con EventEmitterModule.forRoot()
    // No necesitamos registrar handlers manualmente - el decorator hace el trabajo
    // Ver: GamificacionRealtimeListener con @OnEvent('puntos.otorgados.envivo'), etc.

    // Obtener casas de la DB (deberían estar seeded)
    const casaQuantum = await prisma.casa.findFirst({
      where: { tipo: CasaTipo.QUANTUM },
    });
    const casaVertex = await prisma.casa.findFirst({
      where: { tipo: CasaTipo.VERTEX },
    });

    if (casaQuantum) TEST_CUIDS.casaQuantum = casaQuantum.id;
    if (casaVertex) TEST_CUIDS.casaVertex = casaVertex.id;

    // Si no hay casas en DB, crearlas para los tests
    if (!casaQuantum) {
      const created = await prisma.casa.create({
        data: {
          tipo: CasaTipo.QUANTUM,
          nombre: 'Casa Quantum',
          emoji: '⚛️',
          slogan: 'Exploradores del conocimiento',
          colorPrimary: '#00d4ff',
          colorSecondary: '#0088cc',
          colorAccent: '#00ffff',
          colorDark: '#004466',
          gradiente: 'linear-gradient(135deg, #00d4ff 0%, #0088cc 100%)',
          edadMinima: 6,
          edadMaxima: 9,
        },
      });
      TEST_CUIDS.casaQuantum = created.id;
    }

    if (!casaVertex) {
      const created = await prisma.casa.create({
        data: {
          tipo: CasaTipo.VERTEX,
          nombre: 'Casa Vertex',
          emoji: '🔺',
          slogan: 'Constructores del futuro',
          colorPrimary: '#ff00ff',
          colorSecondary: '#cc00cc',
          colorAccent: '#ff66ff',
          colorDark: '#660066',
          gradiente: 'linear-gradient(135deg, #ff00ff 0%, #cc00cc 100%)',
          edadMinima: 10,
          edadMaxima: 12,
        },
      });
      TEST_CUIDS.casaVertex = created.id;
    }

    // Crear estudiantes de prueba en la DB para el auto-join de casa
    // Nota: Solo necesarios para el test de auto-join
    await createTestStudentsInDB();
  });

  async function createTestStudentsInDB() {
    // Crear tutor primero (requerido para estudiantes)
    const existingTutor = await prisma.tutor.findUnique({
      where: { id: TEST_CUIDS.tutor },
    });
    if (!existingTutor) {
      await prisma.tutor.create({
        data: {
          id: TEST_CUIDS.tutor,
          nombre: 'Tutor',
          apellido: 'Test Gamificacion',
          email: 'tutor_gamif_test@test.com',
          passwordHash: 'not_used_in_ws_tests',
        },
      });
    }

    // Crear estudiante1 con casa Quantum
    const existing1 = await prisma.estudiante.findUnique({
      where: { id: TEST_CUIDS.estudiante1 },
    });
    if (!existing1) {
      await prisma.estudiante.create({
        data: {
          id: TEST_CUIDS.estudiante1,
          nombre: 'María',
          apellido: 'López',
          username: 'maria_test_gamif',
          passwordHash: 'not_used_in_ws_tests',
          edad: 10,
          nivelEscolar: '5to',
          casaId: TEST_CUIDS.casaQuantum,
          tutorId: TEST_CUIDS.tutor,
        },
      });
    }

    // Crear estudiante2 con casa Quantum (misma casa)
    const existing2 = await prisma.estudiante.findUnique({
      where: { id: TEST_CUIDS.estudiante2 },
    });
    if (!existing2) {
      await prisma.estudiante.create({
        data: {
          id: TEST_CUIDS.estudiante2,
          nombre: 'Juan',
          apellido: 'Pérez',
          username: 'juan_test_gamif',
          passwordHash: 'not_used_in_ws_tests',
          edad: 11,
          nivelEscolar: '6to',
          casaId: TEST_CUIDS.casaQuantum,
          tutorId: TEST_CUIDS.tutor,
        },
      });
    }

    // Crear estudiante con otra casa (Vertex)
    const existing3 = await prisma.estudiante.findUnique({
      where: { id: TEST_CUIDS.estudianteOtraCasa },
    });
    if (!existing3) {
      await prisma.estudiante.create({
        data: {
          id: TEST_CUIDS.estudianteOtraCasa,
          nombre: 'Laura',
          apellido: 'Sánchez',
          username: 'laura_test_gamif',
          passwordHash: 'not_used_in_ws_tests',
          edad: 12,
          nivelEscolar: '7mo',
          casaId: TEST_CUIDS.casaVertex,
          tutorId: TEST_CUIDS.tutor,
        },
      });
    }
  }

  afterAll(async () => {
    // Cleanup test data (orden importante: estudiantes antes que tutor)
    await prisma.estudiante.deleteMany({
      where: {
        id: {
          in: [
            TEST_CUIDS.estudiante1,
            TEST_CUIDS.estudiante2,
            TEST_CUIDS.estudianteOtraCasa,
          ],
        },
      },
    });
    // Eliminar tutor después de estudiantes
    await prisma.tutor
      .delete({ where: { id: TEST_CUIDS.tutor } })
      .catch(() => {});
    await app?.close();
  });

  afterEach(async () => {
    if (clienteDocente?.connected) clienteDocente.disconnect();
    if (clienteEstudiante1?.connected) clienteEstudiante1.disconnect();
    if (clienteEstudiante2?.connected) clienteEstudiante2.disconnect();
    if (clienteEstudianteOtraCasa?.connected)
      clienteEstudianteOtraCasa.disconnect();
    clienteDocente = undefined;
    clienteEstudiante1 = undefined;
    clienteEstudiante2 = undefined;
    clienteEstudianteOtraCasa = undefined;
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
  // SPRINT 3.3: NOTIFICACIÓN PRIVADA DE PUNTOS
  // ===========================================================================

  describe('Sprint 3.3: Notificación Privada de Puntos', () => {
    it('should_notify_target_estudiante_when_puntos_otorgados', async () => {
      // Setup: Conectar estudiante y unirse a sala
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      // Escuchar evento de puntos
      const puntosPromise = esperarEvento<PuntosOtorgadosPayload>(
        clienteEstudiante1,
        'puntos-otorgados',
      );

      // Emitir evento de dominio (simulando GamificacionService.otorgarPuntos)
      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          10,
          'PARTICIPACION',
          'Excelente participación',
          150,
          `clase:${TEST_CUIDS.claseGrupo}`,
        ),
      );

      // Verificar que el estudiante recibió la notificación
      const payload = await puntosPromise;
      expect(payload.puntos).toBe(10);
      expect(payload.tipoAccion).toBe('PARTICIPACION');
      expect(payload.contexto).toBe('Excelente participación');
      expect(payload.docenteNombre).toBe('Prof. García');
      expect(payload.xpTotal).toBe(150);
      expect(payload.timestamp).toBeDefined();
    });

    it('should_NOT_notify_other_estudiantes_in_same_sala', async () => {
      // Setup: Conectar ambos estudiantes
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudiante2, TEST_CUIDS.claseGrupo);

      // Estudiante2 NO debe recibir el evento destinado a estudiante1
      const noEventoPromise = noDebeRecibirEvento(
        clienteEstudiante2,
        'puntos-otorgados',
        500,
      );

      // Emitir evento solo para estudiante1
      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          10,
          'PARTICIPACION',
          undefined,
          100,
          `clase:${TEST_CUIDS.claseGrupo}`,
        ),
      );

      // Verificar que estudiante2 NO recibió nada
      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_NOT_notify_docente_when_puntos_otorgados', async () => {
      // Setup: Conectar docente y estudiante
      clienteDocente = await crearCliente(generarToken(docenteData));
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteDocente, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      // Docente NO debe recibir el evento
      const noEventoPromise = noDebeRecibirEvento(
        clienteDocente,
        'puntos-otorgados',
        500,
      );

      // Emitir evento
      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          10,
          'PARTICIPACION',
          undefined,
          100,
          undefined,
        ),
      );

      // Verificar que docente NO recibió nada
      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_notify_all_sockets_of_same_estudiante_multitab', async () => {
      // Setup: Estudiante con 2 conexiones (simulando múltiples tabs)
      const cliente1Tab1 = await crearCliente(generarToken(estudiante1Data));
      const cliente1Tab2 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(cliente1Tab1, TEST_CUIDS.claseGrupo);
      await unirseSala(cliente1Tab2, TEST_CUIDS.claseGrupo);

      // Ambos tabs deben recibir el evento
      const tab1Promise = esperarEvento<PuntosOtorgadosPayload>(
        cliente1Tab1,
        'puntos-otorgados',
      );
      const tab2Promise = esperarEvento<PuntosOtorgadosPayload>(
        cliente1Tab2,
        'puntos-otorgados',
      );

      // Emitir evento
      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          15,
          'TAREA_COMPLETADA',
          undefined,
          200,
          undefined,
        ),
      );

      // Verificar ambos tabs recibieron
      const [tab1Payload, tab2Payload] = await Promise.all([
        tab1Promise,
        tab2Promise,
      ]);

      expect(tab1Payload.puntos).toBe(15);
      expect(tab2Payload.puntos).toBe(15);

      // Cleanup
      cliente1Tab1.disconnect();
      cliente1Tab2.disconnect();
    });

    it('should_not_error_when_estudiante_not_connected', async () => {
      // No conectamos ningún cliente

      // Emitir evento para estudiante no conectado
      // No debe lanzar error, solo loguear debug
      expect(() => {
        eventEmitter.emit(
          'puntos.otorgados.envivo',
          new PuntosOtorgadosEnVivoEvent(
            'estudiante-no-conectado-123456',
            TEST_CUIDS.docente,
            'Prof. García',
            10,
            'PARTICIPACION',
            undefined,
            100,
            undefined,
          ),
        );
      }).not.toThrow();
    });

    it('should_include_correct_payload_structure', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const puntosPromise = esperarEvento<PuntosOtorgadosPayload>(
        clienteEstudiante1,
        'puntos-otorgados',
      );

      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          25,
          'QUIZ_APROBADO',
          'Quiz de matemáticas',
          300,
          undefined,
        ),
      );

      const payload = await puntosPromise;

      // Verificar estructura completa
      expect(typeof payload.puntos).toBe('number');
      expect(typeof payload.tipoAccion).toBe('string');
      expect(typeof payload.docenteNombre).toBe('string');
      expect(typeof payload.xpTotal).toBe('number');
      expect(typeof payload.timestamp).toBe('string');
      // contexto es opcional
      expect(
        payload.contexto === undefined || typeof payload.contexto === 'string',
      ).toBe(true);
    });
  });

  // ===========================================================================
  // SPRINT 3.4: NIVEL-UP Y LOGROS EN VIVO
  // ===========================================================================

  describe('Sprint 3.4: Nivel-Up y Logros en Vivo', () => {
    it('should_notify_estudiante_when_nivel_subido', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const nivelPromise = esperarEvento<NivelSubidoPayload>(
        clienteEstudiante1,
        'nivel-subido',
      );

      eventEmitter.emit(
        'estudiante.nivel-up',
        new EstudianteNivelUpEvent(TEST_CUIDS.estudiante1, 2, 3, {
          xp: 100,
        }),
      );

      const payload = await nivelPromise;
      expect(payload.nivelAnterior).toBe(2);
      expect(payload.nivelNuevo).toBe(3);
      expect(payload.recompensas).toBeDefined();
      expect(payload.timestamp).toBeDefined();
    });

    it('should_notify_estudiante_when_logro_desbloqueado', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const logroPromise = esperarEvento<LogroDesbloqueadoPayload>(
        clienteEstudiante1,
        'logro-desbloqueado',
      );

      eventEmitter.emit(
        'logro.desbloqueado',
        new LogroDesbloqueadoEvent(
          TEST_CUIDS.estudiante1,
          'PRIMERA_PARTICIPACION',
          '¡Primera Participación!',
          { xp: 50 },
        ),
      );

      const payload = await logroPromise;
      expect(payload.logroCodigo).toBe('PRIMERA_PARTICIPACION');
      expect(payload.logroNombre).toBe('¡Primera Participación!');
      expect(payload.recompensas).toEqual({ xp: 50 });
      expect(payload.timestamp).toBeDefined();
    });

    it('should_NOT_notify_others_when_nivel_up', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudiante2, TEST_CUIDS.claseGrupo);

      const noEventoPromise = noDebeRecibirEvento(
        clienteEstudiante2,
        'nivel-subido',
        500,
      );

      eventEmitter.emit(
        'estudiante.nivel-up',
        new EstudianteNivelUpEvent(TEST_CUIDS.estudiante1, 1, 2, {}),
      );

      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_NOT_notify_others_when_logro_desbloqueado', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudiante2, TEST_CUIDS.claseGrupo);

      const noEventoPromise = noDebeRecibirEvento(
        clienteEstudiante2,
        'logro-desbloqueado',
        500,
      );

      eventEmitter.emit(
        'logro.desbloqueado',
        new LogroDesbloqueadoEvent(
          TEST_CUIDS.estudiante1,
          'TEST_LOGRO',
          'Test',
          {},
        ),
      );

      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_include_recompensas_in_nivel_payload', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const nivelPromise = esperarEvento<NivelSubidoPayload>(
        clienteEstudiante1,
        'nivel-subido',
      );

      const recompensas = { xp: 150 };
      eventEmitter.emit(
        'estudiante.nivel-up',
        new EstudianteNivelUpEvent(TEST_CUIDS.estudiante1, 4, 5, recompensas),
      );

      const payload = await nivelPromise;
      expect(payload.recompensas).toEqual(recompensas);
    });

    it('should_include_recompensas_in_logro_payload', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const logroPromise = esperarEvento<LogroDesbloqueadoPayload>(
        clienteEstudiante1,
        'logro-desbloqueado',
      );

      const recompensas = { xp: 150 };
      eventEmitter.emit(
        'logro.desbloqueado',
        new LogroDesbloqueadoEvent(
          TEST_CUIDS.estudiante1,
          'RACHA_7_DIAS',
          'Racha de 7 días',
          recompensas,
        ),
      );

      const payload = await logroPromise;
      expect(payload.recompensas).toEqual(recompensas);
    });
  });

  // ===========================================================================
  // SPRINT 3.5: BROADCAST DE PUNTOS DE CASA
  // ===========================================================================

  describe('Sprint 3.5: Broadcast de Puntos de Casa', () => {
    it('should_broadcast_to_all_estudiantes_in_same_casa_room', async () => {
      // Estudiante1 y Estudiante2 están en la misma casa (Quantum)
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));

      // Ambos se unen a la sala (esto también los une al room de casa)
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudiante2, TEST_CUIDS.claseGrupo);

      // Ambos deben recibir el broadcast de casa
      const est1Promise = esperarEvento<CasaPuntosPayload>(
        clienteEstudiante1,
        'casa-puntos-actualizado',
      );
      const est2Promise = esperarEvento<CasaPuntosPayload>(
        clienteEstudiante2,
        'casa-puntos-actualizado',
      );

      // Emitir evento de puntos de casa
      eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          TEST_CUIDS.casaQuantum,
          'Casa Quantum',
          TEST_CUIDS.estudiante1,
          'María López',
          50,
          1500,
        ),
      );

      const [payload1, payload2] = await Promise.all([
        est1Promise,
        est2Promise,
      ]);

      expect(payload1.casaId).toBe(TEST_CUIDS.casaQuantum);
      expect(payload1.casaNombre).toBe('Casa Quantum');
      expect(payload1.xpGanado).toBe(50);

      expect(payload2.casaId).toBe(TEST_CUIDS.casaQuantum);
      expect(payload2.xpGanado).toBe(50);
    });

    it('should_NOT_broadcast_to_estudiantes_in_different_casa', async () => {
      // Estudiante1 (Quantum) y EstudianteOtraCasa (Vertex)
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudianteOtraCasa = await crearCliente(
        generarToken(estudianteOtraCasaData),
      );

      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);
      await unirseSala(clienteEstudianteOtraCasa, TEST_CUIDS.claseGrupo);

      // Estudiante de otra casa NO debe recibir el evento
      const noEventoPromise = noDebeRecibirEvento(
        clienteEstudianteOtraCasa,
        'casa-puntos-actualizado',
        500,
      );

      // Emitir evento para casa Quantum (no es la casa de clienteEstudianteOtraCasa)
      eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          TEST_CUIDS.casaQuantum,
          'Casa Quantum',
          TEST_CUIDS.estudiante1,
          'María López',
          30,
          1200,
        ),
      );

      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_auto_join_casa_room_on_unirse_sala', async () => {
      // Este test verifica que el estudiante se une automáticamente
      // al room de su casa cuando se une a una sala de clase

      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      // Al unirse, debería auto-unirse al room casa:{casaId}
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      // Verificar que puede recibir eventos de casa
      const casaEventPromise = esperarEvento<CasaPuntosPayload>(
        clienteEstudiante1,
        'casa-puntos-actualizado',
      );

      eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          TEST_CUIDS.casaQuantum,
          'Casa Quantum',
          TEST_CUIDS.estudiante2, // Otro estudiante de la misma casa
          'Juan Pérez',
          20,
          1000,
        ),
      );

      const payload = await casaEventPromise;
      expect(payload.xpGanado).toBe(20);
      expect(payload.estudianteNombre).toBe('Juan Pérez');
    });

    it('should_include_correct_casa_payload', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const casaPromise = esperarEvento<CasaPuntosPayload>(
        clienteEstudiante1,
        'casa-puntos-actualizado',
      );

      eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          TEST_CUIDS.casaQuantum,
          'Casa Quantum',
          TEST_CUIDS.estudiante1,
          'María López',
          75,
          2500,
        ),
      );

      const payload = await casaPromise;

      // Verificar estructura completa
      expect(typeof payload.casaId).toBe('string');
      expect(typeof payload.casaNombre).toBe('string');
      expect(typeof payload.estudianteId).toBe('string');
      expect(typeof payload.estudianteNombre).toBe('string');
      expect(typeof payload.xpGanado).toBe('number');
      expect(typeof payload.xpTotalEstudiante).toBe('number');
      expect(typeof payload.timestamp).toBe('string');
    });

    it('should_broadcast_even_to_estudiante_who_earned_points', async () => {
      // El estudiante que ganó los puntos también debe recibir el broadcast
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const casaPromise = esperarEvento<CasaPuntosPayload>(
        clienteEstudiante1,
        'casa-puntos-actualizado',
      );

      // Estudiante1 gana puntos - él mismo debe recibir el broadcast
      eventEmitter.emit(
        'casa.puntos.actualizado',
        new CasaPuntosActualizadosEvent(
          TEST_CUIDS.casaQuantum,
          'Casa Quantum',
          TEST_CUIDS.estudiante1, // El mismo que escucha
          'María López',
          40,
          1800,
        ),
      );

      const payload = await casaPromise;
      expect(payload.estudianteId).toBe(TEST_CUIDS.estudiante1);
      expect(payload.xpGanado).toBe(40);
    });
  });

  // ===========================================================================
  // EDGE CASES
  // ===========================================================================

  describe('Edge Cases', () => {
    it('should_handle_rapid_consecutive_events', async () => {
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, TEST_CUIDS.claseGrupo);

      const eventosRecibidos: PuntosOtorgadosPayload[] = [];
      const totalEventos = 5;

      clienteEstudiante1.on(
        'puntos-otorgados',
        (data: PuntosOtorgadosPayload) => {
          eventosRecibidos.push(data);
        },
      );

      // Emitir 5 eventos rápidamente
      for (let i = 1; i <= totalEventos; i++) {
        eventEmitter.emit(
          'puntos.otorgados.envivo',
          new PuntosOtorgadosEnVivoEvent(
            TEST_CUIDS.estudiante1,
            TEST_CUIDS.docente,
            'Prof. García',
            i * 5,
            'PARTICIPACION',
            `Evento ${i}`,
            i * 10,
            undefined,
          ),
        );
      }

      // Esperar a que lleguen todos
      await new Promise((resolve) => setTimeout(resolve, 500));

      expect(eventosRecibidos.length).toBe(totalEventos);
      expect(eventosRecibidos[0].puntos).toBe(5);
      expect(eventosRecibidos[4].puntos).toBe(25);
    });

    it('should_isolate_events_between_salas', async () => {
      const salaA = 'ctest0gamif3sala00000001a'; // 25 chars ✓
      const salaB = 'ctest0gamif3sala00000001b'; // 25 chars ✓

      // Estudiante1 en sala A, Estudiante2 en sala B
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      clienteEstudiante2 = await crearCliente(generarToken(estudiante2Data));
      await unirseSala(clienteEstudiante1, salaA);
      await unirseSala(clienteEstudiante2, salaB);

      // El aislamiento es por userId, no por sala
      // Así que estudiante2 NO debe recibir evento de estudiante1
      const noEventoPromise = noDebeRecibirEvento(
        clienteEstudiante2,
        'puntos-otorgados',
        500,
      );

      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1, // Solo este debe recibir
          TEST_CUIDS.docente,
          'Prof. García',
          10,
          'PARTICIPACION',
          undefined,
          100,
          `clase:${salaA}`,
        ),
      );

      const noRecibio = await noEventoPromise;
      expect(noRecibio).toBe(true);
    });

    it('should_work_with_estudiante_in_multiple_salas', async () => {
      const salaA = 'ctest0gamif3multisala0001'; // 25 chars ✓
      const salaB = 'ctest0gamif3multisala0002'; // 25 chars ✓

      // Estudiante se une a dos salas diferentes
      clienteEstudiante1 = await crearCliente(generarToken(estudiante1Data));
      await unirseSala(clienteEstudiante1, salaA);
      await unirseSala(clienteEstudiante1, salaB);

      // Debe recibir notificación de puntos (es por userId, no por sala)
      const puntosPromise = esperarEvento<PuntosOtorgadosPayload>(
        clienteEstudiante1,
        'puntos-otorgados',
      );

      eventEmitter.emit(
        'puntos.otorgados.envivo',
        new PuntosOtorgadosEnVivoEvent(
          TEST_CUIDS.estudiante1,
          TEST_CUIDS.docente,
          'Prof. García',
          20,
          'PARTICIPACION',
          undefined,
          200,
          undefined,
        ),
      );

      const payload = await puntosPromise;
      expect(payload.puntos).toBe(20);
    });
  });
});
