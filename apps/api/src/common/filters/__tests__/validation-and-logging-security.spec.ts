import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { AllExceptionsFilter } from '../all-exceptions.filter';
import { LoggerService } from '../../logger/logger.service';
import request from 'supertest';
import { Controller, Post, Body, Get } from '@nestjs/common';
import { IsString, IsEmail, MinLength } from 'class-validator';

/**
 * ✅ SECURITY TEST: Validación y Logging Seguro
 *
 * Este test verifica que:
 * 1. Los errores de validación devuelven status 400 (no 500)
 * 2. Los logs NO incluyen credenciales ni datos sensibles
 * 3. Los mensajes de error son útiles sin exponer información sensible
 */

// DTO de prueba con campos sensibles
class TestLoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  token?: string;
}

// Controller de prueba
@Controller('test')
class TestController {
  @Post('login')
  async login(@Body() dto: TestLoginDto) {
    return { success: true };
  }

  @Get('error')
  async throwError() {
    throw new Error('Test error');
  }
}

describe.skip('Security: ValidationPipe y Logging', () => {
  let app: INestApplication;
  let loggerService: LoggerService;
  let loggedData: any[] = [];

  beforeEach(async () => {
    // Resetear logs capturados
    loggedData = [];

    // Mock del LoggerService para capturar logs
    const mockLogger = {
      setContext: jest.fn(),
      log: jest.fn((message, metadata) => {
        loggedData.push({ level: 'log', message, metadata });
      }),
      error: jest.fn((message, trace, metadata) => {
        loggedData.push({ level: 'error', message, trace, metadata });
      }),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [TestController],
      providers: [
        {
          provide: LoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    loggerService = app.get<LoggerService>(LoggerService);

    // Configurar ValidationPipe idéntico al de main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        disableErrorMessages: false,
        validateCustomDecorators: true,
        // ✅ SECURITY FIX: Lanzar BadRequestException para devolver 400
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => {
            const constraints = Object.values(error.constraints || {});
            return `${error.property}: ${constraints.join(', ')}`;
          });

          return new BadRequestException(messages);
        },
      }),
    );

    // Aplicar AllExceptionsFilter
    app.useGlobalFilters(new AllExceptionsFilter(loggerService));

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('ValidationPipe devuelve 400 (no 500)', () => {
    it('debe devolver 400 Bad Request para payloads inválidos', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'not-an-email', // Email inválido
          password: '123', // Password muy corto
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toContain('Validation failed');
    });

    it('debe devolver 400 para campos faltantes', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          // Email y password faltantes
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
      expect(response.body.message).toBe('Validation failed');
    });

    it('debe devolver 400 para propiedades extra (forbidNonWhitelisted)', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'test@example.com',
          password: 'ValidPassword123',
          maliciousField: 'hack attempt', // Campo no permitido
        })
        .expect(400);

      expect(response.body.statusCode).toBe(400);
    });
  });

  describe('Logs NO incluyen credenciales', () => {
    it('debe redactar passwords en logs de errores', async () => {
      // Enviar sin email para forzar error de validación
      await request(app.getHttpServer())
        .post('/test/login')
        .send({
          password: 'SuperSecretPassword123!', // Esta contraseña NO debe aparecer en logs
        })
        .expect(400);

      // Verificar que ningún log contiene la contraseña
      const allLogs = JSON.stringify(loggedData);
      expect(allLogs).not.toContain('SuperSecretPassword123!');
      expect(allLogs).toContain('[REDACTED]');
    });

    it('debe redactar tokens en logs de errores', async () => {
      // Enviar request malformado para activar el filtro de excepciones
      await request(app.getHttpServer())
        .post('/test/login')
        .send({
          invalidField: 'test', // Campo inválido para forzar forbidNonWhitelisted
          token: 'secret-jwt-token-abc123', // Este token NO debe aparecer en logs
        })
        .expect(400);

      const allLogs = JSON.stringify(loggedData);
      expect(allLogs).not.toContain('secret-jwt-token-abc123');
    });

    it('debe redactar múltiples campos sensibles', async () => {
      // Simular un request con múltiples campos sensibles
      await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'test@example.com',
          password: 'MyPassword123', // Sensible
          token: 'bearer-token-xyz', // Sensible
          apiKey: 'sk-1234567890', // Sensible
        })
        .expect(400);

      const allLogs = JSON.stringify(loggedData);

      // Ninguno de los valores sensibles debe aparecer
      expect(allLogs).not.toContain('MyPassword123');
      expect(allLogs).not.toContain('bearer-token-xyz');
      expect(allLogs).not.toContain('sk-1234567890');

      // Deben estar redactados
      expect(allLogs).toContain('[REDACTED]');
    });
  });

  describe('Mensajes de error útiles sin información sensible', () => {
    it('debe incluir nombres de campos con errores', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'invalid',
          password: 'short',
        })
        .expect(400);

      const responseBody = JSON.stringify(response.body);

      // Debe mencionar los campos con error
      // BadRequestException devuelve { message: [...array de errores...] }
      expect(responseBody).toContain('email');
      expect(responseBody).toContain('password');
    });

    it('debe incluir mensajes de validación descriptivos', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'not-an-email',
          password: '123',
        })
        .expect(400);

      // BadRequestException retorna message como array de strings
      expect(Array.isArray(response.body.message)).toBe(true);
      const errorMessages = response.body.message.join(' ').toLowerCase();

      // Debe incluir descripción útil
      expect(errorMessages).toMatch(/email/);
      expect(errorMessages).toMatch(/password/);
    });

    it('NO debe incluir valores sensibles en mensajes de error', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'test@example.com',
          password: 'SecretPass123!',
        })
        .expect(400);

      const responseBody = JSON.stringify(response.body);

      // La contraseña NO debe estar en la respuesta
      expect(responseBody).not.toContain('SecretPass123!');
    });
  });

  describe('AllExceptionsFilter redacta logs', () => {
    it('debe redactar body, query y params en logs de excepciones', async () => {
      // Forzar un error 500 para verificar el filtro
      await request(app.getHttpServer()).get('/test/error').expect(500);

      // Verificar que el error fue loggeado
      const errorLogs = loggedData.filter((log) => log.level === 'error');
      expect(errorLogs.length).toBeGreaterThan(0);

      // El log debe contener metadata
      const metadata = errorLogs[0].metadata;
      expect(metadata).toBeDefined();
      expect(metadata.errorId).toBeDefined();
    });
  });

  describe('Request válido funciona correctamente', () => {
    it('debe aceptar payloads válidos y devolver 201', async () => {
      const response = await request(app.getHttpServer())
        .post('/test/login')
        .send({
          email: 'valid@example.com',
          password: 'ValidPassword12345', // Mínimo 8 caracteres
        })
        .expect(201);

      expect(response.body).toEqual({ success: true });
    });
  });
});
