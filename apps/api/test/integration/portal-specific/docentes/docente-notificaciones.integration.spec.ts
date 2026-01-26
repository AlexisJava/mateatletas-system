/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Docente Notificaciones Controller
 * ============================================================================
 *
 * METODOLOGÍA: Black Box Testing - Tests de endpoints HTTP
 *
 * REQUISITOS BAJO TEST (según SPEC_NOTIFICACIONES_UI_DOCENTE.md):
 *
 * DROPDOWN (Header):
 * - GET /notificaciones?limit=5 → Últimas 5 notificaciones (ordenadas por fecha)
 * - GET /notificaciones/count → Contador de no leídas para badge
 * - PATCH /notificaciones/:id/leer → Marcar como leída
 * - PATCH /notificaciones/leer-todas → Marcar todas como leídas
 *
 * PÁGINA COMPLETA (/docente/notificaciones):
 * - GET /notificaciones?page=1&limit=20 → Paginación 20 por página
 * - GET /notificaciones?soloNoLeidas=true → Filtro por estado
 * - GET /notificaciones?tipo=DOCENTE_CLASE_PROXIMA → Filtro por tipo
 * - GET /notificaciones?busqueda=texto → Búsqueda en título/mensaje
 * - NO SE PUEDEN ELIMINAR (sin endpoint DELETE para docentes)
 *
 * CLASES DE EQUIVALENCIA:
 * - AUTH: Token válido | Token inválido | Sin token | Rol incorrecto
 * - DATA: Con notificaciones | Sin notificaciones | Mixto leídas/no leídas
 * - OWNERSHIP: Propia | De otro usuario (debe fallar)
 * - FILTERS: soloNoLeidas | tipo | búsqueda
 * - PAGINATION: page=1 | page>1 | limit=5 (dropdown) | limit=20 (página)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="docente-notificaciones" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../../src/app.module';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import {
  createTestDocente,
  createTestTutor,
  createTestEstudiante,
  DEFAULT_PASSWORD,
} from '../../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../../helpers/auth.helpers';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

