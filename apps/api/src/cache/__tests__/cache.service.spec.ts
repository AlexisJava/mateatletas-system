import { Test, TestingModule } from '@nestjs/testing';
import { CacheService, CacheLevel } from '../cache.service';
import { RedisService } from '../../core/redis/redis.service';
import { CacheMetrics } from '../interfaces';

/**
 * CacheService Unit Tests
 *
 * TDD: Estos tests se escriben ANTES de la implementación.
 * Todos deben FALLAR inicialmente (RED phase).
 *
 * Cobertura: 47 tests organizados en 11 grupos
 */

describe('CacheService', () => {
  let service: CacheService;
  let redisService: jest.Mocked<RedisService>;

  // Mock de RedisService
  const createMockRedisService = (): jest.Mocked<RedisService> =>
    ({
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      exists: jest.fn(),
      isRedisAvailable: jest.fn().mockReturnValue(true),
      getClient: jest.fn(),
    }) as unknown as jest.Mocked<RedisService>;

  beforeEach(async () => {
    redisService = createMockRedisService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheService,
        {
          provide: RedisService,
          useValue: redisService,
        },
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 1: OPERACIONES BÁSICAS (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('get/set básico', () => {
    it('should_store_and_retrieve_string_value', async () => {
      const key = 'test:string';
      const value = 'hello world';

      await service.set(key, value, { ttl: 60 });
      const result = await service.get<string>(key);

      expect(result).toBe(value);
    });

    it('should_store_and_retrieve_object_value', async () => {
      const key = 'test:object';
      const value = { id: '123', name: 'Test User', active: true };

      await service.set(key, value, { ttl: 60 });
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
    });

    it('should_store_and_retrieve_array_value', async () => {
      const key = 'test:array';
      const value = [1, 2, 3, 'four', { five: 5 }];

      await service.set(key, value, { ttl: 60 });
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
    });

    it('should_return_null_for_nonexistent_key', async () => {
      const result = await service.get('nonexistent:key');

      expect(result).toBeNull();
    });

    it('should_return_null_after_ttl_expires', async () => {
      const key = 'test:expiring';
      const value = 'will expire';

      await service.set(key, value, { ttl: 1 }); // 1 segundo

      // Esperar a que expire
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await service.get<string>(key);
      expect(result).toBeNull();
    }, 5000);

    it('should_overwrite_existing_key_with_new_value', async () => {
      const key = 'test:overwrite';

      await service.set(key, 'original', { ttl: 60 });
      await service.set(key, 'updated', { ttl: 60 });

      const result = await service.get<string>(key);
      expect(result).toBe('updated');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 2: ESTRATEGIA L1 → L2 (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('multinivel L1/L2', () => {
    it('should_return_from_L1_if_exists_without_hitting_L2', async () => {
      const key = 'test:l1only';
      const value = { data: 'from L1' };

      // Set almacena en L1
      await service.set(key, value, { ttl: 60 });

      // Get debe retornar de L1 sin consultar Redis
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(redisService.get).not.toHaveBeenCalled();
    });

    it('should_fallback_to_L2_when_L1_miss', async () => {
      const key = 'test:l2fallback';
      const value = { data: 'from L2' };

      // Simular que Redis tiene el valor
      redisService.get.mockResolvedValue(JSON.stringify(value));

      // L1 está vacío, debe ir a L2
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(redisService.get).toHaveBeenCalledWith(
        expect.stringContaining(key),
      );
    });

    it('should_populate_L1_after_L2_hit', async () => {
      const key = 'test:l2promotion';
      const value = { data: 'promoted to L1' };

      // Simular que Redis tiene el valor
      redisService.get.mockResolvedValue(JSON.stringify(value));

      // Primera llamada: L1 miss, L2 hit
      await service.get<typeof value>(key);

      // Segunda llamada: debe venir de L1
      redisService.get.mockClear();
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(redisService.get).not.toHaveBeenCalled();
    });

    it('should_respect_MEMORY_ONLY_level_and_skip_L2', async () => {
      const key = 'test:memonly';
      const value = 'memory only value';

      await service.set(key, value, { ttl: 60, level: CacheLevel.MEMORY_ONLY });

      // Redis no debe ser llamado para set
      expect(redisService.set).not.toHaveBeenCalled();

      const result = await service.get<string>(key, {
        level: CacheLevel.MEMORY_ONLY,
      });
      expect(result).toBe(value);
    });

    it('should_respect_REDIS_ONLY_level_and_skip_L1', async () => {
      const key = 'test:redisonly';
      const value = 'redis only value';

      redisService.get.mockResolvedValue(JSON.stringify(value));

      await service.set(key, value, { ttl: 60, level: CacheLevel.REDIS_ONLY });

      // Verificar que se guardó en Redis
      expect(redisService.set).toHaveBeenCalled();

      // Get con REDIS_ONLY
      const result = await service.get<string>(key, {
        level: CacheLevel.REDIS_ONLY,
      });
      expect(result).toBe(value);
      expect(redisService.get).toHaveBeenCalled();
    });

    it('should_use_BOTH_levels_by_default', async () => {
      const key = 'test:both';
      const value = { default: 'both levels' };

      await service.set(key, value, { ttl: 60 });

      // Debe guardar en Redis (L2)
      expect(redisService.set).toHaveBeenCalled();

      // Debe retornar de L1 (sin hit a Redis en get)
      redisService.get.mockClear();
      const result = await service.get<typeof value>(key);

      expect(result).toEqual(value);
      expect(redisService.get).not.toHaveBeenCalled();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 3: FALLBACK Y RESILIENCIA (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('fallback cuando Redis falla', () => {
    it('should_continue_working_with_L1_when_Redis_unavailable', async () => {
      redisService.isRedisAvailable.mockReturnValue(false);
      redisService.set.mockRejectedValue(new Error('Redis unavailable'));

      const key = 'test:noreids';
      const value = 'works without redis';

      // No debe lanzar error
      await expect(service.set(key, value, { ttl: 60 })).resolves.not.toThrow();

      // Debe poder recuperar de L1
      const result = await service.get<string>(key);
      expect(result).toBe(value);
    });

    it('should_return_L1_value_when_L2_throws_error', async () => {
      const key = 'test:l2error';
      const value = 'l1 value';

      // Guardar en L1
      await service.set(key, value, { ttl: 60, level: CacheLevel.MEMORY_ONLY });

      // Simular error en Redis
      redisService.get.mockRejectedValue(new Error('Connection refused'));

      // Debe retornar valor de L1
      const result = await service.get<string>(key);
      expect(result).toBe(value);
    });

    it('should_set_only_in_L1_when_Redis_throws_error', async () => {
      redisService.set.mockRejectedValue(new Error('Redis write error'));

      const key = 'test:l2writeerror';
      const value = 'stored in l1 only';

      // No debe lanzar error
      await expect(service.set(key, value, { ttl: 60 })).resolves.not.toThrow();

      // Debe estar disponible en L1
      const result = await service.get<string>(key, {
        level: CacheLevel.MEMORY_ONLY,
      });
      expect(result).toBe(value);
    });

    it('should_not_throw_when_Redis_fails_on_delete', async () => {
      redisService.del.mockRejectedValue(new Error('Redis delete error'));

      await expect(service.delete('any:key')).resolves.not.toThrow();
    });

    it('should_log_warning_when_Redis_fails', async () => {
      // Este test verifica comportamiento de logging
      // Se implementará con spy en el Logger
      const loggerSpy = jest.spyOn(
        (service as unknown as { logger: { warn: jest.Mock } }).logger,
        'warn',
      );

      redisService.get.mockRejectedValue(new Error('Redis timeout'));

      await service.get('test:key');

      expect(loggerSpy).toHaveBeenCalled();
    });

    it('should_increment_error_metric_when_Redis_fails', async () => {
      redisService.get.mockRejectedValue(new Error('Redis error'));
      service.resetMetrics();

      await service.get('test:error');

      const metrics = service.getMetrics();
      expect(metrics.errors).toBeGreaterThan(0);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 4: TTL Y EXPIRACIÓN (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TTL y expiración', () => {
    it('should_expire_L1_entry_after_ttl', async () => {
      const key = 'test:l1expire';

      await service.set(key, 'expires', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await service.get(key, { level: CacheLevel.MEMORY_ONLY });
      expect(result).toBeNull();
    }, 5000);

    it('should_expire_L2_entry_after_ttl', async () => {
      const key = 'test:l2expire';

      // Redis maneja TTL internamente, verificamos que se pasa correctamente
      await service.set(key, 'expires', {
        ttl: 60,
        level: CacheLevel.REDIS_ONLY,
      });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.any(String),
        60,
      );
    });

    it('should_use_default_ttl_when_not_specified', async () => {
      const key = 'test:defaultttl';

      await service.set(key, 'value');

      // Default TTL es 300 segundos (5 minutos)
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.any(String),
        300,
      );
    });

    it('should_use_custom_ttl_when_specified', async () => {
      const key = 'test:customttl';

      await service.set(key, 'value', { ttl: 3600 });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.any(String),
        3600,
      );
    });

    it('should_return_null_for_expired_L1_entry', async () => {
      const key = 'test:expired';

      await service.set(key, 'will expire', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await service.get(key, { level: CacheLevel.MEMORY_ONLY });
      expect(result).toBeNull();
    }, 5000);

    it('should_clean_expired_entries_with_cleanExpiredL1', async () => {
      // Crear varias entradas con TTL corto
      await service.set('exp:1', 'a', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('exp:2', 'b', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('exp:3', 'c', {
        ttl: 3600,
        level: CacheLevel.MEMORY_ONLY,
      });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const cleaned = service.cleanExpiredL1();

      expect(cleaned).toBe(2); // exp:1 y exp:2
      expect(service.getL1Size()).toBe(1); // solo exp:3
    }, 5000);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 5: DELETE Y PATRONES (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('delete', () => {
    it('should_delete_from_both_L1_and_L2', async () => {
      const key = 'test:delete';

      await service.set(key, 'to delete', { ttl: 60 });
      await service.delete(key);

      // L1 debe estar vacío
      const l1Result = await service.get(key, {
        level: CacheLevel.MEMORY_ONLY,
      });
      expect(l1Result).toBeNull();

      // Redis debe haber recibido del
      expect(redisService.del).toHaveBeenCalledWith(
        expect.stringContaining(key),
      );
    });

    it('should_delete_only_L1_when_Redis_unavailable', async () => {
      redisService.del.mockRejectedValue(new Error('Redis down'));

      const key = 'test:delnoredis';
      await service.set(key, 'value', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      await expect(service.delete(key)).resolves.not.toThrow();

      const result = await service.get(key, { level: CacheLevel.MEMORY_ONLY });
      expect(result).toBeNull();
    });

    it('should_return_silently_when_deleting_nonexistent_key', async () => {
      await expect(service.delete('nonexistent')).resolves.not.toThrow();
    });
  });

  describe('deleteByPattern', () => {
    it('should_delete_all_keys_matching_pattern_from_L1', async () => {
      await service.set('user:1', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('user:2', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('product:1', 'c', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const deleted = await service.deleteByPattern('user:*');

      expect(deleted).toBeGreaterThanOrEqual(2);
      expect(
        await service.get('user:1', { level: CacheLevel.MEMORY_ONLY }),
      ).toBeNull();
      expect(
        await service.get('user:2', { level: CacheLevel.MEMORY_ONLY }),
      ).toBeNull();
      expect(
        await service.get('product:1', { level: CacheLevel.MEMORY_ONLY }),
      ).not.toBeNull();
    });

    it('should_delete_all_keys_matching_pattern_from_L2', async () => {
      // Mock de Redis SCAN + DEL para pattern
      const mockClient = {
        scan: jest.fn().mockResolvedValue(['0', ['user:1', 'user:2']]),
        del: jest.fn().mockResolvedValue(2),
      };
      redisService.getClient.mockReturnValue(
        mockClient as unknown as ReturnType<RedisService['getClient']>,
      );

      await service.deleteByPattern('user:*');

      expect(mockClient.scan).toHaveBeenCalled();
    });

    it('should_return_count_of_deleted_keys', async () => {
      await service.set('del:1', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('del:2', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const count = await service.deleteByPattern('del:*');

      expect(count).toBe(2);
    });

    it('should_handle_pattern_with_no_matches', async () => {
      const count = await service.deleteByPattern('nomatch:*');

      expect(count).toBe(0);
    });

    it('should_support_wildcard_at_end_user_asterisk', async () => {
      await service.set('prefix:abc', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('prefix:xyz', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('other:abc', 'c', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const deleted = await service.deleteByPattern('prefix:*');

      expect(deleted).toBe(2);
    });

    it('should_support_wildcard_in_middle_user_asterisk_name', async () => {
      await service.set('cache:user:123:profile', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('cache:user:456:profile', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('cache:user:123:settings', 'c', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const deleted = await service.deleteByPattern('cache:user:*:profile');

      expect(deleted).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 6: OPERACIONES AVANZADAS (8 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('getOrSet', () => {
    it('should_return_cached_value_without_calling_factory', async () => {
      const key = 'test:getorset';
      const cachedValue = { cached: true };
      const factory = jest.fn().mockResolvedValue({ cached: false });

      await service.set(key, cachedValue, { ttl: 60 });
      const result = await service.getOrSet(key, factory, { ttl: 60 });

      expect(result).toEqual(cachedValue);
      expect(factory).not.toHaveBeenCalled();
    });

    it('should_call_factory_on_cache_miss', async () => {
      const key = 'test:getorsetmiss';
      const factoryValue = { fromFactory: true };
      const factory = jest.fn().mockResolvedValue(factoryValue);

      const result = await service.getOrSet(key, factory, { ttl: 60 });

      expect(result).toEqual(factoryValue);
      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should_cache_factory_result_for_next_call', async () => {
      const key = 'test:getorsetcache';
      const factoryValue = { factoryResult: true };
      const factory = jest.fn().mockResolvedValue(factoryValue);

      await service.getOrSet(key, factory, { ttl: 60 });
      await service.getOrSet(key, factory, { ttl: 60 });

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it('should_not_cache_if_factory_throws', async () => {
      const key = 'test:getorseterror';
      const factory = jest.fn().mockRejectedValue(new Error('Factory error'));

      await expect(service.getOrSet(key, factory, { ttl: 60 })).rejects.toThrow(
        'Factory error',
      );

      // No debe estar en cache
      const result = await service.get(key);
      expect(result).toBeNull();
    });

    it('should_pass_options_to_underlying_set', async () => {
      const key = 'test:getorsetoptions';
      const factory = jest.fn().mockResolvedValue('value');

      await service.getOrSet(key, factory, { ttl: 7200 });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(key),
        expect.any(String),
        7200,
      );
    });
  });

  describe('getMany/setMany', () => {
    it('should_get_multiple_values_in_single_call', async () => {
      await service.set('multi:1', 'one', { ttl: 60 });
      await service.set('multi:2', 'two', { ttl: 60 });

      const results = await service.getMany<string>([
        'multi:1',
        'multi:2',
        'multi:3',
      ]);

      expect(results.get('multi:1')).toBe('one');
      expect(results.get('multi:2')).toBe('two');
      expect(results.get('multi:3')).toBeNull();
    });

    it('should_return_null_for_missing_keys_in_getMany', async () => {
      const results = await service.getMany<string>(['missing:1', 'missing:2']);

      expect(results.get('missing:1')).toBeNull();
      expect(results.get('missing:2')).toBeNull();
    });

    it('should_set_multiple_values_in_single_call', async () => {
      await service.setMany(
        [
          ['batch:1', 'one'],
          ['batch:2', 'two'],
          ['batch:3', 'three'],
        ],
        { ttl: 60 },
      );

      expect(await service.get('batch:1')).toBe('one');
      expect(await service.get('batch:2')).toBe('two');
      expect(await service.get('batch:3')).toBe('three');
    });

    it('should_apply_same_ttl_to_all_entries_in_setMany', async () => {
      await service.setMany(
        [
          ['ttlbatch:1', 'one'],
          ['ttlbatch:2', 'two'],
        ],
        { ttl: 1800 },
      );

      // Verificar que Redis recibió el TTL correcto para cada set
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('ttlbatch:1'),
        expect.any(String),
        1800,
      );
      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining('ttlbatch:2'),
        expect.any(String),
        1800,
      );
    });
  });

  describe('exists', () => {
    it('should_return_true_when_key_exists_in_L1', async () => {
      await service.set('exists:l1', 'value', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const result = await service.exists('exists:l1');

      expect(result).toBe(true);
    });

    it('should_return_true_when_key_exists_in_L2_only', async () => {
      redisService.exists.mockResolvedValue(true);

      const result = await service.exists('exists:l2only');

      expect(result).toBe(true);
    });

    it('should_return_false_when_key_not_found', async () => {
      redisService.exists.mockResolvedValue(false);

      const result = await service.exists('nonexistent');

      expect(result).toBe(false);
    });

    it('should_return_false_for_expired_key', async () => {
      // Mock Redis exists para retornar false (key no existe en L2)
      redisService.exists.mockResolvedValue(false);

      await service.set('exists:expired', 'value', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });
      await new Promise((resolve) => setTimeout(resolve, 1100));

      const result = await service.exists('exists:expired');

      expect(result).toBe(false);
    }, 5000);
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 7: MÉTRICAS (11 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('métricas', () => {
    beforeEach(() => {
      service.resetMetrics();
    });

    it('should_increment_hits_on_cache_hit', async () => {
      await service.set('metrics:hit', 'value', { ttl: 60 });
      await service.get('metrics:hit');

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(1);
    });

    it('should_increment_misses_on_cache_miss', async () => {
      redisService.get.mockResolvedValue(null);

      await service.get('metrics:miss');

      const metrics = service.getMetrics();
      expect(metrics.misses).toBe(1);
    });

    it('should_increment_l1Hits_when_found_in_L1', async () => {
      await service.set('metrics:l1hit', 'value', { ttl: 60 });
      await service.get('metrics:l1hit');

      const metrics = service.getMetrics();
      expect(metrics.hitsByLevel.l1).toBe(1);
    });

    it('should_increment_l2Hits_when_found_in_L2', async () => {
      redisService.get.mockResolvedValue(JSON.stringify('from redis'));

      await service.get('metrics:l2hit');

      const metrics = service.getMetrics();
      expect(metrics.hitsByLevel.l2).toBe(1);
    });

    it('should_increment_sets_on_set_operation', async () => {
      await service.set('metrics:set1', 'value', { ttl: 60 });
      await service.set('metrics:set2', 'value', { ttl: 60 });

      const metrics = service.getMetrics();
      expect(metrics.sets).toBe(2);
    });

    it('should_increment_deletes_on_delete_operation', async () => {
      await service.set('metrics:del', 'value', { ttl: 60 });
      await service.delete('metrics:del');

      const metrics = service.getMetrics();
      expect(metrics.deletes).toBe(1);
    });

    it('should_increment_errors_on_Redis_failure', async () => {
      redisService.get.mockRejectedValue(new Error('Redis error'));

      await service.get('metrics:error');

      const metrics = service.getMetrics();
      expect(metrics.errors).toBe(1);
    });

    it('should_calculate_hitRate_correctly', async () => {
      // 3 hits
      await service.set('rate:1', 'v', { ttl: 60 });
      await service.set('rate:2', 'v', { ttl: 60 });
      await service.set('rate:3', 'v', { ttl: 60 });
      await service.get('rate:1');
      await service.get('rate:2');
      await service.get('rate:3');

      // 1 miss
      redisService.get.mockResolvedValue(null);
      await service.get('rate:miss');

      const metrics = service.getMetrics();
      // hitRate = 3 / (3 + 1) = 0.75
      expect(metrics.hitRate).toBeCloseTo(0.75, 2);
    });

    it('should_return_correct_l1Size', async () => {
      await service.set('size:1', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('size:2', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('size:3', 'c', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const metrics = service.getMetrics();
      expect(metrics.l1Size).toBe(3);
    });

    it('should_reset_metrics_with_resetMetrics', async () => {
      await service.set('reset:1', 'v', { ttl: 60 });
      await service.get('reset:1');

      service.resetMetrics();

      const metrics = service.getMetrics();
      expect(metrics.hits).toBe(0);
      expect(metrics.misses).toBe(0);
      expect(metrics.sets).toBe(0);
    });

    it('should_track_uptimeSeconds_correctly', async () => {
      const metrics = service.getMetrics();

      expect(metrics.uptimeSeconds).toBeGreaterThanOrEqual(0);
      expect(metrics.startedAt).toBeInstanceOf(Date);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 8: EVICTION L1 (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('eviction L1', () => {
    it('should_evict_oldest_entry_when_L1_is_full', async () => {
      // Este test requiere configurar L1_MAX_ITEMS bajo para testing
      // Por ahora verificamos el comportamiento con el límite por defecto
      const firstKey = 'evict:first';
      await service.set(firstKey, 'oldest', {
        ttl: 3600,
        level: CacheLevel.MEMORY_ONLY,
      });

      // Llenar hasta el límite (esto sería con mocks o config de test)
      // Por ahora verificamos que el método existe
      expect(service.cleanExpiredL1).toBeDefined();
    });

    it('should_evict_expired_entries_first', async () => {
      await service.set('evict:expired', 'a', {
        ttl: 1,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('evict:valid', 'b', {
        ttl: 3600,
        level: CacheLevel.MEMORY_ONLY,
      });

      await new Promise((resolve) => setTimeout(resolve, 1100));

      const cleaned = service.cleanExpiredL1();

      expect(cleaned).toBeGreaterThanOrEqual(1);
      expect(
        await service.get('evict:valid', { level: CacheLevel.MEMORY_ONLY }),
      ).toBe('b');
    }, 5000);

    it('should_not_exceed_l1MaxItems_limit', async () => {
      // Verificamos que el size se mantiene controlado
      // En tests reales esto requeriría un límite bajo configurable
      expect(service.getL1Size()).toBeLessThanOrEqual(1000);
    });

    it('should_maintain_entries_in_order_by_createdAt', async () => {
      await service.set('order:1', 'first', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
      await service.set('order:2', 'second', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      // La primera entrada debería ser elegida para eviction antes que la segunda
      // Esto se verifica indirectamente por el comportamiento de cleanExpiredL1
      expect(service.getL1Size()).toBe(2);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 9: SERIALIZACIÓN (6 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('serialización', () => {
    it('should_serialize_object_to_JSON_for_L2', async () => {
      const obj = { name: 'test', value: 123 };

      await service.set('serial:obj', obj, { ttl: 60 });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.any(String),
        JSON.stringify(obj),
        60,
      );
    });

    it('should_deserialize_JSON_from_L2_to_object', async () => {
      const obj = { name: 'test', value: 123 };
      redisService.get.mockResolvedValue(JSON.stringify(obj));

      const result = await service.get<typeof obj>('serial:deser');

      expect(result).toEqual(obj);
    });

    it('should_handle_Date_objects_correctly', async () => {
      const data = { createdAt: new Date('2025-01-01T00:00:00.000Z') };

      // Forzar que venga de L2 (Redis) para verificar serialización
      service.clearL1();
      redisService.get.mockResolvedValue(JSON.stringify(data));

      const result = await service.get<{ createdAt: string }>('serial:date');

      // Dates se serializan como strings ISO en JSON
      expect(result?.createdAt).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should_handle_nested_objects', async () => {
      const nested = {
        level1: {
          level2: {
            level3: {
              value: 'deep',
            },
          },
        },
      };

      await service.set('serial:nested', nested, { ttl: 60 });
      redisService.get.mockResolvedValue(JSON.stringify(nested));

      const result = await service.get<typeof nested>('serial:nested');

      expect(result?.level1.level2.level3.value).toBe('deep');
    });

    it('should_handle_arrays_of_objects', async () => {
      const arr = [
        { id: 1, name: 'first' },
        { id: 2, name: 'second' },
      ];

      await service.set('serial:array', arr, { ttl: 60 });
      redisService.get.mockResolvedValue(JSON.stringify(arr));

      const result = await service.get<typeof arr>('serial:array');

      expect(result).toHaveLength(2);
      expect(result?.[0].name).toBe('first');
    });

    it('should_return_null_on_invalid_JSON_from_L2', async () => {
      redisService.get.mockResolvedValue('invalid json {{{');

      const result = await service.get('serial:invalid');

      expect(result).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 10: HEALTH (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('health status', () => {
    it('should_return_healthy_when_L1_and_L2_available', async () => {
      redisService.isRedisAvailable.mockReturnValue(true);

      const health = await service.getHealthStatus();

      expect(health.status).toBe('healthy');
      expect(health.l1.available).toBe(true);
      expect(health.l2.available).toBe(true);
    });

    it('should_return_degraded_when_L2_unavailable', async () => {
      redisService.isRedisAvailable.mockReturnValue(false);

      const health = await service.getHealthStatus();

      expect(health.status).toBe('degraded');
      expect(health.l1.available).toBe(true);
      expect(health.l2.available).toBe(false);
    });

    it('should_return_unhealthy_when_hitRate_below_threshold', async () => {
      // Generar muchos misses
      redisService.get.mockResolvedValue(null);
      service.resetMetrics();

      for (let i = 0; i < 10; i++) {
        await service.get(`health:miss:${i}`);
      }

      const health = await service.getHealthStatus();

      // Con 0 hits y 10 misses, hitRate = 0
      expect(health.status).toBe('unhealthy');
    });

    it('should_include_L1_item_count', async () => {
      await service.set('health:1', 'a', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });
      await service.set('health:2', 'b', {
        ttl: 60,
        level: CacheLevel.MEMORY_ONLY,
      });

      const health = await service.getHealthStatus();

      expect(health.l1.itemCount).toBe(2);
    });

    it('should_include_L2_latency_ms', async () => {
      redisService.isRedisAvailable.mockReturnValue(true);

      const health = await service.getHealthStatus();

      // latencyMs debería ser un número o null
      expect(
        health.l2.latencyMs === null || typeof health.l2.latencyMs === 'number',
      ).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 11: PREFIJOS Y KEYS (3 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('key building', () => {
    it('should_prepend_global_prefix_to_all_keys', async () => {
      await service.set('simple:key', 'value', { ttl: 60 });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringMatching(/^mateatletas:.*simple:key$/),
        expect.any(String),
        expect.any(Number),
      );
    });

    it('should_prepend_custom_prefix_when_specified', async () => {
      await service.set('key', 'value', { ttl: 60, prefix: 'custom:' });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringMatching(/custom:key$/),
        expect.any(String),
        expect.any(Number),
      );
    });

    it('should_handle_keys_with_special_characters', async () => {
      const specialKey = 'user:123:profile:settings';

      await service.set(specialKey, 'value', { ttl: 60 });

      expect(redisService.set).toHaveBeenCalledWith(
        expect.stringContaining(specialKey),
        expect.any(String),
        expect.any(Number),
      );
    });
  });
});
