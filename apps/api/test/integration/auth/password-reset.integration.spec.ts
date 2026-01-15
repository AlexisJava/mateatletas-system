/**
 * ============================================================================
 * PASSWORD RESET INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINT: POST /auth/forgot-password
 *           POST /auth/verify-reset-token
 *           POST /auth/reset-password
 *
 * EQUIVALENCE CLASSES:
 * - forgot-password:
 *   CE1: Email existente (tutor) → 200 + token creado
 *   CE2: Email existente (docente) → 200 + token creado
 *   CE3: Email existente (estudiante) → 200 + token creado (si tiene email)
 *   CE4: Email NO existente → 200 (no revelar si existe)
 *   CE5: Email formato inválido → 400
 *
 * - verify-reset-token:
 *   CE6: Token válido + email correcto → { valid: true }
 *   CE7: Token válido + email incorrecto → { valid: false }
 *   CE8: Token expirado → { valid: false }
 *   CE9: Token ya usado → { valid: false }
 *   CE10: Token inexistente → { valid: false }
 *
 * - reset-password:
 *   CE11: Token válido + nueva password válida → 200 + password actualizada
 *   CE12: Token expirado → 400
 *   CE13: Token ya usado → 400
 *   CE14: Nueva password débil → 400
 *   CE15: Token inexistente → 400
 *
 * SECURITY TESTS:
 * - No revelar existencia de email (timing attack prevention)
 * - Tokens de un solo uso
 * - Tokens expirados no funcionan
 * - Invalidar tokens anteriores al solicitar nuevo
 *
 * BOUNDARIES:
 * - Token expiration: 60 minutos
 * - Password strength requirements
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="password-reset.integration" --runInBand
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import * as crypto from 'crypto';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { createTestTutor, createTestDocente } from '../../fixtures/factories';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { generateUniqueIP } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Password Reset Flow (BBT)', () => {
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
  // HELPER: Crear token de reset manualmente en DB
  // ============================================================================
  async function createResetToken(
    email: string,
    userType: string,
    options: {
      expired?: boolean;
      used?: boolean;
    } = {},
  ): Promise<{ rawToken: string; hashedToken: string }> {
    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto
      .createHash('sha256')
      .update(rawToken)
      .digest('hex');

    const expiresAt = options.expired
      ? new Date(Date.now() - 60 * 60 * 1000) // 1 hora en el pasado
      : new Date(Date.now() + 60 * 60 * 1000); // 1 hora en el futuro

    await prisma.passwordResetToken.create({
      data: {
        email: email.toLowerCase().trim(),
        token: hashedToken,
        user_type: userType,
        expiresAt,
        used: options.used ?? false,
      },
    });

    return { rawToken, hashedToken };
  }

  // ============================================================================
  // CE1-CE5: POST /auth/forgot-password
  // ============================================================================
  describe('POST /api/auth/forgot-password', () => {
    it('CE1: should return 200 and create token when email exists (tutor)', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: tutor.email });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain(
        'Si el email existe en nuestro sistema',
      );

      // Verify token was created in DB
      const token = await prisma.passwordResetToken.findFirst({
        where: { email: tutor.email.toLowerCase() },
      });
      expect(token).toBeDefined();
      expect(token?.used).toBe(false);
      expect(token?.user_type).toBe('tutor');
    });

    it('CE2: should return 200 and create token when email exists (docente)', async () => {
      // Arrange
      const { docente } = await createTestDocente(prisma);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email });

      // Assert
      expect(response.status).toBe(200);

      // Verify token was created
      const token = await prisma.passwordResetToken.findFirst({
        where: { email: docente.email.toLowerCase() },
      });
      expect(token).toBeDefined();
      expect(token?.user_type).toBe('docente');
    });

    it('CE4: should return 200 when email does NOT exist (security - no reveal)', async () => {
      // Act - Email que no existe
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: 'nonexistent@example.com' });

      // Assert - Mismo response que cuando existe (security)
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain(
        'Si el email existe en nuestro sistema',
      );

      // No token should be created
      const token = await prisma.passwordResetToken.findFirst({
        where: { email: 'nonexistent@example.com' },
      });
      expect(token).toBeNull();
    });

    it('CE5: should return 400 when email format is invalid', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: 'not-an-email' });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should invalidate previous tokens when requesting new one', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Create an existing token
      await createResetToken(tutor.email, 'tutor');

      // Act - Request new token
      await request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: tutor.email });

      // Assert - Old tokens should be marked as used
      const tokens = await prisma.passwordResetToken.findMany({
        where: { email: tutor.email.toLowerCase() },
        orderBy: { createdAt: 'asc' },
      });

      expect(tokens.length).toBeGreaterThanOrEqual(2);
      // First token (old) should be marked as used
      expect(tokens[0].used).toBe(true);
      // Last token (new) should NOT be used yet
      expect(tokens[tokens.length - 1].used).toBe(false);
    });
  });

  // ============================================================================
  // CE6-CE10: POST /auth/verify-reset-token
  // ============================================================================
  describe('POST /api/auth/verify-reset-token', () => {
    it('CE6: should return valid=true when token is valid and email matches', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor');

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({ token: rawToken, email: tutor.email });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(true);
    });

    it('CE7: should return valid=false when token valid but email does not match', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      await createResetToken(tutor.email, 'tutor');
      const { rawToken } = await createResetToken(tutor.email, 'tutor');

      // Act - Use wrong email
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({ token: rawToken, email: 'wrong@email.com' });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('CE8: should return valid=false when token is expired', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor', {
        expired: true,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({ token: rawToken, email: tutor.email });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('CE9: should return valid=false when token is already used', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor', {
        used: true,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({ token: rawToken, email: tutor.email });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('CE10: should return valid=false when token does not exist', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Act - Random token that doesn't exist
      const response = await request(app.getHttpServer())
        .post('/api/auth/verify-reset-token')
        .send({
          token: crypto.randomBytes(32).toString('hex'),
          email: tutor.email,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.valid).toBe(false);
    });
  });

  // ============================================================================
  // CE11-CE15: POST /auth/reset-password
  // ============================================================================
  describe('POST /api/auth/reset-password', () => {
    it('CE11: should reset password when token valid and new password strong', async () => {
      // Arrange
      const { tutor, password: oldPassword } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor');
      const newPassword = 'NewSecurePassword123!';

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword,
        });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('actualizada exitosamente');

      // Verify token is now marked as used
      const usedToken = await prisma.passwordResetToken.findFirst({
        where: { email: tutor.email.toLowerCase(), used: true },
      });
      expect(usedToken).toBeDefined();

      // Verify can login with new password
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: tutor.email, password: newPassword });

      expect(loginResponse.status).toBe(200);

      // Verify cannot login with old password
      const oldLoginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: tutor.email, password: oldPassword });

      expect(oldLoginResponse.status).toBe(401);
    });

    it('CE12: should return 400 when token is expired', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor', {
        expired: true,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword: 'NewSecurePassword123!',
        });

      // Assert
      expect(response.status).toBe(400);
      expect(response.body.message).toContain('inválido o ha expirado');
    });

    it('CE13: should return 400 when token is already used', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor', {
        used: true,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword: 'NewSecurePassword123!',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE14: should return 400 when new password is too weak', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor');

      // Act - Password without uppercase/special char
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword: '123456',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('CE15: should return 400 when token does not exist', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Act - Random token
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: crypto.randomBytes(32).toString('hex'),
          email: tutor.email,
          newPassword: 'NewSecurePassword123!',
        });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should work for docente password reset', async () => {
      // Arrange
      const { docente, password: oldPassword } =
        await createTestDocente(prisma);
      const { rawToken } = await createResetToken(docente.email, 'docente');
      const newPassword = 'NewDocentePassword123!';

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: docente.email,
          newPassword,
        });

      // Assert
      expect(response.status).toBe(200);

      // Verify login with new password works
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password: newPassword });

      expect(loginResponse.status).toBe(200);
    });
  });

  // ============================================================================
  // SECURITY TESTS
  // ============================================================================
  describe('Security Tests', () => {
    // NOTE: Timing attack test removed because email service latency makes it unreliable
    // The security behavior (same response for existing/non-existing emails) is tested in CE4

    it('token should be single-use', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { rawToken } = await createResetToken(tutor.email, 'tutor');

      // Act - First use
      const firstResponse = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword: 'FirstNewPassword123!',
        });

      expect(firstResponse.status).toBe(200);

      // Act - Second use (should fail)
      const secondResponse = await request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({
          token: rawToken,
          email: tutor.email,
          newPassword: 'SecondNewPassword123!',
        });

      // Assert
      expect(secondResponse.status).toBe(400);
    });
  });
});
