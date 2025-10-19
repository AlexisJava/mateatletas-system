import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { JwtService } from '@nestjs/jwt';
import { TokenBlacklistService } from '../token-blacklist.service';

describe('TokenBlacklistService', () => {
  let service: TokenBlacklistService;
  let cacheManager: any;
  let jwtService: JwtService;

  const mockToken = 'mock.jwt.token';

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TokenBlacklistService,
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
            del: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            decode: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TokenBlacklistService>(TokenBlacklistService);
    cacheManager = module.get(CACHE_MANAGER);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addToBlacklist', () => {
    it('should add valid token to blacklist', async () => {
      const now = Math.floor(Date.now() / 1000);
      const expiresIn = 3600;

      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        exp: now + expiresIn,
      });

      await service.addToBlacklist(mockToken, 'user_logout');

      expect(cacheManager.set).toHaveBeenCalled();
    });

    it('should NOT blacklist expired token', async () => {
      const now = Math.floor(Date.now() / 1000);

      jest.spyOn(jwtService, 'decode').mockReturnValue({
        sub: 'user-123',
        exp: now - 3600,
      });

      await service.addToBlacklist(mockToken, 'user_logout');

      expect(cacheManager.set).not.toHaveBeenCalled();
    });

    it('should handle invalid token', async () => {
      jest.spyOn(jwtService, 'decode').mockReturnValue(null);

      await expect(service.addToBlacklist('invalid', 'test')).resolves.not.toThrow();
    });
  });

  describe('isBlacklisted', () => {
    it('should return true for blacklisted token', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ reason: 'user_logout' });

      const result = await service.isBlacklisted(mockToken);

      expect(result).toBe(true);
    });

    it('should return false for clean token', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const result = await service.isBlacklisted(mockToken);

      expect(result).toBe(false);
    });
  });

  describe('blacklistAllUserTokens', () => {
    it('should blacklist all tokens for a user', async () => {
      await service.blacklistAllUserTokens('user-123', 'password_change');

      expect(cacheManager.set).toHaveBeenCalledWith(
        'blacklist:user:user-123',
        expect.any(Object),
        expect.any(Number),
      );
    });
  });

  describe('isUserBlacklisted', () => {
    it('should return true if user has mass blacklist', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue({ allTokens: true });

      const result = await service.isUserBlacklisted('user-123');

      expect(result).toBe(true);
    });

    it('should return false if no mass blacklist', async () => {
      jest.spyOn(cacheManager, 'get').mockResolvedValue(null);

      const result = await service.isUserBlacklisted('user-123');

      expect(result).toBe(false);
    });
  });
});
