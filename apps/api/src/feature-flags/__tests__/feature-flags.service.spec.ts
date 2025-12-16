import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { FeatureFlagsService } from '../feature-flags.service';
import { FEATURE_FLAGS } from '../feature-flags.constants';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;
  let configService: ConfigService;
  let mockGet: jest.Mock;

  beforeEach(async () => {
    mockGet = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagsService,
        {
          provide: ConfigService,
          useValue: {
            get: mockGet,
          },
        },
      ],
    }).compile();

    service = module.get<FeatureFlagsService>(FeatureFlagsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isCacheRedisEnabled', () => {
    it('should_return_true_for_cacheRedisEnabled_when_env_not_set', () => {
      mockGet.mockReturnValue(undefined);

      const result = service.isCacheRedisEnabled();

      expect(result).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(FEATURE_FLAGS.CACHE_REDIS_ENABLED);
    });

    it('should_return_true_for_cacheRedisEnabled_when_env_is_true', () => {
      mockGet.mockReturnValue('true');

      const result = service.isCacheRedisEnabled();

      expect(result).toBe(true);
    });

    it('should_return_false_for_cacheRedisEnabled_when_env_is_false', () => {
      mockGet.mockReturnValue('false');

      const result = service.isCacheRedisEnabled();

      expect(result).toBe(false);
    });
  });

  describe('isThrottlerRedisEnabled', () => {
    it('should_return_true_for_throttlerRedisEnabled_by_default', () => {
      mockGet.mockReturnValue(undefined);

      const result = service.isThrottlerRedisEnabled();

      expect(result).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(
        FEATURE_FLAGS.THROTTLER_REDIS_ENABLED,
      );
    });

    it('should_return_false_for_throttlerRedisEnabled_when_env_is_false', () => {
      mockGet.mockReturnValue('false');

      const result = service.isThrottlerRedisEnabled();

      expect(result).toBe(false);
    });
  });

  describe('isCacheEnabled', () => {
    it('should_return_true_for_cacheEnabled_by_default', () => {
      mockGet.mockReturnValue(undefined);

      const result = service.isCacheEnabled();

      expect(result).toBe(true);
      expect(mockGet).toHaveBeenCalledWith(FEATURE_FLAGS.CACHE_ENABLED);
    });

    it('should_return_false_for_cacheEnabled_when_env_is_false', () => {
      mockGet.mockReturnValue('false');

      const result = service.isCacheEnabled();

      expect(result).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should_read_env_on_each_call_not_cached', () => {
      mockGet.mockReturnValueOnce('true').mockReturnValueOnce('false');

      const firstCall = service.isCacheRedisEnabled();
      const secondCall = service.isCacheRedisEnabled();

      expect(firstCall).toBe(true);
      expect(secondCall).toBe(false);
      expect(mockGet).toHaveBeenCalledTimes(2);
    });

    it('should_handle_case_insensitive_false', () => {
      mockGet.mockReturnValue('FALSE');

      const result = service.isCacheRedisEnabled();

      expect(result).toBe(false);
    });
  });

  describe('getAllFlags', () => {
    it('should_expose_all_flags_via_getAllFlags', () => {
      mockGet
        .mockReturnValueOnce('true') // CACHE_REDIS_ENABLED
        .mockReturnValueOnce('false') // THROTTLER_REDIS_ENABLED
        .mockReturnValueOnce(undefined); // CACHE_ENABLED

      const result = service.getAllFlags();

      expect(result).toEqual({
        cacheRedisEnabled: true,
        throttlerRedisEnabled: false,
        cacheEnabled: true,
      });
    });
  });
});
