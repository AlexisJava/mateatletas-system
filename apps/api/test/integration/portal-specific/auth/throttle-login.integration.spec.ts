/**
 * ============================================================================
 * INTEGRATION TESTS - Throttle en Login
 * ============================================================================
 *
 * Tests que verifican que el rate limiting funciona correctamente.
 * Estos tests usan IPs fijas para probar los límites del throttle.
 *
 * NOTA: Este archivo configura LOGIN_THROTTLE_LIMIT=5 explícitamente
 * para testear el comportamiento real del throttle.
 *
 * Setup:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration -- throttle-login
 */

// IMPORTANTE: Configurar límite de throttle ANTES de importar AppModule
// El límite se lee al cargar el módulo, no al inicializar la app
process.env.LOGIN_THROTTLE_LIMIT = '5';
process.env.LOGIN_THROTTLE_TTL = '60000';

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { PrismaService } from '../../../../src/core/database/prisma.service';
import { AppModule } from '../../../../src/app.module';
import { cleanAllTestTables } from '../../../helpers/db-cleanup';
import { ESTUDIANTE_FIXTURES } from '../../../fixtures/presets';
import { FRONTEND_ORIGIN } from '../../../helpers/auth.helpers';

describe('[INTEGRATION] Throttle en Login Estudiante', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // IP fija para tests de throttle - simula un solo cliente
  const FIXED_IP = '192.168.100.100';

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

  describe('Verificación del Throttle (5 req/min por IP)', () => {
    it('debe permitir 5 logins exitosos desde la misma IP', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT & ASSERT - 5 logins deben ser exitosos
      for (let i = 0; i < 5; i++) {
        const response = await request(app.getHttpServer())
          .post('/api/auth/estudiante/login')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', FIXED_IP)
          .send({
            username: estudiante.username,
            password,
          });

        expect(response.status).toBe(200);
      }
    });

    it('debe bloquear el 6to login desde la misma IP con 429', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // Primero hacemos 5 logins exitosos para agotar el límite
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/estudiante/login')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', FIXED_IP)
          .send({
            username: estudiante.username,
            password,
          });
      }

      // ACT - El 6to login debe fallar
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', FIXED_IP)
        .send({
          username: estudiante.username,
          password,
        });

      // ASSERT
      expect(response.status).toBe(429);
    });

    it('debe permitir logins ilimitados desde IPs diferentes', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      // ACT & ASSERT - 10 logins desde IPs diferentes = todos OK
      for (let i = 0; i < 10; i++) {
        const uniqueIP = `192.168.200.${i + 1}`;
        const response = await request(app.getHttpServer())
          .post('/api/auth/estudiante/login')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', uniqueIP)
          .send({
            username: estudiante.username,
            password,
          });

        expect(response.status).toBe(200);
      }
    });

    it('debe aislar el throttle por IP (una IP bloqueada no afecta a otras)', async () => {
      // ARRANGE
      const { estudiante, password } =
        await ESTUDIANTE_FIXTURES.planSincronico(prisma);

      const IP_A = '192.168.50.1';
      const IP_B = '192.168.50.2';

      // Agotar límite de IP_A
      for (let i = 0; i < 5; i++) {
        await request(app.getHttpServer())
          .post('/api/auth/estudiante/login')
          .set('Origin', FRONTEND_ORIGIN)
          .set('X-Forwarded-For', IP_A)
          .send({ username: estudiante.username, password });
      }

      // ACT - IP_A bloqueada, IP_B debe funcionar
      const responseBlocked = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', IP_A)
        .send({ username: estudiante.username, password });

      const responseAllowed = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .set('Origin', FRONTEND_ORIGIN)
        .set('X-Forwarded-For', IP_B)
        .send({ username: estudiante.username, password });

      // ASSERT
      expect(responseBlocked.status).toBe(429);
      expect(responseAllowed.status).toBe(200);
    });
  });
});
