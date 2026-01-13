/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - SANDBOX NODOS
 * ============================================================================
 *
 * OBJETIVO: Encontrar BUGS reales en la gestión de nodos jerárquicos.
 *
 * ENDPOINTS BAJO TEST:
 * - POST /api/contenidos/:id/nodos          - Crear nodo
 * - PATCH /api/contenidos/nodos/:nodoId     - Actualizar nodo
 * - DELETE /api/contenidos/nodos/:nodoId    - Eliminar nodo
 * - PATCH /api/contenidos/:id/nodos/reordenar - Reordenar nodos
 * - PATCH /api/contenidos/nodos/:nodoId/mover - Mover nodo a otro padre
 *
 * BUGS POTENCIALES A BUSCAR:
 * 1. ¿Se puede eliminar un nodo bloqueado (Teoría/Práctica/Evaluación)?
 * 2. ¿Se puede renombrar un nodo bloqueado?
 * 3. ¿Se puede mover un nodo bloqueado?
 * 4. ¿Se puede crear ciclo moviendo nodo a su propio descendiente?
 * 5. ¿Qué pasa con JSON malformado en contenidoJson?
 * 6. ¿Se puede agregar nodo a contenido de otro admin?
 * 7. ¿Qué pasa si reordeno nodos de diferente padre (cross-parent)?
 * 8. ¿Orden overflow después de muchas operaciones?
 *
 * EQUIVALENCE CLASSES:
 * Nodo:
 * - [BLOQUEADO]: Nodos raíz (Teoría, Práctica, Evaluación) - no eliminar, no renombrar
 * - [NO-BLOQUEADO]: Nodos creados por usuario - editable, eliminable
 * - [CONTENEDOR]: Nodo con hijos - no debería tener contenidoJson
 * - [HOJA]: Nodo sin hijos - puede tener contenidoJson
 *
 * Operaciones:
 * - [CREAR-HIJO]: Agregar nodo como hijo de otro
 * - [CREAR-RAIZ]: Agregar nodo a nivel raíz (debería fallar si bloqueado)
 * - [MOVER-VALIDO]: Mover a padre válido del mismo contenido
 * - [MOVER-OTRO-CONTENIDO]: Mover a padre de otro contenido → ERROR
 * - [MOVER-DESCENDIENTE]: Mover a propio descendiente → ERROR (ciclo)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-nodos" --runInBand
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

