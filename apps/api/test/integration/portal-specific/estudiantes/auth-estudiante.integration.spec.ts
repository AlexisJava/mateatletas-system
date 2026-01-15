/**
 * ============================================================================
 * INTEGRATION TESTS - Auth Estudiante
 * ============================================================================
 *
 * Tests de integración para autenticación de estudiantes.
 * Verifica el flujo completo de login con credenciales username/password.
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- auth-estudiante
 *
 * NOTA: Cada request usa una IP única para evitar throttle (5 req/min por IP).
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { AppModule } from '../../../src/app.module';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { ESTUDIANTE_FIXTURES } from '../../fixtures/presets';
import { FRONTEND_ORIGIN, generateUniqueIP } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Auth Estudiante', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    // Configurar trust proxy para que respete X-Forwarded-For
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
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HAPPY PATH
  // ============================================================================
  describe('POST /api/auth/estudiante/login - Happy Path', () => {
    it('debe retornar token JWT con credenciales válidas', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password,
        });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(estudiante.id);
      // El endpoint retorna email (con fallback a username si no hay email)
      expect(response.body.user.email).toBe(
        estudiante.email || estudiante.username,
      );

      // Verificar que se envía la cookie httpOnly con el token
      const cookies = response.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(Array.isArray(cookies) ? cookies : [cookies]).toContainEqual(
        expect.stringContaining('auth-token='),
      );
    });

    it('debe retornar datos del usuario sin información sensible', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password,
        });

      // ASSERT
      expect(response.status).toBe(200);
      expect(response.body.user).not.toHaveProperty('password');
      expect(response.body.user).not.toHaveProperty('password_hash');
      // No debe retornar access_token en el body (va en cookie)
      expect(response.body).not.toHaveProperty('access_token');
    });

    it('debe permitir login dos veces consecutivas (tokens independientes)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT - Primer login (IP única)
      const response1 = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ACT - Segundo login (otra IP única)
      const response2 = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ASSERT - Ambos exitosos
      expect(response1.status).toBe(200);
      expect(response2.status).toBe(200);

      // Extraer cookies
      const cookies1 = response1.headers['set-cookie'];
      const cookies2 = response2.headers['set-cookie'];
      expect(cookies1).toBeDefined();
      expect(cookies2).toBeDefined();
    });
  });

  // ============================================================================
  // CREDENCIALES INVÁLIDAS
  // ============================================================================
  describe('POST /api/auth/estudiante/login - Credenciales Inválidas', () => {
    it('debe fallar con password incorrecto (401)', async () => {
      // ARRANGE
      const { estudiante } = await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password: 'WrongPassword123!',
        });

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe fallar cuando el username no existe (401)', async () => {
      // ARRANGE - No creamos ningún estudiante

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: 'usuario_inexistente_12345',
          password: 'SomePassword123!',
        });

      // ASSERT
      expect(response.status).toBe(401);
    });

    it('debe fallar con password vacío (400 - validación)', async () => {
      // ARRANGE
      const { estudiante } = await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password: '',
        });

      // ASSERT - 400 Bad Request por validación
      expect(response.status).toBe(400);
    });

    it('debe fallar con username vacío (400 - validación)', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: '',
          password: 'SomePassword123!',
        });

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe fallar con username muy corto (400 - validación)', async () => {
      // ACT - Username menor a 3 caracteres
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: 'ab',
          password: 'SomePassword123!',
        });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContainEqual(
        expect.stringContaining('3 caracteres'),
      );
    });

    it('debe fallar con password muy corto (400 - validación)', async () => {
      // ARRANGE
      const { estudiante } = await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT - Password menor a 4 caracteres
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password: '123',
        });

      // ASSERT
      expect(response.status).toBe(400);
      expect(response.body.message).toContainEqual(
        expect.stringContaining('4 caracteres'),
      );
    });
  });

  // ============================================================================
  // BODY MALFORMADO
  // ============================================================================
  describe('POST /api/auth/estudiante/login - Body Malformado', () => {
    it('debe fallar sin body (400)', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send();

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe fallar con body vacío (400)', async () => {
      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({});

      // ASSERT
      expect(response.status).toBe(400);
    });

    it('debe fallar con campos extra no permitidos (400)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT - Enviar campo extra no permitido
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password,
          campoExtra: 'no permitido',
        });

      // ASSERT - forbidNonWhitelisted rechaza campos extra
      expect(response.status).toBe(400);
    });
  });

  // ============================================================================
  // ESTUDIANTE SUSPENDIDO
  // ============================================================================
  describe('POST /api/auth/estudiante/login - Estudiante Suspendido', () => {
    it('debe permitir login de estudiante suspendido (acceso se valida después)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.suspendido(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          username: estudiante.username,
          password,
        });

      // ASSERT
      // El login permite entrar, la restricción de acceso se aplica en endpoints protegidos
      // Esto permite que el estudiante vea un mensaje explicando por qué está suspendido
      expect(response.status).toBe(200);
      expect(response.body.user.id).toBe(estudiante.id);
    });
  });

  // ============================================================================
  // DIFERENTES TIPOS DE ESTUDIANTE
  // ============================================================================
  describe('POST /api/auth/estudiante/login - Diferentes Fixtures', () => {
    it('debe permitir login de estudiante nuevo (sin plan)', async () => {
      // ARRANGE
      const { estudiante, password } = await ESTUDIANTE_FIXTURES.nuevo(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ASSERT
      expect(response.status).toBe(200);
    });

    it('debe permitir login de estudiante con plan Libros', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planLibros(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ASSERT
      expect(response.status).toBe(200);
    });

    it('debe permitir login de estudiante con override', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.conOverride(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ASSERT
      expect(response.status).toBe(200);
    });

    it('debe permitir login de estudiante con suscripción vencida', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.suscripcionVencida(prisma);

      // ACT
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ username: estudiante.username, password });

      // ASSERT - Login permitido, la restricción se aplica en verificar-acceso
      expect(response.status).toBe(200);
    });
  });
});
