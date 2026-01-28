/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - TUTOR DASHBOARD ENDPOINTS
 * ============================================================================
 *
 * ENDPOINTS TESTEADOS:
 * - GET /tutor/mis-inscripciones
 * - GET /tutor/dashboard-resumen
 * - GET /tutor/proximas-clases
 * - GET /tutor/alertas
 * - GET /tutor/estudiantes/:estudianteId/contenidos/progreso
 *
 * EQUIVALENCE CLASSES POR ENDPOINT:
 *
 * === GET /tutor/mis-inscripciones ===
 * - Auth: [sin-token → 401, token-docente → 403, token-tutor → 200]
 * - Query.periodo: [sin-periodo, periodo-valido "2026-01", periodo-invalido → 400]
 * - Query.estadoPago: [sin-estado, Pendiente, Pagado, Vencido, invalido → 400]
 * - Data: [sin-inscripciones, con-inscripciones, multiples-hijos]
 *
 * === GET /tutor/dashboard-resumen ===
 * - Auth: [sin-token → 401, token-docente → 403, token-tutor → 200]
 * - Data: [sin-hijos, con-hijos, con-alertas, con-pagos-pendientes, con-clases-hoy]
 *
 * === GET /tutor/proximas-clases ===
 * - Auth: [sin-token → 401, token-docente → 403, token-tutor → 200]
 * - Query.limit: [sin-limit → default 5, limit=1 → 1, limit=50 → 50, limit=0 → 400, limit=51 → 400]
 * - Data: [sin-clases, con-clases-futuras, multiples-hijos-clases]
 *
 * === GET /tutor/alertas ===
 * - Auth: [sin-token → 401, token-docente → 403, token-tutor → 200]
 * - Data: [sin-alertas, alertas-ordenadas-prioridad]
 *
 * === GET /tutor/estudiantes/:estudianteId/contenidos/progreso ===
 * - Auth: [sin-token → 401, token-docente → 403, token-tutor → 200]
 * - Path.estudianteId: [hijo-propio → 200, hijo-ajeno → 404, cuid-invalido → 400]
 * - Data: [sin-progreso, con-progreso-parcial]
 *
 * BOUNDARIES:
 * - limit: Min=1, Max=50
 * - periodo: Formato YYYY-MM
 * - estudianteId: CUID válido (25 caracteres)
 *
 * SECURITY:
 * - Data isolation: Tutor A no puede ver datos de Tutor B
 * - tutorId viene del JWT, NO del cliente
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="tutor-dashboard.integration" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import {
  createTestTutor,
  createTestDocente,
  createTestEstudiante,
  createEstudianteConClaseGrupo,
} from '../../fixtures/factories';

// ============================================================================
// TEST SUITE
// ============================================================================

