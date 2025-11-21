/**
 * Constantes de seguridad centralizadas
 */

/**
 * Número de rondas para bcrypt hashing
 * Valor por defecto: 12 (NIST SP 800-63B 2025 recommendation)
 * Valor mínimo recomendado: 12 rounds
 * Puede ser configurado via variable de entorno BCRYPT_ROUNDS
 *
 * SECURITY: Updated from 10 to 12 rounds (2025-11-21)
 * - 10 rounds: ~100,000 hashes/sec with modern GPUs (INSECURE)
 * - 12 rounds: ~25,000 hashes/sec (SECURE for 2025)
 */
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12', 10);

/**
 * Tiempo de expiración del token JWT
 * Valor por defecto: 24 horas
 */
export const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '24h';

/**
 * Longitud mínima de password
 */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Longitud máxima de password
 */
export const MAX_PASSWORD_LENGTH = 100;
