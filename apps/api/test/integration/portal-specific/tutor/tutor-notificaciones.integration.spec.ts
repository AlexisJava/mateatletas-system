/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Tutor Notificaciones Controller
 * ============================================================================
 *
 * METODOLOGÍA: Black Box Testing - Tests de endpoints HTTP
 *
 * REQUISITOS BAJO TEST (TutorNotificacionesController):
 * - GET /tutor/notificaciones → Listar notificaciones con paginación
 * - GET /tutor/notificaciones/count → Contar no leídas
 * - PATCH /tutor/notificaciones/:id/leer → Marcar como leída
 * - PATCH /tutor/notificaciones/leer-todas → Marcar todas como leídas
 * - DELETE /tutor/notificaciones/:id → Eliminar notificación
 *
 * CLASES DE EQUIVALENCIA:
 * - AUTH: Token válido | Token inválido | Sin token | Rol incorrecto
 * - DATA: Con notificaciones | Sin notificaciones | Mixto leídas/no leídas
 * - OWNERSHIP: Propia | De otro usuario (debe fallar)
 * - FILTERS: soloNoLeidas=true | soloNoLeidas=false
 * - PAGINATION: page=1 | page>1 | page fuera de rango
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="tutor-notificaciones" --runInBand
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
  createTestTutor,
  createTestEstudiante,
  DEFAULT_PASSWORD,
} from '../../../fixtures/factories';
import { loginUser, FRONTEND_ORIGIN } from '../../../helpers/auth.helpers';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

