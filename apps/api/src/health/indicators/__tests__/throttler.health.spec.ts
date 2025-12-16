/**
 * ThrottlerHealthIndicator Tests
 *
 * TDD: Tests para el health indicator del Throttler (Rate Limiting)
 * Nota: Usa RedisService directo (Opción B) - no necesita acceso a ThrottlerRedisStorage
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ThrottlerHealthIndicator } from '../throttler.health';
import { RedisService } from '../../../core/redis/redis.service';

describe('ThrottlerHealthIndicator', () => {
  let indicator: ThrottlerHealthIndicator;
  let redisService: jest.Mocked<RedisService>;

  const createRedisMock = (isAvailable: boolean): jest.Mocked<RedisService> => {
    return {
      isRedisAvailable: jest.fn().mockReturnValue(isAvailable),
      getClient: jest.fn(),
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
    } as unknown as jest.Mocked<RedisService>;
  };

  beforeEach(async () => {
    redisService = createRedisMock(true);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerHealthIndicator,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    indicator = module.get<ThrottlerHealthIndicator>(ThrottlerHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should_return_healthy_when_redis_available', async () => {
      // Arrange - Redis available (default mock)

      // Act
      const result = await indicator.isHealthy('throttler');

      // Assert
      expect(result).toHaveProperty('throttler');
      expect(result.throttler.status).toBe('up');
      expect(result.throttler.throttlerStatus).toBe('healthy');
      expect(result.throttler.redisAvailable).toBe(true);
    });

    it('should_return_degraded_when_redis_unavailable', async () => {
      // Arrange
      redisService = createRedisMock(false);
      const module = await Test.createTestingModule({
        providers: [
          ThrottlerHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<ThrottlerHealthIndicator>(
        ThrottlerHealthIndicator,
      );

      // Act
      const result = await indicator.isHealthy('throttler');

      // Assert
      // Note: Still returns "up" because throttler has memory fallback
      expect(result.throttler.status).toBe('up');
      expect(result.throttler.throttlerStatus).toBe('degraded');
      expect(result.throttler.redisAvailable).toBe(false);
      expect(result.throttler.message).toContain('memory fallback');
    });

    it('should_include_redis_status_in_response', async () => {
      // Act
      const result = await indicator.isHealthy('throttler');

      // Assert
      expect(result.throttler.redisAvailable).toBeDefined();
      expect(typeof result.throttler.redisAvailable).toBe('boolean');
    });

    it('should_never_throw_because_throttler_has_fallback', async () => {
      // Arrange - Redis unavailable
      redisService = createRedisMock(false);
      const module = await Test.createTestingModule({
        providers: [
          ThrottlerHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<ThrottlerHealthIndicator>(
        ThrottlerHealthIndicator,
      );

      // Act & Assert - Should NOT throw, because memory fallback exists
      await expect(indicator.isHealthy('throttler')).resolves.toBeDefined();
    });
  });
});
