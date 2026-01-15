/**
 * ============================================================================
 * INTEGRATION TESTS - LiveKit Token (Endpoint)
 * ============================================================================
 *
 * Endpoint: POST /api/livekit/token/estudiante
 *
 * Body (uno de los dos):
 *   { claseGrupoId: string }  // Para clases semanales
 *   { comisionId: string }    // Para talleres/colonias
 *
 * Response (200):
 *   {
 *     token: string,     // JWT para LiveKit
 *     wsUrl: string,     // WebSocket URL
 *     roomName: string   // Nombre de la sala
 *   }
 *
 * Validaciones:
 * - Estudiante debe estar inscrito y activo en la clase/comisión
 * - Solo uno de los IDs debe proporcionarse
 *
 * Errores:
 * - 400: Ambos IDs o ninguno proporcionado
 * - 403: No inscrito, inscripción inactiva, clase/comisión no existe
 * - 401: Sin token JWT
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="livekit-token.integration" --runInBand
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
} from '../../../fixtures/factories';
import {
  generateUniqueIP,
  loginEstudianteRaw,
  FRONTEND_ORIGIN,
} from '../../../helpers/auth.helpers';

describe('[INTEGRATION] LiveKit Token - Endpoints', () => {
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
  describe('POST /livekit/token/estudiante - Happy Path', () => {
    it('debe retornar token válido para estudiante inscrito en ClaseGrupo', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // ASSERT
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body).toHaveProperty('wsUrl');
      expect(response.body).toHaveProperty('roomName');
      expect(response.body.token).toBeTruthy();
      expect(response.body.roomName).toContain('clase-grupo');
    });
  });

  // ============================================================================
  // PERMISOS
  // ============================================================================
  describe('POST /livekit/token/estudiante - Permisos', () => {
    it('debe retornar 401 sin token', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: 'fake-id' });

      expect(response.status).toBe(401);
    });

    it('debe retornar 403 si estudiante no está inscrito en la clase', async () => {
      // ARRANGE - Crear estudiante SIN inscripción en la clase
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Crear otro estudiante que NO está inscrito
      const { tutor } = await createTestTutor(prisma);
      const { estudiante: otroEstudiante, password } =
        await createTestEstudiante(prisma, { tutorId: tutor.id });
      const cookies = await loginEstudiante(otroEstudiante.username, password);

      // ACT - Intentar obtener token para clase donde no está inscrito
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // ASSERT
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('No estás inscrito');
    });

    it('debe retornar 403 con token de docente', async () => {
      // ARRANGE
      const { docente, password } = await createTestDocente(prisma);
      const setup = await createEstudianteConClaseGrupo(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies || [])
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // ASSERT - Docente no puede usar endpoint de estudiante
      expect(response.status).toBe(403);
    });
  });

  // ============================================================================
  // VALIDACIONES
  // ============================================================================
  describe('POST /livekit/token/estudiante - Validaciones', () => {
    it('debe retornar 400 si no proporciona ningún ID', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({}); // Sin ningún ID

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('claseGrupoId o comisionId');
    });

    it('debe retornar 400 si proporciona ambos IDs', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({
          claseGrupoId: setup.claseGrupo.id,
          comisionId: 'fake-comision-id',
        });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('no ambos');
    });

    it('debe retornar 403 si la clase no existe', async () => {
      // ARRANGE
      const setup = await createEstudianteConClaseGrupo(prisma);
      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: 'cm000000000000000000000000' }); // ID inexistente

      // ASSERT
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('no encontrada');
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('POST /livekit/token/estudiante - Edge Cases', () => {
    it('debe fallar si la inscripción tiene fecha_baja (inactiva)', async () => {
      // ARRANGE - Crear estudiante y luego dar de baja
      const setup = await createEstudianteConClaseGrupo(prisma);

      // Dar de baja la inscripción
      await prisma.inscripcionClaseGrupo.updateMany({
        where: { estudiante_id: setup.estudiante.id },
        data: { fecha_baja: new Date() },
      });

      const cookies = await loginEstudiante(
        setup.estudiante.username,
        setup.estudiantePassword,
      );

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/livekit/token/estudiante')
        .set('Cookie', cookies)
        .set('Origin', FRONTEND_ORIGIN)
        .send({ claseGrupoId: setup.claseGrupo.id });

      // ASSERT
      expect(response.status).toBe(403);
      expect(response.body.message).toContain('No estás inscrito');
    });
  });
});
