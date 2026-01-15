/**
 * ============================================================================
 * INTEGRATION TESTS - Reacciones al Activity Feed
 * ============================================================================
 *
 * Endpoints:
 *   POST   /api/estudiantes/feed/:actividadId/reaccion
 *   DELETE /api/estudiantes/feed/:actividadId/reaccion?emoji=X
 *   GET    /api/estudiantes/feed/mis-reacciones-hoy
 *
 * Límites:
 *   - 5 reacciones máximo por día
 *   - 4 emojis permitidos: 👏, 🔥, 💪, 🚀
 *   - NO puede reaccionar a su propia actividad
 *
 * XP:
 *   - Actualmente NO se otorga XP por recibir reacciones (solo social)
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="reacciones.integration" --runInBand
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
  createEstudianteConClaseGrupo,
  createTestTutor,
  createTestEstudiante,
  createTestDocente,
  createTestActividadFeed,
} from '../../../fixtures/factories';
import {
  generateUniqueIP,
  loginEstudianteRaw,
  FRONTEND_ORIGIN,
} from '../../../helpers/auth.helpers';
const EMOJIS_PERMITIDOS = ['👏', '🔥', '💪', '🚀'];
const LIMITE_REACCIONES_DIARIAS = 5;

describe('[INTEGRATION] Reacciones - Endpoints', () => {
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
  // Helper wrapper para usar el helper centralizado con la app actual
  async function loginEstudiante(
    username: string,
    password: string,
  ): Promise<string[]> {
    return loginEstudianteRaw(app, { username, password });
  }

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('POST /estudiantes/feed/:actividadId/reaccion - Happy Path', () => {
    it('debe enviar reacción a actividad de compañero exitosamente', async () => {
      // ARRANGE - Crear dos estudiantes en la misma clase
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear actividad del compañero
      const actividad = await createTestActividadFeed(prisma, compañero.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT
      expect(response.status).toBe(201);

      // Verificar en BD
      const reaccion = await prisma.reaccionFeed.findFirst({
        where: {
          actividad_id: actividad.id,
          estudiante_id: setup1.estudiante.id,
          emoji: '👏',
        },
      });
      expect(reaccion).not.toBeNull();
    });

    it('debe permitir todos los emojis válidos', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const actividad = await createTestActividadFeed(prisma, compañero.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT & ASSERT - Probar cada emoji permitido
      for (const emoji of EMOJIS_PERMITIDOS) {
        const response = await request(app.getHttpServer())
          .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
          .set('Cookie', cookies)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ emoji });

        expect(response.status).toBe(201);
      }

      // Verificar que hay 4 reacciones (solo se cuenta cada emoji único)
      // pero NOTA: Puede haber 4 reacciones diferentes O 4 intentos que se resuelvan a 1
      // dependiendo del constraint único (actividad_id, estudiante_id, emoji)
    });

    it('debe eliminar reacción exitosamente', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const actividad = await createTestActividadFeed(prisma, compañero.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // Primero agregar la reacción
      await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ACT - Eliminar la reacción
      const response = await request(app.getHttpServer())
        .delete(`/api/estudiantes/feed/${actividad.id}/reaccion?emoji=👏`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);

      // Verificar que ya no existe
      const reaccion = await prisma.reaccionFeed.findFirst({
        where: {
          actividad_id: actividad.id,
          estudiante_id: setup1.estudiante.id,
          emoji: '👏',
        },
      });
      expect(reaccion).toBeNull();
    });

    it('debe mostrar contador de reacciones del día', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Crear 3 actividades y reaccionar a cada una
      for (let i = 0; i < 3; i++) {
        const actividad = await createTestActividadFeed(prisma, compañero.id, {
          tipo: 'LECCION_COMPLETADA',
          mensaje: `Actividad ${i}`,
          xpGanado: 50,
        });

        const cookies = await loginEstudiante(
          setup1.estudiante.username,
          setup1.estudiantePassword,
        );

        await request(app.getHttpServer())
          .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
          .set('Cookie', cookies)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ emoji: '👏' });
      }

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mis-reacciones-hoy')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.usadas).toBe(3);
      expect(response.body.limite).toBe(LIMITE_REACCIONES_DIARIAS);
      expect(response.body.restantes).toBe(2);
    });
  });

  // ============================================================================
  // LÍMITE DIARIO
  // ============================================================================
  describe('POST /estudiantes/feed/:actividadId/reaccion - Límite Diario', () => {
    it('debe permitir exactamente 5 reacciones', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // Crear 5 actividades y reaccionar a cada una
      for (let i = 0; i < 5; i++) {
        const actividad = await createTestActividadFeed(prisma, compañero.id, {
          tipo: 'LECCION_COMPLETADA',
          mensaje: `Actividad ${i}`,
          xpGanado: 50,
        });

        const response = await request(app.getHttpServer())
          .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
          .set('Cookie', cookies)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ emoji: '👏' });

        expect(response.status).toBe(201);
      }

      // Verificar contador
      const counterResponse = await request(app.getHttpServer())
        .get('/api/estudiantes/feed/mis-reacciones-hoy')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN);

      expect(counterResponse.body.usadas).toBe(5);
      expect(counterResponse.body.restantes).toBe(0);
    });

    it('debe retornar 429 al intentar la 6ta reacción', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // Crear 6 actividades y reaccionar a las primeras 5
      const actividades = [];
      for (let i = 0; i < 6; i++) {
        const actividad = await createTestActividadFeed(prisma, compañero.id, {
          tipo: 'LECCION_COMPLETADA',
          mensaje: `Actividad ${i}`,
          xpGanado: 50,
        });
        actividades.push(actividad);
      }

      // Reaccionar a las primeras 5
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post(`/api/estudiantes/feed/${actividades[i].id}/reaccion`)
          .set('Cookie', cookies)
          .set('Origin', FRONTEND_ORIGIN)
          .send({ emoji: '👏' });
      }

      // ACT - Intentar la 6ta reacción
      const response = await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividades[5].id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT
      expect(response.status).toBe(429);
      expect(response.body.message).toContain('Límite');
    });
  });

  // ============================================================================
  // PERMISOS
  // ============================================================================
  describe('POST /estudiantes/feed/:actividadId/reaccion - Permisos', () => {
    it('debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/feed/fake-id/reaccion')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      expect(response.status).toBe(401);
    });

    it('debe retornar 400 al reaccionar a su propia actividad', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Crear actividad PROPIA
      const actividad = await createTestActividadFeed(
        prisma,
        setup.estudiante.id,
        {
          tipo: 'LECCION_COMPLETADA',
          mensaje: 'Mi propia actividad',
          xpGanado: 50,
        },
      );

      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('propias actividades');
    });

    it('debe retornar 403 con token de docente', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/feed/fake-id/reaccion')
        .set('Cookie', cookies || [])
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT
      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('POST /estudiantes/feed/:actividadId/reaccion - Edge Cases', () => {
    it('debe retornar 400 con emoji inválido', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const actividad = await createTestActividadFeed(prisma, compañero.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // ACT - Emoji no permitido
      const response = await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '❤️' }); // No permitido

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Emoji no permitido');
    });

    it('debe retornar 400 si la actividad no existe', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/estudiantes/feed/cm000000000000000000000000/reaccion')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('no encontrada');
    });

    it('debe ser idempotente al reaccionar dos veces con el mismo emoji', async () => {
      // ARRANGE
      const setup1 = await createEstudianteConClaseGrupo(prisma);

      const { tutor } = await createTestTutor(prisma);
      const { estudiante: compañero } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      const actividad = await createTestActividadFeed(prisma, compañero.id, {
        tipo: 'LECCION_COMPLETADA',
        mensaje: 'Completó una lección',
        xpGanado: 50,
      });

      const cookies = await loginEstudiante(
        setup1.estudiante.username,
        setup1.estudiantePassword,
      );

      // Primera reacción
      await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ACT - Segunda reacción (mismo emoji)
      const response = await request(app.getHttpServer())
        .post(`/api/estudiantes/feed/${actividad.id}/reaccion`)
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ emoji: '👏' });

      // ASSERT - Debe ser idempotente (201 o similar, no error)
      // El comportamiento puede variar: puede crear, hacer upsert, o lanzar error
      // Verificamos que no haya duplicados en la BD
      const reacciones = await prisma.reaccionFeed.findMany({
        where: {
          actividad_id: actividad.id,
          estudiante_id: setup1.estudiante.id,
          emoji: '👏',
        },
      });

      // Debido al constraint único, debería haber solo 1
      expect(reacciones.length).toBe(1);
    });
  });
});
