import 'reflect-metadata';

process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';
process.env.FRONTEND_URL = process.env.FRONTEND_URL ?? 'http://localhost:3000';

// Redis de test (docker-compose.test.yml usa puerto 6380)
process.env.REDIS_PORT = process.env.REDIS_PORT ?? '6380';

// Rate limiting global (alto para tests)
process.env.RATE_LIMIT_TTL = process.env.RATE_LIMIT_TTL ?? '60000';
process.env.RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ?? '100000';

// Login throttle: Mantenemos valores de producción (5 req/min)
// Los tests de auth usan IPs únicas para evitar throttle (ver auth.helpers.ts)
// Los tests de throttle-login usan IPs fijas para verificar que funciona
// LOGIN_THROTTLE_LIMIT y LOGIN_THROTTLE_TTL no se modifican aquí
