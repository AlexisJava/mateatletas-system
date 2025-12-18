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

// ============================================================================
// JWT TOKEN CONFIGURATION
// ============================================================================

/**
 * Access Token - Corta duración para minimizar ventana de ataque
 * - Usado para autenticar requests a la API
 * - Se renueva automáticamente con refresh token
 *
 * Duración: 15 minutos (producción) / 1 hora (desarrollo)
 */
export const ACCESS_TOKEN_EXPIRATION =
  process.env.NODE_ENV === 'production' ? '15m' : '1h';

/**
 * Access Token cookie maxAge en milisegundos
 */
export const ACCESS_TOKEN_COOKIE_MAX_AGE =
  process.env.NODE_ENV === 'production'
    ? 15 * 60 * 1000 // 15 minutos
    : 60 * 60 * 1000; // 1 hora

/**
 * Refresh Token - Larga duración para mantener sesión
 * - Usado exclusivamente para obtener nuevos access tokens
 * - Se rota en cada uso (seguridad contra robo)
 * - Almacenado en httpOnly cookie separada
 *
 * Duración: 7 días
 */
export const REFRESH_TOKEN_EXPIRATION = '7d';

/**
 * Refresh Token cookie maxAge en milisegundos
 */
export const REFRESH_TOKEN_COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 días

/**
 * @deprecated Use ACCESS_TOKEN_EXPIRATION instead
 * Mantenido para backward compatibility
 */
export const JWT_EXPIRATION =
  process.env.JWT_EXPIRATION || ACCESS_TOKEN_EXPIRATION;

// ============================================================================
// PASSWORD CONFIGURATION
// ============================================================================

/**
 * Longitud mínima de password
 */
export const MIN_PASSWORD_LENGTH = 6;

/**
 * Longitud máxima de password
 */
export const MAX_PASSWORD_LENGTH = 100;