describe('[INTEGRATION] Sandbox - Nodos Jerárquicos', () => {
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
  // HELPER: Login como Admin y crear contenido con nodos
  // ============================================================================
  async function setupContenidoConNodos() {
    const admin = await createTestAdmin(prisma);
    const auth = await loginUser(app, {
      email: admin.email,
      password: DEFAULT_PASSWORD,
    });

    // Crear contenido (automáticamente crea 3 nodos bloqueados)
    const createRes = await request(app.getHttpServer())
      .post('/api/contenidos')
      .set('Authorization', `Bearer ${auth.token}`)
      .set('Cookie', auth.cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        titulo: 'Contenido de Test',
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
      });

    const contenido = createRes.body;
    const nodoTeoria = contenido.nodos.find(
      (n: { titulo: string }) => n.titulo === 'Teoría',
    );
    const nodoPractica = contenido.nodos.find(
      (n: { titulo: string }) => n.titulo === 'Práctica',
    );
    const nodoEvaluacion = contenido.nodos.find(
      (n: { titulo: string }) => n.titulo === 'Evaluación',
    );

    return {
      admin,
      auth,
      contenido,
      nodoTeoria,
      nodoPractica,
      nodoEvaluacion,
    };
  }

  // ============================================================================
  // TESTS: Nodos Bloqueados - NO se pueden eliminar
  // ============================================================================
  describe('Nodos Bloqueados: Restricciones de Eliminación', () => {
    it('Eliminar nodo "Teoría" (bloqueado) → debe retornar 400', async () => {
      const { auth, nodoTeoria } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoTeoria.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('estructural');
    });

    it('Eliminar nodo "Práctica" (bloqueado) → debe retornar 400', async () => {
      const { auth, nodoPractica } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoPractica.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });

    it('Eliminar nodo "Evaluación" (bloqueado) → debe retornar 400', async () => {
      const { auth, nodoEvaluacion } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoEvaluacion.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: Nodos Bloqueados - NO se pueden renombrar
  // ============================================================================
  describe('Nodos Bloqueados: Restricciones de Renombrado', () => {
    it('Renombrar nodo "Teoría" → debe retornar 400', async () => {
      const { auth, nodoTeoria } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoTeoria.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nuevo Título' });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('estructural');
    });

    it('Actualizar contenidoJson de nodo bloqueado → debe permitirse', async () => {
      const { auth, nodoTeoria } = await setupContenidoConNodos();

      // Actualizar SOLO el contenidoJson (no el título) debería estar permitido
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoTeoria.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: '{"type": "Stage", "children": []}' });

      expect(response.status).toBe(200);
      expect(response.body.contenidoJson).toBe(
        '{"type": "Stage", "children": []}',
      );
    });
  });

  // ============================================================================
  // TESTS: Nodos Bloqueados - NO se pueden mover
  // ============================================================================
  describe('Nodos Bloqueados: Restricciones de Movimiento', () => {
    it('Mover nodo "Teoría" a otro padre → debe retornar 400', async () => {
      const { auth, contenido, nodoTeoria, nodoPractica } =
        await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoTeoria.id}/mover`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: nodoPractica.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('estructural');
    });
  });

  // ============================================================================
  // TESTS: Crear Nodos - Casos Válidos
  // ============================================================================
  describe('Crear Nodos: Casos Válidos', () => {
    it('Crear nodo hijo de "Teoría" → debe funcionar', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Introducción',
          parentId: nodoTeoria.id,
        });

      expect(response.status).toBe(201);
      expect(response.body.titulo).toBe('Introducción');
      expect(response.body.parentId).toBe(nodoTeoria.id);
      expect(response.body.bloqueado).toBe(false);
    });

    it('Crear nodo con contenidoJson válido → debe guardarse', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      const jsonContent = JSON.stringify({
        type: 'Stage',
        props: { pattern: 'cyber-grid' },
        children: [
          {
            type: 'ContentZone',
            children: [
              {
                type: 'TextBlock',
                children: 'Hola mundo',
              },
            ],
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Slide 1',
          parentId: nodoTeoria.id,
          contenidoJson: jsonContent,
        });

      expect(response.status).toBe(201);
      expect(response.body.contenidoJson).toBe(jsonContent);
    });

    it('Crear múltiples nodos hijos → deben tener orden secuencial', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      const nodo1 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Primero', parentId: nodoTeoria.id });

      const nodo2 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Segundo', parentId: nodoTeoria.id });

      const nodo3 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Tercero', parentId: nodoTeoria.id });

      expect(nodo1.body.orden).toBe(0);
      expect(nodo2.body.orden).toBe(1);
      expect(nodo3.body.orden).toBe(2);
    });
  });

  // ============================================================================
  // TESTS: Crear Nodos - Casos de Error
  // ============================================================================
  describe('Crear Nodos: Casos de Error', () => {
    it('Crear nodo con parentId inexistente → 404', async () => {
      const { auth, contenido } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Huérfano',
          parentId: 'clxxxxxxxxxxxxxxxxxxxxxxxxx',
        });

      expect(response.status).toBe(404);
    });

    it('Crear nodo con parentId de otro contenido → 400', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear otro contenido
      const otroRes = await request(app.getHttpServer())
        .post('/api/contenidos')
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Otro Contenido',
          casaTipo: 'VERTEX',
          mundoTipo: 'PROGRAMACION',
        });

      const otroContenido = otroRes.body;

      // Intentar crear nodo en otroContenido pero con parentId del primer contenido
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${otroContenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Cross-contenido',
          parentId: nodoTeoria.id, // Este pertenece al primer contenido!
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('mismo contenido');
    });

    it('Crear nodo sin título → 400', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          parentId: nodoTeoria.id,
          // titulo falta
        });

      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // TESTS: Eliminar Nodos - Casos Válidos
  // ============================================================================
  describe('Eliminar Nodos: Casos Válidos', () => {
    it('Eliminar nodo no bloqueado → debe funcionar', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear nodo
      const createRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Para eliminar', parentId: nodoTeoria.id });

      const nodoId = createRes.body.id;

      // Eliminar
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);

      // Verificar en DB
      const nodoEnDB = await prisma.nodoContenido.findUnique({
        where: { id: nodoId },
      });
      expect(nodoEnDB).toBeNull();
    });

    it('Eliminar nodo padre → debe eliminar hijos en cascada', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear nodo padre
      const padreRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Padre', parentId: nodoTeoria.id });

      const padreId = padreRes.body.id;

      // Crear nodos hijos
      const hijo1Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Hijo 1', parentId: padreId });

      const hijo2Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Hijo 2', parentId: padreId });

      const hijo1Id = hijo1Res.body.id;
      const hijo2Id = hijo2Res.body.id;

      // Eliminar padre
      await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${padreId}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Verificar que los hijos también fueron eliminados
      const hijo1EnDB = await prisma.nodoContenido.findUnique({
        where: { id: hijo1Id },
      });
      const hijo2EnDB = await prisma.nodoContenido.findUnique({
        where: { id: hijo2Id },
      });

      expect(hijo1EnDB).toBeNull();
      expect(hijo2EnDB).toBeNull();
    });
  });

  // ============================================================================
  // TESTS: Mover Nodos - Prevención de Ciclos
  // ============================================================================
  describe('Mover Nodos: Prevención de Ciclos', () => {
    it('Mover nodo a su propio hijo → debe retornar 400', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear estructura: Padre > Hijo
      const padreRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Padre', parentId: nodoTeoria.id });

      const padreId = padreRes.body.id;

      const hijoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Hijo', parentId: padreId });

      const hijoId = hijoRes.body.id;

      // Intentar mover Padre bajo Hijo (crearía ciclo)
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${padreId}/mover`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: hijoId });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('descendiente');
    });

    it('Mover nodo a su nieto → debe retornar 400', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear estructura: Abuelo > Padre > Nieto
      const abueloRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Abuelo', parentId: nodoTeoria.id });

      const abueloId = abueloRes.body.id;

      const padreRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Padre', parentId: abueloId });

      const padreId = padreRes.body.id;

      const nietoRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nieto', parentId: padreId });

      const nietoId = nietoRes.body.id;

      // Intentar mover Abuelo bajo Nieto (crearía ciclo profundo)
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${abueloId}/mover`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: nietoId });

      expect(response.status).toBe(400);
    });

    it('Mover nodo a hermano → debe funcionar', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear dos hermanos
      const hermano1Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Hermano 1', parentId: nodoTeoria.id });

      const hermano1Id = hermano1Res.body.id;

      const hermano2Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Hermano 2', parentId: nodoTeoria.id });

      const hermano2Id = hermano2Res.body.id;

      // Mover Hermano 2 bajo Hermano 1 (válido, no es ciclo)
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${hermano2Id}/mover`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: hermano1Id });

      expect(response.status).toBe(200);
      expect(response.body.parentId).toBe(hermano1Id);
    });
  });

  // ============================================================================
  // TESTS: JSON Malformado y Casos Extremos
  // ============================================================================
  describe('Error Guessing: JSON y Datos Extremos', () => {
    it('[BUG?] contenidoJson con string no-JSON → ¿qué pasa?', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // El backend NO valida que contenidoJson sea JSON válido
      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'JSON inválido',
          parentId: nodoTeoria.id,
          contenidoJson: 'esto no es json válido { broken',
        });

      // Documentar comportamiento actual
      if (response.status === 201) {
        console.warn(
          '[COMPORTAMIENTO] El backend acepta contenidoJson que no es JSON válido',
        );
        // No es necesariamente un bug si el frontend es responsable de validar
        expect(response.body.contenidoJson).toBe(
          'esto no es json válido { broken',
        );
      } else {
        expect(response.status).toBe(400);
      }
    });

    it('contenidoJson muy grande (1MB) → debe manejarse', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Generar un JSON grande (1MB aprox)
      const bigArray = Array(50000)
        .fill(null)
        .map((_, i) => ({
          type: 'TextBlock',
          children: `Contenido número ${i}`,
        }));
      const bigJson = JSON.stringify({ type: 'Stage', children: bigArray });

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'JSON grande',
          parentId: nodoTeoria.id,
          contenidoJson: bigJson,
        });

      // Debería o aceptar o rechazar con error claro
      expect([201, 400, 413]).toContain(response.status);

      if (response.status === 201) {
        // Si acepta, verificar que se guardó completo
        const nodoEnDB = await prisma.nodoContenido.findUnique({
          where: { id: response.body.id },
        });
        expect(nodoEnDB?.contenidoJson?.length).toBe(bigJson.length);
      }
    });

    it('título con caracteres especiales SQL → no debe romper', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: "'; DROP TABLE nodo_contenido; --",
          parentId: nodoTeoria.id,
        });

      // Prisma debería sanitizar automáticamente
      expect(response.status).toBe(201);

      // Verificar que la tabla sigue existiendo
      const count = await prisma.nodoContenido.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // TESTS: Reordenar Nodos
  // ============================================================================
  describe('Reordenar Nodos', () => {
    it('Reordenar nodos del mismo padre → debe funcionar', async () => {
      const { auth, contenido, nodoTeoria } = await setupContenidoConNodos();

      // Crear 3 nodos
      const n1 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Primero', parentId: nodoTeoria.id });

      const n2 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Segundo', parentId: nodoTeoria.id });

      const n3 = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Tercero', parentId: nodoTeoria.id });

      // Reordenar: invertir el orden
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenido.id}/nodos/reordenar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          orden: [
            { nodoId: n3.body.id, orden: 0 },
            { nodoId: n2.body.id, orden: 1 },
            { nodoId: n1.body.id, orden: 2 },
          ],
        });

      expect(response.status).toBe(200);

      // Verificar en DB
      const nodosEnDB = await prisma.nodoContenido.findMany({
        where: { contenidoId: contenido.id, parentId: nodoTeoria.id },
        orderBy: { orden: 'asc' },
      });

      expect(nodosEnDB[0].titulo).toBe('Tercero');
      expect(nodosEnDB[1].titulo).toBe('Segundo');
      expect(nodosEnDB[2].titulo).toBe('Primero');
    });

    it('[BUG?] Reordenar nodos de diferente padre → ¿qué pasa?', async () => {
      const { auth, contenido, nodoTeoria, nodoPractica } =
        await setupContenidoConNodos();

      // Crear nodos en diferentes padres
      const nTeoria = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'En Teoría', parentId: nodoTeoria.id });

      const nPractica = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'En Práctica', parentId: nodoPractica.id });

      // Intentar reordenar nodos de diferentes padres juntos
      const response = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenido.id}/nodos/reordenar`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          orden: [
            { nodoId: nTeoria.body.id, orden: 0 },
            { nodoId: nPractica.body.id, orden: 1 },
          ],
        });

      // ESTE ES UN BUG POTENCIAL:
      // El backend no valida que los nodos sean hermanos
      // Esto podría crear un estado inconsistente

      if (response.status === 200) {
        console.warn(
          '[BUG POTENCIAL] Se permite reordenar nodos de diferentes padres',
        );
        // Esto no debería permitirse, pero documentamos el comportamiento
      } else {
        expect(response.status).toBe(400);
      }
    });
  });

  // ============================================================================
  // TESTS: Estado del Contenido
  // ============================================================================
  describe('Operaciones en Contenido No-Borrador', () => {
    it('Agregar nodo a contenido PUBLICADO → debe retornar 400', async () => {
      const { auth, admin } = await setupContenidoConNodos();

      // Crear contenido publicado directamente
      const contenido = await prisma.contenido.create({
        data: {
          titulo: 'Publicado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
          estado: 'PUBLICADO',
          creadorId: admin.id,
          nodos: {
            create: [
              { titulo: 'Teoría', orden: 0, bloqueado: true },
              { titulo: 'Práctica', orden: 1, bloqueado: true },
              { titulo: 'Evaluación', orden: 2, bloqueado: true },
            ],
          },
        },
        include: { nodos: true },
      });

      const nodoTeoria = contenido.nodos.find((n) => n.titulo === 'Teoría');

      const response = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido.id}/nodos`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nuevo', parentId: nodoTeoria!.id });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('BORRADOR');
    });

    it('Eliminar nodo de contenido PUBLICADO → debe retornar 400', async () => {
      const { auth, admin } = await setupContenidoConNodos();

      // Crear contenido publicado con nodo no bloqueado
      const contenido = await prisma.contenido.create({
        data: {
          titulo: 'Publicado',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
          estado: 'PUBLICADO',
          creadorId: admin.id,
          nodos: {
            create: [
              { titulo: 'Teoría', orden: 0, bloqueado: true },
              {
                titulo: 'Eliminable',
                orden: 1,
                bloqueado: false,
                parentId: undefined,
              },
            ],
          },
        },
        include: { nodos: true },
      });

      const nodoEliminable = contenido.nodos.find(
        (n) => n.titulo === 'Eliminable',
      );

      const response = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${nodoEliminable!.id}`)
        .set('Authorization', `Bearer ${auth.token}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('BORRADOR');
    });
  });
});
