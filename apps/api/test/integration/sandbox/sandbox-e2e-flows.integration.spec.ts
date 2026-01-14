/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - FLUJOS E2E COMPLETOS
 * ============================================================================
 *
 * OBJETIVO: Verificar que los flujos completos de usuario funcionan de punta
 * a punta, simulando el uso real del Sandbox.
 *
 * FLUJOS A PROBAR:
 *
 * 1. MICROLECCIÓN COMPLETA
 *    Crear → Agregar nodos → Guardar contenido → Publicar → Verificar
 *
 * 2. PLANIFICACIÓN COMPLETA
 *    Crear → Verificar clases → Editar contenido de clase → Publicar
 *
 * 3. FLUJO DE EDICIÓN CON AUTO-SAVE
 *    Crear → Editar → Cambiar nodo → Volver → Verificar persistencia
 *
 * METODOLOGÍA:
 * - NO leí la implementación
 * - Tests basados en el flujo de usuario documentado
 * - Verifico estado en DB como "juez imparcial"
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sandbox-e2e-flows" --runInBand
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

describe('[INTEGRATION] Sandbox - Flujos E2E Completos', () => {
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
  // FLUJO E2E: MICROLECCIÓN COMPLETA
  // ============================================================================
  describe('Flujo E2E: Crear Microlección Completa', () => {
    /**
     * FLUJO COMPLETO:
     * 1. Admin crea microlección
     * 2. Verifica que se crearon los 3 nodos base (Teoría, Práctica, Evaluación)
     * 3. Agrega un nodo hijo a "Teoría"
     * 4. Guarda contenido JSON en el nodo
     * 5. Agrega un nodo hijo a "Práctica"
     * 6. Guarda contenido JSON en el nodo
     * 7. Publica la microlección
     * 8. Verifica estado final PUBLICADO
     * 9. Intenta editar (debería fallar)
     */
    it('Flujo completo: crear → agregar nodos → guardar → publicar', async () => {
      // ==================== PASO 1: Crear microlección ====================
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
          titulo: 'Microlección E2E: Fracciones',
          casaTipo: 'QUANTUM',
          mundoTipo: 'MATEMATICA',
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body).toHaveProperty('id');
      const contenidoId = createRes.body.id;

      // ==================== PASO 2: Verificar nodos base ====================
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(arbolRes.status).toBe(200);
      expect(arbolRes.body).toBeInstanceOf(Array);

      const nodos = arbolRes.body;
      const teoriaNodo = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const practicaNodo = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Práctica',
      );
      const evaluacionNodo = nodos.find(
        (n: { titulo: string }) => n.titulo === 'Evaluación',
      );

      expect(teoriaNodo).toBeDefined();
      expect(practicaNodo).toBeDefined();
      expect(evaluacionNodo).toBeDefined();

      // Verificar que están bloqueados
      expect(teoriaNodo.bloqueado).toBe(true);
      expect(practicaNodo.bloqueado).toBe(true);
      expect(evaluacionNodo.bloqueado).toBe(true);

      // ==================== PASO 3: Agregar nodo a Teoría ====================
      const addTeoriaRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Introducción a Fracciones',
          parentId: teoriaNodo.id,
        });

      expect(addTeoriaRes.status).toBe(201);
      const nodoTeoriaId = addTeoriaRes.body.id;

      // ==================== PASO 4: Guardar contenido en nodo Teoría ====================
      const contenidoTeoria = JSON.stringify({
        type: 'Stage',
        props: { pattern: 'dots' },
        children: [
          {
            type: 'ContentZone',
            props: { variant: 'center' },
            children: [
              {
                type: 'LessonHeader',
                props: {
                  title: '¿Qué son las fracciones?',
                  subtitle: 'Aprende a dividir en partes iguales',
                },
              },
            ],
          },
        ],
      });

      const saveTeoriaRes = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoTeoriaId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: contenidoTeoria });

      expect(saveTeoriaRes.status).toBe(200);

      // ==================== PASO 5: Agregar nodo a Práctica ====================
      const addPracticaRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Ejercicio: Identificar Fracciones',
          parentId: practicaNodo.id,
        });

      expect(addPracticaRes.status).toBe(201);
      const nodoPracticaId = addPracticaRes.body.id;

      // ==================== PASO 6: Guardar contenido en nodo Práctica ====================
      const contenidoPractica = JSON.stringify({
        type: 'Stage',
        props: { pattern: 'cyber-grid' },
        children: [
          {
            type: 'ContentZone',
            props: { variant: 'center' },
            children: [
              {
                type: 'Quiz',
                props: {
                  question: '¿Cuál representa 1/2?',
                  options: ['Medio pastel', 'Todo el pastel', 'Sin pastel'],
                  correctIndex: 0,
                },
              },
            ],
          },
        ],
      });

      const savePracticaRes = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoPracticaId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: contenidoPractica });

      expect(savePracticaRes.status).toBe(200);

      // ==================== PASO 7: Publicar ====================
      const publicarRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/publicar`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(publicarRes.status).toBe(201);

      // ==================== PASO 8: Verificar estado PUBLICADO ====================
      const contenidoFinal = await prisma.contenido.findUnique({
        where: { id: contenidoId },
        include: { nodos: true },
      });

      expect(contenidoFinal).not.toBeNull();
      expect(contenidoFinal!.estado).toBe('PUBLICADO');
      expect(contenidoFinal!.nodos.length).toBe(5); // 3 base + 2 agregados

      // Verificar que los nodos tienen contenido
      const nodoTeoriaFinal = contenidoFinal!.nodos.find(
        (n) => n.id === nodoTeoriaId,
      );
      const nodoPracticaFinal = contenidoFinal!.nodos.find(
        (n) => n.id === nodoPracticaId,
      );

      expect(nodoTeoriaFinal!.contenidoJson).toBe(contenidoTeoria);
      expect(nodoPracticaFinal!.contenidoJson).toBe(contenidoPractica);

      // ==================== PASO 9: Intentar editar publicado ====================
      const editPublicadoRes = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoTeoriaId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          contenidoJson: '{"type": "Stage", "props": {"hacked": true}}',
        });

      // Debería fallar (400 o 403)
      expect([400, 403]).toContain(editPublicadoRes.status);
    });
  });

  // ============================================================================
  // FLUJO E2E: PLANIFICACIÓN COMPLETA
  // ============================================================================
  describe('Flujo E2E: Crear Planificación Completa', () => {
    /**
     * FLUJO COMPLETO:
     * 1. Admin crea planificación con 3 clases
     * 2. Verifica que se crearon 3 ClasePlanificacion
     * 3. Verifica que cada clase tiene contenido asociado
     * 4. Edita contenido de clase 1 (Teoría)
     * 5. Edita contenido de clase 2 (Práctica)
     * 6. Publica planificación
     * 7. Verifica que todos los contenidos quedaron PUBLICADOS
     */
    it('Flujo completo: crear planificación → editar clases → publicar', async () => {
      // ==================== PASO 1: Crear planificación ====================
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const createRes = await request(app.getHttpServer())
        .post('/api/admin/planificaciones')
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Planificación E2E: Álgebra Básica',
          descripcion: 'Curso completo de álgebra para principiantes',
          casa_tipo: 'VERTEX',
          mundo_tipo: 'MATEMATICA',
          cantidad_clases: 3,
        });

      expect(createRes.status).toBe(201);
      expect(createRes.body).toHaveProperty('id');
      const planificacionId = createRes.body.id;

      // ==================== PASO 2: Verificar clases creadas ====================
      const getRes = await request(app.getHttpServer())
        .get(`/api/admin/planificaciones/${planificacionId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(getRes.status).toBe(200);
      expect(getRes.body.clases).toHaveLength(3);

      const clases = getRes.body.clases;

      // ==================== PASO 3: Verificar contenidos asociados ====================
      for (const clase of clases) {
        // Cada clase debería tener teoria_id y practica_id
        expect(clase).toHaveProperty('teoria_id');
        expect(clase).toHaveProperty('practica_id');

        // Verificar que los contenidos existen
        if (clase.teoria_id) {
          const teoriaContenido = await prisma.contenido.findUnique({
            where: { id: clase.teoria_id },
          });
          expect(teoriaContenido).not.toBeNull();
          expect(teoriaContenido!.estado).toBe('BORRADOR');
        }

        if (clase.practica_id) {
          const practicaContenido = await prisma.contenido.findUnique({
            where: { id: clase.practica_id },
          });
          expect(practicaContenido).not.toBeNull();
          expect(practicaContenido!.estado).toBe('BORRADOR');
        }
      }

      // ==================== PASO 4: Agregar contenido a TODAS las clases ====================
      // Para publicar una planificación, cada clase necesita contenido en teoría Y práctica
      // Helper para agregar contenido a un contenido (teoría o práctica)
      const agregarContenidoANodo = async (
        contenidoId: string,
        tipoNodo: string,
        titulo: string,
      ) => {
        const arbolRes = await request(app.getHttpServer())
          .get(`/api/contenidos/${contenidoId}/arbol`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN);

        expect(arbolRes.status).toBe(200);
        const nodos = arbolRes.body;
        const parentNodo = nodos.find(
          (n: { titulo: string }) => n.titulo === tipoNodo,
        );

        const addNodoRes = await request(app.getHttpServer())
          .post(`/api/contenidos/${contenidoId}/nodos`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({
            titulo,
            parentId: parentNodo.id,
          });

        expect(addNodoRes.status).toBe(201);

        const saveRes = await request(app.getHttpServer())
          .patch(`/api/contenidos/nodos/${addNodoRes.body.id}`)
          .set('Cookie', auth.cookie)
          .set('Origin', FRONTEND_ORIGIN)
          .send({
            contenidoJson: JSON.stringify({
              type: 'Stage',
              props: { pattern: 'aurora' },
              children: [{ type: 'LessonHeader', props: { title: titulo } }],
            }),
          });

        expect(saveRes.status).toBe(200);
      };

      // Agregar contenido a todas las clases (teoría y práctica)
      for (let i = 0; i < clases.length; i++) {
        const clase = clases[i];
        if (clase.teoria_id) {
          await agregarContenidoANodo(
            clase.teoria_id,
            'Teoría',
            `Contenido Teoría Clase ${i + 1}`,
          );
        }
        if (clase.practica_id) {
          await agregarContenidoANodo(
            clase.practica_id,
            'Práctica',
            `Ejercicios Clase ${i + 1}`,
          );
        }
      }

      // ==================== PASO 5: Publicar planificación ====================
      const publicarRes = await request(app.getHttpServer())
        .post(`/api/admin/planificaciones/${planificacionId}/publicar`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(publicarRes.status).toBe(201);

      // ==================== PASO 6: Verificar estado final ====================
      const planFinal = await prisma.planificacion.findUnique({
        where: { id: planificacionId },
        include: { clases: true },
      });

      expect(planFinal).not.toBeNull();
      expect(planFinal!.estado).toBe('PUBLICADO');

      // Verificar que los contenidos asociados están publicados
      for (const clase of planFinal!.clases) {
        if (clase.teoria_id) {
          const teoriaContenido = await prisma.contenido.findUnique({
            where: { id: clase.teoria_id },
          });
          expect(teoriaContenido!.estado).toBe('PUBLICADO');
        }
        if (clase.practica_id) {
          const practicaContenido = await prisma.contenido.findUnique({
            where: { id: clase.practica_id },
          });
          expect(practicaContenido!.estado).toBe('PUBLICADO');
        }
      }
    });
  });

  // ============================================================================
  // FLUJO E2E: EDICIÓN CON CAMBIO DE NODO
  // ============================================================================
  describe('Flujo E2E: Editar y Cambiar de Nodo', () => {
    /**
     * FLUJO:
     * 1. Crear contenido
     * 2. Seleccionar nodo A, editar, guardar
     * 3. Cambiar a nodo B, editar, guardar
     * 4. Volver a nodo A, verificar que conservó su contenido
     * 5. Verificar que nodo B también tiene su contenido
     *
     * Simula el uso real donde el usuario navega entre nodos
     */
    it('Editar múltiples nodos secuencialmente: cada uno conserva su contenido', async () => {
      // ARRANGE
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
          titulo: 'Test Navegación Nodos',
          casaTipo: 'PULSAR',
          mundoTipo: 'PROGRAMACION',
        });

      const contenidoId = createRes.body.id;

      // Obtener nodos base
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const practicaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Práctica',
      );

      // Crear nodo A (bajo Teoría)
      const nodoARes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo A', parentId: teoriaNodo.id });

      const nodoAId = nodoARes.body.id;

      // Crear nodo B (bajo Práctica)
      const nodoBRes = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nodo B', parentId: practicaNodo.id });

      const nodoBId = nodoBRes.body.id;

      // ==================== PASO 2: Editar nodo A ====================
      const contenidoA = JSON.stringify({
        type: 'Stage',
        props: { nodo: 'A', version: 1 },
      });

      await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoAId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: contenidoA });

      // ==================== PASO 3: "Cambiar" a nodo B y editar ====================
      const contenidoB = JSON.stringify({
        type: 'Stage',
        props: { nodo: 'B', version: 1 },
      });

      await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodoBId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ contenidoJson: contenidoB });

      // ==================== PASO 4: "Volver" a nodo A - verificar ====================
      const getNodoA = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Buscar nodo A en el árbol
      const findNodoA = (
        nodos: Array<{ id: string; hijos?: Array<{ id: string }> }>,
      ): { id: string; contenidoJson?: string } | null => {
        for (const nodo of nodos) {
          if (nodo.id === nodoAId)
            return nodo as { id: string; contenidoJson?: string };
          if (nodo.hijos) {
            const found = findNodoA(
              nodo.hijos as Array<{
                id: string;
                hijos?: Array<{ id: string }>;
              }>,
            );
            if (found) return found;
          }
        }
        return null;
      };

      // Verificar directamente en DB (más confiable)
      const nodoAFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoAId },
      });
      const nodoBFinal = await prisma.nodoContenido.findUnique({
        where: { id: nodoBId },
      });

      // ==================== ASSERT ====================
      expect(nodoAFinal!.contenidoJson).toBe(contenidoA);
      expect(nodoBFinal!.contenidoJson).toBe(contenidoB);

      // Los contenidos NO deben estar mezclados
      expect(nodoAFinal!.contenidoJson).not.toBe(contenidoB);
      expect(nodoBFinal!.contenidoJson).not.toBe(contenidoA);
    });
  });

  // ============================================================================
  // FLUJO E2E: ELIMINAR Y VERIFICAR CASCADA
  // ============================================================================
  describe('Flujo E2E: Eliminar Contenido con Nodos', () => {
    /**
     * FLUJO:
     * 1. Crear contenido
     * 2. Agregar varios nodos anidados
     * 3. Eliminar contenido
     * 4. Verificar que NO quedan nodos huérfanos
     */
    it('Eliminar contenido elimina todos sus nodos en cascada', async () => {
      // ARRANGE
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
          titulo: 'Contenido a Eliminar',
          casaTipo: 'QUANTUM',
          mundoTipo: 'CIENCIAS',
        });

      const contenidoId = createRes.body.id;

      // Obtener nodo Teoría
      const arbolRes = await request(app.getHttpServer())
        .get(`/api/contenidos/${contenidoId}/arbol`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      const teoriaNodo = arbolRes.body.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Agregar nodos anidados
      const nivel1Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nivel 1', parentId: teoriaNodo.id });

      const nivel2Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nivel 2', parentId: nivel1Res.body.id });

      const nivel3Res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Nivel 3', parentId: nivel2Res.body.id });

      // Verificar que se crearon todos
      const nodosAntes = await prisma.nodoContenido.findMany({
        where: { contenidoId },
      });
      expect(nodosAntes.length).toBe(6); // 3 base + 3 agregados

      // ACT - Eliminar contenido
      const deleteRes = await request(app.getHttpServer())
        .delete(`/api/contenidos/${contenidoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(deleteRes.status).toBe(200);

      // ASSERT - No deben quedar nodos
      const nodosDespues = await prisma.nodoContenido.findMany({
        where: { contenidoId },
      });
      expect(nodosDespues.length).toBe(0);

      // El contenido tampoco debe existir
      const contenidoDespues = await prisma.contenido.findUnique({
        where: { id: contenidoId },
      });
      expect(contenidoDespues).toBeNull();
    });
  });
});
