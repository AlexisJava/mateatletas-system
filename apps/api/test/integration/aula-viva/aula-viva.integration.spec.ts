/**
 * ============================================================================
 * AULA VIVA INTEGRATION TEST - Black Box Testing
 * ============================================================================
 *
 * ENDPOINT:
 * - POST /aula-viva/token → Obtener token JWT para WebSocket
 *
 * EQUIVALENCE CLASSES:
 *
 * POST /aula-viva/token:
 * - CE1: Docente autenticado → 200/201 + token con rol=DOCENTE
 * - CE2: Estudiante autenticado → 200/201 + token con rol=ESTUDIANTE
 * - CE3: Admin autenticado → 200/201 + token con rol=ADMIN
 * - CE4: No autenticado → 401
 * - CE5: Token structure → Debe contener sub, nombre, rol
 * - CE6: Usuario no existe en DB (edge case) → 404
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn test:integration -- --testPathPattern="aula-viva"
 */

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import {
  createTestAdmin,
  createTestDocente,
  createTestEstudiante,
} from '../../fixtures/factories';
import { DEFAULT_PASSWORD } from '../../fixtures/factories/usuario.factory';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { loginUser, loginEstudianteRaw } from '../../helpers/auth.helpers';

describe('[INTEGRATION] Aula Viva (BBT)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwtService: JwtService;

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
    jwtService = app.get<JwtService>(JwtService);
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
  // CE1-CE3: POST /aula-viva/token - Roles válidos
  // ============================================================================
  describe('POST /api/aula-viva/token', () => {
    it('CE1: should return token with rol=DOCENTE when docente authenticated', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);
      expect(response.body.token).toBeDefined();

      // Decode token and verify payload
      const decoded = jwtService.decode(response.body.token) as {
        sub: string;
        nombre: string;
        rol: string;
      };
      expect(decoded.sub).toBe(docente.id);
      expect(decoded.rol).toBe('DOCENTE');
      expect(decoded.nombre).toContain(docente.nombre);
    });

    it('CE2: should return token with rol=ESTUDIANTE when estudiante authenticated', async () => {
      // Arrange
      const { estudiante, password } = await createTestEstudiante(prisma);
      const cookies = await loginEstudianteRaw(app, {
        username: estudiante.username,
        password,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', cookies);

      // Assert
      expect([200, 201]).toContain(response.status);
      expect(response.body.token).toBeDefined();

      // Decode token and verify payload
      const decoded = jwtService.decode(response.body.token) as {
        sub: string;
        nombre: string;
        rol: string;
      };
      expect(decoded.sub).toBe(estudiante.id);
      expect(decoded.rol).toBe('ESTUDIANTE');
      expect(decoded.nombre).toContain(estudiante.nombre);
    });

    it('CE3: should return token with rol=ADMIN when admin authenticated', async () => {
      // Arrange
      const admin = await createTestAdmin(prisma);
      const auth = await loginUser(app, {
        email: admin.email,
        password: DEFAULT_PASSWORD,
      });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);
      expect(response.body.token).toBeDefined();

      // Decode token and verify payload
      const decoded = jwtService.decode(response.body.token) as {
        sub: string;
        nombre: string;
        rol: string;
      };
      expect(decoded.sub).toBe(admin.id);
      expect(decoded.rol).toBe('ADMIN');
      expect(decoded.nombre).toContain(admin.nombre);
    });

    // ============================================================================
    // CE4: No autenticado
    // ============================================================================
    it('CE4: should return 401 when not authenticated', async () => {
      // Act
      const response = await request(app.getHttpServer()).post(
        '/api/aula-viva/token',
      );

      // Assert
      expect(response.status).toBe(401);
    });

    // ============================================================================
    // CE5: Token structure validation
    // ============================================================================
    it('CE5: token should contain required fields (sub, nombre, rol)', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);

      const decoded = jwtService.decode(response.body.token) as {
        sub: string;
        nombre: string;
        rol: string;
        exp: number;
        iat: number;
      };

      // Required fields
      expect(decoded).toHaveProperty('sub');
      expect(decoded).toHaveProperty('nombre');
      expect(decoded).toHaveProperty('rol');

      // Token expiration (5 min = 300 seconds)
      expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(300);
    });

    // ============================================================================
    // CE6: Usuario eliminado después de autenticarse (edge case)
    // ============================================================================
    it('CE6: should return 401 or 404 when user deleted after authentication', async () => {
      // Este caso verifica el comportamiento cuando el usuario ha sido
      // eliminado después de autenticarse. El sistema puede retornar:
      // - 401 si el guard JWT detecta que el usuario ya no existe
      // - 404 si el endpoint intenta buscar al usuario

      // Arrange - Crear y autenticar docente
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Eliminar el docente de la DB después de autenticarse
      await prisma.docente.delete({ where: { id: docente.id } });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', auth.cookie);

      // Assert - El sistema detecta que el usuario ya no existe
      // Puede ser 401 (guard) o 404 (endpoint) según la implementación
      expect([401, 404]).toContain(response.status);
    });
  });

  // ============================================================================
  // SECURITY: Token expiration
  // ============================================================================
  describe('Security: Token expiration', () => {
    it('should generate token with short expiration (5 min)', async () => {
      // Arrange
      const { docente, password } = await createTestDocente(prisma);
      const auth = await loginUser(app, { email: docente.email, password });

      // Act
      const response = await request(app.getHttpServer())
        .post('/api/aula-viva/token')
        .set('Cookie', auth.cookie);

      // Assert
      expect([200, 201]).toContain(response.status);

      const decoded = jwtService.decode(response.body.token) as {
        exp: number;
        iat: number;
      };

      const expirationSeconds = decoded.exp - decoded.iat;

      // Token debe expirar en 5 minutos (300 segundos)
      expect(expirationSeconds).toBe(300);
    });
  });
});
