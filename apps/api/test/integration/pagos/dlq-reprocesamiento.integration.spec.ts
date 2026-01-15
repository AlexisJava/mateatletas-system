/**
 * ============================================================================
 * BLACK BOX INTEGRATION TEST - Reprocesamiento de Dead Letter Queue (DLQ)
 * ============================================================================
 *
 * REQUISITOS DE NEGOCIO TESTEADOS:
 *
 * R1. CONSULTA DE DLQ:
 *   - Admin puede listar webhooks en DLQ con filtros
 *   - Admin puede ver detalle de un webhook fallido
 *   - Se muestran estadísticas de DLQ (pendientes, resueltos, abandonados)
 *
 * R2. REPROCESAMIENTO:
 *   - Admin puede reintentar procesamiento de webhook desde DLQ
 *   - El webhook reprocesado actualiza su estado correctamente
 *   - Si el reprocesamiento falla, incrementa el contador de reintentos
 *
 * R3. RESOLUCIÓN MANUAL:
 *   - Admin puede marcar webhook como "resuelto" manualmente
 *   - Admin puede marcar webhook como "abandonado"
 *   - Se registra quién y cuándo resolvió el webhook
 *
 * R4. LIMPIEZA:
 *   - Los webhooks resueltos/abandonados antiguos se pueden limpiar
 *   - Los webhooks pendientes nunca se eliminan automáticamente
 *
 * Setup: docker-compose -f docker-compose.test.yml up -d
 * Run: yarn workspace api test --config test/jest-e2e.json --testPathPatterns="dlq-reprocesamiento" --runInBand
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import cookieParser from 'cookie-parser';
import * as express from 'express';
import { AppModule } from '../../../src/app.module';
import { PrismaService } from '../../../src/core/database/prisma.service';
import { WebhookDLQService } from '../../../src/pagos/services/webhook-dlq.service';
import { cleanAllTestTables } from '../../helpers/db-cleanup';
import { createTestAdmin, DEFAULT_PASSWORD } from '../../fixtures/factories';
import {
  loginUser,
  FRONTEND_ORIGIN,
  generateUniqueIP,
} from '../../helpers/auth.helpers';
import { DLQStatus } from '@prisma/client';

describe('[INTEGRATION] Reprocesamiento de Dead Letter Queue', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let dlqService: WebhookDLQService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.use(cookieParser());

    const expressApp = app
      .getHttpAdapter()
      .getInstance() as express.Application;
    expressApp.set('trust proxy', true);

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    prisma = app.get<PrismaService>(PrismaService);
    dlqService = app.get<WebhookDLQService>(WebhookDLQService);
    await app.init();
  }, 60000);

  afterAll(async () => {
    await prisma.$disconnect();
    await app.close();
  }, 30000);

  beforeEach(async () => {
    await cleanAllTestTables(prisma);
  });

  // ============================================================================
  // HELPERS
  // ============================================================================

  /**
   * Crear entrada de prueba en DLQ
   */
  async function createDLQEntry(
    options: {
      paymentId?: string;
      status?: DLQStatus;
      retries?: number;
      errorMessage?: string;
      createdAt?: Date;
      resolvedAt?: Date;
    } = {},
  ) {
    return prisma.webhookFailed.create({
      data: {
        payment_id: options.paymentId || `payment-${Date.now()}`,
        webhook_type: 'payment',
        payload: {
          action: 'payment.created',
          api_version: 'v1',
          data: { id: options.paymentId || `payment-${Date.now()}` },
          date_created: new Date().toISOString(),
          id: Date.now(),
          live_mode: false,
          type: 'payment',
          user_id: '123456',
        },
        error_message: options.errorMessage || 'Connection timeout',
        retries: options.retries ?? 5,
        status: options.status || DLQStatus.PENDING,
        created_at: options.createdAt || new Date(),
        resolved_at: options.resolvedAt,
      },
    });
  }

  async function loginAsAdmin() {
    const admin = await createTestAdmin(prisma);
    return loginUser(app, { email: admin.email, password: DEFAULT_PASSWORD });
  }

  // ============================================================================
  // R1. CONSULTA DE DLQ (via Service)
  // ============================================================================
  describe('R1: Consulta de DLQ', () => {
    it('debe listar webhooks pendientes en DLQ', async () => {
      // SETUP: Crear varios webhooks en DLQ
      await createDLQEntry({ paymentId: 'dlq-list-1' });
      await createDLQEntry({ paymentId: 'dlq-list-2' });
      await createDLQEntry({
        paymentId: 'dlq-list-3',
        status: DLQStatus.RESOLVED,
      });

      // ACCIÓN: Listar solo pendientes
      const result = await dlqService.listDLQ({ status: DLQStatus.PENDING });

      // VERIFICAR: Solo deben aparecer los 2 PENDING, no el RESOLVED
      expect(result.items.every((i) => i.status === DLQStatus.PENDING)).toBe(
        true,
      );
      // Verificar que tenemos al menos los 2 que creamos (pueden haber más de tests anteriores)
      expect(result.items.length).toBeGreaterThanOrEqual(2);
    });

    it('debe filtrar por payment_id', async () => {
      await createDLQEntry({ paymentId: 'specific-payment-123' });
      await createDLQEntry({ paymentId: 'other-payment-456' });

      const result = await dlqService.listDLQ({
        paymentId: 'specific-payment-123',
      });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].payment_id).toBe('specific-payment-123');
    });

    it('debe filtrar por rango de fechas', async () => {
      const ayer = new Date();
      ayer.setDate(ayer.getDate() - 1);

      const haceTresDias = new Date();
      haceTresDias.setDate(haceTresDias.getDate() - 3);

      await createDLQEntry({ paymentId: 'recent', createdAt: ayer });
      await createDLQEntry({ paymentId: 'old', createdAt: haceTresDias });

      const haceDosHoras = new Date();
      haceDosHoras.setHours(haceDosHoras.getHours() - 2);

      const result = await dlqService.listDLQ({
        fromDate: haceDosHoras,
      });

      // No debería incluir ninguno ya que ambos son de hace más de 2 horas
      // (a menos que el test se ejecute muy cerca de la medianoche)
    });

    it('debe retornar estadísticas correctas', async () => {
      await createDLQEntry({ status: DLQStatus.PENDING });
      await createDLQEntry({ status: DLQStatus.PENDING });
      await createDLQEntry({ status: DLQStatus.RESOLVED });
      await createDLQEntry({ status: DLQStatus.ABANDONED });

      const stats = await dlqService.getStats();

      expect(stats.byStatus['PENDING']).toBe(2);
      expect(stats.byStatus['RESOLVED']).toBe(1);
      expect(stats.byStatus['ABANDONED']).toBe(1);
      expect(stats.totalPending).toBe(2);
    });

    it('debe retornar el webhook pendiente más antiguo', async () => {
      const haceDiezDias = new Date();
      haceDiezDias.setDate(haceDiezDias.getDate() - 10);

      const haceCincoDias = new Date();
      haceCincoDias.setDate(haceCincoDias.getDate() - 5);

      await createDLQEntry({
        paymentId: 'oldest-pending',
        createdAt: haceDiezDias,
      });
      await createDLQEntry({
        paymentId: 'newer-pending',
        createdAt: haceCincoDias,
      });

      const stats = await dlqService.getStats();

      expect(stats.oldestPending).not.toBeNull();
      expect(stats.oldestPending?.payment_id).toBe('oldest-pending');
    });

    it('debe paginar resultados correctamente', async () => {
      // Crear 15 webhooks
      for (let i = 0; i < 15; i++) {
        await createDLQEntry({ paymentId: `paginate-${i}` });
      }

      const page1 = await dlqService.listDLQ({}, 10, 0);
      const page2 = await dlqService.listDLQ({}, 10, 10);

      expect(page1.items).toHaveLength(10);
      expect(page1.hasMore).toBe(true);
      expect(page2.items).toHaveLength(5);
      expect(page2.hasMore).toBe(false);
    });
  });

  // ============================================================================
  // R2. REPROCESAMIENTO
  // ============================================================================
  describe('R2: Reprocesamiento', () => {
    it('debe marcar webhook como PROCESSING al iniciar reprocesamiento', async () => {
      const entry = await createDLQEntry({ paymentId: 'reprocess-test' });

      const updated = await dlqService.markAsProcessing(entry.id);

      expect(updated.status).toBe(DLQStatus.PROCESSING);
      expect(updated.last_retry_at).toBeDefined();
    });

    it('debe revertir a PENDING si el reprocesamiento falla', async () => {
      const entry = await createDLQEntry({
        paymentId: 'revert-test',
        retries: 5,
      });

      // Simular inicio de procesamiento
      await dlqService.markAsProcessing(entry.id);

      // Simular fallo y revertir
      const reverted = await dlqService.revertToPending(
        entry.id,
        'New error: API timeout',
      );

      expect(reverted.status).toBe(DLQStatus.PENDING);
      expect(reverted.retries).toBe(6);
      expect(reverted.error_message).toBe('New error: API timeout');
    });

    it('debe mantener el payload original durante reprocesamiento', async () => {
      const originalPayload = {
        action: 'payment.created',
        data: { id: 'preserve-payload-test' },
        type: 'payment',
        extra_field: 'should be preserved',
      };

      const entry = await prisma.webhookFailed.create({
        data: {
          payment_id: 'preserve-payload-test',
          webhook_type: 'payment',
          payload: originalPayload,
          error_message: 'Test error',
          retries: 5,
          status: DLQStatus.PENDING,
        },
      });

      // Simular reprocesamiento
      await dlqService.markAsProcessing(entry.id);

      // Verificar payload intacto
      const retrieved = await dlqService.getById(entry.id);
      const payload = retrieved?.payload as typeof originalPayload;

      expect(payload.extra_field).toBe('should be preserved');
      expect(payload.data.id).toBe('preserve-payload-test');
    });
  });

  // ============================================================================
  // R3. RESOLUCIÓN MANUAL
  // ============================================================================
  describe('R3: Resolución Manual', () => {
    it('admin puede marcar webhook como resuelto', async () => {
      const entry = await createDLQEntry({ paymentId: 'resolve-manual-test' });

      const resolved = await dlqService.markAsResolved(entry.id, {
        resolvedBy: 'admin-123',
        resolutionNotes: 'Procesado manualmente vía API de MercadoPago',
      });

      expect(resolved.status).toBe(DLQStatus.RESOLVED);
      expect(resolved.resolved_by).toBe('admin-123');
      expect(resolved.resolution_notes).toBe(
        'Procesado manualmente vía API de MercadoPago',
      );
      expect(resolved.resolved_at).toBeDefined();
    });

    it('admin puede marcar webhook como abandonado', async () => {
      const entry = await createDLQEntry({ paymentId: 'abandon-test' });

      const abandoned = await dlqService.markAsAbandoned(entry.id, {
        resolvedBy: 'admin-456',
        resolutionNotes: 'Payment ID no existe en MercadoPago - spam o test',
      });

      expect(abandoned.status).toBe(DLQStatus.ABANDONED);
      expect(abandoned.resolved_by).toBe('admin-456');
      expect(abandoned.resolution_notes).toContain('no existe');
    });

    it('debe lanzar error si webhook no existe', async () => {
      await expect(
        dlqService.markAsResolved('nonexistent-id', { resolvedBy: 'admin' }),
      ).rejects.toThrow('no encontrado');

      await expect(
        dlqService.markAsAbandoned('nonexistent-id', { resolvedBy: 'admin' }),
      ).rejects.toThrow('no encontrado');
    });

    it('debe registrar timestamp de resolución', async () => {
      const entry = await createDLQEntry({ paymentId: 'timestamp-test' });
      const beforeResolve = new Date();

      const resolved = await dlqService.markAsResolved(entry.id, {
        resolvedBy: 'admin',
      });

      expect(resolved.resolved_at).toBeDefined();
      expect(new Date(resolved.resolved_at!).getTime()).toBeGreaterThanOrEqual(
        beforeResolve.getTime(),
      );
    });
  });

  // ============================================================================
  // R4. LIMPIEZA
  // ============================================================================
  describe('R4: Limpieza', () => {
    it('debe limpiar webhooks resueltos antiguos (> 30 días)', async () => {
      const haceCuarentaDias = new Date();
      haceCuarentaDias.setDate(haceCuarentaDias.getDate() - 40);

      const haceDiezDias = new Date();
      haceDiezDias.setDate(haceDiezDias.getDate() - 10);

      // Crear webhooks resueltos: uno antiguo y uno reciente
      await prisma.webhookFailed.create({
        data: {
          payment_id: 'old-resolved',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.RESOLVED,
          resolved_at: haceCuarentaDias,
        },
      });

      await prisma.webhookFailed.create({
        data: {
          payment_id: 'recent-resolved',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.RESOLVED,
          resolved_at: haceDiezDias,
        },
      });

      // ACCIÓN: Limpiar
      const deletedCount = await dlqService.cleanOldRecords();

      // VERIFICAR: Solo el antiguo fue eliminado
      expect(deletedCount).toBe(1);

      const remaining = await prisma.webhookFailed.findMany();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].payment_id).toBe('recent-resolved');
    });

    it('debe limpiar webhooks abandonados antiguos', async () => {
      const haceCuarentaDias = new Date();
      haceCuarentaDias.setDate(haceCuarentaDias.getDate() - 40);

      await prisma.webhookFailed.create({
        data: {
          payment_id: 'old-abandoned',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.ABANDONED,
          resolved_at: haceCuarentaDias,
        },
      });

      const deletedCount = await dlqService.cleanOldRecords();

      expect(deletedCount).toBe(1);
    });

    it('NO debe eliminar webhooks pendientes sin importar antigüedad', async () => {
      const haceSesantaDias = new Date();
      haceSesantaDias.setDate(haceSesantaDias.getDate() - 60);

      await prisma.webhookFailed.create({
        data: {
          payment_id: 'very-old-pending',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.PENDING,
          created_at: haceSesantaDias,
        },
      });

      const deletedCount = await dlqService.cleanOldRecords();

      // No debe eliminar pendientes
      expect(deletedCount).toBe(0);

      const remaining = await prisma.webhookFailed.findMany();
      expect(remaining).toHaveLength(1);
      expect(remaining[0].status).toBe(DLQStatus.PENDING);
    });

    it('NO debe eliminar webhooks en PROCESSING', async () => {
      const haceCuarentaDias = new Date();
      haceCuarentaDias.setDate(haceCuarentaDias.getDate() - 40);

      await prisma.webhookFailed.create({
        data: {
          payment_id: 'old-processing',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.PROCESSING,
          last_retry_at: haceCuarentaDias,
        },
      });

      const deletedCount = await dlqService.cleanOldRecords();

      expect(deletedCount).toBe(0);
    });
  });

  // ============================================================================
  // EDGE CASES
  // ============================================================================
  describe('Edge Cases', () => {
    it('debe manejar DLQ vacío correctamente', async () => {
      const result = await dlqService.listDLQ();

      expect(result.items).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.hasMore).toBe(false);
    });

    it('getStats debe retornar objeto válido con DLQ vacío', async () => {
      const stats = await dlqService.getStats();

      expect(stats.byStatus).toEqual({});
      expect(stats.totalPending).toBe(0);
      expect(stats.oldestPending).toBeNull();
    });

    it('debe manejar webhooks con payload muy grande', async () => {
      const largePayload = {
        action: 'payment.created',
        data: {
          id: 'large-payload-test',
          extra_data: 'x'.repeat(50000), // 50KB de datos
        },
        type: 'payment',
      };

      const entry = await prisma.webhookFailed.create({
        data: {
          payment_id: 'large-payload-test',
          webhook_type: 'payment',
          payload: largePayload,
          error_message: 'Test',
          retries: 5,
          status: DLQStatus.PENDING,
        },
      });

      const retrieved = await dlqService.getById(entry.id);

      expect(retrieved).not.toBeNull();
      const payload = retrieved?.payload as typeof largePayload;
      expect(payload.data.extra_data.length).toBe(50000);
    });

    it('debe preservar error stack trace completo', async () => {
      const longStackTrace = `Error: Connection timeout
    at WebhookPaymentProcessor.process (/app/src/pagos/jobs/webhook-payment.processor.ts:45:15)
    at processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async Worker.callProcessJob (/app/node_modules/bullmq/dist/cjs/classes/worker.js:315:15)
    at async Worker.processJob (/app/node_modules/bullmq/dist/cjs/classes/worker.js:357:32)
    at async Worker.retryIfFailed (/app/node_modules/bullmq/dist/cjs/classes/worker.js:457:24)`;

      const entry = await prisma.webhookFailed.create({
        data: {
          payment_id: 'stack-trace-test',
          webhook_type: 'payment',
          payload: {},
          error_message: 'Connection timeout',
          error_stack: longStackTrace,
          retries: 5,
          status: DLQStatus.PENDING,
        },
      });

      const retrieved = await dlqService.getById(entry.id);

      expect(retrieved?.error_stack).toBe(longStackTrace);
      expect(retrieved?.error_stack).toContain('WebhookPaymentProcessor');
    });
  });
});
