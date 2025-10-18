/**
 * Constantes de seguridad centralizadas
 */

/**
 * Número de rondas para bcrypt hashing
 * Valor por defecto: 10 (recomendado para balance seguridad/performance)
 * Puede ser configurado via variable de entorno BCRYPT_ROUNDS
 */
export const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '10', 10);

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
