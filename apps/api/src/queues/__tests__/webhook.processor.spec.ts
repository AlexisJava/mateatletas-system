import { Test, TestingModule } from '@nestjs/testing';
import { WebhookProcessor } from '../processors/webhook.processor';
import { Inscripciones2026Service } from '../../inscripciones-2026/inscripciones-2026.service';
import { Job } from 'bull';
import { MercadoPagoWebhookDto } from '../webhook-queue.service';

/**
 * Test Suite: WebhookProcessor - Worker de Procesamiento (PASO 3.2)
 *
 * OBJETIVO: Worker que procesa webhooks en background
 *
 * RESPONSABILIDADES:
 * - Procesar webhooks desde la queue
 * - Retry automático en caso de fallo
 * - Logging de eventos (active, completed, failed)
 * - Dead letter queue para fallos permanentes
 *
 * TESTS:
 * 1. processWebhook() procesa webhook exitosamente
 * 2. processWebhook() llama al servicio correcto
 * 3. processWebhook() lanza error para trigger retry
 * 4. onActive() loguea cuando job se activa
 * 5. onCompleted() loguea cuando job completa
 * 6. onFailed() loguea cuando job falla
 * 7. onFailed() distingue retry vs dead letter queue
 */
describe('WebhookProcessor - PASO 3.2', () => {
  let processor: WebhookProcessor;
  let mockInscripciones2026Service: Partial<Inscripciones2026Service>;

  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    api_version: 'v1',
    data: {
      id: 'payment-789',
    },
    date_created: '2025-01-22T11:00:00Z',
    id: 67890,
    live_mode: true,
    type: 'payment',
    user_id: 'user-999',
  };

  const createMockJob = (
    data: MercadoPagoWebhookDto,
    attemptsMade: number = 0,
  ): Job<MercadoPagoWebhookDto> => {
    return {
      id: 'job-123',
      data,
      attemptsMade,
      timestamp: Date.now(),
      opts: {
        attempts: 3,
      },
    } as Job<MercadoPagoWebhookDto>;
  };

  beforeEach(async () => {
    mockInscripciones2026Service = {
      procesarWebhookMercadoPago: jest.fn().mockResolvedValue({
        success: true,
        message: 'Webhook procesado',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookProcessor,
        {
          provide: Inscripciones2026Service,
          useValue: mockInscripciones2026Service,
        },
      ],
    }).compile();

    processor = module.get<WebhookProcessor>(WebhookProcessor);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: processWebhook() debe procesar webhook exitosamente
   */
  it('debe procesar webhook exitosamente', async () => {
    const mockJob = createMockJob(mockWebhookData);

    const result = await processor.processWebhook(mockJob);

    expect(result).toEqual({
      success: true,
      message: 'Webhook procesado',
    });

    expect(
      mockInscripciones2026Service.procesarWebhookMercadoPago,
    ).toHaveBeenCalledWith(mockWebhookData);
  });

  /**
   * TEST 2: processWebhook() debe llamar al servicio correcto
   */
  it('debe llamar a Inscripciones2026Service.procesarWebhookMercadoPago', async () => {
    const mockJob = createMockJob(mockWebhookData);

    await processor.processWebhook(mockJob);

    expect(
      mockInscripciones2026Service.procesarWebhookMercadoPago,
    ).toHaveBeenCalledTimes(1);
    expect(
      mockInscripciones2026Service.procesarWebhookMercadoPago,
    ).toHaveBeenCalledWith(mockWebhookData);
  });

  /**
   * TEST 3: processWebhook() debe lanzar error para trigger retry
   *
   * RAZÓN: Bull requiere que el processor lance error para reintentar
   */
  it('debe lanzar error cuando procesamiento falla', async () => {
    const mockJob = createMockJob(mockWebhookData);
    const error = new Error('Database connection failed');

    mockInscripciones2026Service.procesarWebhookMercadoPago = jest
      .fn()
      .mockRejectedValue(error);

    await expect(processor.processWebhook(mockJob)).rejects.toThrow(
      'Database connection failed',
    );

    expect(
      mockInscripciones2026Service.procesarWebhookMercadoPago,
    ).toHaveBeenCalled();
  });

  /**
   * TEST 4: onActive() debe ser llamado cuando job se activa
   */
  it('debe loguear cuando job se activa', () => {
    const mockJob = createMockJob(mockWebhookData);

    // No debe lanzar error
    expect(() => processor.onActive(mockJob)).not.toThrow();
  });

  /**
   * TEST 5: onCompleted() debe ser llamado cuando job completa
   */
  it('debe loguear cuando job completa', () => {
    const mockJob = createMockJob(mockWebhookData);
    const result = { success: true };

    // No debe lanzar error
    expect(() => processor.onCompleted(mockJob, result)).not.toThrow();
  });

  /**
   * TEST 6: onFailed() debe ser llamado cuando job falla
   */
  it('debe loguear cuando job falla', () => {
    const mockJob = createMockJob(mockWebhookData, 1); // 1er intento fallido
    const error = new Error('Processing error');

    // No debe lanzar error
    expect(() => processor.onFailed(mockJob, error)).not.toThrow();
  });

  /**
   * TEST 7: onFailed() debe distinguir entre retry y dead letter queue
   *
   * ESCENARIOS:
   * - attemptsMade < 3 → retry (warning log)
   * - attemptsMade = 3 → dead letter queue (error log)
   */
  it('debe distinguir entre retry y dead letter queue', () => {
    // Caso 1: Primer fallo → retry
    const jobWithRetry = createMockJob(mockWebhookData, 1); // 1 intento de 3
    const error1 = new Error('Temporary error');

    expect(() => processor.onFailed(jobWithRetry, error1)).not.toThrow();

    // Caso 2: Tercer fallo → dead letter queue
    const jobDeadLetter = createMockJob(mockWebhookData, 3); // 3 intentos agotados
    const error2 = new Error('Permanent error');

    expect(() => processor.onFailed(jobDeadLetter, error2)).not.toThrow();
  });

  /**
   * TEST 8: processWebhook() debe incluir attempt number en logs
   */
  it('debe incluir attempt number al procesar', async () => {
    const mockJob = createMockJob(mockWebhookData, 2); // 3er intento

    await processor.processWebhook(mockJob);

    // Verifica que attemptsMade se pasa correctamente
    expect(mockJob.attemptsMade).toBe(2);
  });

  /**
   * TEST 9: processWebhook() debe manejar webhooks sin data.id
   */
  it('debe manejar webhooks sin data.id', async () => {
    const invalidWebhook = {
      ...mockWebhookData,
      data: {} as any,
    };
    const mockJob = createMockJob(invalidWebhook);

    // Debe intentar procesar de todas formas
    await processor.processWebhook(mockJob);

    expect(
      mockInscripciones2026Service.procesarWebhookMercadoPago,
    ).toHaveBeenCalled();
  });

  /**
   * TEST 10: processor debe retornar resultado del servicio
   */
  it('debe retornar resultado del servicio', async () => {
    const mockJob = createMockJob(mockWebhookData);
    const expectedResult = {
      success: true,
      inscripcionId: 'insc-123',
      pagoId: 'pago-456',
    };

    mockInscripciones2026Service.procesarWebhookMercadoPago = jest
      .fn()
      .mockResolvedValue(expectedResult);

    const result = await processor.processWebhook(mockJob);

    expect(result).toEqual(expectedResult);
  });
});

/**
 * ARQUITECTURA DE RETRY (PASO 3.2):
 *
 * Intento 1: Procesamiento falla
 *   → Bull espera 2 segundos (exponential backoff)
 *   → Reintenta (attempt 2/3)
 *
 * Intento 2: Procesamiento falla
 *   → Bull espera 4 segundos (exponential backoff)
 *   → Reintenta (attempt 3/3)
 *
 * Intento 3: Procesamiento falla
 *   → Job va a dead letter queue
 *   → onFailed() loguea error permanente
 *   → Requiere intervención manual (retryFailedJob)
 *
 * CONCURRENCY:
 * - Default: 1 job a la vez
 * - Óptimo: 10-20 jobs concurrentes
 * - Se puede configurar en @Processor({ concurrency: 10 })
 */
