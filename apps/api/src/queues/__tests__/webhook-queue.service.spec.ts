import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bull';
import {
  WebhookQueueService,
  MercadoPagoWebhookDto,
} from '../webhook-queue.service';
import { Queue } from 'bull';

/**
 * Test Suite: WebhookQueueService - Queue Asíncrono (PASO 3.2)
 *
 * OBJETIVO: Sistema de queue para procesamiento asíncrono de webhooks
 *
 * PROBLEMA (ANTES):
 * - Procesamiento síncrono: endpoint espera 800-1200ms
 * - Picos de tráfico (100+ webhooks) → timeouts
 * - Servidor saturado → webhooks perdidos
 *
 * SOLUCIÓN (DESPUÉS):
 * - Queue asíncrono: endpoint retorna en <50ms
 * - Worker procesa en background
 * - Retry automático con exponential backoff
 * - Throughput: 1000+ webhooks/min
 *
 * TESTS:
 * 1. addWebhookJob() agrega job a queue
 * 2. Job tiene payment_id como jobId (evita duplicados)
 * 3. Job tiene retry config correcta (3 attempts, exponential backoff)
 * 4. getQueueStats() retorna estadísticas correctas
 * 5. getFailedJobs() retorna jobs fallidos
 * 6. retryFailedJob() reintenta job manualmente
 * 7. pauseQueue() y resumeQueue() funcionan
 */
