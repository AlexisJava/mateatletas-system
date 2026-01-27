/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - RACE CONDITIONS
 * ============================================================================
 *
 * OBJETIVO: Detectar problemas de concurrencia que pueden causar pérdida de datos
 * o estados inconsistentes en el Sandbox.
 *
 * ESCENARIOS DE RACE CONDITION A PROBAR:
 *
 * 1. AUTO-SAVE CONCURRENTE
 *    - Dos PATCH al mismo nodo casi simultáneos
 *    - ¿Cuál gana? ¿Se pierde alguno? ¿Estado final consistente?
 *
 * 2. EDITAR MIENTRAS SE GUARDA
 *    - PATCH a nodo A mientras PATCH a nodo B está en vuelo
 *    - Simula cambiar de nodo rápido mientras auto-save
 *
 * 3. PUBLICAR MIENTRAS SE EDITA
 *    - POST /publicar mientras PATCH /nodos está en progreso
 *    - ¿Se publica con contenido viejo o nuevo?
 *
 * 4. ELIMINAR MIENTRAS SE GUARDA
 *    - DELETE nodo mientras PATCH al mismo nodo está en vuelo
 *    - ¿Error 404? ¿Silencioso? ¿Resurge el nodo?
 *
 * 5. CREAR DUPLICADO (DOUBLE CLICK)
 *    - Dos POST /contenidos idénticos casi simultáneos
 *    - ¿Se crean 2 contenidos? ¿Uno falla?
 *
 * METODOLOGÍA:
 * - NO leí la implementación del backend
 * - Tests basados en el CONTRATO de la API
 * - Uso Promise.all para simular concurrencia real
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-race-conditions" --runInBand
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

