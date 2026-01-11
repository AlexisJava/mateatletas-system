/**
 * ============================================================================
 * ENVIRONMENT SETUP - Variables de Entorno para Tests
 * ============================================================================
 *
 * Este archivo se ejecuta ANTES de que Jest cargue cualquier módulo.
 * Usa `setupFiles` (no `setupFilesAfterEnv`) para garantizar que las
 * variables de entorno estén disponibles cuando NestJS compile los módulos.
 *
 * IMPORTANTE: Este archivo es JavaScript puro (no TypeScript) porque
 * se ejecuta antes de que ts-jest procese los archivos.
 */

// Core
process.env.NODE_ENV = process.env.NODE_ENV || 'test';

// Auth - Secrets requeridos por SecretRotationService
process.env.JWT_SECRET =
  process.env.JWT_SECRET || 'test-jwt-secret-for-integration-tests';
process.env.MERCADOPAGO_WEBHOOK_SECRET =
  process.env.MERCADOPAGO_WEBHOOK_SECRET ||
  'test-webhook-secret-for-integration-tests';

// URLs
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Redis de test (docker-compose.test.yml usa puerto 6380)
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6380';

// Rate limiting - Alto para tests
process.env.RATE_LIMIT_TTL = process.env.RATE_LIMIT_TTL || '60000';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX || '100000';

// Login throttle - Alto para tests de integración
process.env.LOGIN_THROTTLE_LIMIT = process.env.LOGIN_THROTTLE_LIMIT || '10000';
process.env.LOGIN_THROTTLE_TTL = process.env.LOGIN_THROTTLE_TTL || '60000';

// Database - Solo si no está configurada
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL =
    'postgresql://test:test_password_123@localhost:5433/mateatletas_test';
}
