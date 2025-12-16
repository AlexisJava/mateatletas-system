/**
 * RedisHealthIndicator Tests
 *
 * TDD: Tests para el health indicator de Redis
 */

import { Test, TestingModule } from '@nestjs/testing';
import { HealthCheckError } from '@nestjs/terminus';
import { RedisHealthIndicator } from '../redis.health';
import { RedisService } from '../../../core/redis/redis.service';

describe('RedisHealthIndicator', () => {
  let indicator: RedisHealthIndicator;
  let redisService: jest.Mocked<RedisService>;

  const createRedisMock = (
    isAvailable: boolean,
    pingResponse: string | null = 'PONG',
    pingLatency: number = 5,
  ): jest.Mocked<RedisService> => {
    return {
      isRedisAvailable: jest.fn().mockReturnValue(isAvailable),
      getClient: jest.fn().mockReturnValue({
        ping: jest.fn().mockImplementation(() => {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              if (pingResponse) {
                resolve(pingResponse);
              } else {
                reject(new Error('Connection refused'));
              }
            }, pingLatency);
          });
        }),
      }),
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
        RedisHealthIndicator,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isHealthy', () => {
    it('should_return_healthy_when_redis_ping_succeeds', async () => {
      // Arrange
      redisService = createRedisMock(true, 'PONG', 5);
      const module = await Test.createTestingModule({
        providers: [
          RedisHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

      // Act
      const result = await indicator.isHealthy('redis');

      // Assert
      expect(result).toHaveProperty('redis');
      expect(result.redis.status).toBe('up');
      expect(result.redis.latencyMs).toBeDefined();
      expect(result.redis.latencyMs).toBeLessThan(100);
    });

    it('should_throw_HealthCheckError_when_redis_unavailable', async () => {
      // Arrange
      redisService = createRedisMock(false, null);
      const module = await Test.createTestingModule({
        providers: [
          RedisHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

      // Act & Assert
      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should_include_latency_in_response', async () => {
      // Arrange
      const expectedLatency = 15;
      redisService = createRedisMock(true, 'PONG', expectedLatency);
      const module = await Test.createTestingModule({
        providers: [
          RedisHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

      // Act
      const result = await indicator.isHealthy('redis');

      // Assert
      expect(result.redis.latencyMs).toBeGreaterThanOrEqual(expectedLatency);
    });

    it('should_throw_HealthCheckError_when_ping_fails', async () => {
      // Arrange
      redisService = createRedisMock(true, null); // available but ping fails
      const module = await Test.createTestingModule({
        providers: [
          RedisHealthIndicator,
          { provide: RedisService, useValue: redisService },
        ],
      }).compile();
      indicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);

      // Act & Assert
      await expect(indicator.isHealthy('redis')).rejects.toThrow(
        HealthCheckError,
      );
    });

    it('should_extend_HealthIndicator_base_class', () => {
      // Assert - verify it has getStatus method from HealthIndicator
      expect(indicator).toHaveProperty('getStatus');
      expect(typeof indicator.getStatus).toBe('function');
    });
  });
});
