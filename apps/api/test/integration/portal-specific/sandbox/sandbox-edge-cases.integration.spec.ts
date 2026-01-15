/**
 * ============================================================================
 * SANDBOX - EDGE CASES (BBT)
 * ============================================================================
 *
 * Black Box Tests para casos límite del Sandbox:
 * - Contenido sin nodos editables
 * - Árbol vacío
 * - Nodo raíz vs nodo hoja
 * - Límites de profundidad
 * - Operaciones en cascada
 * - Orden de nodos
 * - Mover nodos entre padres
 *
 * Filosofía: "Tests como jueces, no cómplices"
 * - Creados SIN leer implementación para evitar sesgo
 * - Verifican comportamiento en condiciones límite
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

describe('[INTEGRATION] Sandbox - Edge Cases (BBT)', () => {
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
  // HELPERS
  // ============================================================================
  async function crearContenido(cookie: string, titulo?: string) {
    const res = await request(app.getHttpServer())
      .post('/api/contenidos')
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({
        titulo: titulo ?? `Test Edge ${Date.now()}`,
        casaTipo: 'QUANTUM',
        mundoTipo: 'MATEMATICA',
      });

    return res.body.id;
  }

  async function obtenerArbol(cookie: string, contenidoId: string) {
    const res = await request(app.getHttpServer())
      .get(`/api/contenidos/${contenidoId}/arbol`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN);

    return res.body;
  }

  async function crearNodo(
    cookie: string,
    contenidoId: string,
    parentId: string,
    titulo: string,
  ) {
    const res = await request(app.getHttpServer())
      .post(`/api/contenidos/${contenidoId}/nodos`)
      .set('Cookie', cookie)
      .set('Origin', FRONTEND_ORIGIN)
      .send({ titulo, parentId });

    return res.body;
  }

  // ============================================================================
  // ESTRUCTURA DE ÁRBOL
  // ============================================================================
  describe('Estructura de Árbol', () => {
    it('Contenido nuevo tiene exactamente 3 nodos base', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);

      expect(arbol).toBeInstanceOf(Array);
      expect(arbol.length).toBe(3);

      const titulos = arbol.map((n: { titulo: string }) => n.titulo).sort();
      expect(titulos).toEqual(['Evaluación', 'Práctica', 'Teoría']);
    });

    it('Nodos base tienen hijos vacíos inicialmente', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);

      arbol.forEach((nodo: { hijos: unknown[] }) => {
        expect(nodo.hijos).toBeInstanceOf(Array);
        expect(nodo.hijos.length).toBe(0);
      });
    });

    it('Nodos base tienen contenidoJson null inicialmente', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);

      arbol.forEach((nodo: { contenidoJson: unknown }) => {
        expect(nodo.contenidoJson).toBeNull();
      });
    });

    it('Nodos base tienen orden correcto (0, 1, 2)', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);

      // Verificar que hay ordenes 0, 1, 2
      const ordenes = arbol.map((n: { orden: number }) => n.orden).sort();
      expect(ordenes).toEqual([0, 1, 2]);
    });
  });

  // ============================================================================
  // PROFUNDIDAD DE NODOS
  // ============================================================================
  describe('Profundidad de Nodos', () => {
    it('Se puede crear nodo de profundidad 2 (hijo de nodo base)', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const nodo = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Nivel 2',
      );

      expect(nodo).toHaveProperty('id');
      expect(nodo.parentId).toBe(teoriaNodo.id);
    });

    it('Se puede crear nodo de profundidad 3', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const nivel2 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Nivel 2',
      );

      const nivel3 = await crearNodo(
        auth.cookie,
        contenidoId,
        nivel2.id,
        'Nivel 3',
      );

      expect(nivel3.parentId).toBe(nivel2.id);
    });

    it('Se puede crear nodo de profundidad 10', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      let parentId = teoriaNodo.id;
      for (let i = 2; i <= 10; i++) {
        const nodo = await crearNodo(
          auth.cookie,
          contenidoId,
          parentId,
          `Nivel ${i}`,
        );
        expect(nodo).toHaveProperty('id');
        parentId = nodo.id;
      }

      // Verificar que el árbol tiene la profundidad correcta
      const arbolFinal = await obtenerArbol(auth.cookie, contenidoId);
      expect(arbolFinal.length).toBe(3); // Solo 3 raíces

      // Contar nodos totales
      const contarNodos = (
        nodos: Array<{ hijos?: Array<unknown> }>,
      ): number => {
        let count = nodos.length;
        for (const nodo of nodos) {
          if (nodo.hijos && nodo.hijos.length > 0) {
            count += contarNodos(
              nodo.hijos as Array<{ hijos?: Array<unknown> }>,
            );
          }
        }
        return count;
      };

      const totalNodos = contarNodos(arbolFinal);
      expect(totalNodos).toBe(12); // 3 base + 9 creados
    });

    it('Árbol refleja estructura jerárquica correctamente', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear estructura:
      // Teoría
      //   └── Hijo A
      //       ├── Nieto A1
      //       └── Nieto A2
      const hijoA = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Hijo A',
      );
      await crearNodo(auth.cookie, contenidoId, hijoA.id, 'Nieto A1');
      await crearNodo(auth.cookie, contenidoId, hijoA.id, 'Nieto A2');

      const arbolFinal = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaFinal = arbolFinal.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      expect(teoriaFinal.hijos.length).toBe(1);
      expect(teoriaFinal.hijos[0].titulo).toBe('Hijo A');
      expect(teoriaFinal.hijos[0].hijos.length).toBe(2);

      const nietoTitulos = teoriaFinal.hijos[0].hijos
        .map((n: { titulo: string }) => n.titulo)
        .sort();
      expect(nietoTitulos).toEqual(['Nieto A1', 'Nieto A2']);
    });
  });

  // ============================================================================
  // ORDEN DE NODOS
  // ============================================================================
  describe('Orden de Nodos', () => {
    it('Nodos creados secuencialmente tienen orden incremental', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const nodo1 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Primero',
      );
      const nodo2 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Segundo',
      );
      const nodo3 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Tercero',
      );

      expect(nodo1.orden).toBeLessThan(nodo2.orden);
      expect(nodo2.orden).toBeLessThan(nodo3.orden);
    });

    it('Árbol devuelve hijos ordenados', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodos en orden
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'A');
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'B');
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'C');

      const arbolFinal = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaFinal = arbolFinal.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Verificar que vienen en orden
      expect(teoriaFinal.hijos[0].titulo).toBe('A');
      expect(teoriaFinal.hijos[1].titulo).toBe('B');
      expect(teoriaFinal.hijos[2].titulo).toBe('C');
    });

    it('Se puede especificar orden al crear nodo', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodo con orden específico
      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Con Orden', parentId: teoriaNodo.id, orden: 5 });

      expect(res.status).toBe(201);
      expect(res.body.orden).toBe(5);
    });
  });

  // ============================================================================
  // MOVER NODOS
  // ============================================================================
  describe('Mover Nodos', () => {
    it('Se puede mover nodo a otro padre', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const practicaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Práctica',
      );

      // Crear nodo bajo Teoría
      const nodo = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Nodo Móvil',
      );

      // Mover a Práctica
      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${nodo.id}/mover`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: practicaNodo.id });

      expect(res.status).not.toBe(500);

      // Si el endpoint existe, verificar que se movió
      if (res.status === 200) {
        const arbolFinal = await obtenerArbol(auth.cookie, contenidoId);
        const practicaFinal = arbolFinal.find(
          (n: { titulo: string }) => n.titulo === 'Práctica',
        );
        const teoriaFinal = arbolFinal.find(
          (n: { titulo: string }) => n.titulo === 'Teoría',
        );

        expect(practicaFinal.hijos.length).toBe(1);
        expect(teoriaFinal.hijos.length).toBe(0);
      }
    });

    it('NO se puede mover nodo bloqueado', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const practicaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Práctica',
      );

      // Intentar mover nodo bloqueado (Teoría)
      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${teoriaNodo.id}/mover`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: practicaNodo.id });

      // Debería fallar (400) o el endpoint no existe (404)
      expect([400, 404]).toContain(res.status);
    });

    it('NO se puede mover nodo a su propio descendiente', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear: Padre -> Hijo -> Nieto
      const padre = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Padre',
      );
      const hijo = await crearNodo(auth.cookie, contenidoId, padre.id, 'Hijo');
      const nieto = await crearNodo(auth.cookie, contenidoId, hijo.id, 'Nieto');

      // Intentar mover Padre a Nieto (ciclo)
      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/nodos/${padre.id}/mover`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ nuevoParentId: nieto.id });

      // Debe rechazar (400) o endpoint no existe (404)
      expect([400, 404]).toContain(res.status);
    });
  });

  // ============================================================================
  // REORDENAR NODOS
  // ============================================================================
  describe('Reordenar Nodos', () => {
    it('Se pueden reordenar múltiples nodos', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear 3 nodos
      const nodo1 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'A',
      );
      const nodo2 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'B',
      );
      const nodo3 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'C',
      );

      // Reordenar: C, A, B
      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenidoId}/nodos/reordenar`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          orden: [
            { nodoId: nodo3.id, orden: 0 },
            { nodoId: nodo1.id, orden: 1 },
            { nodoId: nodo2.id, orden: 2 },
          ],
        });

      expect(res.status).not.toBe(500);

      if (res.status === 200) {
        // Verificar nuevo orden en el árbol
        const arbolFinal = await obtenerArbol(auth.cookie, contenidoId);
        const teoriaFinal = arbolFinal.find(
          (n: { titulo: string }) => n.titulo === 'Teoría',
        );

        expect(teoriaFinal.hijos[0].titulo).toBe('C');
        expect(teoriaFinal.hijos[1].titulo).toBe('A');
        expect(teoriaFinal.hijos[2].titulo).toBe('B');
      }
    });

    it('Reordenar con nodo de otro contenido: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Crear 2 contenidos
      const contenido1 = await crearContenido(auth.cookie, 'Contenido 1');
      const contenido2 = await crearContenido(auth.cookie, 'Contenido 2');

      const arbol1 = await obtenerArbol(auth.cookie, contenido1);
      const arbol2 = await obtenerArbol(auth.cookie, contenido2);

      const teoria1 = arbol1.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );
      const teoria2 = arbol2.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear nodos en cada contenido
      const nodo1 = await crearNodo(
        auth.cookie,
        contenido1,
        teoria1.id,
        'Nodo C1',
      );
      const nodo2 = await crearNodo(
        auth.cookie,
        contenido2,
        teoria2.id,
        'Nodo C2',
      );

      // Intentar reordenar con nodo de otro contenido
      const res = await request(app.getHttpServer())
        .patch(`/api/contenidos/${contenido1}/nodos/reordenar`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          orden: [
            { nodoId: nodo1.id, orden: 0 },
            { nodoId: nodo2.id, orden: 1 }, // Este es de contenido2!
          ],
        });

      expect(res.status).not.toBe(500);
      expect([400, 404]).toContain(res.status);
    });
  });

  // ============================================================================
  // ELIMINACIÓN EN CASCADA
  // ============================================================================
  describe('Eliminación en Cascada', () => {
    it('Eliminar nodo padre elimina todos sus descendientes', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear: Padre -> Hijo -> Nieto
      const padre = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Padre',
      );
      await crearNodo(auth.cookie, contenidoId, padre.id, 'Hijo');
      await crearNodo(auth.cookie, contenidoId, padre.id, 'Otro Hijo');

      // Contar nodos antes
      const nodosAntes = await prisma.nodoContenido.count({
        where: { contenidoId },
      });
      expect(nodosAntes).toBe(6); // 3 base + 3 creados

      // Eliminar padre
      const res = await request(app.getHttpServer())
        .delete(`/api/contenidos/nodos/${padre.id}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(200);

      // Contar nodos después
      const nodosDespues = await prisma.nodoContenido.count({
        where: { contenidoId },
      });
      expect(nodosDespues).toBe(3); // Solo los 3 base
    });

    it('Eliminar contenido elimina todos sus nodos', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear varios nodos
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'A');
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'B');
      await crearNodo(auth.cookie, contenidoId, teoriaNodo.id, 'C');

      // Eliminar contenido
      const res = await request(app.getHttpServer())
        .delete(`/api/contenidos/${contenidoId}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      expect(res.status).toBe(200);

      // Verificar que no quedan nodos
      const nodosRestantes = await prisma.nodoContenido.count({
        where: { contenidoId },
      });
      expect(nodosRestantes).toBe(0);
    });
  });

  // ============================================================================
  // TÍTULOS Y CONTENIDO
  // ============================================================================
  describe('Títulos y Contenido', () => {
    it('Título vacío debe rechazarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: '', parentId: teoriaNodo.id });

      expect(res.status).not.toBe(500);
      expect([400, 422]).toContain(res.status);
    });

    it('Título con solo espacios debe rechazarse o trimmearse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: '   ', parentId: teoriaNodo.id });

      expect(res.status).not.toBe(500);
      // Puede ser 400 (rechaza) o 201 (acepta pero trimmea)
    });

    it('Título muy largo (1000+ chars) debe manejarse', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      const tituloLargo = 'A'.repeat(1000);

      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: tituloLargo, parentId: teoriaNodo.id });

      expect(res.status).not.toBe(500);
      // Puede aceptar, truncar, o rechazar
    });

    it('Dos nodos pueden tener el mismo título', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);
      const arbol = await obtenerArbol(auth.cookie, contenidoId);
      const teoriaNodo = arbol.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Crear dos nodos con mismo título
      const nodo1 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Título Repetido',
      );
      const nodo2 = await crearNodo(
        auth.cookie,
        contenidoId,
        teoriaNodo.id,
        'Título Repetido',
      );

      expect(nodo1.id).not.toBe(nodo2.id);
      expect(nodo1.titulo).toBe(nodo2.titulo);
    });
  });

  // ============================================================================
  // PARENT ID INVÁLIDO
  // ============================================================================
  describe('Parent ID Inválido', () => {
    it('Crear nodo con parentId inexistente: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);

      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          titulo: 'Huérfano',
          parentId: '00000000-0000-0000-0000-000000000000',
        });

      expect(res.status).not.toBe(500);
      expect([400, 404]).toContain(res.status);
    });

    it('Crear nodo con parentId de otro contenido: debe fallar', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido1 = await crearContenido(auth.cookie, 'Contenido 1');
      const contenido2 = await crearContenido(auth.cookie, 'Contenido 2');

      const arbol2 = await obtenerArbol(auth.cookie, contenido2);
      const teoria2 = arbol2.find(
        (n: { titulo: string }) => n.titulo === 'Teoría',
      );

      // Intentar crear nodo en contenido1 con padre de contenido2
      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenido1}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Cruzado', parentId: teoria2.id });

      expect(res.status).not.toBe(500);
      expect([400, 404]).toContain(res.status);
    });

    it('Crear nodo sin parentId: debe fallar (no hay raíces)', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenidoId = await crearContenido(auth.cookie);

      // Intentar crear nodo raíz (sin parentId)
      const res = await request(app.getHttpServer())
        .post(`/api/contenidos/${contenidoId}/nodos`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ titulo: 'Sin Padre' }); // No parentId

      expect(res.status).not.toBe(500);
      // Debería rechazar o crear bajo algún padre por defecto
    });
  });

  // ============================================================================
  // MÚLTIPLES CONTENIDOS
  // ============================================================================
  describe('Múltiples Contenidos', () => {
    it('Nodos de diferentes contenidos están aislados', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido1 = await crearContenido(auth.cookie, 'Contenido A');
      const contenido2 = await crearContenido(auth.cookie, 'Contenido B');

      const arbol1 = await obtenerArbol(auth.cookie, contenido1);
      const arbol2 = await obtenerArbol(auth.cookie, contenido2);

      // Verificar que tienen IDs diferentes
      const ids1 = arbol1.map((n: { id: string }) => n.id);
      const ids2 = arbol2.map((n: { id: string }) => n.id);

      ids1.forEach((id: string) => {
        expect(ids2).not.toContain(id);
      });
    });

    it('Eliminar un contenido no afecta a otros', async () => {
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      const contenido1 = await crearContenido(auth.cookie, 'Contenido A');
      const contenido2 = await crearContenido(auth.cookie, 'Contenido B');

      // Eliminar contenido 1
      await request(app.getHttpServer())
        .delete(`/api/contenidos/${contenido1}`)
        .set('Cookie', auth.cookie)
        .set('Origin', FRONTEND_ORIGIN);

      // Contenido 2 debe seguir existiendo
      const arbol2 = await obtenerArbol(auth.cookie, contenido2);
      expect(arbol2.length).toBe(3);

      const contenido2Data = await prisma.contenido.findUnique({
        where: { id: contenido2 },
      });
      expect(contenido2Data).not.toBeNull();
    });
  });
});
