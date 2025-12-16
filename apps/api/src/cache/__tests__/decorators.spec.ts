/**
 * Cache Decorators Tests
 *
 * Tests para @Cacheable, @CacheInvalidate y CacheInterceptor
 */

import { Test, TestingModule } from '@nestjs/testing';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, lastValueFrom } from 'rxjs';
import { CacheService, CacheLevel } from '../cache.service';
import { CacheInterceptor } from '../interceptors/cache.interceptor';
import { Cacheable, buildCacheKey } from '../decorators/cacheable.decorator';
import {
  CacheInvalidate,
  normalizeKeys,
  processInvalidationKeys,
} from '../decorators/cache-invalidate.decorator';
import {
  CACHEABLE_METADATA_KEY,
  CACHE_INVALIDATE_METADATA_KEY,
} from '../cache.constants';

describe('Cache Decorators', () => {
  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 1: @Cacheable decorator (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('@Cacheable', () => {
    it('should_set_metadata_with_key_and_ttl', () => {
      class TestService {
        @Cacheable({ key: 'user:{0}', ttl: 300 })
        getUser(_id: string): Promise<object> {
          return Promise.resolve({ id: _id });
        }
      }

      const metadata = Reflect.getMetadata(
        CACHEABLE_METADATA_KEY,
        TestService.prototype.getUser,
      );

      expect(metadata).toEqual({ key: 'user:{0}', ttl: 300 });
    });

    it('should_set_metadata_with_level_option', () => {
      class TestService {
        @Cacheable({ key: 'test', ttl: 60, level: CacheLevel.MEMORY_ONLY })
        getData(): Promise<string> {
          return Promise.resolve('data');
        }
      }

      const metadata = Reflect.getMetadata(
        CACHEABLE_METADATA_KEY,
        TestService.prototype.getData,
      );

      expect(metadata.level).toBe(CacheLevel.MEMORY_ONLY);
    });

    it('should_set_metadata_with_condition_function', () => {
      const condition = (result: unknown) => result !== null;

      class TestService {
        @Cacheable({ key: 'test', ttl: 60, condition })
        getData(): Promise<string | null> {
          return Promise.resolve('data');
        }
      }

      const metadata = Reflect.getMetadata(
        CACHEABLE_METADATA_KEY,
        TestService.prototype.getData,
      );

      expect(metadata.condition).toBe(condition);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 2: buildCacheKey helper (5 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('buildCacheKey', () => {
    it('should_replace_single_placeholder_with_argument', () => {
      const key = buildCacheKey('user:{0}', ['123']);
      expect(key).toBe('user:123');
    });

    it('should_replace_multiple_placeholders', () => {
      const key = buildCacheKey('user:{0}:profile:{1}', ['123', 'avatar']);
      expect(key).toBe('user:123:profile:avatar');
    });

    it('should_handle_numeric_arguments', () => {
      const key = buildCacheKey('page:{0}:limit:{1}', [1, 50]);
      expect(key).toBe('page:1:limit:50');
    });

    it('should_use_id_from_object_argument', () => {
      const key = buildCacheKey('entity:{0}', [
        { id: 'abc-123', name: 'Test' },
      ]);
      expect(key).toBe('entity:abc-123');
    });

    it('should_handle_null_or_undefined_arguments', () => {
      const keyNull = buildCacheKey('key:{0}', [null]);
      const keyUndefined = buildCacheKey('key:{0}', [undefined]);

      expect(keyNull).toBe('key:null');
      expect(keyUndefined).toBe('key:null');
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 3: @CacheInvalidate decorator (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('@CacheInvalidate', () => {
    it('should_set_metadata_with_single_key', () => {
      class TestService {
        @CacheInvalidate({ keys: 'user:{0}' })
        updateUser(_id: string): Promise<void> {
          return Promise.resolve();
        }
      }

      const metadata = Reflect.getMetadata(
        CACHE_INVALIDATE_METADATA_KEY,
        TestService.prototype.updateUser,
      );

      expect(metadata).toEqual({ keys: 'user:{0}' });
    });

    it('should_set_metadata_with_multiple_keys', () => {
      class TestService {
        @CacheInvalidate({ keys: ['user:{0}', 'users:list', 'users:count'] })
        deleteUser(_id: string): Promise<void> {
          return Promise.resolve();
        }
      }

      const metadata = Reflect.getMetadata(
        CACHE_INVALIDATE_METADATA_KEY,
        TestService.prototype.deleteUser,
      );

      expect(metadata.keys).toHaveLength(3);
    });

    it('should_set_beforeInvocation_option', () => {
      class TestService {
        @CacheInvalidate({ keys: 'cache:*', beforeInvocation: true })
        clearAll(): Promise<void> {
          return Promise.resolve();
        }
      }

      const metadata = Reflect.getMetadata(
        CACHE_INVALIDATE_METADATA_KEY,
        TestService.prototype.clearAll,
      );

      expect(metadata.beforeInvocation).toBe(true);
    });

    it('should_default_beforeInvocation_to_undefined', () => {
      class TestService {
        @CacheInvalidate({ keys: 'test' })
        doSomething(): Promise<void> {
          return Promise.resolve();
        }
      }

      const metadata = Reflect.getMetadata(
        CACHE_INVALIDATE_METADATA_KEY,
        TestService.prototype.doSomething,
      );

      expect(metadata.beforeInvocation).toBeUndefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 4: Helper functions (4 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('normalizeKeys', () => {
    it('should_return_array_unchanged', () => {
      const result = normalizeKeys(['a', 'b', 'c']);
      expect(result).toEqual(['a', 'b', 'c']);
    });

    it('should_wrap_string_in_array', () => {
      const result = normalizeKeys('single-key');
      expect(result).toEqual(['single-key']);
    });
  });

  describe('processInvalidationKeys', () => {
    it('should_replace_placeholders_in_all_keys', () => {
      const result = processInvalidationKeys(
        ['user:{0}', 'profile:{0}:{1}'],
        ['123', 'settings'],
      );

      expect(result).toEqual(['user:123', 'profile:123:settings']);
    });

    it('should_handle_object_with_id', () => {
      const result = processInvalidationKeys(
        ['entity:{0}'],
        [{ id: 'ent-456' }],
      );

      expect(result).toEqual(['entity:ent-456']);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // GRUPO 5: CacheInterceptor (10 tests)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('CacheInterceptor', () => {
    let interceptor: CacheInterceptor;
    let cacheService: jest.Mocked<CacheService>;
    let reflector: jest.Mocked<Reflector>;

    const createMockExecutionContext = (
      handler: () => void = jest.fn(),
    ): ExecutionContext =>
      ({
        getHandler: () => handler,
        getArgs: () => ['arg1', 'arg2'],
        getClass: () => ({}),
        switchToHttp: jest.fn(),
      }) as unknown as ExecutionContext;

    const createMockCallHandler = (returnValue: unknown = {}): CallHandler =>
      ({
        handle: () => of(returnValue),
      }) as CallHandler;

    beforeEach(async () => {
      cacheService = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        deleteByPattern: jest.fn(),
      } as unknown as jest.Mocked<CacheService>;

      reflector = {
        get: jest.fn(),
      } as unknown as jest.Mocked<Reflector>;

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          CacheInterceptor,
          { provide: CacheService, useValue: cacheService },
          { provide: Reflector, useValue: reflector },
        ],
      }).compile();

      interceptor = module.get<CacheInterceptor>(CacheInterceptor);
    });

    it('should_return_cached_value_on_hit', async () => {
      const cachedData = { id: 1, name: 'Cached' };

      reflector.get.mockImplementation((key) => {
        if (key === CACHEABLE_METADATA_KEY) {
          return { key: 'test:{0}', ttl: 300 };
        }
        return undefined;
      });
      cacheService.get.mockResolvedValue(cachedData);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ id: 1, name: 'Fresh' });

      const result$ = interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(cachedData);
      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should_call_handler_and_cache_on_miss', async () => {
      const freshData = { id: 1, name: 'Fresh' };

      reflector.get.mockImplementation((key) => {
        if (key === CACHEABLE_METADATA_KEY) {
          return { key: 'test:{0}', ttl: 300 };
        }
        return undefined;
      });
      cacheService.get.mockResolvedValue(null);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler(freshData);

      const result$ = interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(freshData);
      expect(cacheService.set).toHaveBeenCalled();
    });

    it('should_not_cache_when_condition_returns_false', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHEABLE_METADATA_KEY) {
          return {
            key: 'test:{0}',
            ttl: 300,
            condition: (result: unknown) => result !== null,
          };
        }
        return undefined;
      });
      cacheService.get.mockResolvedValue(null);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler(null);

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(cacheService.set).not.toHaveBeenCalled();
    });

    it('should_invalidate_single_key_after_method', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHE_INVALIDATE_METADATA_KEY) {
          return { keys: 'user:{0}' };
        }
        return undefined;
      });

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ success: true });

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(cacheService.delete).toHaveBeenCalledWith('user:arg1');
    });

    it('should_invalidate_multiple_keys', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHE_INVALIDATE_METADATA_KEY) {
          return { keys: ['user:{0}', 'users:list'] };
        }
        return undefined;
      });

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ success: true });

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(cacheService.delete).toHaveBeenCalledTimes(2);
    });

    it('should_use_deleteByPattern_for_wildcard_keys', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHE_INVALIDATE_METADATA_KEY) {
          return { keys: 'user:*' };
        }
        return undefined;
      });

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ success: true });

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(cacheService.deleteByPattern).toHaveBeenCalledWith('user:*');
      expect(cacheService.delete).not.toHaveBeenCalled();
    });

    it('should_invalidate_before_method_when_beforeInvocation_true', async () => {
      let deleteCalledBeforeHandler = false;

      reflector.get.mockImplementation((key) => {
        if (key === CACHE_INVALIDATE_METADATA_KEY) {
          return { keys: 'cache:key', beforeInvocation: true };
        }
        return undefined;
      });

      cacheService.delete.mockImplementation(() => {
        deleteCalledBeforeHandler = true;
        return Promise.resolve();
      });

      const context = createMockExecutionContext();
      const handler: CallHandler = {
        handle: () => {
          expect(deleteCalledBeforeHandler).toBe(true);
          return of({ success: true });
        },
      };

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);
    });

    it('should_pass_through_when_no_cache_decorators', async () => {
      reflector.get.mockReturnValue(undefined);

      const freshData = { untouched: true };
      const context = createMockExecutionContext();
      const handler = createMockCallHandler(freshData);

      const result$ = interceptor.intercept(context, handler);
      const result = await lastValueFrom(result$);

      expect(result).toEqual(freshData);
      expect(cacheService.get).not.toHaveBeenCalled();
      expect(cacheService.set).not.toHaveBeenCalled();
      expect(cacheService.delete).not.toHaveBeenCalled();
    });

    it('should_build_cache_key_with_method_arguments', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHEABLE_METADATA_KEY) {
          return { key: 'complex:{0}:{1}', ttl: 300 };
        }
        return undefined;
      });
      cacheService.get.mockResolvedValue(null);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ data: 'result' });

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      expect(cacheService.get).toHaveBeenCalledWith('complex:arg1:arg2');
    });

    it('should_handle_both_cacheable_and_invalidate_decorators', async () => {
      reflector.get.mockImplementation((key) => {
        if (key === CACHEABLE_METADATA_KEY) {
          return { key: 'data:{0}', ttl: 300 };
        }
        if (key === CACHE_INVALIDATE_METADATA_KEY) {
          return { keys: 'related:{0}' };
        }
        return undefined;
      });
      cacheService.get.mockResolvedValue(null);

      const context = createMockExecutionContext();
      const handler = createMockCallHandler({ combined: true });

      const result$ = interceptor.intercept(context, handler);
      await lastValueFrom(result$);

      // Debería cachear el resultado Y invalidar la clave relacionada
      expect(cacheService.set).toHaveBeenCalled();
      expect(cacheService.delete).toHaveBeenCalledWith('related:arg1');
    });
  });
});
