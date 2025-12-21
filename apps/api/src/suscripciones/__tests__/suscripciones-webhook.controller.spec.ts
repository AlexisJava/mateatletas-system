/**
 * Tests TDD para SuscripcionesWebhookController
 *
 * REGLAS:
 * - POST /webhooks/preapproval responde 200 inmediatamente
 * - Usa MercadoPagoWebhookGuard para validar firma
 * - Encola webhook para procesamiento async (BullMQ)
 */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, INestApplication, Logger } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { getQueueToken } from '@nestjs/bullmq';

import { SuscripcionesWebhookController } from '../presentation/suscripciones-webhook.controller';
import { MercadoPagoWebhookGuard } from '../../pagos/guards/mercadopago-webhook.guard';
import { MercadoPagoIpWhitelistService } from '../../pagos/services/mercadopago-ip-whitelist.service';
import { MercadoPagoPreApprovalClientService } from '../services/mercadopago-preapproval-client.service';
import { PreApprovalWebhookPayload, PreApprovalDetail } from '../types';
import { WEBHOOK_PREAPPROVAL_QUEUE } from '../jobs/webhook-preapproval.queue';

describe('SuscripcionesWebhookController', () => {
  let app: INestApplication;
  let mockQueue: { add: jest.Mock };
  let mockMpClientService: {
    get: jest.Mock;
    isConfigured: jest.Mock;
  };

  const mockIpWhitelistService = {
    extractRealIp: jest.fn().mockReturnValue('127.0.0.1'),
    isIpAllowed: jest.fn().mockReturnValue(true),
  };

  // Payload de webhook válido
  const validWebhookPayload: PreApprovalWebhookPayload = {
    type: 'subscription_preapproval',
    action: 'updated',
    id: 'webhook-123',
    api_version: 'v1',
    date_created: new Date().toISOString(),
    live_mode: false,
    user_id: '12345',
    data: { id: 'mp-preapproval-123' },
  };

  // Detalle de preapproval válido (lo que retorna MP)
  const validPreapprovalDetail: PreApprovalDetail = {
    id: 'mp-preapproval-123',
    status: 'authorized',
    external_reference: 'suscripcion-uuid-456',
    payer_email: 'tutor@example.com',
    payer_id: 123456789,
    reason: 'Suscripción Mateatletas - Plan Mensual',
    next_payment_date: '2025-01-20T00:00:00.000Z',
    auto_recurring: {
      frequency: 1,
      frequency_type: 'months',
      transaction_amount: 5000,
      currency_id: 'ARS',
    },
    date_created: '2024-12-20T10:00:00.000Z',
    last_modified: '2024-12-20T10:00:00.000Z',
  };

  beforeAll(async () => {
    mockQueue = {
      add: jest.fn().mockResolvedValue({ id: 'job-123' }),
    };

    mockMpClientService = {
      get: jest.fn().mockResolvedValue(validPreapprovalDetail),
      isConfigured: jest.fn().mockReturnValue(true),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [
            () => ({
              NODE_ENV: 'test',
              DISABLE_WEBHOOK_SIGNATURE_VALIDATION: 'true',
            }),
          ],
        }),
      ],
      controllers: [SuscripcionesWebhookController],
      providers: [
        {
          provide: getQueueToken(WEBHOOK_PREAPPROVAL_QUEUE),
          useValue: mockQueue,
        },
        {
          provide: MercadoPagoPreApprovalClientService,
          useValue: mockMpClientService,
        },
        {
          provide: MercadoPagoIpWhitelistService,
          useValue: mockIpWhitelistService,
        },
        MercadoPagoWebhookGuard,
        {
          provide: APP_GUARD,
          useClass: MercadoPagoWebhookGuard,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Silenciar logs
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'debug').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default mock values
    mockMpClientService.get.mockResolvedValue(validPreapprovalDetail);
    mockMpClientService.isConfigured.mockReturnValue(true);
    mockQueue.add.mockResolvedValue({ id: 'job-123' });
  });

  describe('POST /webhooks/preapproval - Happy Path', () => {
    it('should_respond_200_and_enqueue_when_preapproval_detail_available', async () => {
      // Act
      const response = await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK);

      // Assert: Response structure
      expect(response.body).toEqual({
        received: true,
        action: 'queued',
        message: expect.stringContaining('job-123'),
      });

      // Assert: MP client was called with correct ID
      expect(mockMpClientService.get).toHaveBeenCalledTimes(1);
      expect(mockMpClientService.get).toHaveBeenCalledWith(
        'mp-preapproval-123',
      );

      // Assert: Queue was called with correct job data
      expect(mockQueue.add).toHaveBeenCalledTimes(1);
      expect(mockQueue.add).toHaveBeenCalledWith(
        'preapproval-mp-preapproval-123',
        expect.objectContaining({
          payload: validWebhookPayload,
          detail: validPreapprovalDetail,
          correlationId: expect.any(String),
          receivedAt: expect.any(String),
        }),
        expect.any(Object), // WEBHOOK_JOB_OPTIONS
      );
    });

    it('should_include_preapproval_detail_in_job_data', async () => {
      // Act
      await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK);

      // Assert: Verify exact detail structure in queue call
      const [, jobData] = mockQueue.add.mock.calls[0];
      expect(jobData.detail).toEqual(validPreapprovalDetail);
      expect(jobData.detail.status).toBe('authorized');
      expect(jobData.detail.payer_email).toBe('tutor@example.com');
    });

    it('should_accept_all_webhook_actions_and_enqueue', async () => {
      const actions: Array<PreApprovalWebhookPayload['action']> = [
        'created',
        'updated',
        'payment.created',
      ];

      for (const action of actions) {
        jest.clearAllMocks();
        mockMpClientService.get.mockResolvedValue(validPreapprovalDetail);

        const payload = { ...validWebhookPayload, action };

        const response = await request(app.getHttpServer())
          .post('/webhooks/preapproval')
          .send(payload)
          .expect(HttpStatus.OK);

        // Assert: Each action results in successful queue
        expect(response.body.action).toBe('queued');
        expect(mockQueue.add).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('POST /webhooks/preapproval - Error Handling', () => {
    it('should_return_error_when_mp_client_returns_null', async () => {
      // Arrange: MP client returns null (API error, not found, etc.)
      mockMpClientService.get.mockResolvedValue(null);

      // Act
      const response = await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK); // Always 200 for MP

      // Assert
      expect(response.body).toEqual({
        received: true,
        action: 'error',
        message: 'No se pudo obtener detalle del preapproval',
      });
      expect(mockQueue.add).not.toHaveBeenCalled();
    });

    it('should_return_200_when_queue_fails', async () => {
      // Arrange: Queue throws error
      mockQueue.add.mockRejectedValue(new Error('Redis connection failed'));

      // Act
      const response = await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK); // CRITICAL: Always 200

      // Assert
      expect(response.body.received).toBe(true);
      expect(response.body.action).toBe('error');
      expect(response.body.message).toContain('Redis connection failed');
    });

    it('should_always_return_200_to_prevent_mp_retries', async () => {
      // This is a critical business rule: MP will retry on non-200
      // We must ALWAYS return 200, even on internal errors

      // Test 1: MP client error
      mockMpClientService.get.mockRejectedValue(new Error('API timeout'));
      let response = await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload);
      expect(response.status).toBe(200);

      // Test 2: Queue error
      mockMpClientService.get.mockResolvedValue(validPreapprovalDetail);
      mockQueue.add.mockRejectedValue(new Error('Queue full'));
      response = await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload);
      expect(response.status).toBe(200);
    });
  });

  describe('POST /webhooks/preapproval - MP Client Not Configured', () => {
    it('should_return_error_action_when_mp_client_not_configured', async () => {
      // Arrange: Create new app with unconfigured MP client
      const mockUnconfiguredMpClient = {
        get: jest.fn().mockResolvedValue(null),
        isConfigured: jest.fn().mockReturnValue(false),
      };

      const moduleWithoutMp = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            isGlobal: true,
            load: [
              () => ({
                NODE_ENV: 'test',
                DISABLE_WEBHOOK_SIGNATURE_VALIDATION: 'true',
              }),
            ],
          }),
        ],
        controllers: [SuscripcionesWebhookController],
        providers: [
          {
            provide: getQueueToken(WEBHOOK_PREAPPROVAL_QUEUE),
            useValue: mockQueue,
          },
          {
            provide: MercadoPagoPreApprovalClientService,
            useValue: mockUnconfiguredMpClient,
          },
          {
            provide: MercadoPagoIpWhitelistService,
            useValue: mockIpWhitelistService,
          },
          MercadoPagoWebhookGuard,
        ],
      }).compile();

      const appWithoutMp = moduleWithoutMp.createNestApplication();
      await appWithoutMp.init();

      try {
        // Act
        const response = await request(appWithoutMp.getHttpServer())
          .post('/webhooks/preapproval')
          .send(validWebhookPayload)
          .expect(HttpStatus.OK);

        // Assert
        expect(response.body.received).toBe(true);
        expect(response.body.action).toBe('error');
        expect(mockQueue.add).not.toHaveBeenCalled();
      } finally {
        await appWithoutMp.close();
      }
    });
  });

  describe('POST /webhooks/preapproval - Different Preapproval States', () => {
    it('should_enqueue_pending_status', async () => {
      mockMpClientService.get.mockResolvedValue({
        ...validPreapprovalDetail,
        status: 'pending',
      });

      await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK);

      const [, jobData] = mockQueue.add.mock.calls[0];
      expect(jobData.detail.status).toBe('pending');
    });

    it('should_enqueue_cancelled_status', async () => {
      mockMpClientService.get.mockResolvedValue({
        ...validPreapprovalDetail,
        status: 'cancelled',
      });

      await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK);

      const [, jobData] = mockQueue.add.mock.calls[0];
      expect(jobData.detail.status).toBe('cancelled');
    });

    it('should_enqueue_paused_status', async () => {
      mockMpClientService.get.mockResolvedValue({
        ...validPreapprovalDetail,
        status: 'paused',
      });

      await request(app.getHttpServer())
        .post('/webhooks/preapproval')
        .send(validWebhookPayload)
        .expect(HttpStatus.OK);

      const [, jobData] = mockQueue.add.mock.calls[0];
      expect(jobData.detail.status).toBe('paused');
    });
  });
});
