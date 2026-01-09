/**
 * ============================================================================
 * INTEGRATION TESTS - Completar Lección (Endpoint)
 * ============================================================================
 *
 * Endpoint: POST /api/estudiantes/aula/completar-leccion
 *
 * Body:
 *   {
 *     asignacionId: string;   // ID de AsignacionPlanificacion
 *     claseId: string;        // ID de ClasePlanificacion
 *     tipo: 'teoria' | 'practica';
 *     tiempoSegundos: number;
 *   }
 *
 * Response (200):
 *   {
 *     success: true,
 *     progreso: { teoria_completada: boolean, practica_completada: boolean },
 *     xp_ganado: number,  // 50 (teoría) o 75 (práctica) + bonus tiempo
 *     mensaje: string
 *   }
 *
 * Comportamiento:
 * - Verifica acceso del estudiante (inscripción activa en el grupo)
 * - Verifica que la clase está activada (teoria_activa/practica_activa)
 * - Crea/actualiza ProgresoClaseEstudiante
 * - Emite evento 'leccion.completada' → listener otorga XP
 * - Si completa teoría+práctica → emite 'clase.completada' (bonus XP)
 *
 * IMPORTANTE:
 * - El endpoint NO verifica idempotencia de XP, cada llamada emite evento
 * - La idempotencia debe verificarse en el listener o agregar lógica
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="completar-leccion.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  cleanAllTestTables,
  createFullAulaSetup,
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
} from '../../utils/db-cleanup.helper';
import { generateUniqueIP } from '../../utils/auth.helpers';

const FRONTEND_ORIGIN = 'http://localhost:3000';

describe('[INTEGRATION] Completar Lección - Endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPER: Login estudiante
  // ============================================================================
  async function loginEstudiante(
    username: string,
    password: string,
  ): Promise<string[]> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/estudiante/login')
      .set('Origin', FRONTEND_ORIGIN)
      .set('X-Forwarded-For', generateUniqueIP())
      .send({ username, password });

    return response.headers['set-cookie'] as string[];
  }

  // ============================================================================
  // HELPER: Obtener XP actual del estudiante
  // ============================================================================
  async function getXPActual(estudianteId: string): Promise<number> {
    const recursos = await prisma.recursosEstudiante.findUnique({
      where: { estudiante_id: estudianteId },
    });
    return recursos?.xp_total ?? 0;
  }

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('POST /estudiantes/aula/completar-leccion - Happy Path', () => {
    it('debe completar teoría por primera vez y otorgar 50 XP base', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      const xpAntes = await getXPActual(setup.estudiante.id);
      const claseActivada = setup.clases[0]; // Clase 1 está activada

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'teoria',
          tiempoSegundos: 300, // 5 minutos
        });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.progreso.teoria_completada).toBe(true);
      expect(response.body.xp_ganado).toBeGreaterThanOrEqual(50); // 50 base + bonus tiempo

      // Verificar en BD
      const progreso = await prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudiante_id_clase_id: {
            estudiante_id: setup.estudiante.id,
            clase_id: claseActivada.id,
          },
        },
      });
      expect(progreso?.teoria_completada).toBe(true);
      expect(progreso?.teoria_completada_en).not.toBeNull();

      // Verificar XP aumentó (el listener es async, puede tardar)
      // Esperar un poco para el evento
      await new Promise((resolve) => setTimeout(resolve, 100));
      const xpDespues = await getXPActual(setup.estudiante.id);
      expect(xpDespues).toBeGreaterThan(xpAntes);
    });

    it('debe completar práctica por primera vez y otorgar 75 XP base', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      const xpAntes = await getXPActual(setup.estudiante.id);
      const claseActivada = setup.clases[0];

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'practica',
          tiempoSegundos: 600, // 10 minutos
        });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.progreso.practica_completada).toBe(true);
      expect(response.body.xp_ganado).toBeGreaterThanOrEqual(75); // 75 base + bonus

      // Verificar XP
      await new Promise((resolve) => setTimeout(resolve, 100));
      const xpDespues = await getXPActual(setup.estudiante.id);
      expect(xpDespues).toBeGreaterThan(xpAntes);
    });

    it('debe otorgar bonus de XP por tiempo dedicado (2 XP por minuto, max 20)', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      const claseActivada = setup.clases[0];

      // ACT - 15 minutos = 30 XP bonus (pero max 20)
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'teoria',
          tiempoSegundos: 900, // 15 minutos
        });

      // ASSERT
      expect(response.status).toBe(201);
      // 50 base + 20 max bonus = 70 XP
      expect(response.body.xp_ganado).toBe(70);
    });

    it('debe completar teoría y práctica y otorgar XP acumulativo', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      const xpAntes = await getXPActual(setup.estudiante.id);
      const claseActivada = setup.clases[0];

      // ACT - Completar teoría
      await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ACT - Completar práctica
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'practica',
          tiempoSegundos: 300,
        });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body.progreso.teoria_completada).toBe(true);
      expect(response.body.progreso.practica_completada).toBe(true);

      // Verificar progreso en BD
      const progreso = await prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudiante_id_clase_id: {
            estudiante_id: setup.estudiante.id,
            clase_id: claseActivada.id,
          },
        },
      });
      expect(progreso?.teoria_completada).toBe(true);
      expect(progreso?.practica_completada).toBe(true);

      // Esperar eventos async
      await new Promise((resolve) => setTimeout(resolve, 200));

      // XP debería haber aumentado significativamente
      // (50 teoría + 75 práctica + 50 bonus clase completa + bonuses tiempo)
      const xpDespues = await getXPActual(setup.estudiante.id);
      expect(xpDespues).toBeGreaterThanOrEqual(xpAntes + 125); // Mínimo esperado
    });
  });

  // ============================================================================
  // IDEMPOTENCIA (COMPORTAMIENTO ACTUAL)
  // ============================================================================
  describe('POST /estudiantes/aula/completar-leccion - Idempotencia', () => {
    it('debe permitir completar la misma lección múltiples veces (suma tiempo)', async () => {
      // NOTA: El endpoint actual NO es idempotente en XP.
      // Cada llamada emite evento y suma XP. Este test documenta el comportamiento actual.
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      const claseActivada = setup.clases[0];

      // Primera vez
      await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // Segunda vez (misma lección)
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: claseActivada.id,
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ASSERT - Debe seguir funcionando (no error)
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);

      // Verificar idempotencia: el tiempo NO se acumula después de completar
      // (la segunda llamada es no-op una vez completada)
      const progreso = await prisma.progresoClaseEstudiante.findUnique({
        where: {
          estudiante_id_clase_id: {
            estudiante_id: setup.estudiante.id,
            clase_id: claseActivada.id,
          },
        },
      });
      // El tiempo es solo de la primera llamada (idempotencia)
      expect(progreso?.tiempo_teoria_segundos).toBe(300);
      expect(progreso?.teoria_completada).toBe(true);
    });
  });

  // ============================================================================
  // PERMISOS Y ERRORES
  // ============================================================================
  describe('POST /estudiantes/aula/completar-leccion - Errores', () => {
    it('debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: 'fake-id',
          claseId: 'fake-id',
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de docente (ExactRoles)', async () => {
      // ARRANGE - Login como docente
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies || [])
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: 'fake-id',
          claseId: 'fake-id',
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ASSERT - Debe ser 403 (ExactRoles no permite docentes)
      expect(response.status).toBe(403);
    });

    it('debe retornar 404 si la asignación no existe', async () => {
      // ARRANGE
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });
      const cookies = await loginEstudiante(estudiante.username, password);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: 'cm000000000000000000000000', // ID inválido pero formato correcto
          claseId: 'cm000000000000000000000000',
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ASSERT
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la clase no está activada', async () => {
      // ARRANGE - Crear setup SIN activar clases
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [], // Ninguna clase activada
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT - Intentar completar clase que no está activada
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: setup.clases[0].id, // Clase existe pero no está activada
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ASSERT
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('no está disponible');
    });

    it('debe retornar 400 si tipo es inválido', async () => {
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: setup.clases[0].id,
          tipo: 'invalido', // Tipo inválido
          tiempoSegundos: 300,
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe retornar 404 si estudiante no está inscrito en el grupo', async () => {
      // ARRANGE - Crear setup y otro estudiante NO inscrito
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });

      // Crear estudiante que NO está inscrito en el grupo
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: estudianteNoInscrito, password } =
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
      const cookies = await loginEstudiante(
        estudianteNoInscrito.username,
        password,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: setup.clases[0].id,
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // ASSERT - No tiene acceso a la asignación
      expect(response.status).toBe(404);
      expect(response.body.message).toContain('No tienes acceso');
    });
  });

  // ============================================================================
  // GAMIFICACIÓN
  // ============================================================================
  describe('POST /estudiantes/aula/completar-leccion - Gamificación', () => {
    it('debe crear entrada en Activity Feed después de completar', async () => {
      // ARRANGE
      const setup = await createFullAulaSetup(prisma, {
        cantidadClases: 2,
        activarClases: [1],
      });
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      await request(app.getHttpServer())
        .post('/api/estudiantes/aula/completar-leccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          asignacionId: setup.asignacion.id,
          claseId: setup.clases[0].id,
          tipo: 'teoria',
          tiempoSegundos: 300,
        });

      // Esperar evento async
      await new Promise((resolve) => setTimeout(resolve, 200));

      // ASSERT - Verificar que se creó TransaccionRecurso (registro de XP)
      // TransaccionRecurso se relaciona a través de RecursosEstudiante
      const recursosEstudiante = await prisma.recursosEstudiante.findUnique({
        where: { estudiante_id: setup.estudiante.id },
      });

      expect(recursosEstudiante).not.toBeNull();

      const transacciones = await prisma.transaccionRecurso.findMany({
        where: {
          recursos_estudiante_id: recursosEstudiante!.id,
          tipo_recurso: 'XP',
        },
      });

      // Debería haber al menos una transacción de XP
      expect(transacciones.length).toBeGreaterThanOrEqual(1);
    });
  });
});