describe('WebhookQueueService - PASO 3.2', () => {
  let service: WebhookQueueService;
  let mockQueue: Partial<Queue<MercadoPagoWebhookDto>>;

  const mockWebhookData: MercadoPagoWebhookDto = {
    action: 'payment.updated',
    api_version: 'v1',
    data: {
      id: 'payment-123',
    },
    date_created: '2025-01-22T10:00:00Z',
    id: 12345,
    live_mode: true,
    type: 'payment',
    user_id: 'user-456',
  };

  beforeEach(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({}),
      getWaitingCount: jest.fn().mockResolvedValue(5),
      getActiveCount: jest.fn().mockResolvedValue(2),
      getCompletedCount: jest.fn().mockResolvedValue(100),
      getFailedCount: jest.fn().mockResolvedValue(3),
      getDelayedCount: jest.fn().mockResolvedValue(0),
      getFailed: jest.fn().mockResolvedValue([]),
      getJob: jest.fn().mockResolvedValue({
        retry: jest.fn().mockResolvedValue(undefined),
      }),
      clean: jest.fn().mockResolvedValue(undefined),
      pause: jest.fn().mockResolvedValue(undefined),
      resume: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookQueueService,
        {
          provide: getQueueToken('webhooks'),
          useValue: mockQueue,
        },
      ],
    }).compile();

    service = module.get<WebhookQueueService>(WebhookQueueService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /**
   * TEST 1: addWebhookJob() debe agregar job a la queue
   */
  it('debe agregar webhook a la queue', async () => {
    await service.addWebhookJob(mockWebhookData);

    expect(mockQueue.add).toHaveBeenCalledWith(
      'process-webhook',
      mockWebhookData,
      expect.objectContaining({
        jobId: 'payment-123',
        priority: 1,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }),
    );
  });

  /**
   * TEST 2: Job debe usar payment_id como jobId
   *
   * RAZÓN: Evitar duplicados en la queue (mismo payment_id = mismo job)
   */
  it('debe usar payment_id como jobId para evitar duplicados', async () => {
    await service.addWebhookJob(mockWebhookData);

    expect(mockQueue.add).toHaveBeenCalledWith(
      'process-webhook',
      mockWebhookData,
      expect.objectContaining({
        jobId: 'payment-123',
      }),
    );
  });

  /**
   * TEST 3: Job debe tener configuración de retry correcta
   *
   * RETRY CONFIG:
   * - attempts: 3
   * - backoff: exponential (2s, 4s, 8s)
   */
  it('debe tener configuración de retry correcta', async () => {
    await service.addWebhookJob(mockWebhookData);

    expect(mockQueue.add).toHaveBeenCalledWith(
      'process-webhook',
      mockWebhookData,
      expect.objectContaining({
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      }),
    );
  });

  /**
   * TEST 4: addWebhookJob() debe permitir opciones custom
   */
  it('debe permitir opciones custom en addWebhookJob', async () => {
    await service.addWebhookJob(mockWebhookData, {
      priority: 5,
      delay: 1000,
    });

    expect(mockQueue.add).toHaveBeenCalledWith(
      'process-webhook',
      mockWebhookData,
      expect.objectContaining({
        priority: 5,
        delay: 1000,
      }),
    );
  });

  /**
   * TEST 5: getQueueStats() debe retornar estadísticas correctas
   */
  it('debe retornar estadísticas de la queue', async () => {
    const stats = await service.getQueueStats();

    expect(stats).toEqual({
      waiting: 5,
      active: 2,
      completed: 100,
      failed: 3,
      delayed: 0,
    });

    expect(mockQueue.getWaitingCount).toHaveBeenCalled();
    expect(mockQueue.getActiveCount).toHaveBeenCalled();
    expect(mockQueue.getCompletedCount).toHaveBeenCalled();
    expect(mockQueue.getFailedCount).toHaveBeenCalled();
    expect(mockQueue.getDelayedCount).toHaveBeenCalled();
  });

  /**
   * TEST 6: getFailedJobs() debe retornar jobs fallidos
   */
  it('debe retornar jobs fallidos', async () => {
    const mockFailedJobs = [
      { id: 'job-1', data: mockWebhookData },
      { id: 'job-2', data: mockWebhookData },
    ];
    mockQueue.getFailed = jest.fn().mockResolvedValue(mockFailedJobs);

    const failedJobs = await service.getFailedJobs(0, 10);

    expect(failedJobs).toEqual(mockFailedJobs);
    expect(mockQueue.getFailed).toHaveBeenCalledWith(0, 10);
  });

  /**
   * TEST 7: retryFailedJob() debe reintentar job manualmente
   */
  it('debe reintentar job fallido manualmente', async () => {
    const mockJob = {
      retry: jest.fn().mockResolvedValue(undefined),
    };
    mockQueue.getJob = jest.fn().mockResolvedValue(mockJob);

    await service.retryFailedJob('job-123');

    expect(mockQueue.getJob).toHaveBeenCalledWith('job-123');
    expect(mockJob.retry).toHaveBeenCalled();
  });

  /**
   * TEST 8: retryFailedJob() debe manejar job no encontrado
   */
  it('debe manejar job no encontrado en retryFailedJob', async () => {
    mockQueue.getJob = jest.fn().mockResolvedValue(null);

    // No debe lanzar error
    await expect(service.retryFailedJob('nonexistent')).resolves.not.toThrow();

    expect(mockQueue.getJob).toHaveBeenCalledWith('nonexistent');
  });

  /**
   * TEST 9: cleanCompletedJobs() debe limpiar jobs antiguos
   */
  it('debe limpiar jobs completados antiguos', async () => {
    const grace = 24 * 60 * 60 * 1000; // 24 horas

    await service.cleanCompletedJobs(grace);

    expect(mockQueue.clean).toHaveBeenCalledWith(grace, 'completed');
  });

  /**
   * TEST 10: pauseQueue() debe pausar la queue
   */
  it('debe pausar la queue', async () => {
    await service.pauseQueue();

    expect(mockQueue.pause).toHaveBeenCalled();
  });

  /**
   * TEST 11: resumeQueue() debe reanudar la queue
   */
  it('debe reanudar la queue', async () => {
    await service.resumeQueue();

    expect(mockQueue.resume).toHaveBeenCalled();
  });

  /**
   * TEST 12: addWebhookJob() debe lanzar error si queue falla
   */
  it('debe lanzar error si queue falla', async () => {
    mockQueue.add = jest.fn().mockRejectedValue(new Error('Queue error'));

    await expect(service.addWebhookJob(mockWebhookData)).rejects.toThrow(
      'Queue error',
    );
  });
});

/**
 * MÉTRICAS ESPERADAS (PASO 3.2):
 *
 * ANTES (procesamiento síncrono):
 * - Latencia endpoint: 800-1200ms
 * - Throughput: ~100 webhooks/min
 * - Uptime en picos: 90%
 *
 * DESPUÉS (queue asíncrono):
 * - Latencia endpoint: <50ms (solo agregar a queue)
 * - Throughput: 1000+ webhooks/min
 * - Uptime en picos: 99.9%
 * - Mejora: 95% más rápido, 10x más throughput
 */