describe('[INTEGRATION] Tutor Notificaciones Controller - Black Box Testing', () => {
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
   * Crea una notificación para un tutor dado
   */
  async function crearNotificacion(options: {
    tutorId: string;
    titulo?: string;
    mensaje?: string;
    tipo?: TipoNotificacion;
    prioridad?: PrioridadNotificacion;
    leida?: boolean;
  }) {
    return prisma.notificacion.create({
      data: {
        tutor_id: options.tutorId,
        titulo: options.titulo ?? 'Notificación de prueba',
        mensaje: options.mensaje ?? 'Mensaje de prueba',
        tipo: options.tipo ?? TipoNotificacion.TUTOR_PAGO_EXITOSO,
        prioridad: options.prioridad ?? PrioridadNotificacion.MEDIA,
        leida: options.leida ?? false,
      },
    });
  }

  // ============================================================================
  // TEST 1: GET /tutor/notificaciones - Autenticación
  // ============================================================================
  describe('GET /tutor/notificaciones - Autenticación', () => {
    it('debe retornar 401 sin token de autenticación', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN);

      // Assert
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de rol incorrecto (estudiante)', async () => {
      // Arrange - Login como estudiante
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Login de estudiante retorna cookies, usamos endpoint de estudiante
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ username: estudiante.username, password });

      // Act - Intentar acceder a endpoint de tutor
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', loginResponse.headers['set-cookie']);

      // Assert
      expect(response.status).toBe(403);
    });

    it('debe retornar 200 con token de tutor válido', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  // ============================================================================
  // TEST 2: GET /tutor/notificaciones - Listado y paginación
  // ============================================================================
  describe('GET /tutor/notificaciones - Listado y paginación', () => {
    it('debe retornar array vacío si no hay notificaciones', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('debe retornar solo notificaciones del tutor autenticado', async () => {
      // Arrange - Dos tutores con notificaciones
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'tutor2@test.com',
      });

      await crearNotificacion({ tutorId: tutor1.id, titulo: 'Para Tutor 1' });
      await crearNotificacion({
        tutorId: tutor1.id,
        titulo: 'Otra de Tutor 1',
      });
      await crearNotificacion({ tutorId: tutor2.id, titulo: 'Para Tutor 2' });

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Solo las 2 de tutor1
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
      expect(
        response.body.data.every(
          (n: { titulo: string }) =>
            n.titulo === 'Para Tutor 1' || n.titulo === 'Otra de Tutor 1',
        ),
      ).toBe(true);
    });

    it('debe ordenar por prioridad DESC y fecha DESC', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Crear en orden: MEDIA, CRITICA, BAJA
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'Media',
        prioridad: PrioridadNotificacion.MEDIA,
      });
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'Critica',
        prioridad: PrioridadNotificacion.CRITICA,
      });
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'Baja',
        prioridad: PrioridadNotificacion.BAJA,
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - CRITICA primero
      expect(response.status).toBe(200);
      expect(response.body.data[0].titulo).toBe('Critica');
    });

    it('debe aplicar filtro soloNoLeidas=true correctamente', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'Leída',
        leida: true,
      });
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'No leída 1',
        leida: false,
      });
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'No leída 2',
        leida: false,
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones?soloNoLeidas=true')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
      expect(
        response.body.data.every((n: { leida: boolean }) => n.leida === false),
      ).toBe(true);
    });

    it('debe aplicar paginación correctamente', async () => {
      // Arrange - 5 notificaciones
      const { tutor } = await createTestTutor(prisma);
      for (let i = 1; i <= 5; i++) {
        await crearNotificacion({
          tutorId: tutor.id,
          titulo: `Notificación ${i}`,
        });
      }

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Página 1 con limit 2
      const page1 = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones?page=1&limit=2')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      const page2 = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones?page=2&limit=2')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.meta.total).toBe(5);
      expect(page1.body.meta.totalPages).toBe(3);
      expect(page2.body.data).toHaveLength(2);

      // Verificar que son diferentes
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
    });

    it('debe retornar metadata de paginación correcta', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      for (let i = 1; i <= 15; i++) {
        await crearNotificacion({
          tutorId: tutor.id,
          titulo: `Notificación ${i}`,
        });
      }

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones?page=2&limit=5')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.body.meta).toEqual({
        total: 15,
        page: 2,
        limit: 5,
        totalPages: 3,
      });
    });
  });

  // ============================================================================
  // TEST 3: GET /tutor/notificaciones/count
  // ============================================================================
  describe('GET /tutor/notificaciones/count', () => {
    it('debe retornar 0 si no hay notificaciones', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 0 });
    });

    it('debe contar solo notificaciones no leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // 3 no leídas, 2 leídas
      for (let i = 0; i < 3; i++) {
        await crearNotificacion({ tutorId: tutor.id, leida: false });
      }
      for (let i = 0; i < 2; i++) {
        await crearNotificacion({ tutorId: tutor.id, leida: true });
      }

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 3 });
    });

    it('no debe contar notificaciones de otros tutores', async () => {
      // Arrange
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });

      await crearNotificacion({ tutorId: tutor1.id });
      await crearNotificacion({ tutorId: tutor2.id });
      await crearNotificacion({ tutorId: tutor2.id });

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.body).toEqual({ count: 1 });
    });
  });

  // ============================================================================
  // TEST 4: PATCH /tutor/notificaciones/:id/leer
  // ============================================================================
  describe('PATCH /tutor/notificaciones/:id/leer', () => {
    it('debe marcar notificación como leída', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const notificacion = await crearNotificacion({
        tutorId: tutor.id,
        leida: false,
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/tutor/notificaciones/${notificacion.id}/leer`)
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
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/tutor/notificaciones/id-inexistente/leer')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la notificación es de otro tutor (ownership)', async () => {
      // Arrange
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      const notificacion = await crearNotificacion({ tutorId: tutor2.id });

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - tutor1 intenta marcar notificación de tutor2
      const response = await request(app.getHttpServer())
        .patch(`/api/tutor/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe ser idempotente - marcar leída una ya leída no falla', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const notificacion = await crearNotificacion({
        tutorId: tutor.id,
        leida: true, // Ya leída
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/tutor/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.leida).toBe(true);
    });
  });

  // ============================================================================
  // TEST 5: PATCH /tutor/notificaciones/leer-todas
  // ============================================================================
  describe('PATCH /tutor/notificaciones/leer-todas', () => {
    it('debe marcar todas las notificaciones como leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      for (let i = 0; i < 5; i++) {
        await crearNotificacion({ tutorId: tutor.id, leida: false });
      }

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/tutor/notificaciones/leer-todas')
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
        where: { tutor_id: tutor.id, leida: false },
      });
      expect(noLeidas).toBe(0);
    });

    it('no debe afectar notificaciones de otros tutores', async () => {
      // Arrange
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });

      await crearNotificacion({ tutorId: tutor1.id, leida: false });
      await crearNotificacion({ tutorId: tutor2.id, leida: false });

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      await request(app.getHttpServer())
        .patch('/api/tutor/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - La de tutor2 sigue no leída
      const countTutor2 = await prisma.notificacion.count({
        where: { tutor_id: tutor2.id, leida: false },
      });
      expect(countTutor2).toBe(1);
    });

    it('debe retornar count=0 si no hay notificaciones no leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      await crearNotificacion({ tutorId: tutor.id, leida: true });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/tutor/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  // ============================================================================
  // TEST 6: DELETE /tutor/notificaciones/:id
  // ============================================================================
  describe('DELETE /tutor/notificaciones/:id', () => {
    it('debe eliminar la notificación', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const notificacion = await crearNotificacion({ tutorId: tutor.id });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/tutor/notificaciones/${notificacion.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(
        'Notificación eliminada correctamente',
      );

      // Verificar en DB
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb).toBeNull();
    });

    it('debe retornar 404 si la notificación no existe', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/tutor/notificaciones/id-inexistente')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la notificación es de otro tutor (ownership)', async () => {
      // Arrange
      const { tutor: tutor1 } = await createTestTutor(prisma);
      const { tutor: tutor2 } = await createTestTutor(prisma, {
        email: 'otro@test.com',
      });
      const notificacion = await crearNotificacion({ tutorId: tutor2.id });

      const auth = await loginUser(app, {
        email: tutor1.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/tutor/notificaciones/${notificacion.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(404);

      // Verificar que NO se eliminó
      const enDb = await prisma.notificacion.findUnique({
        where: { id: notificacion.id },
      });
      expect(enDb).not.toBeNull();
    });
  });

  // ============================================================================
  // TEST 7: Edge cases y validaciones
  // ============================================================================
  describe('Edge cases', () => {
    it('debe manejar ID inválido en PATCH', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/tutor/notificaciones/   /leer')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Debe fallar con 400 o 404
      expect([400, 404]).toContain(response.status);
    });

    it('debe aplicar valores por defecto de paginación', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      for (let i = 0; i < 25; i++) {
        await crearNotificacion({
          tutorId: tutor.id,
          titulo: `Notif ${i}`,
        });
      }

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Sin especificar page ni limit
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert - Debe usar defaults (page=1, limit=20)
      expect(response.body.data).toHaveLength(20);
      expect(response.body.meta.page).toBe(1);
      expect(response.body.meta.limit).toBe(20);
    });

    it('debe incluir todos los campos en la respuesta', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      await crearNotificacion({
        tutorId: tutor.id,
        titulo: 'Test',
        mensaje: 'Mensaje completo',
        tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
        prioridad: PrioridadNotificacion.ALTA,
      });

      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/tutor/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      const notif = response.body.data[0];
      expect(notif).toHaveProperty('id');
      expect(notif).toHaveProperty('titulo', 'Test');
      expect(notif).toHaveProperty('mensaje', 'Mensaje completo');
      expect(notif).toHaveProperty('tipo', 'TUTOR_PAGO_EXITOSO');
      expect(notif).toHaveProperty('prioridad', 'ALTA');
      expect(notif).toHaveProperty('leida');
      expect(notif).toHaveProperty('createdAt');
    });
  });
});
