import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MercadoPagoWebhookGuard } from '../mercadopago-webhook.guard';
import * as crypto from 'crypto';

/**
 * MercadoPagoWebhookGuard - SECURITY TESTS (Formato 2025)
 *
 * OBJETIVO: Validar que SOLO webhooks auténticos de MercadoPago sean aceptados
 *
 * Formato oficial 2025:
 * - Header x-signature: "ts=1234567890,v1=abcdef123456..."
 * - Payload: `${timestamp}.${JSON.stringify(body)}`
 *
 * Casos de test de seguridad:
 * 1. ✅ Webhook válido con firma correcta y timestamp válido → PERMITIR
 * 2. ❌ Webhook con firma inválida → RECHAZAR
 * 3. ❌ Webhook con timestamp expirado (replay attack) → RECHAZAR
 * 4. ❌ Webhook sin headers obligatorios → RECHAZAR
 * 5. ❌ Webhook sin campos obligatorios en body → RECHAZAR
 * 6. ❌ Webhook con formato de firma incorrecto → RECHAZAR
 * 7. ❌ Timing attack: firma casi correcta → RECHAZAR
 * 8. 🚨 Producción sin secret → RECHAZAR
 * 9. ⚠️  Desarrollo sin secret → PERMITIR (warn)
 */