describe('[INTEGRATION] Sandbox - Race Conditions', () => {
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

  /**
   * Crea un contenido de prueba y retorna su ID y el ID del nodo "Teoría"
   */
  async function crearContenidoConNodo(cookie: string): Promise<{
    contenidoId: string;
    teoriaNodoId: string;
    practicaNodoId: string;
  }> {
    // Crear contenido
    const createRes = await request(app.getHttpServer())
      .post('/api/contenidos')
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        titulo: `Test Race ${Date.now()}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
      });

    expect(createRes.status).toBe(201);
    const contenidoId = createRes.body.id;

    // Obtener árbol para encontrar nodos
    const arbolRes = await request(app.getHttpServer())
      .get(`/api/contenidos/${contenidoId}/arbol`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN);

    expect(arbolRes.status).toBe(200);

    const nodos = arbolRes.body;
    const teoriaNodo = nodos.find(
      (n: { titulo: string }) => n.titulo === 'Teoría',
    );
    const practicaNodo = nodos.find(
      (n: { titulo: string }) => n.titulo === 'Práctica',
    );

    return {
      contenidoId,
      teoriaNodoId: teoriaNodo.id,
      practicaNodoId: practicaNodo.id,
    };
  }

  /**
   * Crea un nodo hijo y retorna su ID
   */
  async function crearNodoHijo(
    cookie: string,
    contenidoId: string,
    parentId: string,
    titulo: string,
  ): Promise<string> {
    const res = await request(app.getHttpServer())
      .post(`/api/contenidos/${contenidoId}/nodos`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({ titulo, parentId });

    expect(res.status).toBe(201);
    return res.body.id;
  }

  // ============================================================================
  // RACE CONDITION: AUTO-SAVE CONCURRENTE AL MISMO NODO
  // ============================================================================
  describe('Race Condition: Dos PATCH al mismo nodo simultáneos', () => {
    /**
     * ESCENARIO:
     * Usuario escribe rápido, auto-save dispara dos requests casi juntos.
     *
     * EXPECTATIVA BBT:
     * - Ambos requests deberían completar (200)
     * - El estado final debe ser consistente (uno de los dos valores)
     * - NO debe haber corrupción de datos
     */
    it('Dos PATCH simultáneos al mismo nodo: ambos deben completar sin error', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId } = await crearContenidoConNodo(
        auth.cookie,
      );
      const nodoId = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        teoriaNodoId,
        'Nodo Test',
      );

      const json1 = JSON.stringify({ type: 'Stage', props: { version: 1 } });
      const json2 = JSON.stringify({ type: 'Stage', props: { version: 2 } });

      // ACT - Disparar ambos requests simultáneamente
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: json1 }),
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: json2 }),
      ]);

      // ASSERT - Ambos deberían completar (200)
      expect([200, 201]).toContain(res1.status);
      expect([200, 201]).toContain(res2.status);

      // Verificar estado final en DB
      const nodoFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoId },
      });

      expect(nodoFinal).not.toBeNull();
      expect(nodoFinal!.contenidoJson).not.toBeNull();

      // El valor final debe ser UNO de los dos (no corrupto)
      const valorFinal = nodoFinal!.contenidoJson;
      expect([json1, json2]).toContain(valorFinal);
    });

    /**
     * ESCENARIO:
     * 5 requests PATCH simultáneos con valores diferentes.
     * Stress test de concurrencia.
     *
     * EXPECTATIVA BBT:
     * - Todos completan sin error 500
     * - Estado final es consistente (un valor válido)
     */
    it('5 PATCH simultáneos: stress test de concurrencia', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId } = await crearContenidoConNodo(
        auth.cookie,
      );
      const nodoId = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        teoriaNodoId,
        'Nodo Stress',
      );

      const jsons = [1, 2, 3, 4, 5].map((v) =>
        JSON.stringify({ type: 'Stage', props: { version: v } }),
      );

      // ACT - 5 requests simultáneos
      const responses = await Promise.all(
        jsons.map((json) =>
          request(app.getHttpServer())
            .patch(`/api/contenidos/nodos/${nodoId}`)
            .set('Cookie', auth.cookie)
            .set('Origin', FRONTEND_ORIGIN)
            .send({ contenidoJson: json }),
        ),
      );

      // ASSERT - Ninguno debe ser 500
      responses.forEach((res, i) => {
        expect(res.status).not.toBe(500);
        // 200, 201, o incluso 409 (conflict) serían aceptables
        expect([200, 201, 409]).toContain(res.status);
      });

      // Estado final consistente
      const nodoFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoId },
      });

      expect(nodoFinal).not.toBeNull();
      expect(jsons).toContain(nodoFinal!.contenidoJson);
    });
  });

  // ============================================================================
  // RACE CONDITION: EDITAR NODO A MIENTRAS AUTO-SAVE DE NODO B
  // ============================================================================
  describe('Race Condition: Cambiar de nodo mientras auto-save', () => {
    /**
     * ESCENARIO:
     * T0: Usuario edita nodo A, auto-save inicia (request 1)
     * T1: Usuario cambia a nodo B, edita, auto-save inicia (request 2)
     * T2: Request 2 llega antes que request 1
     *
     * EXPECTATIVA BBT:
     * - Ambos nodos deben guardar su contenido correcto
     * - No debe haber "cross-contamination" de datos
     */
    it('PATCH a nodo A y nodo B simultáneos: cada uno guarda su contenido', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId, practicaNodoId } =
        await crearContenidoConNodo(auth.cookie);

      const nodoA = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        teoriaNodoId,
        'Nodo A',
      );
      const nodoB = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        practicaNodoId,
        'Nodo B',
      );

      const jsonA = JSON.stringify({ type: 'Stage', props: { nodo: 'A' } });
      const jsonB = JSON.stringify({ type: 'Stage', props: { nodo: 'B' } });

      // ACT - Simular cambio rápido de nodo
      const [resA, resB] = await Promise.all([
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoA}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: jsonA }),
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoB}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: jsonB }),
      ]);

      // ASSERT
      expect([200, 201]).toContain(resA.status);
      expect([200, 201]).toContain(resB.status);

      // Verificar que cada nodo tiene SU contenido (no mezclado)
      const nodoAFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoA },
      });
      const nodoBFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoB },
      });

      expect(nodoAFinal!.contenidoJson).toBe(jsonA);
      expect(nodoBFinal!.contenidoJson).toBe(jsonB);
    });
  });

  // ============================================================================
  // RACE CONDITION: PUBLICAR MIENTRAS SE EDITA
  // ============================================================================
  describe('Race Condition: Publicar mientras se edita', () => {
    /**
     * ESCENARIO:
     * Usuario hace click en "Publicar" mientras auto-save está guardando.
     *
     * EXPECTATIVA BBT:
     * - Publicación debería esperar a que termine el guardado, O
     * - Publicación debería fallar si hay cambios pendientes, O
     * - Publicación procede y cambio se pierde (DOCUMENTAR COMPORTAMIENTO)
     */
    it('PATCH + POST /publicar simultáneos: documentar comportamiento', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId } = await crearContenidoConNodo(
        auth.cookie,
      );
      const nodoId = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        teoriaNodoId,
        'Nodo Publicar',
      );

      // Guardar contenido inicial para que sea publicable
      const jsonInicial = JSON.stringify({
        type: 'Stage',
        props: { initial: true },
      });
      await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: jsonInicial });

      const jsonNuevo = JSON.stringify({
        type: 'Stage',
        props: { nuevo: true },
      });

      // ACT - Publicar mientras se guarda
      const [resPatch, resPublicar] = await Promise.all([
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: jsonNuevo }),
        request(app.getHttpServer())
          .post(`/api/contenidos/${contenidoId}/publicar`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN),
      ]);

      // ASSERT - Documentar qué pasó
      // Caso 1: Publicación exitosa
      // Caso 2: Publicación falla (400 o 409)
      // Caso 3: PATCH falla porque ya está publicado

      // Lo importante es que NO haya error 500
      expect(resPatch.status).not.toBe(500);
      expect(resPublicar.status).not.toBe(500);

      // Verificar estado final
      const contenidoFinal = await prisma.contenido.findUnique({
        where: { id: contenidoId },
      });

      const nodoFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoId },
      });

      // Log para documentar comportamiento actual
      console.log('=== RACE CONDITION: Publicar mientras edita ===');
      console.log('PATCH status:', resPatch.status);
      console.log('Publicar status:', resPublicar.status);
      console.log('Estado final contenido:', contenidoFinal?.estado);
      console.log('Contenido nodo:', nodoFinal?.contenidoJson);
      console.log('===============================================');

      // El contenido debe estar en un estado válido
      expect(['BORRADOR', 'PUBLICADO']).toContain(contenidoFinal?.estado);
    });
  });

  // ============================================================================
  // RACE CONDITION: ELIMINAR MIENTRAS SE GUARDA
  // ============================================================================
  describe('Race Condition: Eliminar nodo mientras se guarda', () => {
    /**
     * ESCENARIO:
     * Usuario elimina un nodo mientras hay un auto-save pendiente.
     *
     * EXPECTATIVA BBT:
     * - DELETE debería tener prioridad (nodo eliminado)
     * - PATCH debería retornar 404 o ser ignorado
     * - NO debe resurgir el nodo después de eliminado
     */
    it('DELETE + PATCH simultáneos: nodo no debe resurgir', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId } = await crearContenidoConNodo(
        auth.cookie,
      );
      const nodoId = await crearNodoHijo(
        auth.cookie,
        contenidoId,
        teoriaNodoId,
        'Nodo a Eliminar',
      );

      const json = JSON.stringify({
        type: 'Stage',
        props: { eliminame: true },
      });

      // ACT - Eliminar mientras se guarda
      const [resDelete, resPatch] = await Promise.all([
        request(app.getHttpServer())
          .delete(`/api/contenidos/nodos/${nodoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN),
        request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${nodoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ contenidoJson: json }),
      ]);

      // ASSERT - Sin errores 500
      expect(resDelete.status).not.toBe(500);
      expect(resPatch.status).not.toBe(500);

      // El nodo NO debe existir después
      const nodoFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoId },
      });

      expect(nodoFinal).toBeNull();
    });
  });

  // ============================================================================
  // RACE CONDITION: DOBLE CLICK EN CREAR
  // ============================================================================
  describe('Race Condition: Doble click en Crear contenido', () => {
    /**
     * ESCENARIO:
     * Usuario hace doble click en "Crear", disparando dos POST simultáneos.
     *
     * EXPECTATIVA BBT:
     * - Ambos podrían crear (títulos únicos no requeridos), O
     * - Segundo debería fallar con 409 Conflict
     * - NO debería crear contenidos corruptos
     */
    it('Dos POST /contenidos simultáneos: ¿crea duplicados?', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const payload = {
        titulo: 'Contenido Doble Click',
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
      };

      // ACT - Doble POST simultáneo
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/contenidos')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send(payload),
        request(app.getHttpServer())
          .post('/api/contenidos')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send(payload),
      ]);

      // ASSERT - Sin errores 500
      expect(res1.status).not.toBe(500);
      expect(res2.status).not.toBe(500);

      // Contar cuántos contenidos se crearon
      const contenidos = await prisma.contenido.findMany({
        where: { titulo: payload.titulo },
      });

      console.log('=== RACE CONDITION: Doble click crear ===');
      console.log('POST 1 status:', res1.status);
      console.log('POST 2 status:', res2.status);
      console.log('Contenidos creados:', contenidos.length);
      console.log('==========================================');

      // Documentar comportamiento - ¿Se crean 2 o 1?
      // Ambos escenarios son válidos dependiendo del diseño
      expect(contenidos.length).toBeGreaterThanOrEqual(1);
      expect(contenidos.length).toBeLessThanOrEqual(2);

      // Verificar que los contenidos creados son válidos
      for (const contenido of contenidos) {
        expect(contenido.titulo).toBe(payload.titulo);
        expect(contenido.casaTipo).toBe(payload.casaTipo);
        expect(contenido.mundoTipo).toBe(payload.mundoTipo);

        // Verificar que tiene nodos estructurales
        const nodos = await prisma.nodoContenido.findMany({
          where: { contenidoId: contenido.id },
        });
        expect(nodos.length).toBeGreaterThanOrEqual(3); // Teoría, Práctica, Evaluación
      }
    });

    /**
     * ESCENARIO:
     * Doble click en crear planificación.
     *
     * EXPECTATIVA BBT:
     * Similar a contenidos, pero más costoso (crea múltiples clases)
     */
    it('Dos POST /admin/planificaciones simultáneos: ¿crea duplicados?', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const payload = {
        titulo: 'Planificación Doble Click',
        descripcion: 'Test de race condition',
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
        cantidadClases: 2,
      };

      // ACT
      const [res1, res2] = await Promise.all([
        request(app.getHttpServer())
          .post('/api/admin/planificaciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send(payload),
        request(app.getHttpServer())
          .post('/api/admin/planificaciones')
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send(payload),
      ]);

      // ASSERT
      expect(res1.status).not.toBe(500);
      expect(res2.status).not.toBe(500);

      const planificaciones = await prisma.planificacion.findMany({
        where: { titulo: payload.titulo },
      });

      console.log('=== RACE CONDITION: Doble click planificación ===');
      console.log('POST 1 status:', res1.status);
      console.log('POST 2 status:', res2.status);
      console.log('Planificaciones creadas:', planificaciones.length);
      console.log('=================================================');

      // Verificar integridad de cada planificación creada
      for (const plan of planificaciones) {
        const clases = await prisma.clasePlanificacion.findMany({
          where: { planificacionId: plan.id },
        });
        expect(clases.length).toBe(payload.cantidadClases);
      }
    });
  });

  // ============================================================================
  // RACE CONDITION: ELIMINAR CONTENIDO MIENTRAS SE CREA NODO
  // ============================================================================
  describe('Race Condition: Eliminar contenido mientras se agrega nodo', () => {
    /**
     * ESCENARIO:
     * Admin elimina contenido mientras auto-save intenta crear un nodo.
     *
     * EXPECTATIVA BBT:
     * - DELETE debería ganar
     * - POST nodo debería retornar 404 o similar
     * - NO deben quedar nodos huérfanos
     */
    it('DELETE contenido + POST nodo simultáneos: no nodos huérfanos', async () => {
      // ARRANGE
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const { contenidoId, teoriaNodoId } = await crearContenidoConNodo(
        auth.cookie,
      );

      // ACT - Eliminar contenido mientras se crea nodo
      const [resDelete, resPost] = await Promise.all([
        request(app.getHttpServer())
          .delete(`/api/contenidos/${contenidoId}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN),
        request(app.getHttpServer())
          .post(`/api/contenidos/${contenidoId}/nodos`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ titulo: 'Nodo Huérfano?', parentId: teoriaNodoId }),
      ]);

      // ASSERT
      expect(resDelete.status).not.toBe(500);
      expect(resPost.status).not.toBe(500);

      // Verificar que no hay contenido
      const contenido = await prisma.contenido.findUnique({
        where: { id: contenidoId },
      });
      expect(contenido).toBeNull();

      // Verificar que no hay nodos huérfanos
      const nodosHuerfanos = await prisma.nodoContenido.findMany({
        where: { contenidoId },
      });
      expect(nodosHuerfanos.length).toBe(0);
    });
  });
});
