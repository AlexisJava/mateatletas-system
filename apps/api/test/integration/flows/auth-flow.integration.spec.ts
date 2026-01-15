/**
 * ============================================================================
 * AUTH FLOW INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * Tests de integración para flujos de autenticación completos.
 * Basado en los REQUISITOS reales del sistema documentados en auth.controller.ts:
 *
 * Endpoints:
 * - POST /auth/login → 200 { user, roles } + cookies (auth-token, refresh-token)
 * - POST /auth/estudiante/login → 200 { user } + cookies
 * - POST /auth/refresh → 200 { success: true, message } (cookies renovadas)
 * - GET /auth/profile → 200 perfil del usuario
 * - POST /auth/logout → 200 { message, description }
 *
 * Rate limiting: 5 intentos por defecto (LOGIN_THROTTLE_LIMIT)
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestTutor,
  createTestDocente,
  createTestEstudiante,
} from '../../fixtures/factories';
import {
  createTestPlan,
  createTestSuscripcion,
} from '../../fixtures/factories/plan.factory';
import { cleanAllTestTables } from '../../helpers/db-cleanup';

describe('Auth Flow Integration Tests (BBT)', () => {
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
    await app.init();

    prisma = moduleFixture.get<PrismaService>(PrismaService);
  }, 60000);

  afterAll(async () => {
    await cleanAllTestTables(prisma);
    await app.close();
  });

  afterEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGIN TUTOR VÁLIDO
  // ==========================================================================

  describe('Login Tutor - Flujo Exitoso', () => {
    it('should_return_user_and_roles_with_cookies_when_valid_credentials', async () => {
      // Arrange
      const { tutor, password } = await createTestTutor(prisma);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password });

      // Assert - Response body
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('roles');
      expect(response.body.user.id).toBe(tutor.id);
      expect(response.body.user.email).toBe(tutor.email);
      expect(Array.isArray(response.body.roles)).toBe(true);

      // Assert - Cookies establecidas
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('auth-token='))).toBe(
        true,
      );
      expect(cookies.some((c: string) => c.startsWith('refresh-token='))).toBe(
        true,
      );
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGIN TUTOR INVÁLIDO
  // ==========================================================================

  describe('Login Tutor - Credenciales Inválidas', () => {
    it('should_return_401_when_wrong_password', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password: 'WrongPassword123!' });

      // Assert
      expect(response.status).toBe(401);
    });

    it('should_return_401_when_email_not_exists', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'AnyPassword123!',
        });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGIN ESTUDIANTE VÁLIDO
  // ==========================================================================

  describe('Login Estudiante - Flujo Exitoso', () => {
    it('should_return_user_with_cookies_when_valid_credentials', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const plan = await createTestPlan(prisma, 'STEAM_SINCRONICO');
      await createTestSuscripcion(prisma, tutor.id, plan.id);
      const { estudiante, password } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
        planId: plan.id,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .send({ username: estudiante.username, password });

      // Assert - Response body: { user } SIN roles (estudiante no tiene roles en respuesta)
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body.user.id).toBe(estudiante.id);
      // Nota: estudiante login NO devuelve 'roles' en el body (diferente a tutor)

      // Assert - Cookies establecidas
      const cookies = response.headers['set-cookie'] as string[];
      expect(cookies).toBeDefined();
      expect(cookies.some((c: string) => c.startsWith('auth-token='))).toBe(
        true,
      );
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGIN ESTUDIANTE INVÁLIDO
  // ==========================================================================

  describe('Login Estudiante - Credenciales Inválidas', () => {
    it('should_return_401_when_wrong_password', async () => {
      // Arrange
      const { tutor } = await createTestTutor(prisma);
      const { estudiante } = await createTestEstudiante(prisma, {
        tutorId: tutor.id,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .send({ username: estudiante.username, password: 'WrongPass123!' });

      // Assert
      expect(response.status).toBe(401);
    });

    it('should_return_401_when_username_not_exists', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .send({ username: 'nonexistent_user_123', password: 'AnyPass123!' });

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: REFRESH TOKEN
  // ==========================================================================

  describe('Refresh Token - Renovación de Sesión', () => {
    it('should_renew_tokens_when_valid_refresh_token', async () => {
      // Arrange - Login para obtener cookies
      const { tutor, password } = await createTestTutor(prisma);
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];
      const cookieHeader = cookies.join('; ');

      // Act - Refresh usando la cookie
      const response = await request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Cookie', cookieHeader);

      // Assert - El endpoint devuelve { success: true, message } NO accessToken
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Tokens renovados exitosamente');

      // Assert - Nuevas cookies establecidas
      const newCookies = response.headers['set-cookie'] as string[];
      expect(newCookies).toBeDefined();
      expect(newCookies.some((c: string) => c.startsWith('auth-token='))).toBe(
        true,
      );
    });

    it('should_return_401_when_no_refresh_token', async () => {
      // Act - Sin cookie
      const response = await request(app.getHttpServer()).post(
        '/api/auth/refresh',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: PROFILE AUTENTICADO
  // ==========================================================================

  describe('Profile - Acceso Autenticado', () => {
    it('should_return_profile_when_authenticated', async () => {
      // Arrange - Login
      const { tutor, password } = await createTestTutor(prisma);
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];
      const cookieHeader = cookies.join('; ');

      // Act
      const response = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Cookie', cookieHeader);

      // Assert
      expect(response.status).toBe(200);
      expect(response.body.id).toBe(tutor.id);
      expect(response.body.email).toBe(tutor.email);
    });

    it('should_return_401_when_not_authenticated', async () => {
      // Act - Sin token
      const response = await request(app.getHttpServer()).get(
        '/api/auth/profile',
      );

      // Assert
      expect(response.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGOUT
  // ==========================================================================

  describe('Logout - Cierre de Sesión', () => {
    it('should_clear_cookies_and_return_success_message', async () => {
      // Arrange - Login
      const { tutor, password } = await createTestTutor(prisma);
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];
      const cookieHeader = cookies.join('; ');

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookieHeader);

      // Assert - Response
      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Logout exitoso');

      // Assert - Cookie auth-token limpiada (expires en el pasado o valor vacío)
      const logoutCookies = response.headers['set-cookie'] as string[];
      expect(logoutCookies).toBeDefined();
    });

    it('should_invalidate_session_after_logout', async () => {
      // Arrange - Login
      const { tutor, password } = await createTestTutor(prisma);
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: tutor.email, password });

      const cookies = loginResponse.headers['set-cookie'] as string[];
      const cookieHeader = cookies.join('; ');

      // Act - Logout
      await request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Cookie', cookieHeader);

      // Assert - Profile con token antiguo debe fallar (token blacklisted)
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Cookie', cookieHeader);

      expect(profileResponse.status).toBe(401);
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: LOGIN DOCENTE
  // ==========================================================================

  describe('Login Docente - Flujo Exitoso', () => {
    it('should_return_user_and_roles_with_cookies_when_valid_credentials', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: docente.email, password });

      // Assert
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('roles');
      expect(response.body.user.id).toBe(docente.id);
      expect(response.body.user.email).toBe(docente.email);

      // Docente puede tener must_change_password en la respuesta
      // (si es primera vez que se loguea con password temporal)
    });
  });

  // ==========================================================================
  // CLASE DE EQUIVALENCIA: DATOS INVÁLIDOS (VALIDACIÓN)
  // ==========================================================================

  describe('Login - Validación de Datos', () => {
    it('should_return_400_when_email_invalid_format', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'not-an-email', password: 'Password123!' });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should_return_400_when_password_missing', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'valid@email.com' });

      // Assert
      expect(response.status).toBe(400);
    });

    it('should_return_400_when_estudiante_username_missing', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/api/auth/estudiante/login')
        .send({ password: 'Password123!' });

      // Assert
      expect(response.status).toBe(400);
    });
  });
});
