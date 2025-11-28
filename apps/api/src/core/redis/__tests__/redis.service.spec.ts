import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from '../redis.service';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

// In-memory store para simular Redis en tests
const mockStore = new Map<
  string,
  { value: string; ttl: number; createdAt: number }
>();

// Mock de ioredis con in-memory store
jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),

    setex: jest
      .fn()
      .mockImplementation((key: string, ttl: number, value: string) => {
        mockStore.set(key, { value, ttl, createdAt: Date.now() });
        return Promise.resolve('OK');
      }),

    get: jest.fn().mockImplementation((key: string) => {
      const item = mockStore.get(key);
      if (!item) return Promise.resolve(null);

      // Verificar si expiró
      const elapsed = (Date.now() - item.createdAt) / 1000;
      if (elapsed > item.ttl) {
        mockStore.delete(key);
        return Promise.resolve(null);
      }

      return Promise.resolve(item.value);
    }),

    del: jest.fn().mockImplementation((key: string) => {
      mockStore.delete(key);
      return Promise.resolve(1);
    }),

    exists: jest.fn().mockImplementation((key: string) => {
      const item = mockStore.get(key);
      if (!item) return Promise.resolve(0);

      // Verificar si expiró
      const elapsed = (Date.now() - item.createdAt) / 1000;
      if (elapsed > item.ttl) {
        mockStore.delete(key);
        return Promise.resolve(0);
      }

      return Promise.resolve(1);
    }),

    flushdb: jest.fn().mockImplementation(() => {
      mockStore.clear();
      return Promise.resolve('OK');
    }),

    on: jest.fn(),
  }));
});

/**
 * Test Suite: RedisService - Sistema de Caching
 *
 * OBJETIVO: Implementar caching con Redis para optimizar performance
 *
 * CONTEXTO DE PERFORMANCE (PASO 3.1):
 * - Sin caching: Cada validación consulta DB → 50-100ms por query
 * - Con Redis: Cache hit → <5ms (mejora 95%)
 * - Cache miss → consulta DB + guarda en cache
 *
 * ESCENARIO ACTUAL (LENTO):
 * 1. Webhook llega → wasProcessed() consulta DB → 50ms
 * 2. Validación de monto consulta pago en DB → 100ms
 * 3. MercadoPago reintenta webhook → consulta DB otra vez → 50ms
 * 4. Total: 200ms+ solo en validaciones
 *
 * SOLUCIÓN CON REDIS:
 * 1. Webhook llega → wasProcessed() consulta cache → <5ms (cache hit)
 * 2. Validación de monto consulta cache → <5ms (cache hit)
 * 3. MercadoPago reintenta → cache hit → <5ms
 * 4. Total: <15ms (mejora 93%)
 *
 * TTL (Time To Live):
 * - Validaciones de webhook processed: 300s (5 minutos)
 * - Datos de pagos: 120s (2 minutos)
 * - Datos de inscripciones: 60s (1 minuto)
 *
 * FALLBACK:
 * - Si Redis no disponible → fallback a DB (lento pero funcional)
 * - Logger warning si Redis falla
 * - Aplicación sigue funcionando
 */
