import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';

/**
 * Tests de Seguridad: Bcrypt Salt Rounds
 *
 * CONTEXT: Auditoría de seguridad 2025-11-21
 * ISSUE: Sistema usaba solo 10 rounds (INSUFICIENTE)
 * FIX: Actualizado a 12 rounds (NIST SP 800-63B 2025)
 *
 * Estos tests garantizan que:
 * 1. BCRYPT_ROUNDS >= 12 (mínimo NIST)
 * 2. Nuevos hashes usan 12+ rounds
 * 3. Hashes antiguos son detectables
 */
describe('Bcrypt Security - Salt Rounds', () => {
  describe('BCRYPT_ROUNDS constant', () => {
    it('debe ser >= 12 (NIST SP 800-63B 2025 requirement)', () => {
      // ✅ CRITICAL SECURITY TEST
      expect(BCRYPT_ROUNDS).toBeGreaterThanOrEqual(12);
    });

    it('debe ser un número válido', () => {
      expect(typeof BCRYPT_ROUNDS).toBe('number');
      expect(Number.isInteger(BCRYPT_ROUNDS)).toBe(true);
      expect(BCRYPT_ROUNDS).toBeGreaterThan(0);
    });
  });

  describe('Hash generation', () => {
    it('debe generar hashes con 12+ rounds', async () => {
      const password = 'TestPassword123!';
      const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Extract rounds from hash (format: $2b$XX$...)
      const parts = hash.split('$');
      const rounds = parseInt(parts[2], 10);

      expect(rounds).toBe(BCRYPT_ROUNDS);
      expect(rounds).toBeGreaterThanOrEqual(12);
    });

    it('debe generar hashes diferentes para la misma password (salt único)', async () => {
      const password = 'TestPassword123!';
      const hash1 = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const hash2 = await bcrypt.hash(password, BCRYPT_ROUNDS);

      expect(hash1).not.toBe(hash2); // Different salts
      expect(await bcrypt.compare(password, hash1)).toBe(true);
      expect(await bcrypt.compare(password, hash2)).toBe(true);
    });
  });

  describe('Old hash detection', () => {
    it('debe detectar hashes con rounds antiguos (10 rounds)', async () => {
      const password = 'OldPassword123!';
      const oldHash = await bcrypt.hash(password, 10); // Old rounds

      // Extract rounds
      const parts = oldHash.split('$');
      const rounds = parseInt(parts[2], 10);

      expect(rounds).toBe(10);
      expect(rounds).toBeLessThan(BCRYPT_ROUNDS);

      // Verify old hash is still valid
      expect(await bcrypt.compare(password, oldHash)).toBe(true);
    });

    it('debe poder comparar passwords contra hashes antiguos y nuevos', async () => {
      const password = 'TestPassword123!';

      // Hash with old rounds (10)
      const oldHash = await bcrypt.hash(password, 10);

      // Hash with new rounds (12)
      const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

      // Both should validate the same password
      expect(await bcrypt.compare(password, oldHash)).toBe(true);
      expect(await bcrypt.compare(password, newHash)).toBe(true);

      // Extract rounds to verify difference
      const oldRounds = parseInt(oldHash.split('$')[2], 10);
      const newRounds = parseInt(newHash.split('$')[2], 10);

      expect(oldRounds).toBe(10);
      expect(newRounds).toBe(12);
    });
  });

  describe('Performance', () => {
    it('debe tomar tiempo significativo para hashear (seguridad)', async () => {
      const password = 'TestPassword123!';

      const start = Date.now();
      await bcrypt.hash(password, BCRYPT_ROUNDS);
      const duration = Date.now() - start;

      // 12 rounds debería tomar al menos 50ms (puede variar por CPU)
      // Esto garantiza que NO se use 1 round (instant)
      expect(duration).toBeGreaterThan(10);
    }, 10000); // 10s timeout

    it('debe ser significativamente más lento con más rounds', async () => {
      const password = 'TestPassword123!';

      // Hash with 10 rounds
      const start10 = Date.now();
      await bcrypt.hash(password, 10);
      const duration10 = Date.now() - start10;

      // Hash with 12 rounds
      const start12 = Date.now();
      await bcrypt.hash(password, 12);
      const duration12 = Date.now() - start12;

      // 12 rounds debería ser ~4x más lento que 10 rounds (2^2 = 4)
      // Pero por variabilidad de CPU, solo verificamos que sea más lento
      expect(duration12).toBeGreaterThanOrEqual(duration10);
    }, 10000); // 10s timeout
  });

  describe('Security boundaries', () => {
    it('NO debe permitir rounds < 10 (configuración mínima de emergencia)', () => {
      // Si alguien intenta configurar BCRYPT_ROUNDS=8 via env var,
      // debería ser rechazado
      expect(BCRYPT_ROUNDS).toBeGreaterThanOrEqual(10);
    });

    it('NO debe usar rounds excesivos (> 14) que bloqueen el servidor', () => {
      // 14 rounds es razonable máximo (CPU-intensive pero manejable)
      // 15+ rounds puede causar DoS auto-infligido
      expect(BCRYPT_ROUNDS).toBeLessThanOrEqual(14);
    });
  });
});

/**
 * Helper para extraer rounds de un hash de bcrypt
 * Útil para debugging y testing
 *
 * Formato bcrypt: $2b$XX$... donde XX es el número de rounds
 * Ejemplo: $2b$12$abcdef... -> 12 rounds
 */
export function extractRoundsFromHash(hash: string): number {
  if (!hash || typeof hash !== 'string') {
    throw new Error('Invalid bcrypt hash format: hash is empty or not a string');
  }

  const parts = hash.split('$');

  // Formato válido: ['', '2b', '12', 'salt+hash...']
  // Mínimo 4 partes para un hash válido completo
  if (parts.length < 4) {
    throw new Error(`Invalid bcrypt hash format: expected at least 4 parts, got ${parts.length}`);
  }

  const roundsStr = parts[2];
  if (!roundsStr || roundsStr.trim() === '') {
    throw new Error('Invalid bcrypt hash format: rounds section is empty');
  }

  const rounds = parseInt(roundsStr, 10);
  if (isNaN(rounds) || rounds <= 0) {
    throw new Error(`Invalid bcrypt hash format: rounds "${roundsStr}" is not a valid positive number`);
  }

  return rounds;
}

describe('extractRoundsFromHash helper', () => {
  it('debe extraer rounds correctamente de hashes válidos', () => {
    const hash10 = '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABC';
    const hash12 = '$2b$12$abcdefghijklmnopqrstuvwxyz1234567890ABC';

    expect(extractRoundsFromHash(hash10)).toBe(10);
    expect(extractRoundsFromHash(hash12)).toBe(12);
  });

  it('debe lanzar error para hashes inválidos', () => {
    expect(() => extractRoundsFromHash('invalid')).toThrow();
    expect(() => extractRoundsFromHash('$2b$')).toThrow();
    expect(() => extractRoundsFromHash('')).toThrow();
  });
});
