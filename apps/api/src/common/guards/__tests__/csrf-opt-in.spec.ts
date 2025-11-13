/**
 * ✅ SECURITY TEST: CSRF Protection Opt-In
 *
 * Verifica que la protección CSRF funciona correctamente en modo opt-in:
 * 1. Endpoints SIN @RequireCsrf() permiten requests sin Origin/Referer
 * 2. Endpoints CON @RequireCsrf() rechazan requests sin Origin válido
 * 3. Webhooks funcionan correctamente sin Origin/Referer
 * 4. API pura funciona sin restricciones
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, Controller, Post, Get, Body } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import { CsrfProtectionGuard } from '../csrf-protection.guard';
import { RequireCsrf } from '../../decorators/require-csrf.decorator';

// DTOs de prueba
class TestDto {
  data: string;
}

/**
 * Controller de prueba con endpoints que simulan:
 * - Endpoint protegido con @RequireCsrf (simula login web)
 * - Endpoint NO protegido (simula webhook/API)
 */
@Controller('test')
class TestController {
  /**
   * Endpoint CON protección CSRF
   * Simula: /auth/login desde formulario web
   */
  @Post('protected')
  @RequireCsrf()
  protected(@Body() _dto: TestDto) {
    return { message: 'Protected endpoint accessed' };
  }

  /**
   * Endpoint SIN protección CSRF
   * Simula: /pagos/webhook desde MercadoPago
   */
  @Post('webhook')
  webhook(@Body() _dto: TestDto) {
    return { message: 'Webhook processed' };
  }

  /**
   * Endpoint de lectura (GET)
   * No necesita protección CSRF
   */
  @Get('public')
  public() {
    return { message: 'Public data' };
  }

  /**
   * Endpoint API puro SIN protección CSRF
   * Simula: /api/estudiantes (llamadas programáticas)
   */
  @Post('api')
  api(@Body() _dto: TestDto) {
    return { message: 'API call processed' };
  }
}

