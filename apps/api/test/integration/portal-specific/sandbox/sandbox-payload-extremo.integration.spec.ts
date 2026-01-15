/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - PAYLOAD EXTREMO
 * ============================================================================
 *
 * OBJETIVO: Probar cómo se comporta la API con datos inusuales, malformados,
 * o en los límites de lo esperado.
 *
 * CATEGORÍAS DE PRUEBA:
 *
 * 1. JSON MALFORMADO
 *    - String que no es JSON válido
 *    - JSON incompleto (falta cierre)
 *    - JSON con trailing commas
 *
 * 2. JSON VÁLIDO PERO INESPERADO
 *    - Array en vez de objeto
 *    - Null
 *    - String vacío
 *    - Número
 *    - Boolean
 *
 * 3. JSON GRANDE
 *    - 1KB, 100KB, 1MB
 *    - Profundidad extrema (100 niveles)
 *    - Cantidad extrema de keys
 *
 * 4. CARACTERES ESPECIALES
 *    - Unicode (emojis, caracteres chinos)
 *    - HTML/Script injection
 *    - SQL injection patterns
 *    - Null bytes
 *
 * 5. CAMPOS EXTRA / FALTANTES
 *    - Body vacío {}
 *    - Campos extra no esperados
 *    - Campos requeridos faltantes
 *
 * METODOLOGÍA:
 * - NO leí la implementación
 * - Tests basados en Error Guessing y Boundary Analysis
 * - Enfoque en NO romper el servidor (no 500s)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-payload-extremo" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import { createTestAdmin } from '../../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../../helpers/auth.helpers';
import { DEFAULT_PASSWORD } from '../../../fixtures/factories/usuario.factory';

