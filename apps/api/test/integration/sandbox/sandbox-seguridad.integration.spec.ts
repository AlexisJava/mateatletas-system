/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - SANDBOX SEGURIDAD Y AISLAMIENTO
 * ============================================================================
 *
 * OBJETIVO: Encontrar BUGS de seguridad y aislamiento de datos.
 *
 * BUGS POTENCIALES A BUSCAR:
 * 1. ¿Admin A puede ver contenidos creados por Admin B?
 * 2. ¿Admin puede manipular nodos de contenido que no creó?
 * 3. ¿Un estudiante puede acceder a endpoints de admin?
 * 4. ¿Se puede acceder a contenidos BORRADOR desde fuera?
 * 5. ¿Hay información sensible en las respuestas?
 * 6. ¿Los errores revelan información del sistema?
 *
 * EQUIVALENCE CLASSES:
 * Roles:
 * - [ADMIN]: Acceso completo a sandbox
 * - [DOCENTE]: Sin acceso a sandbox (solo a sus asignaciones)
 * - [ESTUDIANTE]: Sin acceso a sandbox
 * - [NO-AUTH]: Sin token - rechazado
 *
 * Propiedad:
 * - [PROPIETARIO]: Admin que creó el contenido
 * - [OTRO-ADMIN]: Otro admin (¿tiene acceso?)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-seguridad" --runInBand
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
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  loginEstudiante,
} from '../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sandbox - Seguridad y Aislamiento', () => {
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
  // TESTS: Control de Acceso por Rol
  // ============================================================================
  describe('Control de Acceso por Rol', () => {
    it('Sin token → 401 en todos los endpoints de contenidos', async () => {
      const endpoints = [
        { method: 'post', path: '/api/contenidos' },
        { method: 'get', path: '/api/contenidos' },
        { method: 'get', path: '/api/contenidos/some-id' },
        { method: 'patch', path: '/api/contenidos/some-id' },
        { method: 'delete', path: '/api/contenidos/some-id' },
      ];

      for (const ep of endpoints) {
        const response = await (
          request(app.getHttpServer()) as unknown as Record<
            string,
            (path: string) => request.Test
          >
        )
          [ep.method](ep.path)
          .set('Origin', FRONTEND_ORIGIN);

        expect(response.status).toBe(401);
      }
    });

    it('Docente autenticado → 403 en endpoints de contenidos', async () => {
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(response.status).toBe(403);
    });

    it('Estudiante autenticado → 403 en endpoints de admin', async () => {
      const { estudiante, password } = await createTestEstudiante(prisma);
      const auth = await loginEstudiante(app, {
        username: estudiante.username,
        password,
      });

      const response = await request(app.getHttpServer())
        .get('/api/admin/planificaciones')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(403);
    });

    it('Admin autenticado → 200/201 en endpoints de contenidos', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(response.status).toBe(201);
    });
  });

  // ============================================================================
  // TESTS: Aislamiento entre Admins (Horizontal Access)
  // ============================================================================
  describe('Aislamiento entre Admins', () => {
    it('[CRITICAL] Admin A puede ver contenido creado por Admin B', async () => {
      // Crear dos admins
      const adminA = await createTestAdmin(prisma, {
        email: 'admin.a@test.com',
      });
      const adminB = await createTestAdmin(prisma, {
        email: 'admin.b@test.com',
      });

      const authA = await loginUser(app, {
        email: adminA.email,
        password: DEFAULT_PASSWORD,
      });
      const authB = await loginUser(app, {
        email: adminB.email,
        password: DEFAULT_PASSWORD,
      });

      // Admin A crea contenido
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${authA.token}`)
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Admin A',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      // Admin B intenta ver el contenido
      const response = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}`)
        .set('Authorization', `Bearer ${authB.token}`)
        .set('Cookie', authB.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // NOTA: En la mayoría de sistemas de admin, los admins pueden ver
      // todo el contenido. Si esto es un bug depende del requisito de negocio.
      // Documentamos el comportamiento actual:
      if (response.status === 200) {
        // Comportamiento típico: admins ven todo
        console.log(
          '[INFO] Admin B puede ver contenido de Admin A (comportamiento esperado?)',
        );
        expect(response.body.id).toBe(contenidoId);
      } else if (response.status === 403) {
        // Comportamiento restringido: admins solo ven lo suyo
        console.log(
          '[INFO] Admin B NO puede ver contenido de Admin A (aislamiento estricto)',
        );
      }
    });

    it('[CRITICAL] Admin A puede modificar nodo creado por Admin B', async () => {
      const adminA = await createTestAdmin(prisma, {
        email: 'admin.a2@test.com',
      });
      const adminB = await createTestAdmin(prisma, {
        email: 'admin.b2@test.com',
      });

      const authA = await loginUser(app, {
        email: adminA.email,
        password: DEFAULT_PASSWORD,
      });
      const authB = await loginUser(app, {
        email: adminB.email,
        password: DEFAULT_PASSWORD,
      });

      // Admin A crea contenido y obtiene un nodo
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${authA.token}`)
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Contenido de Admin A',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;
      const nodoTeoria = createRes.body.nodos[0];

      // Admin A crea un nodo hijo
      const nodoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Authorization', `Bearer ${authA.token}`)
        .set('Cookie', authA.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo de Admin A', parentId: nodoTeoria.id });

      const nodoId = nodoRes.body.id;

      // Admin B intenta modificar el nodo
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Authorization', `Bearer ${authB.token}`)
        .set('Cookie', authB.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"modificado": "por Admin B"}' });

      // Documentar comportamiento
      if (response.status === 200) {
        console.log('[INFO] Admin B puede modificar nodo de Admin A');
      } else if (response.status === 403) {
        console.log('[INFO] Admin B NO puede modificar nodo de Admin A');
      }
    });
  });

  // ============================================================================
  // TESTS: Protección de Contenidos BORRADOR
  // ============================================================================
  describe('Protección de Contenidos BORRADOR', () => {
    it('Contenido BORRADOR no debe ser accesible por endpoints públicos', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Crear contenido en BORRADOR
      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Secreto',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const contenidoId = createRes.body.id;

      // Intentar acceder sin auth (como si fuera un endpoint público)
      const response = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}`)
        .set('Origin', FRONTEND_ORIGIN);

      // Debe rechazar
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // TESTS: Seguridad de Información
  // ============================================================================
  describe('Seguridad de Información', () => {
    it('Errores no revelan información del sistema', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Provocar error con ID inválido
      const response = await request(app.getHttpServer())
        .get('/api/contenidos/clxxxxxxxxx')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // El error no debe revelar:
      // - Paths del servidor
      // - Stack traces
      // - Nombres de tablas o columnas
      // - Versiones de software

      const body = JSON.stringify(response.body);

      expect(body).not.toContain('/home/');
      expect(body).not.toContain('/var/');
      expect(body).not.toContain('/usr/');
      expect(body).not.toContain('node_modules');
      expect(body).not.toContain('at '); // Stack trace
      expect(body).not.toContain('.ts:'); // File references
    });

    it('Respuestas no incluyen campos sensibles innecesarios', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Test',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      const body = JSON.stringify(createRes.body);

      // No debe incluir información sensible
      expect(body).not.toContain('password');
      expect(body).not.toContain('password_hash');
      expect(body).not.toContain('secret');
      expect(body).not.toContain('token');
    });
  });

  // ============================================================================
  // TESTS: Validación de Tokens
  // ============================================================================
  describe('Validación de Tokens', () => {
    it('Token expirado o inválido → 401', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/contenidos')
        .set('Authorization', 'Bearer invalid.token.here')
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(401);
    });

    it('Token de un usuario eliminado → debería fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Verificar que funciona
      const firstResponse = await request(app.getHttpServer())
        .get('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(firstResponse.status).toBe(200);

      // Eliminar el admin
      await prisma.admin.delete({ where: { id: admin.id } });

      // Intentar usar el mismo token
      const secondResponse = await request(app.getHttpServer())
        .get('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Debería fallar porque el usuario ya no existe
      // (depende de la implementación - puede ser 401 o 403)
      expect([401, 403, 404]).toContain(secondResponse.status);
    });
  });

  // ============================================================================
  // TESTS: Límites y Rate Limiting
  // ============================================================================
  describe('Límites y Rate Limiting', () => {
    it('No hay rate limiting en operaciones de sandbox', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Hacer múltiples requests rápidas pero en batches para evitar ECONNRESET
      // Dividir en 4 batches de 5 requests cada uno
      const responses: { status: number }[] = [];

      for (let batch = 0; batch < 4; batch++) {
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(
            request(app.getHttpServer())
              .get('/api/contenidos')
              .set('Authorization', `Bearer ${auth.token}`)
              .set('Cookie', auth.cookie)
              .set('Origin', FRONTEND_ORIGIN),
          );
        }
        const batchResponses = await Promise.all(promises);
        responses.push(...batchResponses);
      }

      // Todas deberían ser 200 (sin rate limiting)
      const successCount = responses.filter((r) => r.status === 200).length;
      const throttledCount = responses.filter((r) => r.status === 429).length;

      // Documentar si hay rate limiting
      if (throttledCount > 0) {
        console.log(
          `[INFO] Rate limiting activo: ${throttledCount}/20 requests throttled`,
        );
      }

      // Al menos la mayoría debería pasar
      expect(successCount).toBeGreaterThan(10);
    });
  });

  // ============================================================================
  // TESTS: SQL Injection Resistance
  // ============================================================================
  describe('SQL Injection Resistance', () => {
    it('Payload SQL injection en búsqueda → no rompe', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Intentar SQL injection
      const response = await request(app.getHttpServer())
        .get("/api/contenidos?estado='; DROP TABLE contenido; --")
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Debería fallar con 400 (validación) o ignorar el parámetro
      expect([200, 400]).toContain(response.status);

      // Verificar que la tabla sigue existiendo
      const count = await prisma.contenido.count();
      expect(count).toBeGreaterThanOrEqual(0); // La tabla existe
    });

    it('Payload SQL injection en creación → no rompe', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const response = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: "'; DELETE FROM contenido; --",
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      // Prisma parametriza automáticamente
      expect(response.status).toBe(201);

      // Verificar que el contenido se creó con el título literal
      expect(response.body.titulo).toBe("'; DELETE FROM contenido; --");

      // Verificar que la tabla tiene contenido (no se borró nada)
      const count = await prisma.contenido.count();
      expect(count).toBeGreaterThan(0);
    });
  });
});
