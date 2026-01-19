/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Estudiante Notificaciones Controller
 * ============================================================================
 *
 * METODOLOGÍA: Black Box Testing - Tests de endpoints HTTP
 *
 * REQUISITOS BAJO TEST (EstudianteNotificacionesController):
 * - GET /estudiantes/notificaciones → Listar notificaciones con paginación
 * - GET /estudiantes/notificaciones/count → Contar no leídas
 * - PATCH /estudiantes/notificaciones/:id/leer → Marcar como leída
 * - PATCH /estudiantes/notificaciones/leer-todas → Marcar todas como leídas
 * - DELETE /estudiantes/notificaciones/:id → Eliminar notificación
 *
 * CLASES DE EQUIVALENCIA:
 * - AUTH: Token válido | Token inválido | Sin token | Rol incorrecto
 * - DATA: Con notificaciones | Sin notificaciones | Mixto leídas/no leídas
 * - OWNERSHIP: Propia | De otro estudiante (debe fallar)
 * - FILTERS: soloNoLeidas=true | soloNoLeidas=false
 *
 * NOTA: Estudiantes usan username para login, no email.
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="estudiante-notificaciones" --runInBand
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
import {
  loginUser,
  loginEstudianteRaw,
  FRONTEND_ORIGIN,
} from '../../../helpers/auth.helpers';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

