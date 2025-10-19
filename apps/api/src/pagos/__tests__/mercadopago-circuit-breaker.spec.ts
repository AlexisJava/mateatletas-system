import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoService } from '../mercadopago.service';

/**
 * MercadoPagoService - CIRCUIT BREAKER TESTS
 *
 * TESTS DE CIRCUIT BREAKER:
 * - createPreference(): Verificar protección con circuit breaker
 * - getPayment(): Verificar protección con circuit breaker
 * - Circuit breaker states: CLOSED, OPEN, HALF_OPEN
 * - Fallback behavior cuando circuito está abierto
 * - Métricas del circuit breaker
 *
 * OBJETIVO:
 * - ANTES: API falla repetidamente, app se cuelga
 * - AHORA: Circuit breaker abre después de 3 fallos, rechaza requests por 60s
 */

describe('MercadoPagoService - Circuit Breaker Protection', () => {
  let service: MercadoPagoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MercadoPagoService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MERCADOPAGO_ACCESS_TOKEN') {
                return 'TEST_ACCESS_TOKEN_12345'; // Token válido (no mock mode)
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MercadoPagoService>(MercadoPagoService);
  });

  describe('Circuit Breaker - Create Preference', () => {
    it('should successfully create preference when circuit is CLOSED', async () => {
      // Arrange
      const mockPreference = {
        id: 'pref-123',
        init_point: 'https://mercadopago.com/checkout/pref-123',
      };

      // Mock successful API call
      const mockCreate = jest.fn().mockResolvedValue(mockPreference);
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = {
        items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }],
      };

      // Act
      const result = await service.createPreference(preferenceData);

      // Assert
      expect(result).toEqual(mockPreference);
      expect(mockCreate).toHaveBeenCalledWith({ body: preferenceData });

      // Verify circuit is CLOSED
      const metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.state).toBe('CLOSED');
      expect(metrics.createPreference.failureCount).toBe(0);
    });

    it('should open circuit after 3 consecutive failures', async () => {
      // Arrange
      const mockCreate = jest.fn().mockRejectedValue(new Error('MercadoPago API timeout'));
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Act & Assert - Failure 1
      await expect(service.createPreference(preferenceData)).rejects.toThrow('MercadoPago API timeout');
      let metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.state).toBe('CLOSED'); // Still closed
      expect(metrics.createPreference.failureCount).toBe(1);

      // Act & Assert - Failure 2
      await expect(service.createPreference(preferenceData)).rejects.toThrow('MercadoPago API timeout');
      metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.state).toBe('CLOSED'); // Still closed
      expect(metrics.createPreference.failureCount).toBe(2);

      // Act & Assert - Failure 3 (OPENS circuit)
      await expect(service.createPreference(preferenceData)).rejects.toThrow('MercadoPago API timeout');
      metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.state).toBe('OPEN'); // Now OPEN
      expect(metrics.createPreference.failureCount).toBe(3);
    });

    it('should reject requests immediately when circuit is OPEN', async () => {
      // Arrange - Fail 3 times to open circuit
      const mockCreate = jest.fn().mockRejectedValue(new Error('MercadoPago API timeout'));
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Open circuit (3 failures)
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();

      // Reset mock call count
      mockCreate.mockClear();

      // Act - Try again (circuit is OPEN, should use fallback without calling API)
      await expect(service.createPreference(preferenceData)).rejects.toThrow(
        'MercadoPago API is temporarily unavailable (circuit breaker OPEN). Please try again later.'
      );

      // Assert - API should NOT have been called (circuit breaker blocked it)
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it('should return fallback error message when circuit is OPEN', async () => {
      // Arrange - Open circuit
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Open circuit
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();

      // Act & Assert - Fallback message
      await expect(service.createPreference(preferenceData)).rejects.toThrow(
        'MercadoPago API is temporarily unavailable (circuit breaker OPEN). Please try again later.'
      );
    });

    it('should reset failure count on successful request', async () => {
      // Arrange
      const mockCreate = jest.fn()
        .mockRejectedValueOnce(new Error('API Error')) // Failure 1
        .mockRejectedValueOnce(new Error('API Error')) // Failure 2
        .mockResolvedValueOnce({ id: 'pref-123' }); // Success

      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Act - 2 failures
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();

      let metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.failureCount).toBe(2);

      // Act - Success (resets failure count)
      await service.createPreference(preferenceData);

      // Assert - Failure count reset to 0
      metrics = service.getCircuitBreakerMetrics();
      expect(metrics.createPreference.failureCount).toBe(0);
      expect(metrics.createPreference.state).toBe('CLOSED');
    });
  });

  describe('Circuit Breaker - Get Payment', () => {
    it('should successfully get payment when circuit is CLOSED', async () => {
      // Arrange
      const mockPayment = {
        id: 'pay-123',
        status: 'approved',
        external_reference: 'membresia-1-tutor-2',
      };

      const mockGet = jest.fn().mockResolvedValue(mockPayment);
      (service as any).paymentClient = {
        get: mockGet,
      };

      // Act
      const result = await service.getPayment('pay-123');

      // Assert
      expect(result).toEqual(mockPayment);
      expect(mockGet).toHaveBeenCalledWith({ id: 'pay-123' });

      // Verify circuit is CLOSED
      const metrics = service.getCircuitBreakerMetrics();
      expect(metrics.getPayment.state).toBe('CLOSED');
      expect(metrics.getPayment.failureCount).toBe(0);
    });

    it('should open circuit after 3 consecutive failures', async () => {
      // Arrange
      const mockGet = jest.fn().mockRejectedValue(new Error('MercadoPago API timeout'));
      (service as any).paymentClient = {
        get: mockGet,
      };

      // Act & Assert - 3 failures to open circuit
      await expect(service.getPayment('pay-123')).rejects.toThrow('MercadoPago API timeout');
      await expect(service.getPayment('pay-123')).rejects.toThrow('MercadoPago API timeout');
      await expect(service.getPayment('pay-123')).rejects.toThrow('MercadoPago API timeout');

      // Assert - Circuit is OPEN
      const metrics = service.getCircuitBreakerMetrics();
      expect(metrics.getPayment.state).toBe('OPEN');
      expect(metrics.getPayment.failureCount).toBe(3);
    });

    it('should reject requests immediately when circuit is OPEN', async () => {
      // Arrange - Open circuit
      const mockGet = jest.fn().mockRejectedValue(new Error('API Error'));
      (service as any).paymentClient = {
        get: mockGet,
      };

      // Open circuit
      await expect(service.getPayment('pay-123')).rejects.toThrow();
      await expect(service.getPayment('pay-123')).rejects.toThrow();
      await expect(service.getPayment('pay-123')).rejects.toThrow();

      mockGet.mockClear();

      // Act - Try again (circuit is OPEN, should use fallback)
      await expect(service.getPayment('pay-123')).rejects.toThrow(
        'MercadoPago Payment API is temporarily unavailable (circuit breaker OPEN). Please try again later.'
      );

      // Assert - API should NOT have been called
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('Circuit Breaker Metrics', () => {
    it('should return metrics for both circuit breakers', () => {
      // Act
      const metrics = service.getCircuitBreakerMetrics();

      // Assert
      expect(metrics).toHaveProperty('createPreference');
      expect(metrics).toHaveProperty('getPayment');

      expect(metrics.createPreference).toHaveProperty('state');
      expect(metrics.createPreference).toHaveProperty('failureCount');
      expect(metrics.createPreference).toHaveProperty('failureThreshold');
      expect(metrics.createPreference).toHaveProperty('nextAttempt');

      expect(metrics.getPayment).toHaveProperty('state');
      expect(metrics.getPayment).toHaveProperty('failureCount');
      expect(metrics.getPayment).toHaveProperty('failureThreshold');
      expect(metrics.getPayment).toHaveProperty('nextAttempt');
    });

    it('should show correct initial state', () => {
      // Act
      const metrics = service.getCircuitBreakerMetrics();

      // Assert
      expect(metrics.createPreference.state).toBe('CLOSED');
      expect(metrics.createPreference.failureCount).toBe(0);
      expect(metrics.createPreference.failureThreshold).toBe(3);
      expect(metrics.createPreference.nextAttempt).toBeNull();

      expect(metrics.getPayment.state).toBe('CLOSED');
      expect(metrics.getPayment.failureCount).toBe(0);
      expect(metrics.getPayment.failureThreshold).toBe(3);
      expect(metrics.getPayment.nextAttempt).toBeNull();
    });

    it('should show nextAttempt when circuit is OPEN', async () => {
      // Arrange - Open circuit
      const mockCreate = jest.fn().mockRejectedValue(new Error('API Error'));
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Open circuit
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();

      // Act
      const metrics = service.getCircuitBreakerMetrics();

      // Assert
      expect(metrics.createPreference.state).toBe('OPEN');
      expect(metrics.createPreference.nextAttempt).not.toBeNull();
      expect(typeof metrics.createPreference.nextAttempt).toBe('string'); // ISO date string
    });
  });

  describe('Independent Circuit Breakers', () => {
    it('should have independent circuit breakers for createPreference and getPayment', async () => {
      // Arrange - Fail createPreference 3 times
      const mockCreate = jest.fn().mockRejectedValue(new Error('Preference API Error'));
      (service as any).preferenceClient = {
        create: mockCreate,
      };

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };

      // Fail createPreference to open its circuit
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();
      await expect(service.createPreference(preferenceData)).rejects.toThrow();

      // Arrange - getPayment should still work
      const mockGet = jest.fn().mockResolvedValue({ id: 'pay-123', status: 'approved' });
      (service as any).paymentClient = {
        get: mockGet,
      };

      // Act
      const paymentResult = await service.getPayment('pay-123');

      // Assert
      const metrics = service.getCircuitBreakerMetrics();

      // createPreference circuit is OPEN
      expect(metrics.createPreference.state).toBe('OPEN');

      // getPayment circuit is still CLOSED (independent)
      expect(metrics.getPayment.state).toBe('CLOSED');
      expect(paymentResult.id).toBe('pay-123');
    });
  });

  describe('Mock Mode', () => {
    it('should not use circuit breaker in mock mode', async () => {
      // Arrange - Create service in mock mode
      const mockModule: TestingModule = await Test.createTestingModule({
        providers: [
          MercadoPagoService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn((key: string) => {
                if (key === 'MERCADOPAGO_ACCESS_TOKEN') {
                  return 'TEST_XXXXXXXX'; // Mock mode token
                }
                return null;
              }),
            },
          },
        ],
      }).compile();

      const mockService = mockModule.get<MercadoPagoService>(MercadoPagoService);

      // Act & Assert
      expect(mockService.isMockMode()).toBe(true);

      const preferenceData = { items: [{ id: '1', title: 'Test', quantity: 1, unit_price: 100, currency_id: 'ARS' }] };
      await expect(mockService.createPreference(preferenceData)).rejects.toThrow(
        'MercadoPago está en modo mock'
      );
    });
  });
});
