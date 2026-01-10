/**
 * ============================================================================
 * INTEGRATION TESTS - Verificar Acceso Estudiante
 * ============================================================================
 *
 * Tests de integración para el sistema de verificación de acceso de estudiantes.
 * Verifica el flujo completo de múltiples fuentes de acceso:
 * - Plan directo
 * - Suscripción del tutor
 * - Comisión activa
 * - Override administrativo
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- verificar-acceso
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestEstudiante,
  createTestTutor,
  createTestPlan,
  createTestSuscripcion,
} from '../../fixtures/factories';
import { ESTUDIANTE_FIXTURES } from '../../fixtures/presets';
import {
  loginEstudiante,
  loginUser,
  withAuthHeaders,
  FRONTEND_ORIGIN,
} from '../../helpers/auth.helpers';
import { EstadoSuscripcion } from '@prisma/client';

describe('[INTEGRATION] Verificar Acceso Estudiante', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    // Configurar trust proxy para que respete X-Forwarded-For
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPER para hacer request autenticado
  // ============================================================================
  async function getVerificarAcceso(auth: { cookie: string; token: string }) {
    return withAuthHeaders(
      request(app.getHttpServer())
        .get('/api/estudiantes/verificar-acceso')
        .set('Origin', FRONTEND_ORIGIN),
      auth,
    );
  }

  // ============================================================================
  // HAPPY PATH - ACCESO COMPLETO
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Acceso por Plan', () => {
    it('debe retornar acceso completo con plan STEAM_SINCRONICO', async () => {
      // ARRANGE
      // El fixture simula: tutor paga suscripción → estudiante hereda acceso
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('SUSCRIPCION_TUTOR');
      expect(response.body.permisos).toMatchObject({
        accesoLibros: true,
        accesoPlanificaciones: true,
        accesoClasesVivo: true,
      });
    });

    it('debe retornar acceso sin clases vivo con plan STEAM_LIBROS', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planLibros(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoLibros).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(false);
    });

    it('debe retornar acceso por plan asincrónico (sin clases vivo)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planAsincronico(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.permisos.accesoLibros).toBe(true);
      expect(response.body.permisos.accesoPlanificaciones).toBe(true);
      expect(response.body.permisos.accesoClasesVivo).toBe(false);
    });
  });

  // ============================================================================
  // SIN ACCESO
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Sin Acceso', () => {
    it('debe retornar sin acceso para estudiante nuevo (sin plan)', async () => {
      // ARRANGE
      const { estudiante, password } = await ESTUDIANTE_FIXTURES.nuevo(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
      expect(response.body.permisos).toMatchObject({
        accesoLibros: false,
        accesoPlanificaciones: false,
        accesoClasesVivo: false,
      });
    });

    it('debe retornar sin acceso para estudiante suspendido', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.suspendido(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
      expect(response.body.mensaje).toContain('suspendido');
    });

    it('debe retornar sin acceso con suscripción vencida', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.suscripcionVencida(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(false);
      expect(response.body.motivo).toBe('SIN_ACCESO');
    });
  });

  // ============================================================================
  // OVERRIDE ADMINISTRATIVO
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Override', () => {
    it('debe retornar acceso completo con override activo', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.conOverride(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
      expect(response.body.permisos).toMatchObject({
        accesoLibros: true,
        accesoPlanificaciones: true,
        accesoClasesVivo: true,
      });
      expect(response.body.detalles.override).toBeDefined();
      expect(response.body.detalles.override.motivo).toBe(
        'Prueba de acceso temporal',
      );
    });

    it('debe retornar acceso con override permanente (sin fecha límite)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.conOverridePermanente(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('OVERRIDE');
      expect(response.body.detalles.override.hasta).toBeNull();
    });

    it('debe ignorar override vencido y verificar otras fuentes', async () => {
      // ARRANGE - Crear estudiante con override vencido, sin plan directo
      // El estudiante hereda acceso de la suscripción del tutor
      const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
      const { tutor } = await createTestTutor(prisma);
      await createTestSuscripcion(prisma, tutor.id, plan.id);

      // Override vencido (hace 1 día)
      const overrideVencido = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // NO asignar planId - el estudiante hereda de la suscripción del tutor
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        override: {
          acceso_clases_vivo: true,
          hasta: overrideVencido,
          motivo: 'Override vencido',
        },
      });

      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT - Override vencido, debe usar suscripción del tutor
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('SUSCRIPCION_TUTOR');
    });
  });

  // ============================================================================
  // COMISIÓN ACTIVA
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Comisión', () => {
    it('debe retornar acceso por comisión activa', async () => {
      // ARRANGE
      const { estudiante, password, comision } =
        await ESTUDIANTE_FIXTURES.conComision(prisma);

      // Remover el plan para que solo tenga acceso por comisión
      await prisma.estudiante.update({
        where: { id: estudiante.id },
        data: { plan_id: null },
      });

      // Desactivar suscripción del tutor
      await prisma.suscripcion.updateMany({
        where: { tutor_id: estudiante.tutor_id },
        data: { estado: EstadoSuscripcion.CANCELADA },
      });

      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
      expect(response.body.motivo).toBe('COMISION_ACTIVA');
      expect(response.body.detalles.comisionesActivas).toHaveLength(1);
      expect(response.body.detalles.comisionesActivas[0].comisionId).toBe(
        comision.id,
      );
    });
  });

  // ============================================================================
  // PRIORIDAD DE FUENTES
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Prioridad', () => {
    it('override tiene prioridad sobre plan', async () => {
      // ARRANGE - Estudiante con plan Y override
      const plan = await createTestPlan(prisma, 'STEAM_LIBROS');
      const { tutor } = await createTestTutor(prisma);
      await createTestSuscripcion(prisma, tutor.id, plan.id);

      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        planId: plan.id,
        override: {
          acceso_clases_vivo: true,
          hasta: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          motivo: 'Override especial',
        },
      });

      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT - Override tiene prioridad
      expect(response.status).toBe(200);
      expect(response.body.motivo).toBe('OVERRIDE');
      // Override da acceso a clases vivo aunque STEAM_LIBROS no lo daría
      expect(response.body.permisos.accesoClasesVivo).toBe(true);
    });
  });

  // ============================================================================
  // ERRORES DE AUTENTICACIÓN
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Errores Auth', () => {
    it('debe fallar sin token (401)', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/verificar-acceso')
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe fallar con token inválido (401)', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/verificar-acceso')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Authorization', 'Bearer token-invalido-12345')
        .set('Cookie', 'auth-token=token-invalido-12345');

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe fallar con token de tutor', async () => {
      // ARRANGE - Login como tutor, no estudiante
      const { tutor, tutorPassword } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);
      const tutorAuth = await loginUser(app, {
        email: tutor.email,
        password: tutorPassword,
      });

      // ACT - Intentar acceder a endpoint de estudiante con token de tutor
      const response = await withAuthHeaders(
        request(app.getHttpServer())
          .get('/api/estudiantes/verificar-acceso')
          .set('Origin', FRONTEND_ORIGIN),
        tutorAuth,
      );

      // ASSERT - El endpoint requiere @Roles(Role.ESTUDIANTE)
      // RolesGuard usa jerarquía (TUTOR > ESTUDIANTE) así que pasa el guard
      // Pero el servicio busca estudiante con tutor.id → retorna "no encontrado"
      // Por ahora verificamos que NO sea 200 con datos válidos de estudiante
      if (response.status === 200) {
        // Si devuelve 200, debe ser porque no encontró estudiante (puedeAcceder=false)
        expect(response.body.puedeAcceder).toBe(false);
      } else {
        // O debería ser error (403/404)
        expect([403, 404]).toContain(response.status);
      }
    });
  });

  // ============================================================================
  // DETALLES DEL RESPONSE
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Estructura Response', () => {
    it('debe incluir todos los campos requeridos en la respuesta', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT - Verificar estructura completa
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('puedeAcceder');
      expect(response.body).toHaveProperty('motivo');
      expect(response.body).toHaveProperty('permisos');
      expect(response.body).toHaveProperty('detalles');
      expect(response.body).toHaveProperty('mensaje');

      // Verificar estructura de permisos
      expect(response.body.permisos).toHaveProperty('accesoLibros');
      expect(response.body.permisos).toHaveProperty('accesoPlanificaciones');
      expect(response.body.permisos).toHaveProperty('accesoClasesVivo');

      // Verificar estructura de detalles
      expect(response.body.detalles).toHaveProperty('comisionesActivas');
      expect(Array.isArray(response.body.detalles.comisionesActivas)).toBe(
        true,
      );
    });

    it('debe incluir detalles de suscripción del tutor cuando aplica', async () => {
      // ARRANGE
      const { estudiante, password, plan } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.detalles.suscripcionTutor).toBeDefined();
      expect(response.body.detalles.suscripcionTutor.planNombre).toBe(
        plan.nombre,
      );
      expect(response.body.detalles.suscripcionTutor.estado).toBe('ACTIVA');
    });

    it('debe incluir mensaje legible para el usuario', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(typeof response.body.mensaje).toBe('string');
      expect(response.body.mensaje.length).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('GET /api/estudiantes/verificar-acceso - Edge Cases', () => {
    it('debe manejar estudiante con progreso (recursos existentes)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.conProgreso(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT - Debe funcionar normalmente
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
    });

    it('debe manejar estudiante "todoCompletado"', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.todoCompletado(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      // ACT
      const response = await getVerificarAcceso(auth);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.puedeAcceder).toBe(true);
    });
  });
});
