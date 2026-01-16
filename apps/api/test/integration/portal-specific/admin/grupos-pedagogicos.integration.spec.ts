/**
 * ============================================================================
 * ADMIN GRUPOS PEDAGOGICOS INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINTS:
 * - GET /admin/grupos-pedagogicos → Listar grupos con filtros
 * - GET /admin/grupos-pedagogicos/:id → Obtener grupo por ID
 * - PATCH /admin/grupos-pedagogicos/:id → Actualizar casa/mundo
 * - GET /admin/grupos-pedagogicos/estadisticas → Estadísticas por casa/mundo
 * - POST /admin/grupos-pedagogicos/migrar-legacy → Migrar grupos legacy
 *
 * EQUIVALENCE CLASSES:
 *
 * GET /admin/grupos-pedagogicos:
 * - CE1: Sin filtros → Lista todos los grupos activos
 * - CE2: Filtro por casa_tipo → Solo de esa casa
 * - CE3: Filtro por mundo_tipo → Solo de ese mundo
 * - CE4: Filtro por activo=false → Solo inactivos
 *
 * GET /admin/grupos-pedagogicos/:id:
 * - CE5: ID existente → Grupo con claseGrupos y comisiones
 * - CE6: ID no existente → 404
 *
 * PATCH /admin/grupos-pedagogicos/:id:
 * - CE7: Actualizar casa_tipo y mundo_tipo → 200
 * - CE8: ID no existente → 404
 *
 * GET /admin/grupos-pedagogicos/estadisticas:
 * - CE9: Retorna totales por casa y mundo
 *
 * Security:
 * - CE10: No autenticado → 401
 * - CE11: Docente → 403
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn test:integration -- --testPathPattern="grupos-pedagogicos"
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import {
  createTestAdmin,
  createTestDocente,
} from '../../../fixtures/factories';
import { DEFAULT_PASSWORD } from '../../../fixtures/factories/usuario.factory';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import { loginUser } from '../../../helpers/auth.helpers';

describe('[INTEGRATION] Admin Grupos Pedagógicos (BBT)', () => {
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
  // HELPER: Crear grupo pedagógico de test
  // ============================================================================
  async function createTestGrupoPedagogico(options: {
    codigo: string;
    nombre?: string;
    casa_tipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR';
    mundo_tipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
    activo?: boolean;
  }) {
    return prisma.grupoPedagogico.create({
      data: {
        codigo: options.codigo,
        nombre: options.nombre ?? `Grupo ${options.codigo}`,
        casa_tipo: options.casa_tipo ?? null,
        mundo_tipo: options.mundo_tipo ?? null,
        activo: options.activo ?? true,
      },
    });
  }

  // ============================================================================
  // CE1-CE4: GET /admin/grupos-pedagogicos - Listado con filtros
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos', () => {
    it('CE1: should list all active grupos without filters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestGrupoPedagogico({
        codigo: 'GP-001',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-002',
        casa_tipo: 'VERTEX',
        mundo_tipo: 'PROGRAMACION',
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2);
    });

    it('CE2: should filter by casa_tipo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestGrupoPedagogico({
        codigo: 'GP-Q1',
        casa_tipo: 'QUANTUM',
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-V1',
        casa_tipo: 'VERTEX',
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos?casa_tipo=QUANTUM')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          (g: { casa_tipo: string }) => g.casa_tipo === 'QUANTUM',
        ),
      ).toBe(true);
    });

    it('CE3: should filter by mundo_tipo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestGrupoPedagogico({
        codigo: 'GP-M1',
        mundo_tipo: 'MATEMATICA',
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-P1',
        mundo_tipo: 'PROGRAMACION',
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos?mundo_tipo=MATEMATICA')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every(
          (g: { mundo_tipo: string }) => g.mundo_tipo === 'MATEMATICA',
        ),
      ).toBe(true);
    });

    it('CE4: should filter by activo=false', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestGrupoPedagogico({
        codigo: 'GP-ACT',
        activo: true,
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-INACT',
        activo: false,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos?activo=false')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(
        response.body.every((g: { activo: boolean }) => g.activo === false),
      ).toBe(true);
    });
  });

  // ============================================================================
  // CE5-CE6: GET /admin/grupos-pedagogicos/:id
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos/:id', () => {
    it('CE5: should return grupo with claseGrupos and comisiones when ID exists', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const grupo = await createTestGrupoPedagogico({
        codigo: 'GP-DET',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/admin/grupos-pedagogicos/${grupo.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(grupo.id);
      expect(response.body.codigo).toBe('GP-DET');
      expect(response.body.casa_tipo).toBe('QUANTUM');
      expect(response.body.mundo_tipo).toBe('MATEMATICA');
      // Debe incluir relaciones
      expect(response.body).toHaveProperty('claseGrupos');
      expect(response.body).toHaveProperty('comisionesProducto');
    });

    it('CE6: should return 404 when ID does not exist', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(
          '/api/admin/grupos-pedagogicos/00000000-0000-0000-0000-000000000000',
        )
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CE7-CE8: PATCH /admin/grupos-pedagogicos/:id
  // ============================================================================
  describe('PATCH /api/admin/grupos-pedagogicos/:id', () => {
    it('CE7: should update casa_tipo and mundo_tipo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const grupo = await createTestGrupoPedagogico({
        codigo: 'GP-UPD',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/admin/grupos-pedagogicos/${grupo.id}`)
        .set('Cookie', auth.cookie)
        .send({
          casa_tipo: 'VERTEX',
          mundo_tipo: 'PROGRAMACION',
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.casa_tipo).toBe('VERTEX');
      expect(response.body.mundo_tipo).toBe('PROGRAMACION');

      // Verificar en DB
      const updated = await prisma.grupoPedagogico.findUnique({
        where: { id: grupo.id },
      });
      expect(updated?.casa_tipo).toBe('VERTEX');
      expect(updated?.mundo_tipo).toBe('PROGRAMACION');
    });

    it('CE8: should return 404 when updating non-existent grupo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(
          '/api/admin/grupos-pedagogicos/00000000-0000-0000-0000-000000000000',
        )
        .set('Cookie', auth.cookie)
        .send({
          casa_tipo: 'VERTEX',
        });

      // Assert
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CE9: GET /admin/grupos-pedagogicos/estadisticas
  // ============================================================================
  describe('GET /api/admin/grupos-pedagogicos/estadisticas', () => {
    it('CE9: should return statistics by casa and mundo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Crear grupos con diferentes casas y mundos
      await createTestGrupoPedagogico({
        codigo: 'GP-EST1',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'MATEMATICA',
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-EST2',
        casa_tipo: 'QUANTUM',
        mundo_tipo: 'PROGRAMACION',
      });
      await createTestGrupoPedagogico({
        codigo: 'GP-EST3',
        casa_tipo: 'VERTEX',
        mundo_tipo: 'MATEMATICA',
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos/estadisticas')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('total_grupos');
      expect(response.body).toHaveProperty('por_casa');
      expect(response.body).toHaveProperty('por_mundo');
      expect(Array.isArray(response.body.por_casa)).toBe(true);
      expect(Array.isArray(response.body.por_mundo)).toBe(true);
    });
  });

  // ============================================================================
  // CE10-CE11: Security - Access Control
  // ============================================================================
  describe('Security: Access Control', () => {
    it('CE10: should return 401 when not authenticated', async () => {
      // Act - Ejecutar secuencialmente para evitar ECONNRESET
      const r1 = await request(app.getHttpServer()).get(
        '/api/admin/grupos-pedagogicos',
      );
      const r2 = await request(app.getHttpServer()).get(
        '/api/admin/grupos-pedagogicos/00000000-0000-0000-0000-000000000000',
      );
      const r3 = await request(app.getHttpServer())
        .patch(
          '/api/admin/grupos-pedagogicos/00000000-0000-0000-0000-000000000000',
        )
        .send({ casa_tipo: 'QUANTUM' });
      const r4 = await request(app.getHttpServer()).get(
        '/api/admin/grupos-pedagogicos/estadisticas',
      );

      // Assert
      expect(r1.status).toBe(401);
      expect(r2.status).toBe(401);
      expect(r3.status).toBe(401);
      expect(r4.status).toBe(401);
    });

    it('CE11: should return 403 when user is docente', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act - Ejecutar secuencialmente para evitar ECONNRESET
      const r1 = await request(app.getHttpServer())
        .get('/api/admin/grupos-pedagogicos')
        .set('Cookie', auth.cookie);
      const r2 = await request(app.getHttpServer())
        .get(
          '/api/admin/grupos-pedagogicos/00000000-0000-0000-0000-000000000000',
        )
        .set('Cookie', auth.cookie);

      // Assert
      expect(r1.status).toBe(403);
      expect(r2.status).toBe(403);
    });
  });
});
