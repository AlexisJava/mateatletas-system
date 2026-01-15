/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST
 * ============================================================================
 *
 * SISTEMA CASA/MUNDO 2026 - Asignaciones de Docentes
 *
 * ENDPOINTS BAJO TEST:
 * - POST   /api/admin/docentes/:docenteId/casas           - Asignar casa
 * - DELETE /api/admin/docentes/:docenteId/casas/:casaTipo - Remover casa
 * - GET    /api/admin/docentes/:docenteId/casas           - Obtener casas
 * - GET    /api/admin/casas/:casaTipo/docentes            - Listar docentes por casa
 * - POST   /api/admin/docentes/:docenteId/mundos          - Asignar mundo
 * - DELETE /api/admin/docentes/:docenteId/mundos/:mundoTipo - Remover mundo
 * - GET    /api/admin/docentes/:docenteId/mundos          - Obtener mundos
 * - GET    /api/admin/mundos/:mundoTipo/docentes          - Listar docentes por mundo
 * - GET    /api/admin/docentes/:docenteId/asignaciones    - Perfil completo
 * - GET    /api/admin/docentes/filtrados                  - Listar con filtros
 *
 * EQUIVALENCE CLASSES:
 * Auth:
 * - [ADMIN]: usuario admin autenticado → 200/201
 * - [DOCENTE]: usuario docente → 403
 * - [ESTUDIANTE]: usuario estudiante → 403
 * - [NO-AUTH]: sin token → 401
 *
 * Docente:
 * - [EXISTE]: docente válido en DB
 * - [NO-EXISTE]: UUID válido pero no existe → 404
 * - [INVALID-ID]: formato inválido → 400
 *
 * CasaTipo/MundoTipo:
 * - [VALIDO]: QUANTUM, VERTEX, PULSAR / MATEMATICA, PROGRAMACION, CIENCIAS
 * - [INVALIDO]: cualquier otro valor → 400
 *
 * Asignación existente:
 * - [NUEVA]: docente no tiene esa casa/mundo
 * - [DUPLICADA]: docente ya tiene esa casa/mundo → idempotente o error
 *
 * BOUNDARIES:
 * - Docente sin asignaciones → arrays vacíos
 * - Docente con 1 asignación
 * - Docente con 3 casas (máximo) y 3 mundos (máximo)
 *
 * STATE TRANSITIONS:
 * - SIN_CASA → asignar → CON_CASA
 * - CON_CASA → asignar_misma → CON_CASA (idempotente)
 * - CON_CASA → remover → SIN_CASA
 * - SIN_CASA → remover → SIN_CASA (no error)
 *
 * ERROR GUESSING:
 * - Asignar casa a docente inexistente
 * - Remover casa que no tiene
 * - Valores de enum inválidos
 * - IDs con formato incorrecto
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="casa-mundo-asignaciones" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import {
  createTestDocente,
  createTestAdmin,
} from '../../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sistema Casa/Mundo 2026 - Asignaciones Docente', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // SETUP
  // ============================================================================
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
  // HELPER: Login admin
  // ============================================================================
  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  // ============================================================================
  // TESTS: POST /api/admin/docentes/:docenteId/casas - Asignar Casa
  // ============================================================================
  describe('POST /api/admin/docentes/:docenteId/casas', () => {
    describe('Equivalence Partitioning: Autenticación', () => {
      it('Clase ADMIN: debe asignar casa correctamente', async () => {
        // ARRANGE
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        // ACT
        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        // ASSERT
        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('casa_tipo', 'QUANTUM');
        expect(response.body).toHaveProperty('docente_id', docente.id);

        // Verificar en DB
        const enDB = await prisma.docenteCasa.findFirst({
          where: { docente_id: docente.id, casa_tipo: 'QUANTUM' },
        });
        expect(enDB).toBeDefined();
      });

      it('Clase NO-AUTH: debe retornar 401', async () => {
        const { docente } = await createTestDocente(prisma);

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', generateUniqueIP())
          .send({ casa_tipo: 'QUANTUM' });

        expect(response.status).toBe(401);
      });

      it('Clase DOCENTE: debe retornar 403', async () => {
        const { docente, password } = await createTestDocente(prisma);
        const auth = await loginUser(app, { email: docente.email, password });

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        expect(response.status).toBe(403);
      });
    });

    describe('Equivalence Partitioning: Docente', () => {
      it('Clase EXISTE: debe asignar exitosamente', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'VERTEX' });

        expect(response.status).toBe(201);
      });

      it('Clase NO-EXISTE: debe retornar 404', async () => {
        const auth = await loginAsAdmin();
        const fakeId = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'; // CUID válido pero no existe

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${fakeId}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        expect(response.status).toBe(404);
      });

      it('Clase INVALID-ID: debe retornar 400', async () => {
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post('/api/admin/docentes/not-a-valid-id/casas')
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        expect(response.status).toBe(400);
      });
    });

    describe('Equivalence Partitioning: CasaTipo', () => {
      it('Clase VALIDO (QUANTUM): debe asignar', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        expect(response.status).toBe(201);
      });

      it('Clase VALIDO (VERTEX): debe asignar', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'VERTEX' });

        expect(response.status).toBe(201);
      });

      it('Clase VALIDO (PULSAR): debe asignar', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'PULSAR' });

        expect(response.status).toBe(201);
      });

      it('Clase INVALIDO: debe retornar 400', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'CASA_INVALIDA' });

        expect(response.status).toBe(400);
      });
    });

    describe('State Transitions: Asignación', () => {
      it('Transición SIN_CASA → asignar → CON_CASA', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        // Verificar estado inicial
        const casasAntes = await prisma.docenteCasa.findMany({
          where: { docente_id: docente.id },
        });
        expect(casasAntes).toHaveLength(0);

        // Asignar
        await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        // Verificar estado final
        const casasDespues = await prisma.docenteCasa.findMany({
          where: { docente_id: docente.id },
        });
        expect(casasDespues).toHaveLength(1);
        expect(casasDespues[0].casa_tipo).toBe('QUANTUM');
      });

      it('Transición CON_CASA → asignar_misma → CON_CASA (idempotente o error controlado)', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        // Primera asignación
        await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        // Segunda asignación (misma casa) - puede ser idempotente (200) o error (409)
        const response = await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/casas`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ casa_tipo: 'QUANTUM' });

        // Aceptamos tanto idempotencia (201/200) como conflicto (409)
        expect([200, 201, 409]).toContain(response.status);

        // Verificar que sigue habiendo exactamente 1 asignación
        const casas = await prisma.docenteCasa.findMany({
          where: { docente_id: docente.id, casa_tipo: 'QUANTUM' },
        });
        expect(casas).toHaveLength(1);
      });
    });

    describe('Boundary: Múltiples casas', () => {
      it('Docente puede tener las 3 casas', async () => {
        const { docente } = await createTestDocente(prisma);
        const auth = await loginAsAdmin();

        // Asignar las 3 casas
        for (const casa of ['QUANTUM', 'VERTEX', 'PULSAR']) {
          await request(app.getHttpServer())
            .post(`/api/admin/docentes/${docente.id}/casas`)
            .set('Authorization', `Bearer ${auth.token}`)
            .set('Cookie', auth.cookie)
            .set('Origin', FRONTEND_ORIGIN)
            .send({ casa_tipo: casa });
        }

        // Verificar
        const casas = await prisma.docenteCasa.findMany({
          where: { docente_id: docente.id },
        });
        expect(casas).toHaveLength(3);
      });
    });
  });

  // ============================================================================
  // TESTS: DELETE /api/admin/docentes/:docenteId/casas/:casaTipo - Remover Casa
  // ============================================================================
  describe('DELETE /api/admin/docentes/:docenteId/casas/:casaTipo', () => {
    it('Clase ADMIN-CON-ASIGNACION: debe remover casa', async () => {
      // ARRANGE - Crear docente con casa asignada
      const { docente } = await createTestDocente(prisma);
      await prisma.docenteCasa.create({
        data: { docente_id: docente.id, casa_tipo: 'QUANTUM' },
      });
      const auth = await loginAsAdmin();

      // ACT
      const response = await request(app.getHttpServer())
        .delete(`/api/admin/docentes/${docente.id}/casas/QUANTUM`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);

      // Verificar en DB
      const enDB = await prisma.docenteCasa.findFirst({
        where: { docente_id: docente.id, casa_tipo: 'QUANTUM' },
      });
      expect(enDB).toBeNull();
    });

    it('Clase ADMIN-SIN-ASIGNACION: debe manejar graciosamente (200 o 404)', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/docentes/${docente.id}/casas/QUANTUM`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Puede ser 200 (idempotente) o 404 (no encontrado)
      expect([200, 404]).toContain(response.status);
    });

    it('Clase NO-AUTH: debe retornar 401', async () => {
      const { docente } = await createTestDocente(prisma);

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/docentes/${docente.id}/casas/QUANTUM`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP());

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/docentes/:docenteId/casas - Obtener Casas
  // ============================================================================
  describe('GET /api/admin/docentes/:docenteId/casas', () => {
    it('Boundary: Docente sin casas → array vacío', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get(`/api/admin/docentes/${docente.id}/casas`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(0);
    });

    it('Boundary: Docente con 2 casas → array con 2 elementos', async () => {
      const { docente } = await createTestDocente(prisma);
      await prisma.docenteCasa.createMany({
        data: [
          { docente_id: docente.id, casa_tipo: 'QUANTUM' },
          { docente_id: docente.id, casa_tipo: 'VERTEX' },
        ],
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get(`/api/admin/docentes/${docente.id}/casas`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/casas/:casaTipo/docentes - Listar Docentes por Casa
  // ============================================================================
  describe('GET /api/admin/casas/:casaTipo/docentes', () => {
    it('Debe retornar docentes asignados a QUANTUM', async () => {
      // ARRANGE - Crear 2 docentes, solo 1 en QUANTUM
      const { docente: docente1 } = await createTestDocente(prisma, {
        nombre: 'Docente1',
      });
      const { docente: docente2 } = await createTestDocente(prisma, {
        nombre: 'Docente2',
      });
      await prisma.docenteCasa.create({
        data: { docente_id: docente1.id, casa_tipo: 'QUANTUM' },
      });
      await prisma.docenteCasa.create({
        data: { docente_id: docente2.id, casa_tipo: 'VERTEX' },
      });
      const auth = await loginAsAdmin();

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/admin/casas/QUANTUM/docentes')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
      expect(response.body[0].docente_id).toBe(docente1.id);
    });

    it('Boundary: Casa sin docentes → array vacío', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/casas/PULSAR/docentes')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });

    it('CasaTipo inválido → 400', async () => {
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/casas/INVALID/docentes')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: POST /api/admin/docentes/:docenteId/mundos - Asignar Mundo
  // ============================================================================
  describe('POST /api/admin/docentes/:docenteId/mundos', () => {
    it('Clase ADMIN: debe asignar mundo correctamente', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/mundos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ mundo_tipo: 'MATEMATICA' });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('mundo_tipo', 'MATEMATICA');

      // Verificar en DB
      const enDB = await prisma.docenteMundo.findFirst({
        where: { docente_id: docente.id, mundo_tipo: 'MATEMATICA' },
      });
      expect(enDB).toBeDefined();
    });

    it('Clase VALIDO (PROGRAMACION): debe asignar', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/mundos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ mundo_tipo: 'PROGRAMACION' });

      expect(response.status).toBe(201);
    });

    it('Clase VALIDO (CIENCIAS): debe asignar', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/mundos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ mundo_tipo: 'CIENCIAS' });

      expect(response.status).toBe(201);
    });

    it('Clase INVALIDO: debe retornar 400', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/mundos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ mundo_tipo: 'MUNDO_INVALIDO' });

      expect(response.status).toBe(400);
    });

    it('Docente puede tener los 3 mundos', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      for (const mundo of ['MATEMATICA', 'PROGRAMACION', 'CIENCIAS']) {
        await request(app.getHttpServer())
          .post(`/api/admin/docentes/${docente.id}/mundos`)
          .set('Authorization', `Bearer ${auth.token}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ mundo_tipo: mundo });
      }

      const mundos = await prisma.docenteMundo.findMany({
        where: { docente_id: docente.id },
      });
      expect(mundos).toHaveLength(3);
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/docentes/:docenteId/asignaciones - Perfil Completo
  // ============================================================================
  describe('GET /api/admin/docentes/:docenteId/asignaciones', () => {
    it('Debe retornar perfil completo con casas y mundos', async () => {
      // ARRANGE
      const { docente } = await createTestDocente(prisma);
      await prisma.docenteCasa.createMany({
        data: [
          { docente_id: docente.id, casa_tipo: 'QUANTUM' },
          { docente_id: docente.id, casa_tipo: 'VERTEX' },
        ],
      });
      await prisma.docenteMundo.create({
        data: { docente_id: docente.id, mundo_tipo: 'MATEMATICA' },
      });
      const auth = await loginAsAdmin();

      // ACT
      const response = await request(app.getHttpServer())
        .get(`/api/admin/docentes/${docente.id}/asignaciones`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', docente.id);
      expect(response.body).toHaveProperty('casas');
      expect(response.body).toHaveProperty('mundos');
      expect(response.body.casas).toHaveLength(2);
      expect(response.body.mundos).toHaveLength(1);
    });

    it('Docente sin asignaciones → arrays vacíos', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get(`/api/admin/docentes/${docente.id}/asignaciones`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body.casas).toHaveLength(0);
      expect(response.body.mundos).toHaveLength(0);
    });
  });

  // ============================================================================
  // TESTS: GET /api/admin/docentes/filtrados - Listar con Filtros
  // ============================================================================
  describe('GET /api/admin/docentes/filtrados', () => {
    it('Sin filtros → retorna todos los docentes con asignaciones', async () => {
      const { docente: d1 } = await createTestDocente(prisma);
      const { docente: d2 } = await createTestDocente(prisma);
      await prisma.docenteCasa.create({
        data: { docente_id: d1.id, casa_tipo: 'QUANTUM' },
      });
      await prisma.docenteMundo.create({
        data: { docente_id: d2.id, mundo_tipo: 'MATEMATICA' },
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/docentes/filtrados')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('Filtro por casa_tipo=QUANTUM → solo docentes de QUANTUM', async () => {
      const { docente: d1 } = await createTestDocente(prisma);
      const { docente: d2 } = await createTestDocente(prisma);
      await prisma.docenteCasa.create({
        data: { docente_id: d1.id, casa_tipo: 'QUANTUM' },
      });
      await prisma.docenteCasa.create({
        data: { docente_id: d2.id, casa_tipo: 'VERTEX' },
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/docentes/filtrados?casa_tipo=QUANTUM')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
      // Todos los resultados deben tener QUANTUM en casas
      for (const docente of response.body) {
        const tieneQuantum = docente.casas?.some(
          (c: { casa_tipo: string }) => c.casa_tipo === 'QUANTUM',
        );
        expect(tieneQuantum).toBe(true);
      }
    });

    it('Filtro por mundo_tipo=PROGRAMACION', async () => {
      const { docente: d1 } = await createTestDocente(prisma);
      await prisma.docenteMundo.create({
        data: { docente_id: d1.id, mundo_tipo: 'PROGRAMACION' },
      });
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/docentes/filtrados?mundo_tipo=PROGRAMACION')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(200);
    });
  });

  // ============================================================================
  // ERROR GUESSING
  // ============================================================================
  describe('Error Guessing', () => {
    it('Body vacío al asignar casa → 400', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/casas`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(response.status).toBe(400);
    });

    it('Campo extra no esperado → debe ignorar o rechazar', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .post(`/api/admin/docentes/${docente.id}/casas`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ casa_tipo: 'QUANTUM', campo_extra: 'malicioso' });

      // Con forbidNonWhitelisted debería ser 400
      expect([201, 400]).toContain(response.status);
    });
  });
});
