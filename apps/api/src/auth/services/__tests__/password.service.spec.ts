import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from '../password.service';

describe('PasswordService', () => {
  let service: PasswordService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PasswordService],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  describe('hash', () => {
    it('should generate a hash different from the original password', async () => {
      const password = 'MySecurePassword123!';

      const hash = await service.hash(password);

      expect(hash).not.toBe(password);
      expect(hash).toMatch(/^\$2[ab]\$\d{2}\$/); // bcrypt format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'MySecurePassword123!';

      const hash1 = await service.hash(password);
      const hash2 = await service.hash(password);

      expect(hash1).not.toBe(hash2);
    });

    it('should use 12 rounds by default', async () => {
      const password = 'TestPassword123!';

      const hash = await service.hash(password);
      const rounds = service.getRoundsFromHash(hash);

      expect(rounds).toBe(12);
    });
  });

  describe('verify', () => {
    it('should return true for correct password', async () => {
      const password = 'CorrectPassword123!';
      const hash = await service.hash(password);

      const result = await service.verify(password, hash);

      expect(result).toBe(true);
    });

    it('should return false for incorrect password', async () => {
      const password = 'CorrectPassword123!';
      const wrongPassword = 'WrongPassword456!';
      const hash = await service.hash(password);

      const result = await service.verify(wrongPassword, hash);

      expect(result).toBe(false);
    });

    it('should return false for empty password', async () => {
      const hash = await service.hash('SomePassword123!');

      const result = await service.verify('', hash);

      expect(result).toBe(false);
    });
  });

  describe('verifyWithTimingProtection', () => {
    it('should return isValid true for correct password', async () => {
      const password = 'SecurePass123!';
      const hash = await service.hash(password);

      const result = await service.verifyWithTimingProtection(password, hash);

      expect(result.isValid).toBe(true);
      expect(result.needsRehash).toBe(false);
      expect(result.currentRounds).toBe(12);
    });

    it('should return isValid false for incorrect password', async () => {
      const hash = await service.hash('CorrectPassword123!');

      const result = await service.verifyWithTimingProtection(
        'WrongPassword',
        hash,
      );

      expect(result.isValid).toBe(false);
    });

    it('should return isValid false for null hash (user not found)', async () => {
      const result = await service.verifyWithTimingProtection(
        'AnyPassword123!',
        null,
      );

      expect(result.isValid).toBe(false);
      expect(result.needsRehash).toBe(false);
      expect(result.currentRounds).toBe(0);
    });

    it('should return isValid false for undefined hash', async () => {
      const result = await service.verifyWithTimingProtection(
        'AnyPassword123!',
        undefined,
      );

      expect(result.isValid).toBe(false);
    });

    it('should indicate needsRehash for hash with fewer rounds', async () => {
      // Simulate a hash with only 10 rounds (old standard)
      const bcrypt = require('bcrypt');
      const oldHash = await bcrypt.hash('TestPassword123!', 10);

      const result = await service.verifyWithTimingProtection(
        'TestPassword123!',
        oldHash,
      );

      expect(result.isValid).toBe(true);
      expect(result.needsRehash).toBe(true);
      expect(result.currentRounds).toBe(10);
    });
  });

  describe('getRoundsFromHash', () => {
    it('should extract rounds from valid bcrypt hash', () => {
      const hash = '$2b$12$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

      const rounds = service.getRoundsFromHash(hash);

      expect(rounds).toBe(12);
    });

    it('should return 0 for invalid hash format', () => {
      const invalidHash = 'not-a-valid-hash';

      const rounds = service.getRoundsFromHash(invalidHash);

      expect(rounds).toBe(0);
    });

    it('should handle hash with different rounds', () => {
      const hash10 = '$2b$10$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';
      const hash14 = '$2b$14$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

      expect(service.getRoundsFromHash(hash10)).toBe(10);
      expect(service.getRoundsFromHash(hash14)).toBe(14);
    });
  });

  describe('needsRehash', () => {
    it('should return true for hash with fewer rounds than current standard', () => {
      const oldHash = '$2b$10$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

      const result = service.needsRehash(oldHash);

      expect(result).toBe(true);
    });

    it('should return false for hash with current rounds', () => {
      const currentHash =
        '$2b$12$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

      const result = service.needsRehash(currentHash);

      expect(result).toBe(false);
    });

    it('should return false for hash with more rounds than current', () => {
      const strongerHash =
        '$2b$14$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

      const result = service.needsRehash(strongerHash);

      expect(result).toBe(false);
    });
  });

  describe('validateStrength', () => {
    it('should approve strong password', () => {
      const strongPassword = 'MyStr0ng!Pass';

      const result = service.validateStrength(strongPassword);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject password shorter than 8 characters', () => {
      const shortPassword = 'Abc1!';

      const result = service.validateStrength(shortPassword);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a debe tener al menos 8 caracteres',
      );
    });

    it('should reject password longer than 128 characters', () => {
      const longPassword = 'A1!'.repeat(50); // 150 chars

      const result = service.validateStrength(longPassword);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a no puede superar los 128 caracteres',
      );
    });

    it('should reject password without uppercase', () => {
      const noUppercase = 'mypassword123!';

      const result = service.validateStrength(noUppercase);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a debe contener al menos una may\u00fascula',
      );
    });

    it('should reject password without lowercase', () => {
      const noLowercase = 'MYPASSWORD123!';

      const result = service.validateStrength(noLowercase);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a debe contener al menos una min\u00fascula',
      );
    });

    it('should reject password without number', () => {
      const noNumber = 'MyPassword!!';

      const result = service.validateStrength(noNumber);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a debe contener al menos un n\u00famero',
      );
    });

    it('should reject password without special character', () => {
      const noSpecial = 'MyPassword123';

      const result = service.validateStrength(noSpecial);

      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        'La contrase\u00f1a debe contener al menos un car\u00e1cter especial (@$!%*?&)',
      );
    });

    it('should return all errors for very weak password', () => {
      const weakPassword = 'abc';

      const result = service.validateStrength(weakPassword);

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3);
    });
  });

  describe('generateTemporaryPassword', () => {
    it('should generate password of specified length', () => {
      const password = service.generateTemporaryPassword(16);

      expect(password.length).toBe(16);
    });

    it('should generate password of default length (12)', () => {
      const password = service.generateTemporaryPassword();

      expect(password.length).toBe(12);
    });

    it('should generate password that passes strength validation', () => {
      const password = service.generateTemporaryPassword();

      const result = service.validateStrength(password);

      expect(result.valid).toBe(true);
    });

    it('should generate different passwords each time', () => {
      const passwords = new Set<string>();

      for (let i = 0; i < 10; i++) {
        passwords.add(service.generateTemporaryPassword());
      }

      expect(passwords.size).toBe(10);
    });

    it('should contain at least one uppercase letter', () => {
      const password = service.generateTemporaryPassword();

      expect(/[A-Z]/.test(password)).toBe(true);
    });

    it('should contain at least one lowercase letter', () => {
      const password = service.generateTemporaryPassword();

      expect(/[a-z]/.test(password)).toBe(true);
    });

    it('should contain at least one number', () => {
      const password = service.generateTemporaryPassword();

      expect(/[0-9]/.test(password)).toBe(true);
    });

    it('should contain at least one special character', () => {
      const password = service.generateTemporaryPassword();

      expect(/[@$!%*?&]/.test(password)).toBe(true);
    });
  });

  describe('BCRYPT_ROUNDS constant', () => {
    it('should be 12 (NIST SP 800-63B 2025 recommendation)', () => {
      expect(service.BCRYPT_ROUNDS).toBe(12);
    });
  });

  describe('DUMMY_HASH constant', () => {
    it('should be a valid bcrypt hash format', () => {
      expect(service.DUMMY_HASH).toMatch(/^\$2[ab]\$12\$/);
    });
  });
});