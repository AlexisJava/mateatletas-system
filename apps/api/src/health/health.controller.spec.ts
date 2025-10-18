import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { PrismaService } from '../core/database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let prismaHealth: PrismaHealthIndicator;

  const mockHealthCheckResult: HealthCheckResult = {
    status: 'ok',
    info: {
      database: {
        status: 'up',
      },
    },
    error: {},
    details: {
      database: {
        status: 'up',
      },
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
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    healthCheckService = module.get<HealthCheckService>(HealthCheckService);
    prismaHealth = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check', () => {
    it('should return health check result with database status', async () => {
      const result = await controller.check();

      expect(result).toEqual(mockHealthCheckResult);
      expect(result.status).toBe('ok');
      expect(result.details.database.status).toBe('up');
    });

    it('should call health check service', async () => {
      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Function)]),
      );
    });
  });

  describe('ready', () => {
    it('should return readiness probe result', async () => {
      const result = await controller.ready();

      expect(result).toEqual(mockHealthCheckResult);
      expect(result.status).toBe('ok');
    });

    it('should verify database connection for readiness', async () => {
      await controller.ready();

      expect(healthCheckService.check).toHaveBeenCalled();
    });
  });

  describe('live', () => {
    it('should return liveness probe with status ok', async () => {
      const result = await controller.live();

      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });

    it('should return valid timestamp in ISO format', async () => {
      const result = await controller.live();

      expect(() => new Date(result.timestamp)).not.toThrow();
      expect(result.timestamp).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should return uptime as a number', async () => {
      const result = await controller.live();

      expect(typeof result.uptime).toBe('number');
      expect(result.uptime).toBeGreaterThan(0);
    });
  });
});
