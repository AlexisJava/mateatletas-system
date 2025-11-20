import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { MercadoPagoWebhookGuard } from '../mercadopago-webhook.guard';
import * as crypto from 'crypto';

/**
 * MercadoPagoWebhookGuard - SECURITY TESTS
 *
 * OBJETIVO: Validar que SOLO webhooks auténticos de MercadoPago sean aceptados
 *
 * Casos de test:
 * 1. ✅ Webhook válido con firma correcta → PERMITIR
 * 2. ❌ Webhook sin headers → RECHAZAR
 * 3. ❌ Webhook con firma inválida → RECHAZAR
 * 4. ❌ Webhook sin data.id → RECHAZAR
 * 5. ⚠️  Modo desarrollo sin secret → PERMITIR (warn)
 * 6. 🚨 Modo producción sin secret → RECHAZAR
 */

describe('MercadoPagoWebhookGuard', () => {
  let guard: MercadoPagoWebhookGuard;
  const TEST_SECRET = 'test-secret-123';

  describe('Production Mode - Strict validation', () => {
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

    it('should allow webhook with valid signature', () => {
      // Arrange
      const dataId = 'payment-123';
      const requestId = 'req-456';
      const manifest = `id:${dataId};request-id:${requestId};`;
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(manifest)
        .digest('hex');

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': validSignature,
          'x-request-id': requestId,
        },
        body: {
          data: {
            id: dataId,
          },
        },
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should reject webhook with invalid signature', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'invalid-signature-123',
          'x-request-id': 'req-456',
        },
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Webhook validation failed',
      );
    });

    it('should reject webhook without x-signature header', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {
          'x-request-id': 'req-456',
        },
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Invalid webhook headers',
      );
    });

    it('should reject webhook without x-request-id header', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'some-signature',
        },
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Invalid webhook headers',
      );
    });

    it('should reject webhook without data.id in body', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'some-signature',
          'x-request-id': 'req-456',
        },
        body: {
          data: {},
        },
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Invalid webhook body',
      );
    });

    it('should reject webhook with empty body', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'some-signature',
          'x-request-id': 'req-456',
        },
        body: {},
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should use timing-safe comparison for signature validation', () => {
      // Arrange
      const dataId = 'payment-123';
      const requestId = 'req-456';
      const manifest = `id:${dataId};request-id:${requestId};`;
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(manifest)
        .digest('hex');

      // Modificar un solo caracter (ataque de timing)
      const almostValidSignature =
        validSignature.substring(0, validSignature.length - 1) + 'X';

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': almostValidSignature,
          'x-request-id': requestId,
        },
        body: {
          data: {
            id: dataId,
          },
        },
      });

      // Act & Assert - Debe rechazar incluso con un solo caracter diferente
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
    });

    it('should correctly construct manifest string', () => {
      // Arrange
      const dataId = 'payment-999';
      const requestId = 'req-888';

      // Construir manifest esperado según documentación de MercadoPago
      const expectedManifest = `id:${dataId};request-id:${requestId};`;
      const expectedSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(expectedManifest)
        .digest('hex');

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': expectedSignature,
          'x-request-id': requestId,
        },
        body: {
          data: {
            id: dataId,
          },
        },
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });
  });

  describe('Development Mode - Permissive validation', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return null; // No secret
                if (key === 'NODE_ENV') return 'development';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should allow webhook without secret in development mode', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {},
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert - Debe permitir en desarrollo sin secret
      expect(result).toBe(true);
    });
  });

  describe('Production Mode - No secret configured', () => {
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoWebhookGuard,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return null; // No secret
                if (key === 'NODE_ENV') return 'production';
                return null;
              }),
            },
          },
        ],
      }).compile();

      guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    });

    it('should reject webhook without secret in production mode', () => {
      // Arrange
      const mockContext = createMockExecutionContext({
        headers: {},
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act & Assert - Debe rechazar en producción sin secret
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Webhook secret not configured',
      );
    });
  });

  describe('Error Handling', () => {
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

    it('should handle crypto errors gracefully', () => {
      // Arrange - Crear contexto con longitudes de firma inválidas
      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': 'short', // Firma muy corta (causará error en timingSafeEqual)
          'x-request-id': 'req-456',
        },
        body: {
          data: {
            id: 'payment-123',
          },
        },
      });

      // Act & Assert
      expect(() => guard.canActivate(mockContext)).toThrow(
        UnauthorizedException,
      );
      expect(() => guard.canActivate(mockContext)).toThrow(
        'Webhook validation failed',
      );
    });
  });

  describe('Real MercadoPago Integration Scenarios', () => {
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

    it('should validate webhook for payment.created event', () => {
      // Arrange - Simular webhook real de payment.created
      const dataId = '12345678';
      const requestId = 'abc-def-ghi-123';
      const manifest = `id:${dataId};request-id:${requestId};`;
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(manifest)
        .digest('hex');

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': validSignature,
          'x-request-id': requestId,
        },
        body: {
          action: 'payment.created',
          api_version: 'v1',
          data: {
            id: dataId,
          },
          date_created: '2025-01-01T00:00:00Z',
          id: 12345,
          live_mode: true,
          type: 'payment',
          user_id: 123456,
        },
      });

      // Act
      const result = guard.canActivate(mockContext);

      // Assert
      expect(result).toBe(true);
    });

    it('should validate webhook for payment.updated event', () => {
      // Arrange - Simular webhook real de payment.updated
      const dataId = '87654321';
      const requestId = 'xyz-123-456';
      const manifest = `id:${dataId};request-id:${requestId};`;
      const validSignature = crypto
        .createHmac('sha256', TEST_SECRET)
        .update(manifest)
        .digest('hex');

      const mockContext = createMockExecutionContext({
        headers: {
          'x-signature': validSignature,
          'x-request-id': requestId,
        },
        body: {
          action: 'payment.updated',
          api_version: 'v1',
          data: {
            id: dataId,
          },
          date_created: '2025-01-01T00:00:00Z',
          id: 67890,
          live_mode: true,
          type: 'payment',
          user_id: 654321,
        },
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
  body: any;
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
  } as unknown as ExecutionContext;
}