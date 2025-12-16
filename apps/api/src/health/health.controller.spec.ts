import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  HealthCheckResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../core/database/prisma.service';
import {
  RedisHealthIndicator,
  CacheHealthIndicator,
  ThrottlerHealthIndicator,
} from './indicators';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;

  const mockHealthCheckResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      redis: { status: 'up', latencyMs: 2 },
      cache: { status: 'up', hitRate: '85.0%' },
      throttler: { status: 'up', redisAvailable: true },
      memory_heap: { status: 'up' },
    },
    error: {},
    details: {
      database: { status: 'up' },
      redis: { status: 'up', latencyMs: 2 },
      cache: { status: 'up', hitRate: '85.0%' },
      throttler: { status: 'up', redisAvailable: true },
      memory_heap: { status: 'up' },
    },
  };

  const mockReadyResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: { status: 'up' },
      redis: { status: 'up' },
    },
    error: {},
    details: {
      database: { status: 'up' },
      redis: { status: 'up' },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn().mockResolvedValue(mockHealthCheckResult),
          },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest.fn().mockResolvedValue({
              database: { status: 'up' },
            }),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            $connect: jest.fn(),
            $disconnect: jest.fn(),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue({
              memory_heap: { status: 'up' },
            }),
          },
        },
        {
          provide: RedisHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              redis: { status: 'up', latencyMs: 2 },
            }),
          },
        },
        {
          provide: CacheHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              cache: { status: 'up', hitRate: '85.0%' },
            }),
          },
        },
        {
          provide: ThrottlerHealthIndicator,
          useValue: {
            isHealthy: jest.fn().mockResolvedValue({
              throttler: { status: 'up', redisAvailable: true },
            }),
          },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result with all services', async () => {
      const result = await controller.check();

      expect(result).toEqual(mockHealthCheckResult);
      expect(result.status).toBe('ok');
    });

    it('should call health check service with all indicators', async () => {
      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database
          expect.any(Function), // redis
          expect.any(Function), // cache
          expect.any(Function), // throttler
          expect.any(Function), // memory
        ]),
      );
    });

    it('should include database status in response', async () => {
      const result = await controller.check();
      expect(result.details.database).toBeDefined();
    });

    it('should include redis status in response', async () => {
      const result = await controller.check();
      expect(result.details.redis).toBeDefined();
    });

    it('should include cache status in response', async () => {
      const result = await controller.check();
      expect(result.details.cache).toBeDefined();
    });

    it('should include throttler status in response', async () => {
      const result = await controller.check();
      expect(result.details.throttler).toBeDefined();
    });

    it('should include memory status in response', async () => {
      const result = await controller.check();
      expect(result.details.memory_heap).toBeDefined();
    });
  });

  describe('ready', () => {
    beforeEach(() => {
      (healthCheckService.check as jest.Mock).mockResolvedValue(
        mockReadyResult,
      );
    });

    it('should return readiness probe result', async () => {
      const result = await controller.ready();

      expect(result.status).toBe('ok');
    });

    it('should verify database and redis for readiness', async () => {
      await controller.ready();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function), // database
          expect.any(Function), // redis
        ]),
      );
    });

    it('should only check critical services (database and redis)', async () => {
      await controller.ready();

      // Ready check should call with exactly 2 functions (database + redis)
      const calls = (healthCheckService.check as jest.Mock).mock.calls;
      expect(calls[0][0]).toHaveLength(2);
    });
  });

  describe('live', () => {
    it('should return liveness probe with status ok', () => {
      const result = controller.live();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return valid timestamp in ISO format', () => {
      const result = controller.live();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should return uptime as a number', () => {
      const result = controller.live();

      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
    });
  });
});
