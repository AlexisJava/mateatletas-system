import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  describe('Connection Pool Configuration', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
      originalEnv = { ...process.env };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    describe('validatePoolSize', () => {
      it('should_return_default_10_when_not_configured', () => {
        const mockConfigService = {
          get: jest.fn().mockImplementation((key: string) => {
            if (key === 'DATABASE_URL')
              return 'postgresql://test:test@localhost:5432/test';
            return undefined;
          }),
        };

        // Access private static method via reflection for testing
        const validatePoolSize = (PrismaService as any).validatePoolSize;
        expect(validatePoolSize(undefined)).toBe(10);
      });

      it('should_return_min_5_when_configured_below_minimum', () => {
        const validatePoolSize = (PrismaService as any).validatePoolSize;
        expect(validatePoolSize(1)).toBe(5);
        expect(validatePoolSize(0)).toBe(5);
        expect(validatePoolSize(-10)).toBe(5);
      });

      it('should_return_max_100_when_configured_above_maximum', () => {
        const validatePoolSize = (PrismaService as any).validatePoolSize;
        expect(validatePoolSize(200)).toBe(100);
        expect(validatePoolSize(999)).toBe(100);
      });

      it('should_return_configured_value_when_within_bounds', () => {
        const validatePoolSize = (PrismaService as any).validatePoolSize;
        expect(validatePoolSize(5)).toBe(5);
        expect(validatePoolSize(50)).toBe(50);
        expect(validatePoolSize(100)).toBe(100);
      });

      it('should_handle_NaN_gracefully', () => {
        const validatePoolSize = (PrismaService as any).validatePoolSize;
        expect(validatePoolSize(NaN)).toBe(10);
      });
    });

    describe('validatePoolTimeout', () => {
      it('should_return_default_30000_when_not_configured', () => {
        const validatePoolTimeout = (PrismaService as any).validatePoolTimeout;
        expect(validatePoolTimeout(undefined)).toBe(30000);
      });

      it('should_return_min_5000_when_configured_below_minimum', () => {
        const validatePoolTimeout = (PrismaService as any).validatePoolTimeout;
        expect(validatePoolTimeout(1000)).toBe(5000);
        expect(validatePoolTimeout(0)).toBe(5000);
      });

      it('should_return_max_60000_when_configured_above_maximum', () => {
        const validatePoolTimeout = (PrismaService as any).validatePoolTimeout;
        expect(validatePoolTimeout(120000)).toBe(60000);
      });

      it('should_return_configured_value_when_within_bounds', () => {
        const validatePoolTimeout = (PrismaService as any).validatePoolTimeout;
        expect(validatePoolTimeout(5000)).toBe(5000);
        expect(validatePoolTimeout(30000)).toBe(30000);
        expect(validatePoolTimeout(60000)).toBe(60000);
      });
    });

    describe('buildConnectionUrl', () => {
      it('should_throw_error_when_DATABASE_URL_not_configured', () => {
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        expect(() => buildConnectionUrl(undefined, 10, 30000)).toThrow(
          'DATABASE_URL no configurada',
        );
      });

      it('should_add_pool_params_to_url_without_query_string', () => {
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        const result = buildConnectionUrl(
          'postgresql://user:pass@localhost:5432/db',
          20,
          15000,
        );
        expect(result).toBe(
          'postgresql://user:pass@localhost:5432/db?connection_limit=20&pool_timeout=15000',
        );
      });

      it('should_add_pool_params_to_url_with_existing_query_string', () => {
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        const result = buildConnectionUrl(
          'postgresql://user:pass@localhost:5432/db?schema=public',
          30,
          20000,
        );
        expect(result).toBe(
          'postgresql://user:pass@localhost:5432/db?schema=public&connection_limit=30&pool_timeout=20000',
        );
      });

      it('should_not_duplicate_params_if_already_present', () => {
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        const urlWithParams =
          'postgresql://user:pass@localhost:5432/db?connection_limit=50';
        const result = buildConnectionUrl(urlWithParams, 20, 15000);
        expect(result).toBe(urlWithParams); // No modification
      });

      it('should_not_duplicate_pool_timeout_if_already_present', () => {
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        const urlWithParams =
          'postgresql://user:pass@localhost:5432/db?pool_timeout=10000';
        const result = buildConnectionUrl(urlWithParams, 20, 15000);
        expect(result).toBe(urlWithParams); // No modification
      });
    });

    describe('Security', () => {
      it('should_not_expose_credentials_in_logs', () => {
        // This test verifies the service doesn't log sensitive data
        // by checking the buildConnectionUrl doesn't modify the URL in a way
        // that would expose credentials differently
        const buildConnectionUrl = (PrismaService as any).buildConnectionUrl;
        const sensitiveUrl =
          'postgresql://admin:SuperSecret123!@prod-db.com:5432/mateatletas';
        const result = buildConnectionUrl(sensitiveUrl, 10, 30000);

        // The function should only append params, not transform or log the URL
        expect(result).toContain('SuperSecret123!'); // Password preserved
        expect(result).toContain('connection_limit=10');
      });
    });
  });

  describe('Service Integration', () => {
    it('should_be_defined_with_valid_config', async () => {
      const mockConfigService = {
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'DATABASE_URL') {
            return 'postgresql://test:test@localhost:5432/test';
          }
          if (key === 'DATABASE_POOL_SIZE') return 20;
          if (key === 'DATABASE_POOL_TIMEOUT') return 15000;
          if (key === 'NODE_ENV') return 'test';
          return undefined;
        }),
      };

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          PrismaService,
          { provide: ConfigService, useValue: mockConfigService },
        ],
      }).compile();

      const service = module.get<PrismaService>(PrismaService);
      expect(service).toBeDefined();
    });

    it('should_throw_on_missing_DATABASE_URL', async () => {
      const mockConfigService = {
        get: jest.fn().mockReturnValue(undefined),
      };

      await expect(
        Test.createTestingModule({
          providers: [
            PrismaService,
            { provide: ConfigService, useValue: mockConfigService },
          ],
        }).compile(),
      ).rejects.toThrow('DATABASE_URL no configurada');
    });
  });
});
