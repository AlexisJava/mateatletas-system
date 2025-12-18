/**
 * ThrottlerRedisStorage Integration Tests
 *
 * Tests de integración que verifican el comportamiento
 * del rate limiting distribuido.
 *
 * Nota: Estos tests usan mocks para simular múltiples instancias.
 */

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { ThrottlerRedisStorage } from '../throttler-redis.storage';
import { RedisService } from '../../../core/redis/redis.service';

describe('ThrottlerRedisStorage Integration', () => {
  let storage1: ThrottlerRedisStorage;
  let storage2: ThrottlerRedisStorage;
  let sharedRedisState: Map<string, { value: number; ttl: number }>;
  let redisAvailable: boolean;

  // Simula un Redis compartido entre instancias
  const createSharedRedisMock = (): jest.Mocked<RedisService> => {
    return {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      isRedisAvailable: jest.fn().mockImplementation(() => redisAvailable),
      getClient: jest.fn().mockReturnValue({
        eval: jest
          .fn()
          .mockImplementation(
            (
              _script: string,
              _numKeys: number,
              key: string,
              ttlStr: string,
            ) => {
              const ttl = parseInt(ttlStr, 10);
              const existing = sharedRedisState.get(key);

              if (existing) {
                existing.value++;
                return Promise.resolve([existing.value, existing.ttl]);
              }

              sharedRedisState.set(key, { value: 1, ttl });
              return Promise.resolve([1, ttl]);
            },
          ),
        pexpire: jest.fn().mockResolvedValue(1),
      }),
    } as unknown as jest.Mocked<RedisService>;
  };

  beforeEach(async () => {
    sharedRedisState = new Map();
    redisAvailable = true;

    // Crear dos instancias que comparten el mismo "Redis"
    const sharedRedisMock = createSharedRedisMock();

    const mockConfigService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          FEATURE_THROTTLER_REDIS_ENABLED: 'true',
        };
        return config[key];
      }),
    };

    const module1: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerRedisStorage,
        { provide: RedisService, useValue: sharedRedisMock },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    const module2: TestingModule = await Test.createTestingModule({
      providers: [
        ThrottlerRedisStorage,
        { provide: RedisService, useValue: sharedRedisMock },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    storage1 = module1.get<ThrottlerRedisStorage>(ThrottlerRedisStorage);
    storage2 = module2.get<ThrottlerRedisStorage>(ThrottlerRedisStorage);
  });

  afterEach(() => {
    storage1?.onModuleDestroy?.();
    storage2?.onModuleDestroy?.();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // TESTS DE INTEGRACIÓN (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  it('should_share_counter_across_storage_instances', async () => {
    // Instance 1 hace 3 requests
    await storage1.increment('shared:user', 60000, 100, 0, 'default');
    await storage1.increment('shared:user', 60000, 100, 0, 'default');
    await storage1.increment('shared:user', 60000, 100, 0, 'default');

    // Instance 2 hace 2 requests - debería ver contador en 5
    const result1 = await storage2.increment(
      'shared:user',
      60000,
      100,
      0,
      'default',
    );
    const result2 = await storage2.increment(
      'shared:user',
      60000,
      100,
      0,
      'default',
    );

    expect(result1.totalHits).toBe(4);
    expect(result2.totalHits).toBe(5);
  });

  it('should_block_after_exceeding_limit_across_instances', async () => {
    const limit = 5;

    // Instance 1 hace 3 requests
    for (let i = 0; i < 3; i++) {
      await storage1.increment('block:test', 60000, limit, 0, 'default');
    }

    // Instance 2 hace 3 requests más (total: 6, excede limit de 5)
    let lastResult;
    for (let i = 0; i < 3; i++) {
      lastResult = await storage2.increment(
        'block:test',
        60000,
        limit,
        0,
        'default',
      );
    }

    expect(lastResult?.totalHits).toBe(6);
    expect(lastResult?.isBlocked).toBe(true);
  });

  it('should_expire_counter_after_ttl', async () => {
    const shortTtl = 100; // 100ms

    await storage1.increment('expire:test', shortTtl, 100, 0, 'default');
    await storage1.increment('expire:test', shortTtl, 100, 0, 'default');

    // Simular expiración limpiando el estado compartido
    await new Promise((resolve) => setTimeout(resolve, 150));
    sharedRedisState.clear();

    // Nueva request debería empezar desde 1
    const result = await storage2.increment(
      'expire:test',
      shortTtl,
      100,
      0,
      'default',
    );

    expect(result.totalHits).toBe(1);
  }, 5000);

  it('should_apply_blockDuration_when_blocked', async () => {
    const limit = 2;
    const blockDuration = 300000; // 5 minutos

    // Exceder límite
    await storage1.increment(
      'blockdur:test',
      60000,
      limit,
      blockDuration,
      'default',
    );
    await storage1.increment(
      'blockdur:test',
      60000,
      limit,
      blockDuration,
      'default',
    );
    const blocked = await storage1.increment(
      'blockdur:test',
      60000,
      limit,
      blockDuration,
      'default',
    );

    expect(blocked.isBlocked).toBe(true);
    expect(blocked.timeToBlockExpire).toBe(blockDuration);
  });

  it('should_fallback_to_memory_when_Redis_down', async () => {
    // Redis disponible inicialmente
    await storage1.increment('fallback:test', 60000, 100, 0, 'default');
    await storage1.increment('fallback:test', 60000, 100, 0, 'default');

    // Redis se cae
    redisAvailable = false;

    // Debería continuar funcionando con memoria local
    const result = await storage1.increment(
      'fallback:test',
      60000,
      100,
      0,
      'default',
    );

    // En memoria, contador empieza de nuevo
    expect(result.totalHits).toBe(1);
    expect(result.timeToExpire).toBeGreaterThan(0);
  });
});
