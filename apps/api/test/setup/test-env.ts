/**
 * ============================================================================
 * TEST ENVIRONMENT CONFIGURATION
 * ============================================================================
 *
 * Variables de entorno para tests de integración.
 * Este archivo es cargado por Jest via setupFilesAfterEnv.
 */

import 'reflect-metadata';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Redis de test (docker-compose.test.yml usa puerto 6380)
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6380';

// Rate limiting global (alto para tests)
process.env.RATE_LIMIT_TTL = process.env.RATE_LIMIT_TTL ?? '60000';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? '100000';

// Login throttle: Límite alto para tests de integración
// Los tests de auth usan IPs únicas pero el throttle por IP se acumula entre suites
// Para tests específicos de throttle, usar LOGIN_THROTTLE_LIMIT bajo explícitamente
process.env.LOGIN_THROTTLE_LIMIT = process.env.LOGIN_THROTTLE_LIMIT ?? '10000';
process.env.LOGIN_THROTTLE_TTL = process.env.LOGIN_THROTTLE_TTL ?? '60000';