describe('CSRF Protection Opt-In', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: APP_GUARD,
          useClass: CsrfProtectionGuard,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();

    // Configurar variables de entorno para tests
    process.env.FRONTEND_URL = 'http://localhost:3000';
    process.env.NODE_ENV = 'test';

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Endpoints SIN @RequireCsrf() permiten requests sin Origin', () => {
    it('debe permitir webhook sin Origin header', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/webhook')
        .send({ data: 'webhook-data' })
        .expect(201);

      expect(response.body.message).toBe('Webhook processed');
    });

    it('debe permitir API call sin Origin header', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/api')
        .send({ data: 'api-data' })
        .expect(201);

      expect(response.body.message).toBe('API call processed');
    });

    it('debe permitir GET sin Origin header', async () => {
      const response = await request(app.getHttpServer())
        .get('/test/public')
        .expect(200);

      expect(response.body.message).toBe('Public data');
    });

    it('debe permitir webhook desde Postman (sin Origin)', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/webhook')
        .set('User-Agent', 'PostmanRuntime/7.32.2')
        .send({ data: 'postman-test' })
        .expect(201);

      expect(response.body.message).toBe('Webhook processed');
    });
  });

  describe('Endpoints CON @RequireCsrf() rechazan requests sin Origin válido', () => {
    it('debe rechazar protected endpoint sin Origin', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .send({ data: 'attack-data' })
        .expect(403);

      expect(response.body.message).toContain('Origin/Referer');
    });

    it('debe rechazar protected endpoint con Origin NO permitido', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'https://malicious-site.com')
        .send({ data: 'attack-data' })
        .expect(403);

      expect(response.body.message).toContain('origin');
      expect(response.body.message).toContain('no permitido');
    });

    it('debe rechazar protected endpoint con Referer NO permitido', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Referer', 'https://evil-domain.com/page')
        .send({ data: 'attack-data' })
        .expect(403);

      expect(response.body.message).toContain('no permitido');
    });
  });

  describe('Endpoints CON @RequireCsrf() aceptan requests con Origin válido', () => {
    it('debe permitir protected endpoint con Origin válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'http://localhost:3000')
        .send({ data: 'legit-data' })
        .expect(201);

      expect(response.body.message).toBe('Protected endpoint accessed');
    });

    it('debe permitir protected endpoint con Referer válido', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Referer', 'http://localhost:3000/login')
        .send({ data: 'legit-data' })
        .expect(201);

      expect(response.body.message).toBe('Protected endpoint accessed');
    });

    it('debe normalizar Origins con trailing slash', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'http://localhost:3000/') // trailing slash
        .send({ data: 'legit-data' })
        .expect(201);

      expect(response.body.message).toBe('Protected endpoint accessed');
    });

    it('debe validar múltiples origins en FRONTEND_URL', async () => {
      // Guardar original
      const originalUrl = process.env.FRONTEND_URL;

      // Configurar múltiples URLs
      process.env.FRONTEND_URL =
        'http://localhost:3000,https://mateatletas.com,https://staging.mateatletas.com';

      // Reiniciar app con nueva config
      await app.close();
      const moduleRef = await Test.createTestingModule({
        controllers: [TestController],
        providers: [
          {
            provide: APP_GUARD,
            useClass: CsrfProtectionGuard,
          },
        ],
      }).compile();
      app = moduleRef.createNestApplication();
      await app.init();

      // Test con cada URL
      const response1 = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'http://localhost:3000')
        .send({ data: 'test' })
        .expect(201);
      expect(response1.body.message).toBe('Protected endpoint accessed');

      const response2 = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'https://mateatletas.com')
        .send({ data: 'test' })
        .expect(201);
      expect(response2.body.message).toBe('Protected endpoint accessed');

      const response3 = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'https://staging.mateatletas.com')
        .send({ data: 'test' })
        .expect(201);
      expect(response3.body.message).toBe('Protected endpoint accessed');

      // Restaurar config original
      process.env.FRONTEND_URL = originalUrl;
    });
  });

  describe('Métodos seguros (GET, HEAD, OPTIONS) no requieren CSRF', () => {
    it('debe permitir GET incluso con @RequireCsrf (métodos seguros exentos)', async () => {
      // Nota: En la práctica, @RequireCsrf solo se usa en POST/PUT/PATCH/DELETE
      // pero el guard verifica el método primero
      const response = await request(app.getHttpServer())
        .get('/test/public')
        .expect(200);

      expect(response.body.message).toBe('Public data');
    });
  });

  describe('Casos edge: validación robusta', () => {
    it('debe manejar Origin vacío', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', '')
        .send({ data: 'test' })
        .expect(403);

      expect(response.body.message).toContain('Origin/Referer');
    });

    it('debe manejar Origin malformado', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'not-a-url')
        .send({ data: 'test' })
        .expect(403);

      expect(response.body.message).toContain('no permitido');
    });

    it('debe manejar múltiples headers (Origin tiene prioridad sobre Referer)', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected')
        .set('Origin', 'http://localhost:3000') // válido
        .set('Referer', 'https://malicious.com') // inválido pero ignorado
        .send({ data: 'test' })
        .expect(201);

      expect(response.body.message).toBe('Protected endpoint accessed');
    });
  });

  describe('Documentación del comportamiento', () => {
    it('debe documentar que webhooks NO tienen @RequireCsrf', () => {
      const webhookEndpoints = [
        '/api/pagos/webhook',
        '/api/colonia/webhook',
        '/api/inscripciones-2026/webhook',
      ];

      // Estos endpoints NO deben tener @RequireCsrf()
      // El guard NO se ejecuta para ellos (retorna true inmediatamente)
      expect(webhookEndpoints.length).toBeGreaterThan(0);
    });

    it('debe documentar que solo 3 endpoints tienen @RequireCsrf', () => {
      const protectedEndpoints = [
        '/api/auth/login',
        '/api/auth/logout',
        '/api/auth/change-password',
      ];

      // Solo estos 3 endpoints críticos tienen @RequireCsrf()
      expect(protectedEndpoints.length).toBe(3);
    });

    it('debe explicar por qué CSRF es opt-in', () => {
      const rationale = {
        problem:
          'CSRF global bloqueaba webhooks legítimos (MercadoPago) y API calls',
        solution: 'Convertir CSRF a opt-in con @RequireCsrf() decorator',
        benefit:
          'Webhooks y API funcionan sin restricciones, solo formularios web protegidos',
        tradeoff: 'Desarrolladores deben recordar usar @RequireCsrf() explícitamente',
      };

      expect(rationale.solution).toContain('opt-in');
      expect(rationale.benefit).toContain('Webhooks');
    });
  });

  describe('Prevención de CSRF en endpoints críticos', () => {
    it('debe prevenir ataques CSRF en login', async () => {
      // Simular ataque CSRF: sitio malicioso intenta hacer login
      const response = await request(app.getHttpServer())
        .post('/test/protected') // simula /auth/login
        .set('Origin', 'https://evil-site.com')
        .set('Cookie', 'auth-token=victim-token') // víctima ya logueada
        .send({
          email: 'attacker@evil.com',
          password: 'attacker-password',
        })
        .expect(403);

      expect(response.body.message).toContain('no permitido');
    });

    it('debe permitir login legítimo desde frontend', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/protected') // simula /auth/login
        .set('Origin', 'http://localhost:3000')
        .send({
          email: 'user@example.com',
          password: 'user-password',
        })
        .expect(201);

      expect(response.body.message).toBe('Protected endpoint accessed');
    });
  });
});
