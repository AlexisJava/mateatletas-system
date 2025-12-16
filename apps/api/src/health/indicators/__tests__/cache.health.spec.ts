/**
 * CacheHealthIndicator Tests
 *
 * TDD: Tests para el health indicator del CacheService
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { CacheHealthIndicator } from '../cache.health';
import { CacheService } from '../../../cache/cache.service';
import { CacheHealthStatus } from '../../../cache/interfaces';

describe('CacheHealthIndicator', () => {
  let indicator: CacheHealthIndicator;
  let cacheService: jest.Mocked<CacheService>;

  const createCacheMock = (
    healthStatus: CacheHealthStatus,
  ): jest.Mocked<CacheService> => {
    return {
      getHealthStatus: jest.fn().mockResolvedValue(healthStatus),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      getMetrics: jest.fn(),
    } as unknown as jest.Mocked<CacheService>;
  };

  const healthyStatus: CacheHealthStatus = {
    status: 'healthy',
    l1: { available: true, itemCount: 50 },
    l2: { available: true, latencyMs: 5 },
    metrics: { hitRate: 0.85, totalOperations: 1000 },
  };

  const degradedStatus: CacheHealthStatus = {
    status: 'degraded',
    l1: { available: true, itemCount: 50 },
    l2: { available: false, latencyMs: null },
    metrics: { hitRate: 0.45, totalOperations: 500 },
  };

  const unhealthyStatus: CacheHealthStatus = {
    status: 'unhealthy',
    l1: { available: true, itemCount: 0 },
    l2: { available: false, latencyMs: null },
    metrics: { hitRate: 0.1, totalOperations: 100 },
  };

  beforeEach(async () => {
    cacheService = createCacheMock(healthyStatus);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheHealthIndicator,
        {
          provide: CacheService,
          useValue: cacheService,
        },
      ],
    }).compile();

    indicator = module.get<CacheHealthIndicator>(CacheHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should_return_healthy_when_cache_healthy', async () => {
      // Arrange - already set up with healthyStatus

      // Act
      const result = await indicator.isHealthy('cache');

      // Assert
      expect(result).toHaveProperty('cache');
      expect(result.cache.status).toBe('up');
      expect(result.cache.l1Available).toBe(true);
      expect(result.cache.l2Available).toBe(true);
      expect(result.cache.hitRate).toBe('85.0%');
    });

    it('should_return_degraded_when_l2_unavailable', async () => {
      // Arrange
      cacheService = createCacheMock(degradedStatus);
      const module = await Test.createTestingModule({
        providers: [
          CacheHealthIndicator,
          { provide: CacheService, useValue: cacheService },
        ],
      }).compile();
      indicator = module.get<CacheHealthIndicator>(CacheHealthIndicator);

      // Act
      const result = await indicator.isHealthy('cache');

      // Assert
      expect(result.cache.status).toBe('up'); // Still up, just degraded
      expect(result.cache.l2Available).toBe(false);
      expect(result.cache.cacheStatus).toBe('degraded');
    });

    it('should_include_metrics_in_response', async () => {
      // Arrange - already set up with healthyStatus

      // Act
      const result = await indicator.isHealthy('cache');

      // Assert
      expect(result.cache.l1ItemCount).toBe(50);
      expect(result.cache.hitRate).toBeDefined();
      expect(result.cache.totalOperations).toBe(1000);
    });

    it('should_throw_HealthCheckError_when_cache_service_fails', async () => {
      // Arrange
      cacheService.getHealthStatus.mockRejectedValue(
        new Error('Cache service error'),
      );

      // Act & Assert
      await expect(indicator.isHealthy('cache')).rejects.toThrow(
        HealthCheckError,
      );
    });
  });
});