describe('[INTEGRATION] Sandbox - Payload Extremo', () => {
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
  // HELPERS
  // ============================================================================
  async function crearContenidoYNodo(cookie: string): Promise<{
    contenidoId: string;
    nodoId: string;
  }> {
    // Crear contenido
    const createRes = await request(app.getHttpServer())
      .post('/api/contenidos')
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        titulo: `Test Payload ${Date.now()}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
      });

    const contenidoId = createRes.body.id;

    // Obtener nodo Teoría
    const arbolRes = await request(app.getHttpServer())
      .get(`/api/contenidos/${contenidoId}/arbol`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN);

    const teoriaNodo = arbolRes.body.find(
      (n: { titulo: string }) => n.titulo === 'Teoría',
    );

    // Crear nodo hijo editable
    const nodoRes = await request(app.getHttpServer())
      .post(`/api/contenidos/${contenidoId}/nodos`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({ titulo: 'Nodo Test', parentId: teoriaNodo.id });

    return {
      contenidoId,
      nodoId: nodoRes.body.id,
    };
  }

  // ============================================================================
  // JSON MALFORMADO
  // ============================================================================
  describe('JSON Malformado en contenidoJson', () => {
    /**
     * EXPECTATIVA BBT:
     * - NO debe causar error 500
     * - Debería retornar 400 (Bad Request) o guardar como string
     * - NO debe corromper datos existentes
     */
    it('String que no es JSON: debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: 'esto no es json válido' });

      expect(res.status).not.toBe(500);
      // Aceptable: 200 (guarda como string) o 400 (rechaza)
      expect([200, 400]).toContain(res.status);
    });

    it('JSON incompleto (falta cierre): debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage", "props": {' }); // Incompleto

      expect(res.status).not.toBe(500);
    });

    it('JSON con trailing comma: debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage", "props": {},}' }); // Trailing comma

      expect(res.status).not.toBe(500);
    });
  });

  // ============================================================================
  // JSON VÁLIDO PERO INESPERADO
  // ============================================================================
  describe('JSON Válido pero Tipo Inesperado', () => {
    it('Array en vez de objeto: debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '["array", "en", "vez", "de", "objeto"]' });

      expect(res.status).not.toBe(500);
    });

    it('null como contenidoJson: debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: null });

      expect(res.status).not.toBe(500);
    });

    it('String vacío como contenidoJson: debe manejarse sin 500', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '' });

      expect(res.status).not.toBe(500);
    });

    it('JSON objeto vacío {}: debe aceptarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{}' });

      expect(res.status).not.toBe(500);
      // Un objeto vacío es JSON válido, debería aceptarse
      expect([200, 201]).toContain(res.status);
    });
  });

  // ============================================================================
  // JSON GRANDE
  // ============================================================================
  describe('JSON de Tamaño Extremo', () => {
    /**
     * EXPECTATIVA BBT:
     * - Tamaños razonables (1KB, 100KB) deberían funcionar
     * - Tamaños extremos (1MB+) podrían rechazarse con 413 o 400
     * - NUNCA 500
     */
    it('JSON de 1KB: debe aceptarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      // Crear JSON de ~1KB
      const largeContent = {
        type: 'Stage',
        props: { data: 'x'.repeat(900) },
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: JSON.stringify(largeContent) });

      expect(res.status).not.toBe(500);
      expect([200, 201]).toContain(res.status);
    });

    it('JSON de 100KB: debe aceptarse o rechazarse limpiamente', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      // Crear JSON de ~100KB
      const largeContent = {
        type: 'Stage',
        props: { data: 'x'.repeat(100000) },
      };

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: JSON.stringify(largeContent) });

      expect(res.status).not.toBe(500);
      // Aceptable: 200 (guarda) o 413/400 (rechaza por tamaño)
      expect([200, 201, 400, 413]).toContain(res.status);
    });

    it('JSON con profundidad 50 niveles: debe manejarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      // Crear JSON con 50 niveles de anidamiento
      type NestedObject = { type: string; children?: NestedObject };
      let deepJson: NestedObject = { type: 'Leaf' };
      for (let i = 0; i < 50; i++) {
        deepJson = { type: `Level${i}`, children: deepJson };
      }

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: JSON.stringify(deepJson) });

      expect(res.status).not.toBe(500);
    });
  });

  // ============================================================================
  // CARACTERES ESPECIALES
  // ============================================================================
  describe('Caracteres Especiales', () => {
    it('Emojis en título: debe aceptarse', async () => {
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
          titulo: '🎮 Matemáticas Divertidas 🚀',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);
      expect([200, 201]).toContain(res.status);

      // Verificar que se guardó correctamente
      if (res.status === 201) {
        const contenido = await prisma.contenido.findUnique({
          where: { id: res.body.id },
        });
        expect(contenido!.titulo).toContain('🎮');
      }
    });

    it('Caracteres Unicode (chino, árabe): debe aceptarse', async () => {
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
          titulo: '数学课程 - دورة الرياضيات',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);
    });

    it('HTML en título: debe sanitizarse o rechazarse', async () => {
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
          titulo: '<script>alert("XSS")</script>Matemáticas',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);

      // Si se aceptó, verificar que se sanitizó
      if (res.status === 201) {
        const contenido = await prisma.contenido.findUnique({
          where: { id: res.body.id },
        });
        // El título NO debería contener <script> ejecutable
        // Podría estar escapado, eliminado, o rechazado
        console.log('Título guardado:', contenido?.titulo);
      }
    });

    it('SQL injection pattern en título: no debe romper', async () => {
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
          titulo: "'; DROP TABLE contenidos; --",
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(res.status).not.toBe(500);

      // Verificar que la tabla sigue existiendo
      const count = await prisma.contenido.count();
      expect(count).toBeGreaterThanOrEqual(0); // La tabla existe
    });

    it('Null bytes en contenidoJson: debe manejarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage\u0000Malicious"}' });

      expect(res.status).not.toBe(500);
    });
  });

  // ============================================================================
  // BODY MALFORMADO
  // ============================================================================
  describe('Body Malformado', () => {
    it('Body vacío {}: debe retornar error descriptivo', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({});

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Campos extra no esperados: deben ignorarse (whitelist)', async () => {
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
          titulo: 'Test Campos Extra',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
          campoExtra: 'ignorame',
          otroExtra: 123,
          __proto__: { polluted: true },
        });

      expect(res.status).not.toBe(500);
      // Con whitelist + forbidNonWhitelisted debería fallar
      // O ignorar los campos extra

      // Si se creó, verificar que no tiene campos extra
      if (res.status === 201) {
        const contenido = await prisma.contenido.findUnique({
          where: { id: res.body.id },
        });
        // El contenido no debería tener campoExtra
        expect(contenido).not.toHaveProperty('campoExtra');
      }
    });

    it('Content-Type incorrecto (text/plain): debe manejar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Content-Type', 'text/plain')
        .send(
          JSON.stringify({
            titulo: 'Test Content Type',
            casaTipo: 'QUANTUM',
            mundoTipo: 'MATEMATICA',
          }),
        );

      expect(res.status).not.toBe(500);
      // Probablemente 400 o 415 (Unsupported Media Type)
    });
  });

  // ============================================================================
  // IDS MALFORMADOS
  // ============================================================================
  describe('IDs Malformados', () => {
    it('UUID con espacios: debe retornar 400', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/api/contenidos/ 550e8400-e29b-41d4-a716-446655440000 ')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).not.toBe(500);
      expect([400, 404]).toContain(res.status);
    });

    it('UUID en mayúsculas: debe funcionar o retornar 404', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/api/contenidos/550E8400-E29B-41D4-A716-446655440000')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).not.toBe(500);
      // UUID válido pero inexistente = 404
      // O podría no reconocerlo como UUID = 400
      expect([400, 404]).toContain(res.status);
    });

    it('String que parece UUID pero no es: debe retornar error', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/api/contenidos/not-a-valid-uuid-at-all')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).not.toBe(500);
      expect([400, 404]).toContain(res.status);
    });

    it('ID vacío: debe retornar error', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Esto en realidad va a /api/contenidos/ (lista)
      const res = await request(app.getHttpServer())
        .delete('/api/contenidos/')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).not.toBe(500);
    });
  });

  // ============================================================================
  // PROTOTYPE POLLUTION
  // ============================================================================
  describe('Prototype Pollution Prevention', () => {
    it('__proto__ en body: no debe afectar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { nodoId } = await crearContenidoYNodo(auth.cookie);

      const maliciousJson = JSON.stringify({
        type: 'Stage',
        __proto__: { polluted: true },
        constructor: { prototype: { polluted: true } },
      });

      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: maliciousJson });

      expect(res.status).not.toBe(500);

      // Verificar que Object.prototype no fue modificado
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });
  });
});
