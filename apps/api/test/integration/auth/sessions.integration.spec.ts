/**
 * ============================================================================
 * SESSIONS MANAGEMENT INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINTS:
 * - GET /auth/sessions → Lista sesiones activas del usuario
 * - DELETE /auth/sessions/:sessionId → Revoca una sesión específica
 * - POST /auth/sessions/revoke-all → Revoca todas excepto la actual
 *
 * EQUIVALENCE CLASSES:
 *
 * GET /auth/sessions:
 * - CE1: Usuario autenticado con 1 sesión → Lista con 1 sesión (current=true)
 * - CE2: Usuario autenticado con múltiples sesiones → Lista todas
 * - CE3: Usuario no autenticado → 401
 *
 * DELETE /auth/sessions/:sessionId:
 * - CE4: Revocar sesión propia existente → 200 + sesión revocada
 * - CE5: Revocar sesión actual → 200 (logout de sí mismo)
 * - CE6: Revocar sesión de otro usuario → 404
 * - CE7: Revocar sesión inexistente → 404
 * - CE8: Usuario no autenticado → 401
 *
 * POST /auth/sessions/revoke-all:
 * - CE9: Usuario con múltiples sesiones → Revoca todas excepto actual
 * - CE10: Usuario con solo 1 sesión → { revokedCount: 0 }
 * - CE11: Usuario no autenticado → 401
 *
 * SECURITY TESTS:
 * - Sesión revocada no puede usarse
 * - No puede ver/revocar sesiones de otros usuarios
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --testPathPattern="sessions.integration" --runInBand
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { createTestTutor, createTestDocente } from '../../fixtures/factories';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { generateUniqueIP } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Sessions Management (BBT)', () => {
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
  // HELPER: Login y obtener cookies
  // ============================================================================
  async function loginAndGetCookies(
    email: string,
    password: string,
    userAgent = 'Test Browser/1.0',
  ): Promise<string> {
    const response = await request(app.getHttpServer())
      .post('/api/auth/login')
      .set('X-Forwarded-For', generateUniqueIP())
      .set('User-Agent', userAgent)
      .send({ email, password });

    expect(response.status).toBe(200);
    const cookies = response.headers['set-cookie'] as string[];
    return cookies.join('; ');
  }

  // ============================================================================
  // CE1-CE3: GET /auth/sessions
  // ============================================================================
  describe('GET /api/auth/sessions', () => {
    it('CE1: should return list with 1 session marked as current', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginAndGetCookies(tutor.email, password);

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.sessions).toBeDefined();
      expect(Array.isArray(response.body.sessions)).toBe(true);
      expect(response.body.sessions.length).toBeGreaterThanOrEqual(1);

      // La sesión actual debe estar marcada como isCurrent
      const currentSession = response.body.sessions.find(
        (s: { isCurrent: boolean }) => s.isCurrent === true,
      );
      expect(currentSession).toBeDefined();
      expect(currentSession.id).toBeDefined();
      expect(currentSession.device).toBeDefined();
      expect(currentSession.browser).toBeDefined();
    });

    it('CE2: should return multiple sessions when user has many active sessions', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);

      // Login from different "devices" (simulated with different user agents)
      const cookies1 = await loginAndGetCookies(
        tutor.email,
        password,
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0',
      );
      const cookies2 = await loginAndGetCookies(
        tutor.email,
        password,
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Safari/604.1',
      );
      const cookies3 = await loginAndGetCookies(
        tutor.email,
        password,
        'Mozilla/5.0 (Linux; Android 14) Chrome/120.0',
      );

      // Act - Check sessions from first session
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies1);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.sessions.length).toBeGreaterThanOrEqual(3);

      // Verify different devices are detected
      const devices = response.body.sessions.map(
        (s: { device: string }) => s.device,
      );
      expect(devices).toContain('Windows');
    });

    it('CE3: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).get(
        '/api/auth/sessions',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE4-CE8: DELETE /auth/sessions/:sessionId
  // ============================================================================
  describe('DELETE /api/auth/sessions/:sessionId', () => {
    it('CE4: should revoke specific session successfully', async () => {
      // Arrange - Login twice
      const { tutor, password } = await createTestTutor(prisma);
      const cookies1 = await loginAndGetCookies(
        tutor.email,
        password,
        'Chrome/Windows',
      );
      const cookies2 = await loginAndGetCookies(
        tutor.email,
        password,
        'Safari/iPhone',
      );

      // Get sessions to find the one to revoke
      const sessionsResponse = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies1);

      expect(sessionsResponse.status).toBe(200);
      const sessions = sessionsResponse.body.sessions;

      // Find the session that is NOT current (the second login)
      const sessionToRevoke = sessions.find(
        (s: { isCurrent: boolean }) => !s.isCurrent,
      );
      expect(sessionToRevoke).toBeDefined();

      // Act - Revoke the other session
      const response = await request(app.getHttpServer())
        .delete(`/api/auth/sessions/${sessionToRevoke.id}`)
        .set('Cookie', cookies1);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('revocada');

      // NOTE: Access token may still work until it expires (JWT behavior)
      // What we revoke is the REFRESH token - verify refresh fails
      const refreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies2);

      // Refresh should fail because the session (refresh token JTI) is revoked
      expect(refreshResponse.status).toBe(401);
    });

    it('CE6: should return 404 when trying to revoke another users session', async () => {
      // Arrange - Two different users
      const { tutor: tutor1, password: password1 } =
        await createTestTutor(prisma);
      const { tutor: tutor2, password: password2 } = await createTestTutor(
        prisma,
        {
          email: 'tutor2@example.com',
        },
      );

      const cookies1 = await loginAndGetCookies(tutor1.email, password1);
      const cookies2 = await loginAndGetCookies(tutor2.email, password2);

      // Get tutor2's session ID
      const sessionsResponse = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies2);

      const tutor2Session = sessionsResponse.body.sessions[0];

      // Act - Try to revoke tutor2's session from tutor1
      const response = await request(app.getHttpServer())
        .delete(`/api/auth/sessions/${tutor2Session.id}`)
        .set('Cookie', cookies1);

      // Assert - Should fail (not found or forbidden)
      expect(response.status).toBe(404);
    });

    it('CE7: should return 404 when session does not exist', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginAndGetCookies(tutor.email, password);

      // Act - Try to revoke non-existent session
      const response = await request(app.getHttpServer())
        .delete('/api/auth/sessions/nonexistent-session-id-12345')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(404);
    });

    it('CE8: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).delete(
        '/api/auth/sessions/any-session-id',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // CE9-CE11: POST /auth/sessions/revoke-all
  // ============================================================================
  describe('POST /api/auth/sessions/revoke-all', () => {
    it('CE9: should revoke all sessions except current', async () => {
      // Arrange - Login multiple times
      const { tutor, password } = await createTestTutor(prisma);
      const cookies1 = await loginAndGetCookies(
        tutor.email,
        password,
        'Chrome/Windows',
      );
      const cookies2 = await loginAndGetCookies(
        tutor.email,
        password,
        'Safari/Mac',
      );
      const cookies3 = await loginAndGetCookies(
        tutor.email,
        password,
        'Firefox/Linux',
      );

      // Act - Revoke all from cookies1
      const response = await request(app.getHttpServer())
        .post('/api/auth/sessions/revoke-all')
        .set('Cookie', cookies1);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.revokedCount).toBeGreaterThanOrEqual(2);

      // Verify current session (cookies1) still works - refresh should succeed
      const currentRefreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies1);
      expect(currentRefreshResponse.status).toBe(200);

      // Verify other sessions are revoked - refresh should fail
      // NOTE: Access tokens may still work (short-lived JWT), but refresh fails
      const session2RefreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies2);
      expect(session2RefreshResponse.status).toBe(401);

      const session3RefreshResponse = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies3);
      expect(session3RefreshResponse.status).toBe(401);
    });

    it('CE10: should return revokedCount=0 when only 1 session exists', async () => {
      // Arrange - Login only once
      const { tutor, password } = await createTestTutor(prisma);
      const cookies = await loginAndGetCookies(tutor.email, password);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/sessions/revoke-all')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.revokedCount).toBe(0);

      // Current session should still work
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Cookie', cookies);
      expect(profileResponse.status).toBe(200);
    });

    it('CE11: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).post(
        '/api/auth/sessions/revoke-all',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // SECURITY & EDGE CASES
  // ============================================================================
  describe('Security Tests', () => {
    it('should detect and parse different user agents correctly', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);

      // Login with specific user agent
      const windowsChromeAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0';
      const cookies = await loginAndGetCookies(
        tutor.email,
        password,
        windowsChromeAgent,
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      const session = response.body.sessions[0];
      expect(session.device).toBe('Windows');
      expect(session.browser).toBe('Chrome');
    });

    it('should track IP address of sessions', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);
      const testIP = '192.168.1.100';

      // Login with specific IP
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', testIP)
        .send({ email: tutor.email, password });

      const cookies = (loginResponse.headers['set-cookie'] as string[]).join(
        '; ',
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      const session = response.body.sessions[0];
      expect(session.ipAddress).toBe(testIP);
    });

    it('revoked session refresh token should be immediately unusable', async () => {
      // Arrange - Login twice
      const { tutor, password } = await createTestTutor(prisma);
      const cookies1 = await loginAndGetCookies(tutor.email, password);
      const cookies2 = await loginAndGetCookies(
        tutor.email,
        password,
        'Safari/Mac',
      );

      // Verify cookies2 refresh works before revocation
      const beforeRevoke = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies2);
      expect(beforeRevoke.status).toBe(200);

      // Get session ID for cookies2
      const sessionsResponse = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies2);

      const currentSession = sessionsResponse.body.sessions.find(
        (s: { isCurrent: boolean }) => s.isCurrent,
      );

      // Act - Revoke from cookies1
      const revokeResponse = await request(app.getHttpServer())
        .delete(`/api/auth/sessions/${currentSession.id}`)
        .set('Cookie', cookies1);

      expect(revokeResponse.status).toBe(200);

      // Assert - cookies2 refresh should be immediately unusable
      // NOTE: Access token may still work until expiry, but refresh is blocked
      const afterRevoke = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookies2);

      expect(afterRevoke.status).toBe(401);
    });
  });

  // ============================================================================
  // DOCENTE SESSIONS
  // ============================================================================
  describe('Docente Sessions', () => {
    it('should work for docentes as well', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);

      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .set('X-Forwarded-For', generateUniqueIP())
        .send({ email: docente.email, password });

      const cookies = (loginResponse.headers['set-cookie'] as string[]).join(
        '; ',
      );

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/sessions')
        .set('Cookie', cookies);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.sessions.length).toBeGreaterThanOrEqual(1);
    });
  });
});
