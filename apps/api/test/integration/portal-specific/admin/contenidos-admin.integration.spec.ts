/**
 * ============================================================================
 * ADMIN CONTENIDOS INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINTS:
 * - POST /contenidos → Crear contenido como BORRADOR
 * - GET /contenidos → Listar contenidos con filtros
 * - GET /contenidos/:id → Obtener contenido con nodos
 * - GET /contenidos/:id/arbol → Obtener árbol jerárquico de nodos
 * - PATCH /contenidos/:id → Actualizar contenido (solo BORRADOR)
 * - DELETE /contenidos/:id → Eliminar contenido (solo BORRADOR)
 * - POST /contenidos/:id/publicar → Publicar contenido
 * - POST /contenidos/:id/archivar → Archivar contenido
 * - POST /contenidos/:id/nodos → Agregar nodo
 * - PATCH /contenidos/nodos/:nodoId → Actualizar nodo
 * - DELETE /contenidos/nodos/:nodoId → Eliminar nodo
 * - PATCH /contenidos/:id/nodos/reordenar → Reordenar nodos
 *
 * EQUIVALENCE CLASSES:
 *
 * POST /contenidos:
 * - CE1: Admin crea contenido válido → 201 + BORRADOR
 * - CE2: Título inválido (vacío) → 400
 * - CE3: CasaTipo inválido → 400
 * - CE4: MundoTipo inválido → 400
 * - CE5: No autenticado → 401
 * - CE6: Docente → 403
 *
 * GET /contenidos:
 * - CE7: Sin filtros → Lista todos
 * - CE8: Filtro por estado → Solo de ese estado
 * - CE9: Filtro por casaTipo → Solo de esa casa
 * - CE10: Filtro por mundoTipo → Solo de ese mundo
 *
 * GET /contenidos/:id:
 * - CE11: ID existente → Contenido con nodos
 * - CE12: ID no existente → 404
 *
 * PATCH /contenidos/:id:
 * - CE13: Actualizar título BORRADOR → 200
 * - CE14: Actualizar PUBLICADO → 400
 *
 * DELETE /contenidos/:id:
 * - CE15: Eliminar BORRADOR → 200
 * - CE16: Eliminar PUBLICADO → 400
 *
 * POST /contenidos/:id/publicar:
 * - CE17: Publicar BORRADOR con nodos reales → 200/201
 * - CE18: Publicar BORRADOR sin nodos reales → 400
 * - CE19: Publicar ya PUBLICADO → 400
 *
 * Nodos:
 * - CE20: Agregar nodo válido → 201
 * - CE21: Actualizar nodo → 200
 * - CE22: Eliminar nodo no bloqueado → 200
 * - CE23: Eliminar nodo bloqueado → 400
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn test:integration -- --testPathPattern="contenidos-admin"
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

describe('[INTEGRATION] Admin Contenidos (BBT)', () => {
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
  // HELPER: Crear contenido de test
  // ============================================================================
  async function createTestContenido(
    adminId: string,
    options?: {
      estado?: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
      casaTipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR';
      mundoTipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
      titulo?: string;
    },
  ) {
    return prisma.contenido.create({
      data: {
        titulo: options?.titulo ?? 'Contenido Test',
        casaTipo: options?.casaTipo ?? 'QUANTUM',
        mundoTipo: options?.mundoTipo ?? 'MATEMATICA',
        tipo: 'LECCION',
        estado: options?.estado ?? 'BORRADOR',
        creadorId: adminId,
      },
    });
  }

  // ============================================================================
  // CE1-CE6: POST /contenidos - Crear contenido
  // ============================================================================
  describe('POST /api/contenidos', () => {
    it('CE1: should create contenido as BORRADOR when admin sends valid data', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const dto = {
        titulo: 'Introducción a las Fracciones',
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        descripcion: 'Lección sobre fracciones básicas',
      };

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send(dto);

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.titulo).toBe(dto.titulo);
      expect(response.body.casaTipo).toBe('QUANTUM');
      expect(response.body.mundoTipo).toBe('MATEMATICA');
      expect(response.body.estado).toBe('BORRADOR');
      expect(response.body.creadorId).toBe(admin.id);
    });

    it('CE2: should reject when titulo is empty', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: '',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE3: should reject when casaTipo is invalid', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: 'Test',
          casaTipo: 'INVALID',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE4: should reject when mundoTipo is invalid', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'INVALID',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE5: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(401);
    });

    it('CE6: should return 403 when user is docente', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // CE7-CE10: GET /contenidos - Listar con filtros
  // ============================================================================
  describe('GET /api/contenidos', () => {
    it('CE7: should list all contenidos without filters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestContenido(admin.id, { titulo: 'Contenido 1' });
      await createTestContenido(admin.id, { titulo: 'Contenido 2' });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/contenidos')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('CE8: should filter by estado', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestContenido(admin.id, { estado: 'BORRADOR' });
      await createTestContenido(admin.id, { estado: 'PUBLICADO' });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/contenidos?estado=BORRADOR')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.data.every(
          (c: { estado: string }) => c.estado === 'BORRADOR',
        ),
      ).toBe(true);
    });

    it('CE9: should filter by casaTipo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestContenido(admin.id, { casaTipo: 'QUANTUM' });
      await createTestContenido(admin.id, { casaTipo: 'VERTEX' });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/contenidos?casaTipo=QUANTUM')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.data.every(
          (c: { casaTipo: string }) => c.casaTipo === 'QUANTUM',
        ),
      ).toBe(true);
    });

    it('CE10: should filter by mundoTipo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      await createTestContenido(admin.id, { mundoTipo: 'MATEMATICA' });
      await createTestContenido(admin.id, { mundoTipo: 'PROGRAMACION' });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/contenidos?mundoTipo=MATEMATICA')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(
        response.body.data.every(
          (c: { mundoTipo: string }) => c.mundoTipo === 'MATEMATICA',
        ),
      ).toBe(true);
    });
  });

  // ============================================================================
  // CE11-CE12: GET /contenidos/:id
  // ============================================================================
  describe('GET /api/contenidos/:id', () => {
    it('CE11: should return contenido with nodos when ID exists', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id);

      // Crear algunos nodos
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo Test',
          bloqueado: false,
          orden: 0,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenido.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(contenido.id);
      expect(response.body.titulo).toBe('Contenido Test');
      expect(response.body.nodos).toBeDefined();
    });

    it('CE12: should return 404 when ID does not exist', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/contenidos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // CE13-CE14: PATCH /contenidos/:id
  // ============================================================================
  describe('PATCH /api/contenidos/:id', () => {
    it('CE13: should update titulo when contenido is BORRADOR', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
        titulo: 'Título Original',
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenido.id}`)
        .set('Cookie', auth.cookie)
        .send({ titulo: 'Título Actualizado' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.titulo).toBe('Título Actualizado');
    });

    it('CE14: should reject update when contenido is PUBLICADO', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'PUBLICADO',
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenido.id}`)
        .set('Cookie', auth.cookie)
        .send({ titulo: 'Intento de cambio' });

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CE15-CE16: DELETE /contenidos/:id
  // ============================================================================
  describe('DELETE /api/contenidos/:id', () => {
    it('CE15: should delete contenido when estado is BORRADOR', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/${contenido.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);

      // Verificar eliminación
      const deleted = await prisma.contenido.findUnique({
        where: { id: contenido.id },
      });
      expect(deleted).toBeNull();
    });

    it('CE16: should reject delete when contenido is PUBLICADO', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'PUBLICADO',
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/${contenido.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CE17-CE19: POST /contenidos/:id/publicar
  // ============================================================================
  describe('POST /api/contenidos/:id/publicar', () => {
    it('CE17: should publish BORRADOR contenido with real nodes', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });

      // Crear nodo con contenido real (bloqueado: false, contenidoJson: not null)
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Introducción',
          bloqueado: false,
          orden: 0,
          contenidoJson: JSON.stringify({
            type: 'hero',
            title: 'Bienvenida',
            content: 'Contenido de prueba',
          }),
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/publicar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('PUBLICADO');

      // Verificar en DB
      const updated = await prisma.contenido.findUnique({
        where: { id: contenido.id },
      });
      expect(updated?.estado).toBe('PUBLICADO');
    });

    it('CE18: should reject publish when no real nodes exist', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });

      // Solo crear nodos estructurales (bloqueado: true, sin contenidoJson)
      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Teoría',
          bloqueado: true,
          orden: 0,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/publicar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toBeDefined();
    });

    it('CE19: should reject publish when already PUBLICADO', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'PUBLICADO',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/publicar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // POST /contenidos/:id/archivar
  // ============================================================================
  describe('POST /api/contenidos/:id/archivar', () => {
    it('should archive PUBLICADO contenido', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'PUBLICADO',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/archivar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);
      expect(response.body.estado).toBe('ARCHIVADO');
    });

    it('should reject archive when estado is BORRADOR', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/archivar`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // CE20-CE23: Gestión de Nodos
  // ============================================================================
  describe('Nodos Management', () => {
    it('CE20: should add nodo to contenido', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });

      // Act
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Cookie', auth.cookie)
        .send({
          titulo: 'Nuevo Nodo',
          contenidoJson: JSON.stringify({ type: 'text', content: 'Hola' }),
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.titulo).toBe('Nuevo Nodo');
      expect(response.body.contenidoId).toBe(contenido.id);
    });

    it('CE21: should update nodo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });
      const nodo = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo Original',
          bloqueado: false,
          orden: 0,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodo.id}`)
        .set('Cookie', auth.cookie)
        .send({
          titulo: 'Nodo Actualizado',
          contenidoJson: JSON.stringify({ type: 'quiz', question: '?' }),
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.titulo).toBe('Nodo Actualizado');
    });

    it('CE22: should delete non-bloqueado nodo', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });
      const nodo = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo Eliminable',
          bloqueado: false,
          orden: 0,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodo.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);

      // Verificar eliminación
      const deleted = await prisma.nodoContenido.findUnique({
        where: { id: nodo.id },
      });
      expect(deleted).toBeNull();
    });

    it('CE23: should reject delete when nodo is bloqueado', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id, {
        estado: 'BORRADOR',
      });
      const nodo = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Nodo Estructural',
          bloqueado: true,
          orden: 0,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodo.id}`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(400);

      // Verificar que no se eliminó
      const exists = await prisma.nodoContenido.findUnique({
        where: { id: nodo.id },
      });
      expect(exists).not.toBeNull();
    });
  });

  // ============================================================================
  // GET /contenidos/:id/arbol
  // ============================================================================
  describe('GET /api/contenidos/:id/arbol', () => {
    it('should return hierarchical tree of nodos', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido = await createTestContenido(admin.id);

      // Crear estructura jerárquica
      const padre = await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Padre',
          bloqueado: true,
          orden: 0,
        },
      });

      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Hijo 1',
          parentId: padre.id,
          bloqueado: false,
          orden: 0,
        },
      });

      await prisma.nodoContenido.create({
        data: {
          contenidoId: contenido.id,
          titulo: 'Hijo 2',
          parentId: padre.id,
          bloqueado: false,
          orden: 1,
        },
      });

      // Act
      const response = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenido.id}/arbol`)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  // ============================================================================
  // SECURITY: Access Control
  // ============================================================================
  describe('Security: Access Control', () => {
    it('should deny all endpoints for unauthenticated users', async () => {
      // Act - Ejecutar secuencialmente para evitar ECONNRESET
      const r1 = await request(app.getHttpServer()).get('/api/contenidos');
      const r2 = await request(app.getHttpServer()).get(
        '/api/contenidos/00000000-0000-0000-0000-000000000000',
      );
      const r3 = await request(app.getHttpServer())
        .post('/api/contenidos')
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });
      const r4 = await request(app.getHttpServer())
        .patch('/api/contenidos/00000000-0000-0000-0000-000000000000')
        .send({ titulo: 'Test' });
      const r5 = await request(app.getHttpServer()).delete(
        '/api/contenidos/00000000-0000-0000-0000-000000000000',
      );

      // Assert
      expect(r1.status).toBe(401);
      expect(r2.status).toBe(401);
      expect(r3.status).toBe(401);
      expect(r4.status).toBe(401);
      expect(r5.status).toBe(401);
    });

    it('should deny all endpoints for docente role', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const responses = await Promise.all([
        request(app.getHttpServer())
          .get('/api/contenidos')
          .set('Cookie', auth.cookie),
        request(app.getHttpServer())
          .post('/api/contenidos')
          .set('Cookie', auth.cookie)
          .send({
            titulo: 'Test',
            casaTipo: 'QUANTUM',
            mundoTipo: 'MATEMATICA',
          }),
      ]);

      // Assert
      responses.forEach((response) => {
        expect(response.status).toBe(403);
      });
    });
  });

  // ============================================================================
  // Boundary Value Analysis: titulo
  // ============================================================================
  describe('Boundary: titulo length', () => {
    it('should reject titulo with > 200 characters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const tituloLargo = 'A'.repeat(201);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: tituloLargo,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should accept titulo with exactly 200 characters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const tituloExacto = 'A'.repeat(200);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: tituloExacto,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert
      expect(response.status).toBe(201);
      expect(response.body.titulo).toBe(tituloExacto);
    });
  });

  // ============================================================================
  // Error Guessing: HTML injection in titulo
  // ============================================================================
  describe('Error Guessing: HTML injection', () => {
    it('should reject titulo with HTML characters', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .send({
          titulo: '<script>alert("xss")</script>',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Assert - El DTO tiene validación @Matches(/^[^<>]*$/)
      expect(response.status).toBe(400);
    });
  });
});
