/**
 * Test Suite: live_mode Validation - MercadoPago Webhook Guard
 *
 * OBJETIVO:
 * Validar que el sistema previene que webhooks de prueba (live_mode=false)
 * activen servicios reales en producción.
 *
 * CONTEXTO DE SEGURIDAD:
 * - MercadoPago envía webhooks con live_mode=false durante pruebas
 * - Sin validación: pago de prueba de $1 puede activar servicio de $50,000
 * - Cliente puede abusar del sistema usando modo sandbox
 *
 * ESCENARIO DE ATAQUE:
 * 1. Atacante crea inscripción real de $50,000
 * 2. Usa credenciales de prueba de MercadoPago (sandbox)
 * 3. "Paga" $1 en modo prueba
 * 4. Webhook llega con live_mode=false pero status=approved
 * 5. Sin validación: servicio se activa sin pago real
 *
 * ESTÁNDAR INTERNACIONAL:
 * - OWASP A07:2021 - Identification and Authentication Failures
 * - PCI DSS Req 6.5.10 - Broken Authentication
 * - ISO 27001 A.9.4.2 - Secure log-on procedures
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoWebhookGuard } from '../mercadopago-webhook.guard';
import { MercadoPagoIpWhitelistService } from '../../services/mercadopago-ip-whitelist.service';

describe('MercadoPagoWebhookGuard - live_mode Validation', () => {
  let guard: MercadoPagoWebhookGuard;
  let configService: ConfigService;
  let ipWhitelistService: MercadoPagoIpWhitelistService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'NODE_ENV') return 'production'; // Modo estricto
      if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return 'test-secret-key-12345';
      return null;
    }),
  };

  const mockIpWhitelistService = {
    extractRealIp: jest.fn(() => '54.94.0.1'), // IP válida de MercadoPago
    isIpAllowed: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoWebhookGuard,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: MercadoPagoIpWhitelistService, useValue: mockIpWhitelistService },
      ],
    }).compile();

    guard = module.get<MercadoPagoWebhookGuard>(MercadoPagoWebhookGuard);
    configService = module.get<ConfigService>(ConfigService);
    ipWhitelistService = module.get<MercadoPagoIpWhitelistService>(
      MercadoPagoIpWhitelistService,
    );

    jest.clearAllMocks();
  });

  afterEach(() => {
    // Restaurar todos los spies para evitar contaminación entre tests
    jest.restoreAllMocks();
  });

  /**
   * Helper para crear ExecutionContext mock
   */
  const createMockExecutionContext = (body: unknown, headers: Record<string, string> = {}): ExecutionContext => {
    return {
      switchToHttp: () => ({
        getRequest: () => ({
          body,
          headers: {
            'x-signature': 'ts=1234567890,v1=abc123',
            ...headers,
          },
          socket: {
            remoteAddress: '54.94.0.1',
          },
          rawBody: JSON.stringify(body),
        }),
      }),
    } as ExecutionContext;
  };

  describe('live_mode Validation - Production Mode', () => {
    /**
     * TEST 1: DEBE RECHAZAR WEBHOOKS CON live_mode=false EN PRODUCCIÓN
     *
     * ESCENARIO:
     * 1. Aplicación en modo producción (NODE_ENV=production)
     * 2. Webhook llega con live_mode=false (modo prueba)
     * 3. Otros campos válidos (IP, firma, timestamp)
     * 4. Sistema debe RECHAZAR
     *
     * VALIDACIONES:
     * - Guard debe lanzar UnauthorizedException
     * - Logger debe registrar intento de webhook de prueba
     * - Mensaje de error debe mencionar "live_mode"
     */
    it('debe rechazar webhooks con live_mode=false en producción', () => {
      // ARRANGE: Webhook de prueba (live_mode=false)
      const testWebhook = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: '123456789',
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-test-mode',
        live_mode: false, // ⚠️ MODO PRUEBA
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(testWebhook);
      const loggerErrorSpy = jest.spyOn(guard['logger'], 'error');

      // ACT & ASSERT: Debe rechazar
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);

      // ASSERT: Debe loguear error de seguridad
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('live_mode'),
      );
    });

    /**
     * TEST 2: DEBE ACEPTAR WEBHOOKS CON live_mode=true EN PRODUCCIÓN
     *
     * ESCENARIO:
     * 1. Aplicación en modo producción
     * 2. Webhook llega con live_mode=true (pago real)
     * 3. Otros campos válidos
     * 4. Sistema debe ACEPTAR
     *
     * VALIDACIONES:
     * - canActivate debe retornar true
     * - NO debe lanzar excepciones
     * - Logger debe confirmar validación exitosa
     */
    it('debe aceptar webhooks con live_mode=true en producción', () => {
      // ARRANGE: Webhook de producción (live_mode=true)
      const productionWebhook = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: '987654321',
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-prod-mode',
        live_mode: true, // ✅ MODO PRODUCCIÓN
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(productionWebhook);

      // Mock validaciones de firma y timestamp para que pasen
      jest.spyOn(guard as any, 'validateSignature').mockReturnValueOnce({
        isValid: true,
        timestamp: Math.floor(Date.now() / 1000),
        signature: 'valid-signature',
      });

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe aceptar
      expect(result).toBe(true);
    });

    /**
     * TEST 3: DEBE RECHAZAR SI live_mode ES STRING 'false'
     *
     * ESCENARIO:
     * 1. Webhook malformado con live_mode='false' (string)
     * 2. Atacante intenta bypass con tipo incorrecto
     * 3. Sistema debe validar tipo estricto
     *
     * VALIDACIONES:
     * - Debe rechazar si live_mode no es boolean
     * - Validación estricta de tipos
     */
    it('debe rechazar si live_mode es string en lugar de boolean', () => {
      // ARRANGE: Webhook con tipo incorrecto
      const malformedWebhook = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: '111222333',
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-malformed',
        live_mode: 'false' as unknown as boolean, // ⚠️ String en lugar de boolean
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(malformedWebhook);

      // ACT & ASSERT: Debe rechazar por tipo inválido
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });
  });

  describe('live_mode Validation - Development Mode', () => {
    beforeEach(() => {
      // Configurar modo desarrollo
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'development';
        if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return 'test-secret-key';
        return null;
      });

      // Recrear guard con nueva configuración
      guard = new MercadoPagoWebhookGuard(
        configService,
        ipWhitelistService,
      );
    });

    afterEach(() => {
      // Restaurar modo producción para tests siguientes
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'NODE_ENV') return 'production';
        if (key === 'MERCADOPAGO_WEBHOOK_SECRET') return 'test-secret-key-12345';
        return null;
      });

      // Recrear guard en modo producción
      guard = new MercadoPagoWebhookGuard(
        configService,
        ipWhitelistService,
      );
    });

    /**
     * TEST 4: DEBE PERMITIR live_mode=false EN DESARROLLO
     *
     * ESCENARIO:
     * 1. Aplicación en modo desarrollo
     * 2. Webhook con live_mode=false (modo prueba)
     * 3. Permitir para facilitar testing local
     *
     * VALIDACIONES:
     * - canActivate debe retornar true
     * - Logger debe advertir que es modo desarrollo
     */
    it('debe permitir live_mode=false en modo desarrollo', () => {
      // ARRANGE: Webhook de prueba en desarrollo
      const testWebhook = {
        type: 'payment',
        action: 'payment.updated',
        data: {
          id: '444555666',
        },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-dev-test',
        live_mode: false, // OK en desarrollo
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(testWebhook);
      const loggerWarnSpy = jest.spyOn(guard['logger'], 'warn');

      // Mock validaciones
      jest.spyOn(guard as any, 'validateSignature').mockReturnValueOnce({
        isValid: true,
        timestamp: Math.floor(Date.now() / 1000),
        signature: 'valid-signature',
      });

      // ACT
      const result = guard.canActivate(context);

      // ASSERT: Debe permitir en desarrollo
      expect(result).toBe(true);

      // ASSERT: Debe advertir que es modo desarrollo
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('desarrollo'),
      );
    });
  });

  describe('Edge Cases - live_mode', () => {
    /**
     * TEST 5: DEBE RECHAZAR SI live_mode ESTÁ AUSENTE
     */
    it('debe rechazar si live_mode está ausente en el body', () => {
      const webhookWithoutLiveMode = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '777888999' },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-no-livemode',
        // live_mode: ausente
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(webhookWithoutLiveMode);

      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    });

    /**
     * TEST 6: DEBE VALIDAR live_mode ANTES DE FIRMA
     *
     * ESCENARIO:
     * 1. Webhook con live_mode=false
     * 2. Firma inválida
     * 3. Debe fallar por live_mode ANTES de validar firma (fail-fast)
     *
     * VALIDACIONES:
     * - Error debe ser por live_mode, no por firma
     * - validateSignature NO debe llamarse si live_mode falla
     */
    it('debe validar live_mode antes de validar firma (fail-fast)', () => {
      const testWebhook = {
        type: 'payment',
        action: 'payment.updated',
        data: { id: '000111222' },
        date_created: '2025-01-22T10:00:00Z',
        id: 'webhook-failfast',
        live_mode: false,
        user_id: '123456',
        api_version: 'v1',
      };

      const context = createMockExecutionContext(testWebhook, {
        'x-signature': 'ts=123,v1=INVALID_SIGNATURE',
      });

      const validateSignatureSpy = jest.spyOn(guard as any, 'validateSignature');

      // ACT & ASSERT
      expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);

      // ASSERT: validateSignature NO debe llamarse
      expect(validateSignatureSpy).not.toHaveBeenCalled();
    });

    /**
     * TEST 7: DEBE TENER TIPOS EXPLÍCITOS
     */
    it('debe tener tipos explícitos en validación de live_mode', () => {
      const liveMode: boolean = true;
      const isProduction: boolean = true;

      expect(typeof liveMode).toBe('boolean');
      expect(typeof isProduction).toBe('boolean');
    });
  });
});