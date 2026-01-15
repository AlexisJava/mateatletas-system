/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - SANDBOX PLANIFICACIONES
 * ============================================================================
 *
 * OBJETIVO: Encontrar BUGS reales en la gestión de planificaciones.
 *
 * ENDPOINTS BAJO TEST:
 * - POST /api/admin/planificaciones                    - Crear planificación
 * - GET /api/admin/planificaciones/:id                 - Obtener planificación
 * - PATCH /api/admin/planificaciones/:id               - Actualizar planificación
 * - DELETE /api/admin/planificaciones/:id              - Eliminar planificación
 * - PATCH /api/admin/planificaciones/clases/:claseId   - Actualizar clase
 * - POST /api/admin/planificaciones/:id/publicar       - Publicar planificación
 *
 * BUGS POTENCIALES A BUSCAR:
 * 1. ¿Se puede publicar planificación con clases vacías (sin nodos con contenido)?
 * 2. ¿Eliminar planificación elimina los Contenidos asociados?
 * 3. ¿cantidad_clases fuera de rango (0, 53)?
 * 4. ¿Se puede editar planificación PUBLICADA?
 * 5. ¿Se puede eliminar planificación con asignaciones activas?
 * 6. ¿Qué pasa si teoria_id apunta a contenido que no existe?
 *
 * EQUIVALENCE CLASSES:
 * cantidad_clases:
 * - [VALIDO]: 1-52 clases
 * - [CERO]: 0 clases → ERROR
 * - [EXCESO]: 53+ clases → ERROR
 *
 * Estado:
 * - [BORRADOR]: Editable, eliminable, publicable
 * - [PUBLICADO]: No editable, no eliminable, no re-publicable
 *
 * Publicación:
 * - [COMPLETA]: Todas las clases con teoría y práctica → OK
 * - [INCOMPLETA]: Alguna clase sin teoría o práctica → ERROR
 * - [SIN-CONTENIDO]: Clases con contenidos vacíos → ¿ERROR?
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-planificaciones" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { createTestAdmin } from '../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sandbox - Planificaciones', () => {
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
  // HELPER: Login como Admin
  // ============================================================================
  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    const auth = await loginUser(app, {
      email: admin.email,
      password: DEFAULT_PASSWORD,
    });
    return { admin, auth };
  }

  // ============================================================================
  // HELPER: Crear planificación
  // ============================================================================
  async function crearPlanificacion(
    auth: { token: string; cookie: string },
    data: {
      titulo?: string;
      cantidad_clases?: number;
      casa_tipo?: string;
      mundo_tipo?: string;
    } = {},
  ) {
    return request(app.getHttpServer())
      .post('/api/admin/planificaciones')
      .set('Authorization', `Bearer ${auth.token}`)
      .set('Cookie', auth.cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        titulo: data.titulo ?? 'Planificación de Test',
        cantidad_clases: data.cantidad_clases ?? 2,
        casa_tipo: data.casa_tipo ?? 'QUANTUM',
        mundo_tipo: data.mundo_tipo ?? 'MATEMATICA',
      });
  }

  // ============================================================================
  // TESTS: Boundary Value Analysis - cantidad_clases
  // ============================================================================
  describe('Boundary Value Analysis: cantidad_clases', () => {
    it('cantidad_clases = 0 → debe retornar 400', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 0 });

      expect(response.status).toBe(400);
    });

    it('cantidad_clases = 1 (mínimo) → debe funcionar', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 1 });

      expect(response.status).toBe(201);
      expect(response.body.cantidad_clases).toBe(1);
      expect(response.body.clases).toHaveLength(1);
    });

    it('cantidad_clases = 52 (máximo) → debe funcionar', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 52 });

      expect(response.status).toBe(201);
      expect(response.body.cantidad_clases).toBe(52);
      expect(response.body.clases).toHaveLength(52);
    });

    it('cantidad_clases = 53 (máximo+1) → debe retornar 400', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 53 });

      expect(response.status).toBe(400);
    });

    it('cantidad_clases negativo → debe retornar 400', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: -1 });

      expect(response.status).toBe(400);
    });

    it('cantidad_clases decimal (2.5) → debe rechazar o truncar', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, {
        cantidad_clases: 2.5 as unknown as number,
      });

      // Debería o rechazar (400) o truncar a 2
      if (response.status === 201) {
        expect(response.body.cantidad_clases).toBe(2);
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  // ============================================================================
  // TESTS: Creación de Planificación
  // ============================================================================
  describe('Creación de Planificación', () => {
    it('Crear planificación → debe crear N contenidos automáticamente', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 3 });

      expect(response.status).toBe(201);
      expect(response.body.clases).toHaveLength(3);

      // Verificar que cada clase tiene teoria_id y practica_id
      for (const clase of response.body.clases) {
        expect(clase.teoria_id).toBeDefined();
        expect(clase.practica_id).toBeDefined();
        expect(clase.teoria).toBeDefined();
        expect(clase.practica).toBeDefined();
      }

      // Verificar en DB que se crearon 6 contenidos (2 por clase)
      const contenidos = await prisma.contenido.count();
      expect(contenidos).toBe(6); // 3 clases * 2 contenidos
    });

    it('Crear planificación → contenidos deben tener 3 nodos cada uno', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 1 });

      const clase = response.body.clases[0];

      // Verificar nodos del contenido de teoría
      const nodosTeoría = await prisma.nodoContenido.findMany({
        where: { contenidoId: clase.teoria_id },
      });
      expect(nodosTeoría).toHaveLength(3);
      expect(nodosTeoría.every((n) => n.bloqueado)).toBe(true);

      // Verificar nodos del contenido de práctica
      const nodosPractica = await prisma.nodoContenido.findMany({
        where: { contenidoId: clase.practica_id },
      });
      expect(nodosPractica).toHaveLength(3);
    });
  });

  // ============================================================================
  // TESTS: State Transitions - Publicación
  // ============================================================================
  describe('State Transitions: Publicación', () => {
    it('Publicar planificación BORRADOR con clases completas → PUBLICADO', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth, { cantidad_clases: 1 });
      const planificacionId = createRes.body.id;
      const teoriaId = createRes.body.clases[0].teoria_id;
      const practicaId = createRes.body.clases[0].practica_id;

      // Agregar nodos con contenido real a teoría y práctica
      // (los nodos bloqueados no tienen contenidoJson, necesitamos agregar nodos con contenido)
      await request(app.getHttpServer())
        .post(`/api/contenidos/${teoriaId}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Teoría',
          contenidoJson:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Contenido real"}]}]}',
        });

      await request(app.getHttpServer())
        .post(`/api/contenidos/${practicaId}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Práctica',
          contenidoJson:
            '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Ejercicio"}]}]}',
        });

      // Publicar
      const pubRes = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacionId}/publicar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(pubRes.status).toBe(201);
      expect(pubRes.body.estado).toBe('PUBLICADO');

      // Verificar que los contenidos también se publicaron
      const clase = pubRes.body.clases[0];
      expect(clase.teoria.estado).toBe('PUBLICADO');
      expect(clase.practica.estado).toBe('PUBLICADO');
    });

    it('Publicar planificación ya PUBLICADA → ERROR', async () => {
      const { auth, admin } = await loginAsAdmin();

      // Crear planificación publicada directamente
      const planificacion = await prisma.planificacion.create({
        data: {
          titulo: 'Ya Publicada',
          cantidad_clases: 1,
          duracion_clase_dias: 7,
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
          estado: 'PUBLICADO',
        },
      });

      const response = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacion.id}/publicar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('borrador');
    });
  });

  // ============================================================================
  // TESTS: Bug Hunting - Publicación sin contenido real
  // ============================================================================
  describe('Bug Hunting: Publicación sin contenido real', () => {
    it('Publicar con nodos vacíos (sin contenidoJson) → ERROR 400', async () => {
      const { auth } = await loginAsAdmin();

      // Crear planificación (genera contenidos con nodos bloqueados SIN contenidoJson)
      const createRes = await crearPlanificacion(auth, { cantidad_clases: 1 });
      const planificacionId = createRes.body.id;

      // Los nodos estructurales (Teoría, Práctica, Evaluación) tienen contenidoJson: null
      // La validación ahora requiere al menos un nodo no-bloqueado con contenidoJson
      const pubRes = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacionId}/publicar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Debe fallar porque no hay contenido real
      expect(pubRes.status).toBe(400);
      expect(pubRes.body.message).toContain('no tiene contenido');
    });
  });

  // ============================================================================
  // TESTS: Eliminación de Planificación
  // ============================================================================
  describe('Eliminación de Planificación', () => {
    it('Eliminar planificación BORRADOR sin asignaciones → OK', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth, { cantidad_clases: 2 });
      const planificacionId = createRes.body.id;

      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/admin/planificaciones/${planificacionId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verificar en DB
      const planEnDB = await prisma.planificacion.findUnique({
        where: { id: planificacionId },
      });
      expect(planEnDB).toBeNull();
    });

    it('Eliminar planificación PUBLICADA → ERROR', async () => {
      const { auth, admin } = await loginAsAdmin();

      const planificacion = await prisma.planificacion.create({
        data: {
          titulo: 'Publicada',
          cantidad_clases: 1,
          duracion_clase_dias: 7,
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
          estado: 'PUBLICADO',
        },
      });

      const response = await request(app.getHttpServer())
        .delete(`/api/admin/planificaciones/${planificacion.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });

    it('Eliminar planificación → también elimina Contenidos asociados', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth, { cantidad_clases: 1 });
      const planificacionId = createRes.body.id;
      const teoriaId = createRes.body.clases[0].teoria_id;
      const practicaId = createRes.body.clases[0].practica_id;

      // Verificar que los contenidos existen antes de eliminar
      const teoriaAntes = await prisma.contenido.findUnique({
        where: { id: teoriaId },
      });
      const practicaAntes = await prisma.contenido.findUnique({
        where: { id: practicaId },
      });
      expect(teoriaAntes).not.toBeNull();
      expect(practicaAntes).not.toBeNull();

      // Eliminar planificación
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/admin/planificaciones/${planificacionId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(deleteRes.status).toBe(200);

      // Verificar que los contenidos fueron eliminados (no huérfanos)
      const teoriaDespues = await prisma.contenido.findUnique({
        where: { id: teoriaId },
      });
      const practicaDespues = await prisma.contenido.findUnique({
        where: { id: practicaId },
      });

      expect(teoriaDespues).toBeNull();
      expect(practicaDespues).toBeNull();
    });
  });

  // ============================================================================
  // TESTS: Actualización de Planificación
  // ============================================================================
  describe('Actualización de Planificación', () => {
    it('Actualizar título de planificación BORRADOR → OK', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth, {
        titulo: 'Título Original',
      });
      const planificacionId = createRes.body.id;

      const updateRes = await request(app.getHttpServer())
        .patch(`/api/admin/planificaciones/${planificacionId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nuevo Título' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.titulo).toBe('Nuevo Título');
    });

    it('Actualizar planificación PUBLICADA → ERROR', async () => {
      const { auth, admin } = await loginAsAdmin();

      const planificacion = await prisma.planificacion.create({
        data: {
          titulo: 'Publicada',
          cantidad_clases: 1,
          duracion_clase_dias: 7,
          casa_tipo: 'QUANTUM',
          mundo_tipo: 'MATEMATICA',
          estado: 'PUBLICADO',
        },
      });

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/planificaciones/${planificacion.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Intento de cambio' });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: Actualización de Clase
  // ============================================================================
  describe('Actualización de Clase', () => {
    it('Actualizar título de clase → OK', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth);
      const claseId = createRes.body.clases[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/planificaciones/clases/${claseId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Clase Renombrada' });

      expect(response.status).toBe(200);
      expect(
        response.body.clases.find((c: { id: string }) => c.id === claseId)
          .titulo,
      ).toBe('Clase Renombrada');
    });

    it('Asignar teoria_id inexistente → ERROR', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth);
      const claseId = createRes.body.clases[0].id;

      const response = await request(app.getHttpServer())
        .patch(`/api/admin/planificaciones/clases/${claseId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ teoria_id: '00000000-0000-0000-0000-000000000000' });

      expect(response.status).toBe(404);
    });
  });

  // ============================================================================
  // TESTS: Error Guessing - IDs y Formatos
  // ============================================================================
  describe('Error Guessing: IDs Inválidos', () => {
    it('GET planificación con UUID inexistente → 404', async () => {
      const { auth } = await loginAsAdmin();

      const response = await request(app.getHttpServer())
        .get('/api/admin/planificaciones/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(404);
    });

    it('GET planificación con ID malformado → 400', async () => {
      const { auth } = await loginAsAdmin();

      // Usar un ID verdaderamente inválido (caracteres especiales que no son UUID, CUID ni Slug)
      const response = await request(app.getHttpServer())
        .get('/api/admin/planificaciones/!!!invalid-id!!!')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: Enums Inválidos
  // ============================================================================
  describe('Error Guessing: Enums Inválidos', () => {
    it('casa_tipo inválido → 400', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, {
        casa_tipo: 'CASA_INVALIDA',
      });

      expect(response.status).toBe(400);
    });

    it('mundo_tipo inválido → 400', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, {
        mundo_tipo: 'MUNDO_INVALIDO',
      });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: Verificación en Base de Datos
  // ============================================================================
  describe('Verificación en Base de Datos', () => {
    it('Al crear planificación, los números de clase son secuenciales', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, { cantidad_clases: 5 });

      const clases = response.body.clases;
      for (let i = 0; i < clases.length; i++) {
        expect(clases[i].numero).toBe(i + 1);
      }
    });

    it('Al crear planificación, los contenidos tienen nombres descriptivos', async () => {
      const { auth } = await loginAsAdmin();

      const response = await crearPlanificacion(auth, {
        titulo: 'Álgebra Básica',
        cantidad_clases: 1,
      });

      const teoriaId = response.body.clases[0].teoria_id;
      const practicaId = response.body.clases[0].practica_id;

      const teoria = await prisma.contenido.findUnique({
        where: { id: teoriaId },
      });
      const practica = await prisma.contenido.findUnique({
        where: { id: practicaId },
      });

      expect(teoria?.titulo).toContain('Álgebra Básica');
      expect(teoria?.titulo).toContain('Teoría');
      expect(practica?.titulo).toContain('Práctica');
    });
  });

  // ============================================================================
  // TESTS: Idempotencia y Consistencia
  // ============================================================================
  describe('Idempotencia y Consistencia', () => {
    it('Publicar planificación es idempotente (segunda vez falla)', async () => {
      const { auth } = await loginAsAdmin();

      const createRes = await crearPlanificacion(auth, { cantidad_clases: 1 });
      const planificacionId = createRes.body.id;
      const teoriaId = createRes.body.clases[0].teoria_id;
      const practicaId = createRes.body.clases[0].practica_id;

      // Agregar contenido real a teoría y práctica antes de publicar
      await request(app.getHttpServer())
        .post(`/api/contenidos/${teoriaId}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Teoría',
          contenidoJson: '{"type":"doc","content":[]}',
        });

      await request(app.getHttpServer())
        .post(`/api/contenidos/${practicaId}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Práctica',
          contenidoJson: '{"type":"doc","content":[]}',
        });

      // Primera publicación
      const pub1 = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacionId}/publicar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(pub1.status).toBe(201);

      // Segunda publicación (debería fallar porque ya está PUBLICADO)
      const pub2 = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacionId}/publicar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(pub2.status).toBe(400);
    });

    it('Crear múltiples planificaciones con mismo título → debe permitirse', async () => {
      const { auth } = await loginAsAdmin();

      const titulo = 'Planificación Duplicada';

      const res1 = await crearPlanificacion(auth, { titulo });
      const res2 = await crearPlanificacion(auth, { titulo });

      expect(res1.status).toBe(201);
      expect(res2.status).toBe(201);
      expect(res1.body.id).not.toBe(res2.body.id);
    });
  });
});
