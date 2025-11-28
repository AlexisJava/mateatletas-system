import { Test, TestingModule } from '@nestjs/testing';
import { PaymentAmountValidatorService } from '../payment-amount-validator.service';
import { PrismaService } from '../../../core/database/prisma.service';
import { RedisService } from '../../../core/redis/redis.service';
import { BadRequestException } from '@nestjs/common';

/**
 * Test Suite: PaymentAmountValidatorService - Redis Caching (PASO 3.1.B)
 *
 * OBJETIVO: Optimizar validaciones de monto con caching de Redis
 *
 * PROBLEMA (ANTES):
 * - validateInscripcionMensual() consulta DB cada vez: 50-100ms
 * - validateMembresia() consulta DB cada vez: 50-100ms
 * - validateInscripcion2026() consulta DB cada vez: 50-100ms
 * - validatePagoInscripcion2026() consulta DB cada vez: 50-100ms
 * - validateColoniaPago() consulta DB cada vez: 50-100ms
 * - MercadoPago reintenta webhooks → mismas queries repetidas
 *
 * SOLUCIÓN (DESPUÉS):
 * - Validaciones verifican cache primero: <5ms (cache hit)
 * - Solo consulta DB en cache miss
 * - Guarda resultado en cache (TTL: 120s = 2 minutos)
 * - Cache hit rate esperado: >70%
 *
 * BENCHMARK ESPERADO:
 * - Cache hit: <5ms (vs 50-100ms DB)
 * - Cache miss: 50-100ms (DB) + guardar en cache
 * - Mejora global: 70-80% más rápido
 */