describe('[INTEGRATION] Docente Notificaciones Controller - Black Box Testing', () => {
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
    await prisma.notificacion.deleteMany({});
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Crea una notificación para un docente dado
   */
  async function crearNotificacion(options: {
    docenteId: string;
    titulo?: string;
    mensaje?: string;
    tipo?: TipoNotificacion;
    prioridad?: PrioridadNotificacion;
    leida?: boolean;
  }) {
    return prisma.notificacion.create({
      data: {
        docenteId: options.docenteId,
        titulo: options.titulo ?? 'Notificación de prueba',
        mensaje: options.mensaje ?? 'Mensaje de prueba',
        tipo: options.tipo ?? TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        prioridad: options.prioridad ?? PrioridadNotificacion.MEDIA,
        leida: options.leida ?? false,
      },
    });
  }

  // ============================================================================
  // TEST 1: GET /notificaciones - Autenticación y Autorización
  // ============================================================================
  describe('GET /notificaciones - Autenticación', () => {
    it('debe retornar 401 sin token de autenticación', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN);

      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de tutor (rol incorrecto)', async () => {
      // Arrange - Login como tutor
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Intentar acceder a endpoint de docente
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(403);
    });

    it('debe retornar 403 con token de estudiante (rol incorrecto)', async () => {
      // Arrange - Login como estudiante
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ username: estudiante.username, password });

      // Act - Intentar acceder a endpoint de docente
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', loginResponse.headers['set-cookie']);

      // Assert
      expect(response.status).toBe(403);
    });

    it('debe retornar 200 con token de docente válido', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  // ============================================================================
  // TEST 2: GET /notificaciones - DROPDOWN (limit=5)
  // ============================================================================
  describe('GET /notificaciones?limit=5 - Dropdown', () => {
    it('debe retornar máximo 5 notificaciones para el dropdown', async () => {
      // Arrange - 10 notificaciones
      const { docente } = await createTestDocente(prisma);
      for (let i = 0; i < 10; i++) {
        await crearNotificacion({
          docenteId: docente.id,
          titulo: `Notificación ${i + 1}`,
        });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?limit=5')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(5);
      expect(response.body.meta.total).toBe(10);
    });

    it('debe ordenar por fecha más reciente primero', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      // Crear con pequeño delay para diferenciar timestamps
      const n1 = await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Primera',
      });
      await new Promise((r) => setTimeout(r, 50));
      const n2 = await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Segunda',
      });
      await new Promise((r) => setTimeout(r, 50));
      const n3 = await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Tercera',
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?limit=5')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - La más reciente primero (considerando prioridad igual)
      expect(response.status).toBe(200);
      // El orden es por prioridad DESC primero, luego fecha DESC
      // Como todas tienen misma prioridad (MEDIA), debería ser por fecha DESC
      const titulos = response.body.data.map(
        (n: { titulo: string }) => n.titulo,
      );
      expect(titulos[0]).toBe('Tercera');
    });

    it('debe retornar array vacío si no hay notificaciones', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?limit=5')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });
  });

  // ============================================================================
  // TEST 3: GET /notificaciones/count - Badge Counter
  // ============================================================================
  describe('GET /notificaciones/count - Badge Counter', () => {
    it('debe retornar 0 si no hay notificaciones', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 0 });
    });

    it('debe contar solo notificaciones no leídas', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      // 3 no leídas, 2 leídas
      for (let i = 0; i < 3; i++) {
        await crearNotificacion({ docenteId: docente.id, leida: false });
      }
      for (let i = 0; i < 2; i++) {
        await crearNotificacion({ docenteId: docente.id, leida: true });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 3 });
    });

    it('no debe contar notificaciones de otros docentes', async () => {
      // Arrange
      const { docente: docente1 } = await createTestDocente(prisma);
      const { docente: docente2 } = await createTestDocente(prisma, {
        email: 'otro@test.com',
      });

      // 1 para docente1, 2 para docente2
      await crearNotificacion({ docenteId: docente1.id });
      await crearNotificacion({ docenteId: docente2.id });
      await crearNotificacion({ docenteId: docente2.id });

      const auth = await loginUser(app, {
        email: docente1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.body).toEqual({ count: 1 });
    });
  });

  // ============================================================================
  // TEST 4: GET /notificaciones - Página Completa (paginación 20 por página)
  // ============================================================================
  describe('GET /notificaciones - Página Completa con Paginación', () => {
    it('debe usar limit=20 por defecto para la página completa', async () => {
      // Arrange - 25 notificaciones
      const { docente } = await createTestDocente(prisma);
      for (let i = 0; i < 25; i++) {
        await crearNotificacion({
          docenteId: docente.id,
          titulo: `Notificación ${i + 1}`,
        });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Sin especificar limit
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Debe retornar 20 (default)
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(20);
      expect(response.body.meta.limit).toBe(20);
      expect(response.body.meta.total).toBe(25);
      expect(response.body.meta.totalPages).toBe(2);
    });

    it('debe paginar correctamente', async () => {
      // Arrange - 25 notificaciones
      const { docente } = await createTestDocente(prisma);
      for (let i = 0; i < 25; i++) {
        await crearNotificacion({
          docenteId: docente.id,
          titulo: `Notificación ${i + 1}`,
        });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Página 1 y 2
      const page1 = await request(app.getHttpServer())
        .get('/api/notificaciones?page=1&limit=20')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      const page2 = await request(app.getHttpServer())
        .get('/api/notificaciones?page=2&limit=20')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(page1.body.data).toHaveLength(20);
      expect(page2.body.data).toHaveLength(5);
      expect(page1.body.meta.page).toBe(1);
      expect(page2.body.meta.page).toBe(2);

      // Verificar que son diferentes
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
    });

    it('debe retornar metadata de paginación correcta', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      for (let i = 0; i < 45; i++) {
        await crearNotificacion({
          docenteId: docente.id,
          titulo: `Notificación ${i + 1}`,
        });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?page=2&limit=20')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.body.meta).toEqual({
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
      });
    });
  });

  // ============================================================================
  // TEST 5: GET /notificaciones - Filtro por Estado (soloNoLeidas)
  // ============================================================================
  describe('GET /notificaciones - Filtro por Estado', () => {
    it('debe filtrar solo no leídas con soloNoLeidas=true', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Leída',
        leida: true,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'No leída 1',
        leida: false,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'No leída 2',
        leida: false,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?soloNoLeidas=true')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
      expect(
        response.body.data.every((n: { leida: boolean }) => n.leida === false),
      ).toBe(true);
    });

    it('debe retornar todas sin filtro soloNoLeidas', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Leída',
        leida: true,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'No leída',
        leida: false,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
    });
  });

  // ============================================================================
  // TEST 6: GET /notificaciones - Filtro por Tipo
  // SPEC: "Filtro por tipo - Dropdown con tipos de notificación"
  // Este test DEBE FALLAR si el backend no implementa este filtro
  // ============================================================================
  describe('GET /notificaciones - Filtro por Tipo (SPEC: REQUERIDO)', () => {
    it('debe filtrar por tipo de notificación', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Clase próxima',
        tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Asistencia pendiente',
        tipo: TipoNotificacion.DOCENTE_ASISTENCIA_PENDIENTE,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Alerta estudiante',
        tipo: TipoNotificacion.DOCENTE_ESTUDIANTE_ALERTA,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Filtrar por tipo específico
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?tipo=DOCENTE_CLASE_PROXIMA')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Solo debe retornar la de tipo DOCENTE_CLASE_PROXIMA
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].tipo).toBe('DOCENTE_CLASE_PROXIMA');
    });
  });

  // ============================================================================
  // TEST 7: GET /notificaciones - Búsqueda por Texto
  // SPEC: "Buscador - Filtrar por texto en título/mensaje"
  // Este test DEBE FALLAR si el backend no implementa búsqueda
  // ============================================================================
  describe('GET /notificaciones - Búsqueda por Texto (SPEC: REQUERIDO)', () => {
    it('debe buscar en título de notificación', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Clase de Matemáticas programada',
        mensaje: 'Descripción genérica',
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Recordatorio importante',
        mensaje: 'Otra cosa diferente',
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Buscar "Matemáticas"
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?busqueda=Matemáticas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].titulo).toContain('Matemáticas');
    });

    it('debe buscar en mensaje de notificación', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Título genérico',
        mensaje: 'Juan Pérez necesita atención especial',
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Otro título',
        mensaje: 'Sin estudiante mencionado',
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Buscar por nombre de estudiante
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?busqueda=Pérez')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(1);
      expect(response.body.data[0].mensaje).toContain('Pérez');
    });
  });

  // ============================================================================
  // TEST 8: PATCH /notificaciones/:id/leer - Marcar como Leída
  // ============================================================================
  describe('PATCH /notificaciones/:id/leer - Marcar como Leída', () => {
    it('debe marcar notificación como leída', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const notificacion = await crearNotificacion({
        docenteId: docente.id,
        leida: false,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.leida).toBe(true);

      // Verificar en DB
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb?.leida).toBe(true);
    });

    it('debe retornar 404 si la notificación no existe', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      const idInexistente = 'ctest0000000000000000001';

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/notificaciones/${idInexistente}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la notificación es de otro docente (ownership)', async () => {
      // Arrange
      const { docente: docente1 } = await createTestDocente(prisma);
      const { docente: docente2 } = await createTestDocente(prisma, {
        email: 'otro@test.com',
      });
      const notificacion = await crearNotificacion({ docenteId: docente2.id });

      const auth = await loginUser(app, {
        email: docente1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - docente1 intenta marcar notificación de docente2
      const response = await request(app.getHttpServer())
        .patch(`/api/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe ser idempotente - marcar leída una ya leída no falla', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const notificacion = await crearNotificacion({
        docenteId: docente.id,
        leida: true, // Ya leída
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.leida).toBe(true);
    });
  });

  // ============================================================================
  // TEST 9: PATCH /notificaciones/leer-todas - Marcar Todas como Leídas
  // ============================================================================
  describe('PATCH /notificaciones/leer-todas - Marcar Todas como Leídas', () => {
    it('debe marcar todas las notificaciones como leídas', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      for (let i = 0; i < 5; i++) {
        await crearNotificacion({ docenteId: docente.id, leida: false });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(5);
      expect(response.body.message).toBe(
        'Todas las notificaciones marcadas como leídas',
      );

      // Verificar en DB
      const noLeidas = await prisma.notificacion.count({
        where: { docenteId: docente.id, leida: false },
      });
      expect(noLeidas).toBe(0);
    });

    it('no debe afectar notificaciones de otros docentes', async () => {
      // Arrange
      const { docente: docente1 } = await createTestDocente(prisma);
      const { docente: docente2 } = await createTestDocente(prisma, {
        email: 'otro@test.com',
      });

      await crearNotificacion({ docenteId: docente1.id, leida: false });
      await crearNotificacion({ docenteId: docente2.id, leida: false });

      const auth = await loginUser(app, {
        email: docente1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      await request(app.getHttpServer())
        .patch('/api/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - La de docente2 sigue no leída
      const countDocente2 = await prisma.notificacion.count({
        where: { docenteId: docente2.id, leida: false },
      });
      expect(countDocente2).toBe(1);
    });

    it('debe retornar count=0 si no hay notificaciones no leídas', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      await crearNotificacion({ docenteId: docente.id, leida: true });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  // ============================================================================
  // TEST 10: DELETE /notificaciones/:id - NO DEBE EXISTIR SEGÚN SPEC
  // SPEC: "NO se pueden eliminar - Sin botón de eliminar"
  // Este test verifica que DELETE NO esté disponible
  // ============================================================================
  describe('DELETE /notificaciones/:id - NO DEBE ESTAR PERMITIDO (SPEC)', () => {
    it('NO debe permitir eliminar notificaciones según el spec', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const notificacion = await crearNotificacion({ docenteId: docente.id });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/notificaciones/${notificacion.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - El SPEC dice que NO se pueden eliminar
      // Si este test falla con 200, el backend tiene un endpoint que NO debería existir
      expect([404, 405]).toContain(response.status);

      // Verificar que la notificación sigue existiendo en DB
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb).not.toBeNull();
    });
  });

  // ============================================================================
  // TEST 11: Ownership - Solo notificaciones propias
  // ============================================================================
  describe('Ownership - Solo notificaciones propias', () => {
    it('debe retornar solo notificaciones del docente autenticado', async () => {
      // Arrange - Dos docentes con notificaciones
      const { docente: docente1 } = await createTestDocente(prisma);
      const { docente: docente2 } = await createTestDocente(prisma, {
        email: 'docente2@test.com',
      });

      await crearNotificacion({
        docenteId: docente1.id,
        titulo: 'Para Docente 1',
      });
      await crearNotificacion({
        docenteId: docente1.id,
        titulo: 'Otra de Docente 1',
      });
      await crearNotificacion({
        docenteId: docente2.id,
        titulo: 'Para Docente 2',
      });

      const auth = await loginUser(app, {
        email: docente1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Solo las 2 de docente1
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
      expect(
        response.body.data.every(
          (n: { titulo: string }) =>
            n.titulo === 'Para Docente 1' || n.titulo === 'Otra de Docente 1',
        ),
      ).toBe(true);
    });
  });

  // ============================================================================
  // TEST 12: Edge Cases y Campos de Respuesta
  // ============================================================================
  describe('Edge Cases y Campos de Respuesta', () => {
    it('debe manejar ID inválido en PATCH con 400 o 404', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/notificaciones/   /leer')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect([400, 404]).toContain(response.status);
    });

    it('debe incluir todos los campos esperados en la respuesta', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Test de campos',
        mensaje: 'Mensaje completo para verificar campos',
        tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        prioridad: PrioridadNotificacion.ALTA,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Verificar estructura de respuesta
      const notif = response.body.data[0];
      expect(notif).toHaveProperty('id');
      expect(notif).toHaveProperty('titulo', 'Test de campos');
      expect(notif).toHaveProperty(
        'mensaje',
        'Mensaje completo para verificar campos',
      );
      expect(notif).toHaveProperty('tipo', 'DOCENTE_CLASE_PROXIMA');
      expect(notif).toHaveProperty('prioridad', 'ALTA');
      expect(notif).toHaveProperty('leida');
      expect(notif).toHaveProperty('createdAt');
    });

    it('debe ordenar por prioridad DESC primero', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      // Crear en orden: MEDIA, CRITICA, BAJA
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Media',
        prioridad: PrioridadNotificacion.MEDIA,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Critica',
        prioridad: PrioridadNotificacion.CRITICA,
      });
      await crearNotificacion({
        docenteId: docente.id,
        titulo: 'Baja',
        prioridad: PrioridadNotificacion.BAJA,
      });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - CRITICA primero
      expect(response.status).toBe(200);
      expect(response.body.data[0].titulo).toBe('Critica');
    });

    it('debe manejar página fuera de rango retornando array vacío', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);
      await crearNotificacion({ docenteId: docente.id });

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Página muy alta
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones?page=100')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(1);
    });
  });

  // ============================================================================
  // TEST 13: Tipos de Notificación Docente Completos
  // ============================================================================
  describe('Tipos de Notificación Docente', () => {
    it('debe aceptar todos los tipos de notificación de docente', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      const tiposDocente = [
        TipoNotificacion.DOCENTE_CLASE_PROXIMA,
        TipoNotificacion.DOCENTE_CLASE_ASIGNADA,
        TipoNotificacion.DOCENTE_ASISTENCIA_PENDIENTE,
        TipoNotificacion.DOCENTE_ESTUDIANTE_ALERTA,
        TipoNotificacion.DOCENTE_CLASE_CANCELADA,
        TipoNotificacion.DOCENTE_LOGRO_ESTUDIANTE,
      ];

      for (const tipo of tiposDocente) {
        await crearNotificacion({
          docenteId: docente.id,
          titulo: `Tipo ${tipo}`,
          tipo,
        });
      }

      const auth = await loginUser(app, {
        email: docente.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(tiposDocente.length);
    });
  });
});