describe('[INTEGRATION] Estudiante Notificaciones Controller - Black Box Testing', () => {
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
   * Crea una notificación para un estudiante dado
   */
  async function crearNotificacion(options: {
    estudianteId: string;
    titulo?: string;
    mensaje?: string;
    tipo?: TipoNotificacion;
    prioridad?: PrioridadNotificacion;
    leida?: boolean;
  }) {
    return prisma.notificacion.create({
      data: {
        estudiante_id: options.estudianteId,
        titulo: options.titulo ?? 'Notificación de prueba',
        mensaje: options.mensaje ?? 'Mensaje de prueba',
        tipo: options.tipo ?? TipoNotificacion.ESTUDIANTE_BIENVENIDA,
        prioridad: options.prioridad ?? PrioridadNotificacion.MEDIA,
        leida: options.leida ?? false,
      },
    });
  }

  // ============================================================================
  // TEST 1: GET /estudiantes/notificaciones - Autenticación
  // ============================================================================
  describe('GET /estudiantes/notificaciones - Autenticación', () => {
    it('debe retornar 401 sin token de autenticación', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN);

      // Assert
      expect(response.status).toBe(401);
    });

    it('debe retornar 403 con token de rol incorrecto (tutor)', async () => {
      // Arrange - Login como tutor
      const { tutor } = await createTestTutor(prisma);
      const auth = await loginUser(app, {
        email: tutor.email,
        password: DEFAULT_PASSWORD,
      });

      // Act - Intentar acceder a endpoint de estudiante
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', auth.cookie);

      // Assert
      expect(response.status).toBe(403);
    });

    it('debe retornar 200 con token de estudiante válido', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('meta');
    });
  });

  // ============================================================================
  // TEST 2: GET /estudiantes/notificaciones - Listado y paginación
  // ============================================================================
  describe('GET /estudiantes/notificaciones - Listado y paginación', () => {
    it('debe retornar array vacío si no hay notificaciones', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });

    it('debe retornar solo notificaciones del estudiante autenticado', async () => {
      // Arrange - Dos estudiantes con notificaciones
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1, password: pwd1 } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        username: 'estudiante2',
      });

      await crearNotificacion({
        estudianteId: est1.id,
        titulo: 'Para Estudiante 1',
      });
      await crearNotificacion({
        estudianteId: est1.id,
        titulo: 'Otra de Estudiante 1',
      });
      await crearNotificacion({
        estudianteId: est2.id,
        titulo: 'Para Estudiante 2',
      });

      const cookies = await loginEstudianteRaw(app, {
        username: est1.username,
        password: pwd1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert - Solo las 2 de estudiante1
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(2);
      expect(
        response.body.data.every(
          (n: { titulo: string }) =>
            n.titulo === 'Para Estudiante 1' ||
            n.titulo === 'Otra de Estudiante 1',
        ),
      ).toBe(true);
    });

    it('debe ordenar por prioridad DESC y fecha DESC', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear en orden: MEDIA, CRITICA, BAJA
      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'Media',
        prioridad: PrioridadNotificacion.MEDIA,
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'Critica',
        prioridad: PrioridadNotificacion.CRITICA,
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'Baja',
        prioridad: PrioridadNotificacion.BAJA,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert - CRITICA primero
      expect(response.status).toBe(200);
      expect(response.body.data[0].titulo).toBe('Critica');
    });

    it('debe aplicar filtro soloNoLeidas=true correctamente', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'Leída',
        leida: true,
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'No leída 1',
        leida: false,
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        titulo: 'No leída 2',
        leida: false,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones?soloNoLeidas=true')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

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
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      for (let i = 1; i <= 5; i++) {
        await crearNotificacion({
          estudianteId: estudiante.id,
          titulo: `Notificación ${i}`,
        });
      }

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act - Página 1 con limit 2
      const page1 = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones?page=1&limit=2')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      const page2 = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones?page=2&limit=2')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(page1.body.data).toHaveLength(2);
      expect(page1.body.meta.total).toBe(5);
      expect(page1.body.meta.totalPages).toBe(3);
      expect(page2.body.data).toHaveLength(2);

      // Verificar que son diferentes
      expect(page1.body.data[0].id).not.toBe(page2.body.data[0].id);
    });
  });

  // ============================================================================
  // TEST 3: GET /estudiantes/notificaciones/count
  // ============================================================================
  describe('GET /estudiantes/notificaciones/count', () => {
    it('debe retornar 0 si no hay notificaciones', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 0 });
    });

    it('debe contar solo notificaciones no leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // 3 no leídas, 2 leídas
      for (let i = 0; i < 3; i++) {
        await crearNotificacion({ estudianteId: estudiante.id, leida: false });
      }
      for (let i = 0; i < 2; i++) {
        await crearNotificacion({ estudianteId: estudiante.id, leida: true });
      }

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ count: 3 });
    });

    it('no debe contar notificaciones de otros estudiantes', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1, password: pwd1 } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        username: 'otro',
      });

      await crearNotificacion({ estudianteId: est1.id });
      await crearNotificacion({ estudianteId: est2.id });
      await crearNotificacion({ estudianteId: est2.id });

      const cookies = await loginEstudianteRaw(app, {
        username: est1.username,
        password: pwd1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones/count')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.body).toEqual({ count: 1 });
    });
  });

  // ============================================================================
  // TEST 4: PATCH /estudiantes/notificaciones/:id/leer
  // ============================================================================
  describe('PATCH /estudiantes/notificaciones/:id/leer', () => {
    it('debe marcar notificación como leída', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const notificacion = await crearNotificacion({
        estudianteId: estudiante.id,
        leida: false,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/estudiantes/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

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
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/estudiantes/notificaciones/id-inexistente/leer')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la notificación es de otro estudiante (ownership)', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1, password: pwd1 } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        username: 'otro',
      });

      const notificacion = await crearNotificacion({ estudianteId: est2.id });

      const cookies = await loginEstudianteRaw(app, {
        username: est1.username,
        password: pwd1,
      });

      // Act - est1 intenta marcar notificación de est2
      const response = await request(app.getHttpServer())
        .patch(`/api/estudiantes/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe ser idempotente - marcar leída una ya leída no falla', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const notificacion = await crearNotificacion({
        estudianteId: estudiante.id,
        leida: true, // Ya leída
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch(`/api/estudiantes/notificaciones/${notificacion.id}/leer`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.leida).toBe(true);
    });
  });

  // ============================================================================
  // TEST 5: PATCH /estudiantes/notificaciones/leer-todas
  // ============================================================================
  describe('PATCH /estudiantes/notificaciones/leer-todas', () => {
    it('debe marcar todas las notificaciones como leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      for (let i = 0; i < 5; i++) {
        await crearNotificacion({ estudianteId: estudiante.id, leida: false });
      }

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/estudiantes/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(5);
      expect(response.body.message).toBe(
        'Todas las notificaciones marcadas como leídas',
      );

      // Verificar en DB
      const noLeidas = await prisma.notificacion.count({
        where: { estudiante_id: estudiante.id, leida: false },
      });
      expect(noLeidas).toBe(0);
    });

    it('no debe afectar notificaciones de otros estudiantes', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1, password: pwd1 } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        username: 'otro',
      });

      await crearNotificacion({ estudianteId: est1.id, leida: false });
      await crearNotificacion({ estudianteId: est2.id, leida: false });

      const cookies = await loginEstudianteRaw(app, {
        username: est1.username,
        password: pwd1,
      });

      // Act
      await request(app.getHttpServer())
        .patch('/api/estudiantes/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert - La de est2 sigue no leída
      const countEst2 = await prisma.notificacion.count({
        where: { estudiante_id: est2.id, leida: false },
      });
      expect(countEst2).toBe(1);
    });

    it('debe retornar count=0 si no hay notificaciones no leídas', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      await crearNotificacion({ estudianteId: estudiante.id, leida: true });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .patch('/api/estudiantes/notificaciones/leer-todas')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.count).toBe(0);
    });
  });

  // ============================================================================
  // TEST 6: DELETE /estudiantes/notificaciones/:id
  // ============================================================================
  describe('DELETE /estudiantes/notificaciones/:id', () => {
    it('debe eliminar la notificación', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const notificacion = await crearNotificacion({
        estudianteId: estudiante.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/estudiantes/notificaciones/${notificacion.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

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
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete('/api/estudiantes/notificaciones/id-inexistente')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(404);
    });

    it('debe retornar 404 si la notificación es de otro estudiante (ownership)', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: est1, password: pwd1 } = await createTestEstudiante(
        prisma,
        { tutorId: tutor.id },
      );
      const { estudiante: est2 } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        username: 'otro',
      });

      const notificacion = await crearNotificacion({ estudianteId: est2.id });

      const cookies = await loginEstudianteRaw(app, {
        username: est1.username,
        password: pwd1,
      });

      // Act
      const response = await request(app.getHttpServer())
        .delete(`/api/estudiantes/notificaciones/${notificacion.id}`)
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

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
  // TEST 7: Tipos de notificaciones específicas para estudiantes
  // ============================================================================
  describe('Tipos de notificaciones de estudiante', () => {
    it('debe retornar notificaciones de tipo ESTUDIANTE correctamente', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear diferentes tipos de notificaciones para estudiante
      await crearNotificacion({
        estudianteId: estudiante.id,
        tipo: TipoNotificacion.ESTUDIANTE_BIENVENIDA,
        titulo: 'Bienvenido',
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        tipo: TipoNotificacion.ESTUDIANTE_LOGRO_DESBLOQUEADO,
        titulo: 'Logro desbloqueado',
      });
      await crearNotificacion({
        estudianteId: estudiante.id,
        tipo: TipoNotificacion.ESTUDIANTE_NIVEL_SUBIDO,
        titulo: 'Subiste de nivel',
      });

      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/notificaciones')
        .set('Origin', FRONTEND_ORIGIN)
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.meta.total).toBe(3);

      const tipos = response.body.data.map(
        (n: { tipo: TipoNotificacion }) => n.tipo,
      );
      expect(tipos).toContain('ESTUDIANTE_BIENVENIDA');
      expect(tipos).toContain('ESTUDIANTE_LOGRO_DESBLOQUEADO');
      expect(tipos).toContain('ESTUDIANTE_NIVEL_SUBIDO');
    });
  });
});