describe('PaymentAmountValidatorService - Redis Caching (PASO 3.1.B)', () => {
  let service: PaymentAmountValidatorService;
  let prisma: PrismaService;
  let redis: RedisService;

  const mockPrismaService = {
    inscripcionMensual: {
      findUnique: jest.fn(),
    },
    membresia: {
      findUnique: jest.fn(),
    },
    inscripcion2026: {
      findUnique: jest.fn(),
    },
    pagoInscripcion2026: {
      findUnique: jest.fn(),
    },
    coloniaPago: {
      findUnique: jest.fn(),
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
        PaymentAmountValidatorService,
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

    service = module.get<PaymentAmountValidatorService>(
      PaymentAmountValidatorService,
    );
    prisma = module.get<PrismaService>(PrismaService);
    redis = module.get<RedisService>(RedisService);

    jest.clearAllMocks();
  });

  /**
   * TEST 1: Cache HIT - validateInscripcionMensual() retorna desde cache
   *
   * ESCENARIO: Inscripción mensual ya está cacheada
   * ESPERADO: Retorna resultado desde cache, NO consulta DB
   * BENCHMARK: <5ms (vs 50-100ms sin cache)
   */
  it('debe retornar InscripcionMensual desde cache (cache hit)', async () => {
    const inscripcionId = 'inscripcion-123';
    const receivedAmount = 10000;

    // Arrange: Cache tiene precio_final cacheado
    mockRedisService.get.mockResolvedValue('10000');

    // Act
    const result = await service.validateInscripcionMensual(
      inscripcionId,
      receivedAmount,
    );

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(10000);
    expect(result.receivedAmount).toBe(10000);

    // Verificó cache
    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:InscripcionMensual:${inscripcionId}`,
    );

    // NO consultó DB
    expect(
      mockPrismaService.inscripcionMensual.findUnique,
    ).not.toHaveBeenCalled();
  });

  /**
   * TEST 2: Cache MISS - validateInscripcionMensual() consulta DB y cachea
   *
   * ESCENARIO: Cache vacío, necesita consultar DB
   * ESPERADO:
   * 1. Verifica cache → null (miss)
   * 2. Consulta DB → encuentra inscripción
   * 3. Guarda precio_final en cache con TTL 120s
   * 4. Retorna resultado de validación
   */
  it('debe consultar DB en cache miss y guardar resultado (InscripcionMensual)', async () => {
    const inscripcionId = 'inscripcion-456';
    const receivedAmount = 5000;

    // Arrange: Cache miss
    mockRedisService.get.mockResolvedValue(null);

    // DB tiene el registro
    mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
      precio_final: 5000,
    });

    // Act
    const result = await service.validateInscripcionMensual(
      inscripcionId,
      receivedAmount,
    );

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(5000);

    // 1. Verificó cache
    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:InscripcionMensual:${inscripcionId}`,
    );

    // 2. Consultó DB
    expect(
      mockPrismaService.inscripcionMensual.findUnique,
    ).toHaveBeenCalledWith({
      where: { id: inscripcionId },
      select: { precio_final: true },
    });

    // 3. Guardó en cache con TTL 120s
    expect(mockRedisService.set).toHaveBeenCalledWith(
      `payment:amount:InscripcionMensual:${inscripcionId}`,
      '5000',
      120, // TTL: 2 minutos
    );
  });

  /**
   * TEST 3: Cache HIT - validateMembresia() retorna desde cache
   *
   * ESCENARIO: Membresía cacheada
   * ESPERADO: Cache hit, sin consulta a DB
   */
  it('debe retornar Membresia desde cache (cache hit)', async () => {
    const membresiaId = 'membresia-789';
    const receivedAmount = 15000;

    // Arrange: Cache tiene precio
    mockRedisService.get.mockResolvedValue('15000');

    // Act
    const result = await service.validateMembresia(membresiaId, receivedAmount);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(15000);

    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:Membresia:${membresiaId}`,
    );
    expect(mockPrismaService.membresia.findUnique).not.toHaveBeenCalled();
  });

  /**
   * TEST 4: Cache MISS - validateMembresia() consulta DB
   *
   * ESCENARIO: Cache vacío
   * ESPERADO: Consulta DB, guarda en cache
   */
  it('debe consultar DB en cache miss y guardar resultado (Membresia)', async () => {
    const membresiaId = 'membresia-101';
    const receivedAmount = 20000;

    // Arrange: Cache miss
    mockRedisService.get.mockResolvedValue(null);

    mockPrismaService.membresia.findUnique.mockResolvedValue({
      producto: {
        precio: 20000,
      },
    });

    // Act
    const result = await service.validateMembresia(membresiaId, receivedAmount);

    // Assert
    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(20000);

    expect(mockRedisService.get).toHaveBeenCalled();
    expect(mockPrismaService.membresia.findUnique).toHaveBeenCalledWith({
      where: { id: membresiaId },
      include: { producto: true },
    });
    expect(mockRedisService.set).toHaveBeenCalledWith(
      `payment:amount:Membresia:${membresiaId}`,
      '20000',
      120,
    );
  });

  /**
   * TEST 5: Cache HIT - validateInscripcion2026()
   */
  it('debe retornar Inscripcion2026 desde cache (cache hit)', async () => {
    const inscripcionId = 'ins2026-111';
    const receivedAmount = 12000;

    mockRedisService.get.mockResolvedValue('12000');

    const result = await service.validateInscripcion2026(
      inscripcionId,
      receivedAmount,
    );

    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(12000);

    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:Inscripcion2026:${inscripcionId}`,
    );
    expect(mockPrismaService.inscripcion2026.findUnique).not.toHaveBeenCalled();
  });

  /**
   * TEST 6: Cache MISS - validateInscripcion2026()
   */
  it('debe consultar DB en cache miss (Inscripcion2026)', async () => {
    const inscripcionId = 'ins2026-222';
    const receivedAmount = 8000;

    mockRedisService.get.mockResolvedValue(null);

    mockPrismaService.inscripcion2026.findUnique.mockResolvedValue({
      total_mensual_actual: 8000,
    });

    const result = await service.validateInscripcion2026(
      inscripcionId,
      receivedAmount,
    );

    expect(result.isValid).toBe(true);
    expect(mockPrismaService.inscripcion2026.findUnique).toHaveBeenCalled();
    expect(mockRedisService.set).toHaveBeenCalledWith(
      `payment:amount:Inscripcion2026:${inscripcionId}`,
      '8000',
      120,
    );
  });

  /**
   * TEST 7: Cache HIT - validatePagoInscripcion2026()
   */
  it('debe retornar PagoInscripcion2026 desde cache (cache hit)', async () => {
    const pagoId = 'pago-333';
    const receivedAmount = 3000;

    mockRedisService.get.mockResolvedValue('3000');

    const result = await service.validatePagoInscripcion2026(
      pagoId,
      receivedAmount,
    );

    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(3000);

    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:PagoInscripcion2026:${pagoId}`,
    );
    expect(
      mockPrismaService.pagoInscripcion2026.findUnique,
    ).not.toHaveBeenCalled();
  });

  /**
   * TEST 8: Cache MISS - validatePagoInscripcion2026()
   */
  it('debe consultar DB en cache miss (PagoInscripcion2026)', async () => {
    const pagoId = 'pago-444';
    const receivedAmount = 2500;

    mockRedisService.get.mockResolvedValue(null);

    mockPrismaService.pagoInscripcion2026.findUnique.mockResolvedValue({
      monto: 2500,
      tipo: 'mensualidad',
    });

    const result = await service.validatePagoInscripcion2026(
      pagoId,
      receivedAmount,
    );

    expect(result.isValid).toBe(true);
    expect(mockPrismaService.pagoInscripcion2026.findUnique).toHaveBeenCalled();
    expect(mockRedisService.set).toHaveBeenCalledWith(
      `payment:amount:PagoInscripcion2026:${pagoId}`,
      '2500',
      120,
    );
  });

  /**
   * TEST 9: Cache HIT - validateColoniaPago()
   */
  it('debe retornar ColoniaPago desde cache (cache hit)', async () => {
    const pagoId = 'colonia-555';
    const receivedAmount = 7000;

    mockRedisService.get.mockResolvedValue('7000');

    const result = await service.validateColoniaPago(pagoId, receivedAmount);

    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(7000);

    expect(mockRedisService.get).toHaveBeenCalledWith(
      `payment:amount:ColoniaPago:${pagoId}`,
    );
    expect(mockPrismaService.coloniaPago.findUnique).not.toHaveBeenCalled();
  });

  /**
   * TEST 10: Cache MISS - validateColoniaPago()
   */
  it('debe consultar DB en cache miss (ColoniaPago)', async () => {
    const pagoId = 'colonia-666';
    const receivedAmount = 9000;

    mockRedisService.get.mockResolvedValue(null);

    mockPrismaService.coloniaPago.findUnique.mockResolvedValue({
      monto: 9000,
    });

    const result = await service.validateColoniaPago(pagoId, receivedAmount);

    expect(result.isValid).toBe(true);
    expect(mockPrismaService.coloniaPago.findUnique).toHaveBeenCalled();
    expect(mockRedisService.set).toHaveBeenCalledWith(
      `payment:amount:ColoniaPago:${pagoId}`,
      '9000',
      120,
    );
  });

  /**
   * TEST 11: Fallback a DB si Redis falla
   *
   * ESCENARIO: Redis no disponible (get() lanza error)
   * ESPERADO: Continúa con DB sin fallar (resilience)
   */
  it('debe hacer fallback a DB si Redis falla', async () => {
    const inscripcionId = 'inscripcion-fallback';
    const receivedAmount = 4000;

    // Arrange: Redis falla
    mockRedisService.get.mockRejectedValue(new Error('Redis connection error'));

    // DB funciona correctamente
    mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
      precio_final: 4000,
    });

    // Act
    const result = await service.validateInscripcionMensual(
      inscripcionId,
      receivedAmount,
    );

    // Assert: Retorna resultado de DB sin fallar
    expect(result.isValid).toBe(true);
    expect(result.expectedAmount).toBe(4000);
    expect(mockPrismaService.inscripcionMensual.findUnique).toHaveBeenCalled();
  });

  /**
   * TEST 12: Cache invalida formato de cache key
   *
   * ESCENARIO: Verificar que las claves de cache tienen el formato correcto
   * ESPERADO: "payment:amount:{EntityType}:{entityId}"
   */
  it('debe usar formato de cache key correcto', async () => {
    mockRedisService.get.mockResolvedValue(null);
    mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
      precio_final: 1000,
    });

    await service.validateInscripcionMensual('test-id', 1000);

    expect(mockRedisService.get).toHaveBeenCalledWith(
      'payment:amount:InscripcionMensual:test-id',
    );
    expect(mockRedisService.set).toHaveBeenCalledWith(
      'payment:amount:InscripcionMensual:test-id',
      '1000',
      120,
    );
  });

  /**
   * TEST 13: TTL correcto de 120 segundos (2 minutos)
   *
   * ESCENARIO: Verificar que el TTL es el esperado
   * ESPERADO: TTL = 120s (2 minutos)
   *
   * RAZÓN:
   * - Más corto que webhooks (300s) porque precios pueden cambiar
   * - Suficientemente largo para aprovechar cache en reintentos de MP
   */
  it('debe usar TTL de 120 segundos en cache', async () => {
    mockRedisService.get.mockResolvedValue(null);
    mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue({
      precio_final: 5500,
    });

    await service.validateInscripcionMensual('ttl-test', 5500);

    expect(mockRedisService.set).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      120, // ← TTL debe ser 120s
    );
  });

  /**
   * TEST 14: Cache no interfiere con validación de monto
   *
   * ESCENARIO: Monto inválido (diferencia > 1%) debe ser rechazado
   * ESPERADO: Resultado de validación correcto incluso con cache
   */
  it('debe validar correctamente incluso con cache (monto inválido)', async () => {
    const inscripcionId = 'inscripcion-fraude';
    const expectedAmount = 10000;
    const receivedAmount = 5000; // 50% menos → FRAUDE

    // Cache tiene el precio esperado
    mockRedisService.get.mockResolvedValue('10000');

    const result = await service.validateInscripcionMensual(
      inscripcionId,
      receivedAmount,
    );

    // Validación debe fallar
    expect(result.isValid).toBe(false);
    expect(result.expectedAmount).toBe(10000);
    expect(result.receivedAmount).toBe(5000);
    expect(result.reason).toContain('Amount mismatch');
  });

  /**
   * TEST 15: NotFound exception cuando entidad no existe (sin cache)
   *
   * ESCENARIO: Cache miss + DB retorna null
   * ESPERADO: BadRequestException
   */
  it('debe lanzar BadRequestException cuando inscripción no existe', async () => {
    mockRedisService.get.mockResolvedValue(null);
    mockPrismaService.inscripcionMensual.findUnique.mockResolvedValue(null);

    await expect(
      service.validateInscripcionMensual('non-existent', 1000),
    ).rejects.toThrow(BadRequestException);
  });
});

/**
 * MÉTRICAS ESPERADAS (PASO 3.1.B):
 *
 * ANTES (sin caching):
 * - validateInscripcionMensual() latencia: 50-100ms (query DB)
 * - validateMembresia() latencia: 80-120ms (query DB + join)
 * - validateInscripcion2026() latencia: 50-100ms
 * - Total validaciones por webhook: 100-200ms
 *
 * DESPUÉS (con Redis):
 * - Cache hit: <5ms (mejora 95%)
 * - Cache miss: 50-100ms (DB) + guardar en cache
 * - Cache hit rate esperado: 70% (MP reintenta webhooks)
 * - Total validaciones: 70% hits (<5ms) + 30% misses (100ms) = ~35ms
 * - Mejora: 80% más rápido
 *
 * CACHE HIT RATE: >70%
 * - Primer webhook: cache miss (consulta DB)
 * - Reintentos MP: cache hit (desde Redis)
 * - Webhooks paralelos: cache hit si mismo payment_id
 */
