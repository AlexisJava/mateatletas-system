import { UserThrottlerGuard } from './user-throttler.guard';

describe('UserThrottlerGuard', () => {
  let guard: UserThrottlerGuard;

  beforeEach(() => {
    guard = new UserThrottlerGuard(
      { ttl: 60, limit: 10 } as any,
      {} as any,
      {} as any,
    );
  });

  describe('getTracker', () => {
    it('should return user ID when user is authenticated', async () => {
      const mockRequest = {
        user: { id: 'user-123' },
        headers: {},
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('user:user-123');
    });

    it('should return IP from x-forwarded-for header', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1, 10.0.0.1',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:192.168.1.1');
    });

    it('should handle single IP in x-forwarded-for', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:192.168.1.1');
    });

    it('should fallback to x-real-ip if x-forwarded-for is missing', async () => {
      const mockRequest = {
        headers: {
          'x-real-ip': '192.168.1.100',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:192.168.1.100');
    });

    it('should fallback to request.ip if proxy headers are missing', async () => {
      const mockRequest = {
        headers: {},
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:127.0.0.1');
    });

    it('should return "unknown" if no IP is available', async () => {
      const mockRequest = {
        headers: {},
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:unknown');
    });

    // 🔥 TESTS CRÍTICOS: Null-safety para evitar crashes

    it('should handle empty x-forwarded-for header without crashing', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      // Empty string after trim should fallback to request.ip
      expect(result).toBe('ip:127.0.0.1');
    });

    it('should handle x-forwarded-for as array without crashing', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': ['192.168.1.1', '10.0.0.1'], // Some proxies send arrays
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      // Should fallback to request.ip when header is not a string
      expect(result).toBe('ip:127.0.0.1');
    });

    it('should handle x-forwarded-for as number without crashing', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': 12345, // Malformed header
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      // Should fallback to request.ip when header is not a string
      expect(result).toBe('ip:127.0.0.1');
    });

    it('should handle x-forwarded-for with only commas', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': ',,,',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      // Empty string after trim should fallback
      expect(result).toBe('ip:127.0.0.1');
    });

    it('should trim whitespace from x-forwarded-for IPs', async () => {
      const mockRequest = {
        headers: {
          'x-forwarded-for': '  192.168.1.1  ,  10.0.0.1  ',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      expect(result).toBe('ip:192.168.1.1');
    });

    it('should prioritize authenticated user over IP', async () => {
      const mockRequest = {
        user: { id: 'user-456' },
        headers: {
          'x-forwarded-for': '192.168.1.1',
        },
        ip: '127.0.0.1',
      } as any;

      const result = await guard['getTracker'](mockRequest);
      // User ID takes priority over IP
      expect(result).toBe('user:user-456');
    });
  });
});
