import { Test, TestingModule } from '@nestjs/testing';
import { WebhookIdempotencyService } from '../webhook-idempotency.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';

/**
 * Test Suite: WebhookIdempotencyService - Redis Caching (PASO 3.1.B)
 *
 * OBJETIVO: Optimizar wasProcessed() con caching de Redis
 *
 * PROBLEMA (ANTES):
 * - wasProcessed() consulta DB cada vez: 50-100ms
 * - MercadoPago reintenta webhooks → misma query repetida
 * - 100 webhooks = 100 queries a DB = 5-10 segundos
 *
 * SOLUCIÓN (DESPUÉS):
 * - wasProcessed() verifica cache primero: <5ms (cache hit)
 * - Solo consulta DB en cache miss
 * - Guarda resultado en cache (TTL: 300s = 5 minutos)
 * - 100 webhooks con cache hit = <500ms (mejora 90%)
 *
 * BENCHMARK ESPERADO:
 * - Cache hit: <5ms (vs 50-100ms DB)
 * - Cache miss: 50-100ms (DB) + guardar en cache
 * - Cache hit rate esperado: >80% (MP reintenta webhooks)
 */
describe('WebhookIdempotencyService - Redis Caching (PASO 3.1.B)', () => {
  let service: WebhookIdempotencyService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    webhookProcessed: {
      findUnique: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    setex: jest.fn(),
    flush: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookIdempotencyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<WebhookIdempotencyService>(
      WebhookIdempotencyService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  /**
   * TEST 1: Cache HIT - wasProcessed() retorna desde cache sin consultar DB
   *
   * ESCENARIO: Webhook ya procesado, resultado en cache
   * ESPERADO: Retorna true desde cache, NO consulta DB
   * BENCHMARK: <5ms (vs 50-100ms sin cache)
   */
  it('debe retornar desde cache (cache hit) sin consultar DB', async () => {
    // Arrange: Cache tiene 'true' para este payment_id
    mockRedisService.get.mockResolvedValue('true');

    // Act
    const result = await service.wasProcessed('payment-123');

    // Assert
    expect(result).toBe(true);
    expect(mockRedisService.get).toHaveBeenCalledWith(
      'webhook:processed:payment-123',
    );
    expect(mockPrismaService.webhookProcessed.findUnique).not.toHaveBeenCalled(); // ← NO consulta DB
  });

  /**
   * TEST 2: Cache HIT con false - webhook NO procesado (cache negativo)
   *
   * ESCENARIO: Cache tiene 'false' (webhook no procesado)
   * ESPERADO: Retorna false desde cache, NO consulta DB
   * BENCHMARK: <5ms
   */
  it('debe retornar false desde cache cuando webhook no procesado', async () => {
    // Arrange: Cache tiene 'false'
    mockRedisService.get.mockResolvedValue('false');

    // Act
    const result = await service.wasProcessed('payment-456');

    // Assert
    expect(result).toBe(false);
    expect(mockRedisService.get).toHaveBeenCalledWith(
      'webhook:processed:payment-456',
    );
    expect(mockPrismaService.webhookProcessed.findUnique).not.toHaveBeenCalled();
  });

  /**
   * TEST 3: Cache MISS - consulta DB y guarda resultado en cache
   *
   * ESCENARIO: Cache vacío (null), necesita consultar DB
   * ESPERADO:
   * 1. Verifica cache → null (miss)
   * 2. Consulta DB → encuentra registro
   * 3. Guarda 'true' en cache con TTL 300s
   * 4. Retorna true
   *
   * BENCHMARK: 50-100ms (DB) + 5ms (guardar cache)
   */
  it('debe consultar DB en cache miss y guardar resultado', async () => {
    // Arrange: Cache miss
    mockRedisService.get.mockResolvedValue(null);

    // DB tiene el registro
    const mockWebhook = {
      id: 'webhook-1',
      payment_id: 'payment-789',
      webhook_type: 'payment',
      status: 'approved',
      external_reference: 'ref-123',
      processed_at: new Date('2025-01-15T10:00:00Z'),
    };
    mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(
      mockWebhook,
    );

    // Act
    const result = await service.wasProcessed('payment-789');

    // Assert
    expect(result).toBe(true);

    // 1. Verificó cache
    expect(mockRedisService.get).toHaveBeenCalledWith(
      'webhook:processed:payment-789',
    );

    // 2. Consultó DB
    expect(mockPrismaService.webhookProcessed.findUnique).toHaveBeenCalledWith({
      where: { payment_id: 'payment-789' },
    });

    // 3. Guardó resultado en cache con TTL 300s
    expect(mockRedisService.set).toHaveBeenCalledWith(
      'webhook:processed:payment-789',
      'true',
      300, // TTL: 5 minutos
    );
  });

  /**
   * TEST 4: Cache MISS con webhook NO procesado - guarda false en cache
   *
   * ESCENARIO: Cache vacío, DB retorna null (webhook no procesado)
   * ESPERADO:
   * 1. Cache miss → null
   * 2. DB retorna null
   * 3. Guarda 'false' en cache
   * 4. Retorna false
   */
  it('debe guardar false en cache cuando webhook no existe en DB', async () => {
    // Arrange: Cache miss
    mockRedisService.get.mockResolvedValue(null);

    // DB no tiene el registro
    mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(null);

    // Act
    const result = await service.wasProcessed('payment-new');

    // Assert
    expect(result).toBe(false);

    expect(mockRedisService.get).toHaveBeenCalled();
    expect(mockPrismaService.webhookProcessed.findUnique).toHaveBeenCalled();

    // Guardó 'false' en cache
    expect(mockRedisService.set).toHaveBeenCalledWith(
      'webhook:processed:payment-new',
      'false',
      300,
    );
  });

  /**
   * TEST 5: Fallback a DB si Redis falla
   *
   * ESCENARIO: Redis no disponible (get() lanza error)
   * ESPERADO: Continúa con DB sin fallar (resilience)
   *
   * RAZÓN: La app debe funcionar sin Redis (más lento pero funcional)
   */
  it('debe hacer fallback a DB si Redis falla', async () => {
    // Arrange: Redis falla
    mockRedisService.get.mockRejectedValue(new Error('Redis connection error'));

    // DB funciona correctamente
    mockPrismaService.webhookProcessed.findUnique.mockResolvedValue({
      id: 'webhook-1',
      payment_id: 'payment-fallback',
      processed_at: new Date(),
    });

    // Act
    const result = await service.wasProcessed('payment-fallback');

    // Assert: Retorna resultado de DB sin fallar
    expect(result).toBe(true);
    expect(mockPrismaService.webhookProcessed.findUnique).toHaveBeenCalled();
  });

  /**
   * TEST 6: markAsProcessed() invalida cache
   *
   * ESCENARIO: Después de marcar webhook como procesado
   * ESPERADO:
   * 1. Crea registro en DB
   * 2. Invalida cache (del) o actualiza cache (set 'true')
   *
   * RAZÓN: Evitar cache stale (cache dice 'false' pero DB tiene 'true')
   */
  it('debe invalidar cache después de markAsProcessed()', async () => {
    // Arrange
    const webhookData = {
      paymentId: 'payment-invalidate',
      webhookType: 'payment',
      status: 'approved',
      externalReference: 'ref-123',
    };

    mockPrismaService.webhookProcessed.create.mockResolvedValue({
      id: 'webhook-new',
      payment_id: 'payment-invalidate',
      webhook_type: 'payment',
      status: 'approved',
      external_reference: 'ref-123',
      processed_at: new Date(),
    });

    // Act
    await service.markAsProcessed(webhookData);

    // Assert: Cache fue invalidado O actualizado
    expect(
      mockRedisService.del.mock.calls.length > 0 ||
        mockRedisService.set.mock.calls.length > 0,
    ).toBe(true);
  });

  /**
   * TEST 7: TTL correcto de 300 segundos (5 minutos)
   *
   * ESCENARIO: Verificar que el TTL es el esperado
   * ESPERADO: TTL = 300s (5 minutos)
   *
   * RAZÓN:
   * - Muy corto (60s): muchos cache miss
   * - Muy largo (3600s): cache stale si cambia estado
   * - 300s: balance óptimo
   */
  it('debe usar TTL de 300 segundos en cache', async () => {
    // Arrange: Cache miss
    mockRedisService.get.mockResolvedValue(null);
    mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(null);

    // Act
    await service.wasProcessed('payment-ttl-test');

    // Assert: TTL correcto
    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      300, // ← TTL debe ser 300s
    );
  });

  /**
   * TEST 8: Cache key format correcto
   *
   * ESCENARIO: Verificar formato de las claves de cache
   * ESPERADO: "webhook:processed:{paymentId}"
   *
   * RAZÓN: Claves consistentes facilitan debugging y monitoring
   */
  it('debe usar formato de cache key correcto', async () => {
    // Arrange
    mockRedisService.get.mockResolvedValue(null);
    mockPrismaService.webhookProcessed.findUnique.mockResolvedValue(null);

    // Act
    await service.wasProcessed('test-payment-id');

    // Assert: Cache key con formato correcto
    expect(mockRedisService.get).toHaveBeenCalledWith(
      'webhook:processed:test-payment-id',
    );

    expect(mockRedisService.set).toHaveBeenCalledWith(
      'webhook:processed:test-payment-id',
      expect.any(String),
      expect.any(Number),
    );
  });
});

/**
 * MÉTRICAS ESPERADAS (PASO 3.1.B):
 *
 * ANTES (sin caching):
 * - wasProcessed() latencia: 50-100ms (query a DB)
 * - 100 webhooks = 100 queries = 5-10 segundos
 * - DB sobrecargado durante picos de tráfico
 *
 * DESPUÉS (con Redis):
 * - Cache hit: <5ms (mejora 95%)
 * - Cache miss: 50-100ms (DB) + guardar en cache
 * - 100 webhooks con 80% hit rate: 80 hits (<5ms) + 20 misses (100ms) = ~2.4s
 * - Mejora: 75% más rápido
 *
 * CACHE HIT RATE esperado: >80%
 * - MP reintenta webhooks → múltiples requests con mismo payment_id
 * - Primero: cache miss (consulta DB)
 * - Reintentos: cache hit (desde Redis)
 */