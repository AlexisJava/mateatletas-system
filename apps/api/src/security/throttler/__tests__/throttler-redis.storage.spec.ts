/**
 * ThrottlerRedisStorage Unit Tests
 *
 * TDD: Estos tests se escriben ANTES de la implementación.
 * Todos deben FALLAR inicialmente (RED phase).
 *
 * Cobertura: 17 tests organizados en 4 grupos
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ThrottlerRedisStorage } from '../throttler-redis.storage';
import { RedisService } from '../../../core/redis/redis.service';
import { THROTTLER_PREFIX } from '../throttler.constants';

describe('ThrottlerRedisStorage', () => {
  let storage: ThrottlerRedisStorage;
  let redisService: jest.Mocked<RedisService>;
  let configService: jest.Mocked<ConfigService>;

  // Mock de RedisService
  const createMockRedisService = (): jest.Mocked<RedisService> =>
    ({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      isRedisAvailable: jest.fn().mockReturnValue(true),
      getClient: jest.fn().mockReturnValue({
        eval: jest.fn(),
        pexpire: jest.fn(),
      }),
    }) as unknown as jest.Mocked<RedisService>;

  // Mock de ConfigService
  const createMockConfigService = (): jest.Mocked<ConfigService> =>
    ({
      get: jest.fn().mockReturnValue(undefined), // Default: feature flag enabled
    }) as unknown as jest.Mocked<ConfigService>;

  beforeEach(async () => {
    redisService = createMockRedisService();
    configService = createMockConfigService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerRedisStorage,
        {
          provide: RedisService,
          useValue: redisService,
        },
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    storage = module.get<ThrottlerRedisStorage>(ThrottlerRedisStorage);
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Limpiar interval si existe
    storage?.onModuleDestroy?.();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 1: INCREMENT EN REDIS (9 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('increment', () => {
    it('should_increment_counter_in_Redis_atomically', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([1, 60000]);

      const result = await storage.increment(
        'user:123',
        60000,
        100,
        0,
        'default',
      );

      expect(mockClient.eval).toHaveBeenCalledTimes(1);
      expect(result.totalHits).toBe(1);
    });

    it('should_set_TTL_on_first_increment', async () => {
      const mockClient = redisService.getClient();
      // Primera vez: TTL viene del script Lua como ARGV[1]
      (mockClient.eval as jest.Mock).mockResolvedValue([1, 60000]);

      const result = await storage.increment(
        'user:456',
        60000,
        100,
        0,
        'default',
      );

      expect(result.timeToExpire).toBe(60000);
    });

    it('should_return_correct_ThrottlerStorageRecord', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([5, 45000]);

      const result = await storage.increment(
        'user:789',
        60000,
        100,
        0,
        'default',
      );

      expect(result).toEqual({
        totalHits: 5,
        timeToExpire: 45000,
        isBlocked: false,
        timeToBlockExpire: 0,
      });
    });

    it('should_use_correct_key_with_throttlerName_prefix', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([1, 60000]);

      await storage.increment('ip:192.168.1.1', 60000, 100, 0, 'webhook');

      expect(mockClient.eval).toHaveBeenCalledWith(
        expect.any(String),
        1,
        `${THROTTLER_PREFIX}webhook:ip:192.168.1.1`,
        '60000',
      );
    });

    it('should_mark_isBlocked_true_when_exceeds_limit', async () => {
      const mockClient = redisService.getClient();
      // 101 hits cuando limit es 100
      (mockClient.eval as jest.Mock).mockResolvedValue([101, 30000]);

      const result = await storage.increment(
        'user:spammer',
        60000,
        100,
        0,
        'default',
      );

      expect(result.isBlocked).toBe(true);
      expect(result.totalHits).toBe(101);
    });

    it('should_apply_blockDuration_when_blocked', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([101, 30000]);
      (mockClient.pexpire as jest.Mock).mockResolvedValue(1);

      const result = await storage.increment(
        'user:blocked',
        60000,
        100,
        300000, // 5 minutos de bloqueo
        'default',
      );

      expect(result.isBlocked).toBe(true);
      expect(result.timeToBlockExpire).toBe(300000);
      expect(mockClient.pexpire).toHaveBeenCalledWith(
        expect.stringContaining('user:blocked'),
        300000,
      );
    });

    it('should_fallback_to_memory_when_Redis_unavailable', async () => {
      redisService.isRedisAvailable.mockReturnValue(false);

      const result = await storage.increment(
        'user:noreids',
        60000,
        100,
        0,
        'default',
      );

      expect(result.totalHits).toBe(1);
      expect(result.timeToExpire).toBeGreaterThan(0);
      expect(redisService.getClient().eval).not.toHaveBeenCalled();
    });

    it('should_fallback_to_memory_when_Redis_throws', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockRejectedValue(
        new Error('Redis connection refused'),
      );

      const result = await storage.increment(
        'user:error',
        60000,
        100,
        0,
        'default',
      );

      expect(result.totalHits).toBe(1);
      expect(result.timeToExpire).toBeGreaterThan(0);
    });

    it('should_log_warning_on_Redis_failure', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockRejectedValue(new Error('Redis down'));

      const loggerSpy = jest.spyOn(
        (storage as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      );

      await storage.increment('user:fail', 60000, 100, 0, 'default');

      expect(loggerSpy).toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 2: MEMORY FALLBACK (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('memory fallback', () => {
    beforeEach(() => {
      // Forzar uso de memoria
      redisService.isRedisAvailable.mockReturnValue(false);
    });

    it('should_track_hits_in_memory_during_fallback', async () => {
      const result1 = await storage.increment(
        'mem:user1',
        60000,
        100,
        0,
        'default',
      );
      const result2 = await storage.increment(
        'mem:user1',
        60000,
        100,
        0,
        'default',
      );
      const result3 = await storage.increment(
        'mem:user1',
        60000,
        100,
        0,
        'default',
      );

      expect(result1.totalHits).toBe(1);
      expect(result2.totalHits).toBe(2);
      expect(result3.totalHits).toBe(3);
    });

    it('should_expire_memory_entries_after_ttl', async () => {
      // TTL muy corto para test
      await storage.increment('mem:expire', 100, 100, 0, 'default');

      // Esperar a que expire
      await new Promise((resolve) => setTimeout(resolve, 150));

      // Nueva request debería resetear contador
      const result = await storage.increment(
        'mem:expire',
        100,
        100,
        0,
        'default',
      );

      expect(result.totalHits).toBe(1);
    }, 5000);

    it('should_block_in_memory_when_exceeds_limit', async () => {
      // Hacer 101 requests con límite de 100
      let result;
      for (let i = 0; i < 101; i++) {
        result = await storage.increment('mem:spam', 60000, 100, 0, 'default');
      }

      expect(result?.isBlocked).toBe(true);
      expect(result?.totalHits).toBe(101);
    });

    it('should_cleanup_expired_entries_periodically', async () => {
      // Crear entradas con TTL corto
      await storage.increment('cleanup:1', 50, 100, 0, 'default');
      await storage.increment('cleanup:2', 50, 100, 0, 'default');

      // Esperar a que expiren
      await new Promise((resolve) => setTimeout(resolve, 100));

      const cleaned = storage.cleanExpiredMemoryEntries();

      expect(cleaned).toBeGreaterThanOrEqual(2);
    }, 5000);

    it('should_clear_memory_on_module_destroy', async () => {
      await storage.increment('destroy:1', 60000, 100, 0, 'default');
      await storage.increment('destroy:2', 60000, 100, 0, 'default');

      expect(storage.getMemoryFallbackSize()).toBe(2);

      storage.onModuleDestroy();

      expect(storage.getMemoryFallbackSize()).toBe(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 3: MÉTRICAS (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('metrics', () => {
    it('should_track_Redis_operations_count', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([1, 60000]);

      await storage.increment('metrics:1', 60000, 100, 0, 'default');
      await storage.increment('metrics:2', 60000, 100, 0, 'default');

      const metrics = storage.getMetrics();
      expect(metrics.redisOperations).toBe(2);
    });

    it('should_track_memory_fallback_count', async () => {
      redisService.isRedisAvailable.mockReturnValue(false);

      await storage.increment('mem:metrics:1', 60000, 100, 0, 'default');
      await storage.increment('mem:metrics:2', 60000, 100, 0, 'default');

      const metrics = storage.getMetrics();
      expect(metrics.memoryOperations).toBe(2);
    });

    it('should_expose_health_status', async () => {
      redisService.isRedisAvailable.mockReturnValue(true);

      const health = storage.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.redisAvailable).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 4: EDGE CASES (0 tests adicionales, cubiertos arriba)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('edge cases', () => {
    it('should_handle_zero_TTL', async () => {
      const mockClient = redisService.getClient();
      (mockClient.eval as jest.Mock).mockResolvedValue([1, 0]);

      const result = await storage.increment('edge:zero', 0, 100, 0, 'default');

      expect(result.timeToExpire).toBe(0);
    });

    it('should_handle_negative_timeToExpire_from_Redis', async () => {
      const mockClient = redisService.getClient();
      // Redis puede retornar -2 si la key no existe o -1 si no tiene TTL
      (mockClient.eval as jest.Mock).mockResolvedValue([1, -1]);

      const result = await storage.increment(
        'edge:negative',
        60000,
        100,
        0,
        'default',
      );

      // Debería normalizar a 0
      expect(result.timeToExpire).toBeGreaterThanOrEqual(0);
    });
  });
});