describe('MercadoPagoWebhookGuard (Formato 2025)', () => {
  let guard: MercadoPagoWebhookGuard;
  const TEST_SECRET = 'test-secret-mercadopago-2025';

  /**
   * Helper para generar firma válida según formato 2025
   */
  function generateValidSignature(
    body: Record<string, string | number | boolean | Record<string, string>>,
    secret: string,
    timestamp?: number,
  ): { signature: string; timestamp: number } {
    const ts = timestamp || Math.floor(Date.now() / 1000);
    const payload = `${ts}.${JSON.stringify(body)}`;
    const v1 = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return {
      signature: `ts=${ts},v1=${v1}`,
      timestamp: ts,
    };
  }

  /**
   * Helper para crear body válido de webhook
   */
  function createValidWebhookBody(): Record<string, string | number | boolean | Record<string, string>> {
    return {
      action: 'payment.created',
      api_version: 'v1',
      data: {
        id: 'payment-12345',
      },
      date_created: '2025-01-01T00:00:00Z',
      id: 'webhook-id-123',
      live_mode: true,
      type: 'payment',
      user_id: '166135502',
    };
  }

  describe('✅ Casos válidos', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return TEST_SECRET;
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should allow webhook with valid signature (formato 2025)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': signature,
        },
        body,
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should allow webhook for payment.created event', () => {
      // Arrange
      const body = {
        ...createValidWebhookBody(),
        action: 'payment.created',
        type: 'payment',
      };
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow webhook for payment.updated event', () => {
      // Arrange
      const body = {
        ...createValidWebhookBody(),
        action: 'payment.updated',
        type: 'payment',
      };
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(guard.canActivate(mockContext)).toBe(true);
    });

    it('should allow webhook with numeric user_id', () => {
      // Arrange
      const body = {
        ...createValidWebhookBody(),
        user_id: 166135502, // Numérico
      };
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('❌ Ataques de firma inválida', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return TEST_SECRET;
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject webhook with completely invalid signature', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'ts=1234567890,v1=invalid-signature-fake',
        },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Invalid webhook signature');
    });

    it('should reject webhook with wrong secret', () => {
      // Arrange
      const body = createValidWebhookBody();
      const { signature } = generateValidSignature(body, 'wrong-secret');

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject webhook with modified body (firma no coincide)', () => {
      // Arrange
      const originalBody = createValidWebhookBody();
      const { signature } = generateValidSignature(originalBody, TEST_SECRET);

      // Modificar body después de firmar (ataque)
      const modifiedBody = { ...originalBody, data: { id: 'hacked-payment-id' } };

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body: modifiedBody,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject timing attack: signature with one character changed', () => {
      // Arrange
      const body = createValidWebhookBody();
      const { signature } = generateValidSignature(body, TEST_SECRET);

      // Modificar último caracter de la firma (timing attack)
      const tamperedSignature = signature.substring(0, signature.length - 1) + 'X';

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': tamperedSignature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject signature with wrong format (missing ts)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'v1=abcdef123456', // Falta ts=
        },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject signature with wrong format (missing v1)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'ts=1234567890', // Falta v1=
        },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject signature with invalid timestamp (non-numeric)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'ts=invalid,v1=abcdef123456',
        },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject signature with empty v1', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'ts=1234567890,v1=',
        },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });
  });

  describe('❌ Ataques de replay (timestamp expirado)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return TEST_SECRET;
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject webhook with expired timestamp (6 minutes old)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const oldTimestamp = Math.floor(Date.now() / 1000) - 360; // 6 minutos atrás
      const { signature } = generateValidSignature(body, TEST_SECRET, oldTimestamp);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Timestamp expired');
    });

    it('should reject webhook with future timestamp (6 minutes ahead)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const futureTimestamp = Math.floor(Date.now() / 1000) + 360; // 6 minutos adelante
      const { signature } = generateValidSignature(body, TEST_SECRET, futureTimestamp);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should accept webhook with timestamp within 5 minutes', () => {
      // Arrange
      const body = createValidWebhookBody();
      const recentTimestamp = Math.floor(Date.now() / 1000) - 240; // 4 minutos atrás
      const { signature } = generateValidSignature(body, TEST_SECRET, recentTimestamp);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(guard.canActivate(mockContext)).toBe(true);
    });
  });

  describe('❌ Headers faltantes', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return TEST_SECRET;
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject webhook without x-signature header', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {},
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject webhook with empty x-signature header', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': '' },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });
  });

  describe('❌ Body inválido', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return TEST_SECRET;
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject webhook with missing action field', () => {
      // Arrange
      const body = { ...createValidWebhookBody() };
      delete (body as Record<string, string>).action;
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('missing fields');
    });

    it('should reject webhook with missing type field', () => {
      // Arrange
      const body = { ...createValidWebhookBody() };
      delete (body as Record<string, string>).type;
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
    });

    it('should reject webhook with missing data.id', () => {
      // Arrange
      const body = { ...createValidWebhookBody(), data: {} };
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('data.id must be a string');
    });

    it('should reject webhook with empty type', () => {
      // Arrange
      const body = { ...createValidWebhookBody(), type: '' };
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('non-empty string');
    });

    it('should reject webhook with non-boolean live_mode', () => {
      // Arrange
      const body = { ...createValidWebhookBody(), live_mode: 'true' }; // String en vez de boolean
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('live_mode must be a boolean');
    });

    it('should reject webhook with invalid user_id type', () => {
      // Arrange
      const body = { ...createValidWebhookBody(), user_id: true }; // Boolean
      const { signature } = generateValidSignature(body, TEST_SECRET);

      const mockContext = createMockExecutionContext({
        headers: { 'x-signature': signature },
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('user_id must be a string or number');
    });
  });

  describe('🚨 Producción sin secret', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return null; // Sin secret
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject all webhooks in production without secret', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {},
        body,
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
      expect(() => guard.canActivate(mockContext)).toThrow('Webhook secret not configured');
    });
  });

  describe('⚠️ Desarrollo sin secret (permisivo)', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return null; // Sin secret
                if (key === 'NODE_ENV') return 'development';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should allow all webhooks in development without secret (warning)', () => {
      // Arrange
      const body = createValidWebhookBody();
      const mockContext = createMockExecutionContext({
        headers: {},
        body,
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });
});

/**
 * Helper para crear ExecutionContext mock
 */
function createMockExecutionContext(request: {
  headers: Record<string, string>;
  body: Record<string, string | number | boolean | Record<string, string>>;
}): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: jest.fn(),
      getNext: jest.fn(),
    }),
    getClass: jest.fn(),
    getHandler: jest.fn(),
    getArgs: jest.fn(),
    getArgByIndex: jest.fn(),
    switchToRpc: jest.fn(),
    switchToWs: jest.fn(),
    getType: jest.fn(),
  } as ExecutionContext;
}