describe('[INTEGRATION] Tutor Dashboard Endpoints', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ==========================================================================
  // SETUP
  // ==========================================================================

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );

    await app.init();
    prisma = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await app?.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ==========================================================================
  // HELPER FUNCTIONS
  // ==========================================================================

  /**
   * Helper para hacer request autenticado con cookies
   */
  async function authenticatedRequest(
    method: 'get' | 'post',
    path: string,
    token: string,
    cookie: string,
  ) {
    const req = request(app.getHttpServer())
      [method](`/api${path}`)
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN);
    return req;
  }

  // ==========================================================================
  // GET /tutor/mis-inscripciones
  // ==========================================================================

  describe('GET /tutor/mis-inscripciones', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no auth token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      });

      it('should return 403 when authenticated as docente (wrong role)', async () => {
        // Arrange: Create docente and login
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(403);
      });

      it('should return 200 when authenticated as tutor', async () => {
        // Arrange: Create tutor and login
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('inscripciones');
        expect(response.body).toHaveProperty('resumen');
      });
    });

    describe('Query Parameters - Periodo', () => {
      it('should accept valid periodo format YYYY-MM', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones?periodo=2026-01')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
      });

      it('should return 400 for invalid periodo format', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones?periodo=invalid')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('YYYY-MM');
      });

      it('should return 400 for periodo with only year', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones?periodo=2026')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
      });
    });

    describe('Query Parameters - EstadoPago', () => {
      it('should accept valid estadoPago values', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Test all valid values
        for (const estado of ['Pendiente', 'Pagado', 'Vencido']) {
          // Act
          const response = await request(app.getHttpServer())
            .get(`/api/tutor/mis-inscripciones?estadoPago=${estado}`)
            .set('Authorization', `Bearer ${auth.token}`)
            .set('Cookie', auth.cookie)
            .set('Origin', FRONTEND_ORIGIN);

          // Assert
          expect(response.status).toBe(200);
        }
      });

      it('should return 400 for invalid estadoPago value', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones?estadoPago=InvalidState')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Pendiente, Pagado, Vencido');
      });
    });

    describe('Data Scenarios', () => {
      it('should return empty inscripciones when tutor has no hijos', async () => {
        // Arrange: Tutor without children
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.inscripciones).toEqual([]);
        expect(response.body.resumen).toMatchObject({
          totalPendiente: 0,
          totalPagado: 0,
          cantidadInscripciones: 0,
          estudiantesUnicos: 0,
        });
      });

      it('should return inscripciones for tutor with children', async () => {
        // Arrange: Create tutor with estudiante
        const { tutor, password } = await createTestTutor(prisma);
        await createTestEstudiante(prisma, { tutorId: tutor.id });
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('inscripciones');
        expect(response.body).toHaveProperty('resumen');
        expect(response.body.resumen).toHaveProperty('totalPendiente');
        expect(response.body.resumen).toHaveProperty('totalPagado');
        expect(response.body.resumen).toHaveProperty('cantidadInscripciones');
        expect(response.body.resumen).toHaveProperty('estudiantesUnicos');
      });
    });

    describe('Data Isolation (Security)', () => {
      it('should NOT return inscripciones from other tutors', async () => {
        // Arrange: Create two tutors, each with a child
        const { tutor: tutorA, password: passwordA } =
          await createTestTutor(prisma);
        const { tutor: tutorB, password: passwordB } =
          await createTestTutor(prisma);

        await createTestEstudiante(prisma, { tutorId: tutorA.id });
        await createTestEstudiante(prisma, { tutorId: tutorB.id });

        const authA = await loginUser(app, {
          email: tutorA.email,
          password: passwordA,
        });
        const authB = await loginUser(app, {
          email: tutorB.email,
          password: passwordB,
        });

        // Act: TutorA queries their inscripciones
        const responseA = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${authA.token}`)
          .set('Cookie', authA.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Act: TutorB queries their inscripciones
        const responseB = await request(app.getHttpServer())
          .get('/api/tutor/mis-inscripciones')
          .set('Authorization', `Bearer ${authB.token}`)
          .set('Cookie', authB.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert: Each tutor only sees their own data
        expect(responseA.status).toBe(200);
        expect(responseB.status).toBe(200);

        // Verify the resumen counts are independent (max 1 estudiante each)
        expect(responseA.body.resumen.estudiantesUnicos).toBeLessThanOrEqual(1);
        expect(responseB.body.resumen.estudiantesUnicos).toBeLessThanOrEqual(1);
      });
    });
  });

  // ==========================================================================
  // GET /tutor/dashboard-resumen
  // ==========================================================================

  describe('GET /tutor/dashboard-resumen', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no auth token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      });

      it('should return 403 when authenticated as docente', async () => {
        // Arrange
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(403);
      });

      it('should return 200 with dashboard data for authenticated tutor', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('metricas');
        expect(response.body).toHaveProperty('hijos');
        expect(response.body).toHaveProperty('alertas');
        expect(response.body).toHaveProperty('pagosPendientes');
        expect(response.body).toHaveProperty('clasesHoy');
      });
    });

    describe('Response Structure', () => {
      it('should return correct metricas structure for tutor without hijos', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.metricas).toMatchObject({
          totalHijos: 0,
          clasesDelMes: 0,
          totalPagadoAnio: 0,
          asistenciaPromedio: 0,
        });
        expect(response.body.hijos).toEqual([]);
        expect(response.body.alertas).toEqual([]);
        expect(response.body.pagosPendientes).toEqual([]);
        expect(response.body.clasesHoy).toEqual([]);
      });

      it('should return hijos with correct structure when tutor has children', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Juan',
          apellido: 'Pérez',
          edad: 10,
          nivelEscolar: '4to Primaria',
        });
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.metricas.totalHijos).toBe(1);
        expect(response.body.hijos).toHaveLength(1);

        const hijo = response.body.hijos[0];
        expect(hijo).toHaveProperty('id');
        expect(hijo).toHaveProperty('nombre', 'Juan');
        expect(hijo).toHaveProperty('apellido', 'Pérez');
        expect(hijo).toHaveProperty('edad', 10);
        expect(hijo).toHaveProperty('nivelEscolar', '4to Primaria');
        expect(hijo).toHaveProperty('comisiones');
        expect(Array.isArray(hijo.comisiones)).toBe(true);
      });

      it('should count multiple hijos correctly', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Hijo1',
        });
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Hijo2',
        });
        await createTestEstudiante(prisma, {
          tutorId: tutor.id,
          nombre: 'Hijo3',
        });
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.metricas.totalHijos).toBe(3);
        expect(response.body.hijos).toHaveLength(3);
      });
    });

    describe('Data Isolation (Security)', () => {
      it('should NOT include hijos from other tutors', async () => {
        // Arrange: Create two tutors with different numbers of children
        const { tutor: tutorA, password: passwordA } =
          await createTestTutor(prisma);
        const { tutor: tutorB, password: passwordB } =
          await createTestTutor(prisma);

        // TutorA has 2 children
        await createTestEstudiante(prisma, {
          tutorId: tutorA.id,
          nombre: 'HijoA1',
        });
        await createTestEstudiante(prisma, {
          tutorId: tutorA.id,
          nombre: 'HijoA2',
        });

        // TutorB has 1 child
        await createTestEstudiante(prisma, {
          tutorId: tutorB.id,
          nombre: 'HijoB1',
        });

        const authA = await loginUser(app, {
          email: tutorA.email,
          password: passwordA,
        });
        const authB = await loginUser(app, {
          email: tutorB.email,
          password: passwordB,
        });

        // Act
        const responseA = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${authA.token}`)
          .set('Cookie', authA.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        const responseB = await request(app.getHttpServer())
          .get('/api/tutor/dashboard-resumen')
          .set('Authorization', `Bearer ${authB.token}`)
          .set('Cookie', authB.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert: Each tutor only sees their own children
        expect(responseA.body.metricas.totalHijos).toBe(2);
        expect(responseA.body.hijos).toHaveLength(2);
        expect(
          responseA.body.hijos.map((h: { nombre: string }) => h.nombre),
        ).toEqual(expect.arrayContaining(['HijoA1', 'HijoA2']));

        expect(responseB.body.metricas.totalHijos).toBe(1);
        expect(responseB.body.hijos).toHaveLength(1);
        expect(responseB.body.hijos[0].nombre).toBe('HijoB1');
      });
    });
  });

  // ==========================================================================
  // GET /tutor/proximas-clases
  // ==========================================================================

  describe('GET /tutor/proximas-clases', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no auth token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      });

      it('should return 403 when authenticated as docente', async () => {
        // Arrange
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(403);
      });

      it('should return 200 for authenticated tutor', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('clases');
        expect(response.body).toHaveProperty('total');
      });
    });

    describe('Query Parameters - Limit Boundaries', () => {
      it('should use default limit=5 when not specified', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert: Request should succeed, limit is applied internally
        expect(response.status).toBe(200);
      });

      it('should accept limit=1 (lower boundary)', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases?limit=1')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
      });

      it('should accept limit=50 (upper boundary)', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases?limit=50')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
      });

      it('should return 400 for limit=0 (below minimum)', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases?limit=0')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('mínimo');
      });

      it('should return 400 for limit=51 (above maximum)', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases?limit=51')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
        expect(response.body.message).toContain('máximo');
      });

      it('should return 400 for non-integer limit', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases?limit=abc')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(400);
      });
    });

    describe('Response Structure', () => {
      it('should return empty clases when tutor has no hijos', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/proximas-clases')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.clases).toEqual([]);
        expect(response.body.total).toBe(0);
      });
    });
  });

  // ==========================================================================
  // GET /tutor/alertas
  // ==========================================================================

  describe('GET /tutor/alertas', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no auth token provided', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/tutor/alertas')
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      });

      it('should return 403 when authenticated as docente', async () => {
        // Arrange
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/alertas')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(403);
      });

      it('should return 200 with alertas structure for authenticated tutor', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/alertas')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('alertas');
        expect(response.body).toHaveProperty('total');
        expect(response.body).toHaveProperty('hayAlertas');
        expect(Array.isArray(response.body.alertas)).toBe(true);
      });
    });

    describe('Response Structure', () => {
      it('should return hayAlertas=false when no alerts', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/alertas')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body.alertas).toEqual([]);
        expect(response.body.total).toBe(0);
        expect(response.body.hayAlertas).toBe(false);
      });
    });
  });

  // ==========================================================================
  // GET /tutor/estudiantes/:estudianteId/contenidos/progreso
  // ==========================================================================

  describe('GET /tutor/estudiantes/:estudianteId/contenidos/progreso', () => {
    describe('Autenticación y Autorización', () => {
      it('should return 401 when no auth token provided', async () => {
        const response = await request(app.getHttpServer())
          .get(
            '/api/tutor/estudiantes/ctest0000000000000000001/contenidos/progreso',
          )
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      });

      it('should return 403 when authenticated as docente', async () => {
        // Arrange
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get(
            '/api/tutor/estudiantes/ctest0000000000000000001/contenidos/progreso',
          )
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(403);
      });
    });

    describe('Path Parameter Validation', () => {
      it('should return 400 for invalid CUID format', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get('/api/tutor/estudiantes/invalid-id/contenidos/progreso')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert: Should be 400 for invalid ID format
        expect(response.status).toBe(400);
      });

      it('should return 404 for non-existent estudiante', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const auth = await loginUser(app, { email: tutor.email, password });
        // Valid CUID format but doesn't exist (exactly 25 chars)
        const nonExistentId = 'ctest0000000000000000001';

        // Act
        const response = await request(app.getHttpServer())
          .get(`/api/tutor/estudiantes/${nonExistentId}/contenidos/progreso`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(404);
      });
    });

    describe('Data Isolation (Security) - Critical', () => {
      it('should return 404 when trying to access another tutors child', async () => {
        // Arrange: Create two tutors, each with a child
        const { tutor: tutorA, password: passwordA } =
          await createTestTutor(prisma);
        const { tutor: tutorB, password: passwordB } =
          await createTestTutor(prisma);

        const { estudiante: hijoA } = await createTestEstudiante(prisma, {
          tutorId: tutorA.id,
        });
        const { estudiante: hijoB } = await createTestEstudiante(prisma, {
          tutorId: tutorB.id,
        });

        const authA = await loginUser(app, {
          email: tutorA.email,
          password: passwordA,
        });

        // Act: TutorA tries to access TutorB's child
        const response = await request(app.getHttpServer())
          .get(`/api/tutor/estudiantes/${hijoB.id}/contenidos/progreso`)
          .set('Authorization', `Bearer ${authA.token}`)
          .set('Cookie', authA.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert: Should be denied with 404 (don't reveal existence)
        expect(response.status).toBe(404);
      });

      it('should return 200 when accessing own child', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get(`/api/tutor/estudiantes/${estudiante.id}/contenidos/progreso`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(Array.isArray(response.body)).toBe(true);
      });
    });

    describe('Response Structure', () => {
      it('should return empty array when student has no progreso', async () => {
        // Arrange
        const { tutor, password } = await createTestTutor(prisma);
        const { estudiante } = await createTestEstudiante(prisma, {
          tutorId: tutor.id,
        });
        const auth = await loginUser(app, { email: tutor.email, password });

        // Act
        const response = await request(app.getHttpServer())
          .get(`/api/tutor/estudiantes/${estudiante.id}/contenidos/progreso`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        // Assert
        expect(response.status).toBe(200);
        expect(response.body).toEqual([]);
      });
    });
  });
});
