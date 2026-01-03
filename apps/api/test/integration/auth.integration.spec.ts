/**
 * ============================================================================
 * INTEGRATION TESTS - Auth Module
 * ============================================================================
 *
 * Estos tests corren contra una base de datos REAL (PostgreSQL de test).
 * A diferencia de los unit tests que mockean Prisma, estos tests verifican:
 *
 * - El schema de Prisma funciona correctamente
 * - Los constraints de DB se aplican correctamente
 * - Las transacciones funcionan
 * - El flujo completo de auth funciona end-to-end
 *
 * Setup required:
 *   docker-compose -f docker-compose.test.yml up -d
 *   DATABASE_URL="postgresql://test:test_password_123@localhost:5433/mateatletas_test" npx prisma migrate deploy
 *
 * Run:
 *   npm run test:integration
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import { PrismaService } from '../../src/core/database/prisma.service';
import { AppModule } from '../../src/app.module';

describe('[INTEGRATION] Auth Module', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  // ============================================================================
  // Setup: Levantar aplicación con DB real
  // ============================================================================
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser()); // Necesario para parsear cookies httpOnly
    prisma = app.get<PrismaService>(PrismaService);

    await app.init();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  });

  // ============================================================================
  // Cleanup: Limpiar DB antes de cada test
  // ============================================================================
  beforeEach(async () => {
    // Limpiar tablas en orden correcto (primero hijos, después padres)
    // para respetar foreign keys
    await prisma.contenido.deleteMany({}); // Hijo de Admin
    await prisma.estudiante.deleteMany({}); // Hijo de Tutor
    await prisma.tutor.deleteMany({});
    await prisma.docente.deleteMany({});
    await prisma.admin.deleteMany({});
  });

  // ============================================================================
  // INTEGRATION TEST 1: Register + Login flow completo
  // ============================================================================
  describe('POST /auth/register → POST /auth/login', () => {
    it('should register tutor and login successfully', async () => {
      // PASO 1: Registrar tutor (RegisterDto solo soporta tutores)
      const registerResponse = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'integration-test@example.com',
          password: 'SecurePassword123!',
          nombre: 'Integration',
          apellido: 'Test',
        })
        .expect(201);

      // El registro solo devuelve { message, user } - no access_token
      expect(registerResponse.body).toHaveProperty('message');
      expect(registerResponse.body).toHaveProperty('user');
      expect(registerResponse.body.user).toMatchObject({
        email: 'integration-test@example.com',
        nombre: 'Integration',
        apellido: 'Test',
        role: 'TUTOR',
      });

      // PASO 2: Verificar que el tutor existe en la DB
      const tutorInDb = await prisma.tutor.findUnique({
        where: { email: 'integration-test@example.com' },
      });

      expect(tutorInDb).toBeDefined();
      expect(tutorInDb?.email).toBe('integration-test@example.com');
      expect(tutorInDb?.password_hash).toBeDefined();
      expect(tutorInDb?.password_hash).not.toBe('SecurePassword123!'); // Debe estar hasheado

      // PASO 3: Login con credenciales correctas
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'integration-test@example.com',
          password: 'SecurePassword123!',
        })
        .expect(200);

      // El token se envía como cookie httpOnly, no en el body
      // El body solo contiene { user, roles }
      expect(loginResponse.body).toHaveProperty('user');
      expect(loginResponse.body.user.email).toBe(
        'integration-test@example.com',
      );
      // Verificar que se envía la cookie con el token
      expect(loginResponse.headers['set-cookie']).toBeDefined();
    });

    it('should reject duplicate email (unique constraint)', async () => {
      // PASO 1: Registrar primer tutor
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'Password123!',
          nombre: 'First',
          apellido: 'User',
        })
        .expect(201);

      // PASO 2: Intentar registrar con mismo email (debe fallar)
      // El código usa BadRequestException (400) para emails duplicados
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'duplicate@example.com',
          password: 'DifferentPassword123!',
          nombre: 'Second',
          apellido: 'User',
        })
        .expect(400); // BadRequest - el código actual usa esta excepción

      // PASO 3: Verificar que solo hay 1 tutor en DB
      const tutorsCount = await prisma.tutor.count({
        where: { email: 'duplicate@example.com' },
      });

      expect(tutorsCount).toBe(1);
    });
  });

  // ============================================================================
  // INTEGRATION TEST 2: Login con credenciales incorrectas
  // ============================================================================
  describe('POST /auth/login (invalid credentials)', () => {
    it('should reject wrong password', async () => {
      // Setup: Crear tutor
      await request(app.getHttpServer()).post('/api/auth/register').send({
        email: 'valid@example.com',
        password: 'CorrectPassword123!',
        nombre: 'Valid',
        apellido: 'User',
      });

      // Test: Login con password incorrecta
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'valid@example.com',
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should reject non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Password123!',
        })
        .expect(401);
    });
  });

  // ============================================================================
  // INTEGRATION TEST 3: JWT Token funciona con endpoints protegidos
  // ============================================================================
  describe('Protected endpoints with JWT', () => {
    it('should access protected endpoint with valid cookie', async () => {
      // PASO 1: Registrar tutor
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          email: 'protected@example.com',
          password: 'Password123!',
          nombre: 'Protected',
          apellido: 'User',
        })
        .expect(201);

      // PASO 2: Login para obtener cookies
      const loginResponse = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'protected@example.com',
          password: 'Password123!',
        });

      // Extraer cookies del header set-cookie
      const cookies = loginResponse.headers['set-cookie'];

      // PASO 3: Acceder a endpoint protegido usando las cookies
      const profileResponse = await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Cookie', cookies)
        .expect(200);

      expect(profileResponse.body.email).toBe('protected@example.com');
    });

    it('should reject protected endpoint without token', async () => {
      await request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('should reject protected endpoint with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token-12345')
        .expect(401);
    });
  });
});
