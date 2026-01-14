/**
 * ============================================================================
 * SANDBOX - CASOS CRÍTICOS (BBT)
 * ============================================================================
 *
 * Black Box Tests para validar comportamiento crítico del Sandbox:
 * - Permisos: solo admin puede crear/editar/publicar
 * - Validaciones de campos obligatorios
 * - Estados: BORRADOR vs PUBLICADO
 * - Nodos bloqueados vs editables
 *
 * Filosofía: "Tests como jueces, no cómplices"
 * - Creados SIN leer implementación para evitar sesgo
 * - Verifican contrato de API, no detalles internos
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import {
  createTestAdmin,
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  loginUser,
  loginEstudiante,
  FRONTEND_ORIGIN,
} from '../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sandbox - Casos Críticos (BBT)', () => {
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
  // PERMISOS: CREAR CONTENIDO
  // ============================================================================
  describe('Permisos: Crear Contenido', () => {
    /**
     * CRÍTICO: Solo admin puede crear contenido
     */
    it('Admin puede crear contenido', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido Admin',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
    });

    it('Docente NO puede crear contenido', async () => {
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido Docente',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // 401 (no autorizado) o 403 (prohibido)
      expect([401, 403]).toContain(res.status);
    });

    it('Tutor NO puede crear contenido', async () => {
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido Tutor',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('Estudiante NO puede crear contenido', async () => {
      const { estudiante } = await createTestEstudiante(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido Estudiante',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect([401, 403]).toContain(res.status);
    });

    it('Usuario no autenticado NO puede crear contenido', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido Anónimo',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).toBe(401);
    });
  });

  // ============================================================================
  // PERMISOS: EDITAR NODOS
  // ============================================================================
  describe('Permisos: Editar Nodos', () => {
    async function crearContenidoConNodoEditable(adminCookie: string) {
      // Crear contenido
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', adminCookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: `Test Permisos ${Date.now()}`,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      // Obtener nodo Teoría
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', adminCookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodo editable
      const nodoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', adminCookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo Editable', parentId: teoriaNodo.id });

      return {
        contenidoId,
        nodoId: nodoRes.body.id,
      };
    }

    it('Admin puede editar nodo', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoConNodoEditable(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage"}' });

      expect(res.status).toBe(200);
    });

    it('Docente NO puede editar nodo de contenido ajeno', async () => {
      // Admin crea contenido
      const admin = await createTestAdmin(prisma);
      const adminAuth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoConNodoEditable(adminAuth.cookie);

      // Docente intenta editar
      const { docente } = await createTestDocente(prisma);
      const docenteAuth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', docenteAuth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Hacked"}' });

      expect([401, 403]).toContain(res.status);
    });

    it('Usuario no autenticado NO puede editar nodo', async () => {
      const admin = await createTestAdmin(prisma);
      const adminAuth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoConNodoEditable(adminAuth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Anónimo"}' });

      expect(res.status).toBe(401);
    });
  });

  // ============================================================================
  // VALIDACIONES: CAMPOS OBLIGATORIOS
  // ============================================================================
  describe('Validaciones: Campos Obligatorios', () => {
    it('Crear contenido sin titulo: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Crear contenido sin casaTipo: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Sin Casa',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Crear contenido sin mundoTipo: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Sin Mundo',
          casaTipo: 'QUANTUM',
        });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Crear contenido con casaTipo inválido: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Casa Inválida',
          casaTipo: 'CASA_INVENTADA',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Crear contenido con mundoTipo inválido: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Mundo Inválido',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MUNDO_INVENTADO',
        });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Crear nodo sin titulo: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Crear contenido
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Nodo Sin Titulo',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      // Obtener nodo padre
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Intentar crear nodo sin titulo
      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ parentId: teoriaNodo.id }); // Sin titulo

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });
  });

  // ============================================================================
  // ESTADOS: BORRADOR vs PUBLICADO
  // ============================================================================
  describe('Estados: BORRADOR vs PUBLICADO', () => {
    async function crearYPublicarContenido(cookie: string) {
      // Crear contenido
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: `Test Estado ${Date.now()}`,
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      // Obtener nodo y agregar hijo
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const nodoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo Test', parentId: teoriaNodo.id });

      const nodoId = nodoRes.body.id;

      // Guardar contenido
      await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage"}' });

      // Publicar
      await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/publicar`)
        .set('Cookie', cookie)
        .set('Origin', FRONTEND_ORIGIN);

      return { contenidoId, nodoId };
    }

    it('Contenido nuevo debe estar en BORRADOR', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Estado Inicial',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(createRes.status).toBe(201);

      // Verificar estado en DB
      const contenido = await prisma.contenido.findUnique({
        where: { id: createRes.body.id },
      });

      expect(contenido?.estado).toBe('BORRADOR');
    });

    it('NO se puede editar nodo de contenido PUBLICADO', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearYPublicarContenido(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Hacked"}' });

      // 400 (bad request) o 403 (forbidden)
      expect([400, 403]).toContain(res.status);
    });

    it('NO se puede agregar nodo a contenido PUBLICADO', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId } = await crearYPublicarContenido(auth.cookie);

      // Obtener árbol
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo Nuevo', parentId: teoriaNodo.id });

      expect([400, 403]).toContain(res.status);
    });

    it('NO se puede eliminar nodo de contenido PUBLICADO', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearYPublicarContenido(auth.cookie);

      const res = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect([400, 403]).toContain(res.status);
    });

    it('NO se puede publicar contenido ya PUBLICADO', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId } = await crearYPublicarContenido(auth.cookie);

      // Intentar publicar de nuevo
      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/publicar`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Ya está publicado, debería rechazar o ser idempotente
      expect(res.status).not.toBe(500);
      // Podría ser 400 (ya publicado) o 200 (idempotente)
      expect([200, 400, 409]).toContain(res.status);
    });
  });

  // ============================================================================
  // NODOS BLOQUEADOS vs EDITABLES
  // ============================================================================
  describe('Nodos Bloqueados vs Editables', () => {
    it('Nodos base (Teoría, Práctica, Evaluación) deben estar bloqueados', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Nodos Bloqueados',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const nodos = arbolRes.body;

      // Verificar que Teoría, Práctica, Evaluación existen y están bloqueados
      const teoria = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const practica = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Práctica',
      );
      const evaluacion = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Evaluación',
      );

      expect(teoria).toBeDefined();
      expect(practica).toBeDefined();
      expect(evaluacion).toBeDefined();

      expect(teoria.bloqueado).toBe(true);
      expect(practica.bloqueado).toBe(true);
      expect(evaluacion.bloqueado).toBe(true);
    });

    it('NO se puede eliminar nodo bloqueado (Teoría)', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Eliminar Bloqueado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${teoriaNodo.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(400);
    });

    it('NO se puede cambiar título de nodo bloqueado', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Cambiar Titulo Bloqueado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${teoriaNodo.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Título Cambiado' });

      expect(res.status).toBe(400);
    });

    it('SÍ se puede agregar contenidoJson a nodo bloqueado', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Contenido en Bloqueado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${teoriaNodo.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage", "props": {}}' });

      // Debería permitir editar contenidoJson aunque el nodo esté bloqueado
      expect(res.status).toBe(200);
    });

    it('Nodo hijo creado NO debe estar bloqueado', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Nodo Hijo No Bloqueado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodo hijo
      const nodoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo Hijo', parentId: teoriaNodo.id });

      expect(nodoRes.status).toBe(201);
      expect(nodoRes.body.bloqueado).toBe(false);
    });

    it('SÍ se puede eliminar nodo hijo (no bloqueado)', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test Eliminar Nodo Hijo',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodo hijo
      const nodoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo a Eliminar', parentId: teoriaNodo.id });

      const nodoId = nodoRes.body.id;

      // Eliminar nodo hijo
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(deleteRes.status).toBe(200);
    });
  });

  // ============================================================================
  // ACCESO A RECURSOS INEXISTENTES
  // ============================================================================
  describe('Acceso a Recursos Inexistentes', () => {
    it('GET contenido inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/api/contenidos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(404);
    });

    it('GET árbol de contenido inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/api/contenidos/00000000-0000-0000-0000-000000000000/arbol')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(404);
    });

    it('PATCH nodo inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .patch('/api/contenidos/nodos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{}' });

      expect(res.status).toBe(404);
    });

    it('DELETE nodo inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .delete('/api/contenidos/nodos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(404);
    });

    it('DELETE contenido inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .delete('/api/contenidos/00000000-0000-0000-0000-000000000000')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(404);
    });

    it('POST nodo a contenido inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos/00000000-0000-0000-0000-000000000000/nodos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Nodo Huérfano',
          parentId: '00000000-0000-0000-0000-000000000001',
        });

      expect(res.status).toBe(404);
    });

    it('Publicar contenido inexistente: 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos/00000000-0000-0000-0000-000000000000/publicar')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(404);
    });
  });
});