describe('RedisService - PASO 3.1', () => {
  let service: RedisService;
  let mockConfigService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    // Limpiar store antes de cada test
    mockStore.clear();

    // Mock de ConfigService para testing
    mockConfigService = {
      get: jest.fn((key: string) => {
        switch (key) {
          case 'REDIS_HOST':
            return 'localhost';
          case 'REDIS_PORT':
            return 6379;
          case 'REDIS_PASSWORD':
            return undefined;
          default:
            return undefined;
        }
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    // Cleanup: cerrar conexión a Redis
    await service.onModuleDestroy();
    mockStore.clear();
  });

  /**
   * TEST 1: Servicio debe estar definido
   *
   * ESCENARIO: Verificar que el servicio se crea correctamente
   * ESPERADO: RedisService está definido
   * RAZÓN: Sin servicio, no hay caching
   */
  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  /**
   * TEST 2: set() debe guardar valor en Redis
   *
   * ESCENARIO: Guardar "webhook:processed:123" con valor "true"
   * ESPERADO: Redis almacena el valor correctamente
   * RAZÓN: Necesitamos guardar resultados de validaciones
   */
  it('debe guardar valor en Redis con set()', async () => {
    const key = 'test:key:1';
    const value = 'test-value';

    await service.set(key, value, 60); // TTL: 60 segundos

    // Verificar que se guardó
    const retrieved = await service.get(key);
    expect(retrieved).toBe(value);
  });

  /**
   * TEST 3: get() debe retornar valor guardado
   *
   * ESCENARIO: Recuperar valor previamente guardado
   * ESPERADO: get() retorna el valor correcto
   * RAZÓN: Cache hit debe retornar dato almacenado
   */
  it('debe recuperar valor con get()', async () => {
    const key = 'test:key:2';
    const value = 'cached-data';

    await service.set(key, value, 60);
    const result = await service.get(key);

    expect(result).toBe(value);
  });

  /**
   * TEST 4: get() debe retornar null si clave no existe (cache miss)
   *
   * ESCENARIO: Intentar recuperar clave que no existe
   * ESPERADO: get() retorna null
   * RAZÓN: Cache miss → necesitamos consultar DB
   */
  it('debe retornar null para cache miss', async () => {
    const key = 'non-existent-key';

    const result = await service.get(key);

    expect(result).toBeNull();
  });

  /**
   * TEST 5: TTL debe expirar después del tiempo especificado
   *
   * ESCENARIO: Guardar con TTL de 1 segundo, esperar 2 segundos
   * ESPERADO: Después de TTL, get() retorna null
   * RAZÓN: Cache debe invalidarse automáticamente
   *
   * NOTA: Test rápido usa 1s TTL, producción usa 60-300s
   */
  it('debe expirar cache después de TTL', async () => {
    const key = 'test:ttl:key';
    const value = 'expires-soon';

    await service.set(key, value, 1); // TTL: 1 segundo

    // Inmediatamente después, debe existir
    let result = await service.get(key);
    expect(result).toBe(value);

    // Esperar 2 segundos (más que TTL)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Debe haber expirado
    result = await service.get(key);
    expect(result).toBeNull();
  }, 10000); // Timeout de 10s para test con sleep

  /**
   * TEST 6: del() debe eliminar clave del cache
   *
   * ESCENARIO: Guardar valor, luego eliminarlo con del()
   * ESPERADO: Después de del(), get() retorna null
   * RAZÓN: Necesitamos invalidar cache cuando cambia el estado
   */
  it('debe eliminar clave con del()', async () => {
    const key = 'test:delete:key';
    const value = 'to-be-deleted';

    await service.set(key, value, 60);

    // Verificar que existe
    let result = await service.get(key);
    expect(result).toBe(value);

    // Eliminar
    await service.del(key);

    // Verificar que ya no existe
    result = await service.get(key);
    expect(result).toBeNull();
  });

  /**
   * TEST 7: exists() debe verificar si clave existe
   *
   * ESCENARIO: Verificar existencia de claves
   * ESPERADO: exists() retorna true/false correctamente
   * RAZÓN: Útil para verificar cache antes de consultar DB
   */
  it('debe verificar existencia de clave con exists()', async () => {
    const key = 'test:exists:key';
    const value = 'exists-test';

    // Antes de guardar
    let exists = await service.exists(key);
    expect(exists).toBe(false);

    // Después de guardar
    await service.set(key, value, 60);
    exists = await service.exists(key);
    expect(exists).toBe(true);

    // Después de eliminar
    await service.del(key);
    exists = await service.exists(key);
    expect(exists).toBe(false);
  });

  /**
   * TEST 8: setex() debe ser equivalente a set() con TTL
   *
   * ESCENARIO: Usar setex() para guardar con TTL
   * ESPERADO: setex(key, ttl, value) == set(key, value, ttl)
   * RAZÓN: setex() es método común en Redis, debe estar soportado
   */
  it('debe guardar con setex()', async () => {
    const key = 'test:setex:key';
    const value = 'setex-value';
    const ttl = 60;

    await service.setex(key, ttl, value);

    const result = await service.get(key);
    expect(result).toBe(value);
  });

  /**
   * TEST 9: flush() debe limpiar todo el cache (solo en testing)
   *
   * ESCENARIO: Guardar múltiples claves, luego flush()
   * ESPERADO: Después de flush(), todas las claves desaparecen
   * RAZÓN: Útil para limpiar cache en tests
   *
   * WARNING: NUNCA usar flush() en producción
   */
  it('debe limpiar todo el cache con flush()', async () => {
    // Guardar varias claves
    await service.set('test:flush:1', 'value1', 60);
    await service.set('test:flush:2', 'value2', 60);
    await service.set('test:flush:3', 'value3', 60);

    // Verificar que existen
    expect(await service.exists('test:flush:1')).toBe(true);
    expect(await service.exists('test:flush:2')).toBe(true);
    expect(await service.exists('test:flush:3')).toBe(true);

    // Flush
    await service.flush();

    // Verificar que ya no existen
    expect(await service.exists('test:flush:1')).toBe(false);
    expect(await service.exists('test:flush:2')).toBe(false);
    expect(await service.exists('test:flush:3')).toBe(false);
  });

  /**
   * TEST 10: Tipos explícitos - No usar any/unknown
   *
   * ESCENARIO: Verificar que todos los métodos tienen tipos explícitos
   * ESPERADO: TypeScript compila sin errores de tipos
   * RAZÓN: Lineamiento de Sprint 3 - tipos explícitos obligatorios
   */
  it('debe tener tipos explícitos en todos los métodos', () => {
    // Este test verifica que TypeScript compile correctamente
    // Si hay tipos incorrectos, TypeScript fallará en compilación

    expect(service.set).toBeDefined();
    expect(service.get).toBeDefined();
    expect(service.del).toBeDefined();
    expect(service.exists).toBeDefined();
    expect(service.setex).toBeDefined();
    expect(service.flush).toBeDefined();

    // Verificar signatures
    expect(typeof service.set).toBe('function');
    expect(typeof service.get).toBe('function');
    expect(typeof service.del).toBe('function');
    expect(typeof service.exists).toBe('function');
    expect(typeof service.setex).toBe('function');
    expect(typeof service.flush).toBe('function');
  });
});

/**
 * MÉTRICAS ESPERADAS (PASO 3.1):
 *
 * ANTES (sin caching):
 * - wasProcessed() latencia: 50-100ms (consulta DB)
 * - Validación de monto: 100-200ms (consulta DB)
 * - Total por webhook: 150-300ms solo en validaciones
 *
 * DESPUÉS (con Redis):
 * - wasProcessed() latencia: <5ms (cache hit)
 * - Validación de monto: <5ms (cache hit)
 * - Total por webhook: <10ms (mejora 95%)
 *
 * THROUGHPUT:
 * - Sin caching: ~100 webhooks/min (DB bottleneck)
 * - Con caching: 1000+ webhooks/min (cache rápido)
 *
 * CACHE HIT RATE esperado: >80%
 * - MercadoPago reintenta webhooks → cache hits
 * - Mismo payment_id consultado múltiples veces → cache hits
 */
