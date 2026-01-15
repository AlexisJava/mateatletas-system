import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  Registry,
  Counter,
  Histogram,
  Gauge,
  collectDefaultMetrics,
} from 'prom-client';

/**
 * PrometheusService
 *
 * Servicio centralizado de métricas Prometheus para el módulo de pagos.
 *
 * Métricas expuestas:
 * - Counters: webhooks recibidos, procesados, fallidos
 * - Gauges: tamaño de DLQ, jobs en cola
 * - Histograms: duración de procesamiento de webhooks
 *
 * @see https://prometheus.io/docs/concepts/metric_types/
 */
@Injectable()
export class PrometheusService implements OnModuleInit {
  private readonly registry: Registry;

  // === WEBHOOK METRICS ===

  /** Webhooks recibidos por tipo y estado */
  readonly webhooksReceived: Counter<'type' | 'status'>;

  /** Webhooks procesados exitosamente */
  readonly webhooksProcessed: Counter<'type' | 'action'>;

  /** Webhooks que fallaron (por tipo de error) */
  readonly webhooksFailed: Counter<'type' | 'error_type'>;

  /** Duración del procesamiento de webhooks */
  readonly webhookProcessingDuration: Histogram<'type' | 'status'>;

  // === DLQ METRICS ===

  /** Tamaño actual de la Dead Letter Queue */
  readonly dlqSize: Gauge<'status'>;

  /** Webhooks movidos a DLQ */
  readonly dlqEnqueued: Counter<'type' | 'reason'>;

  /** Webhooks resueltos desde DLQ */
  readonly dlqResolved: Counter<'type' | 'resolution'>;

  // === QUEUE METRICS ===

  /** Jobs actualmente en la cola */
  readonly queueSize: Gauge<'queue' | 'state'>;

  /** Reintentos de jobs */
  readonly jobRetries: Counter<'queue'>;

  // === PAYMENT METRICS ===

  /** Pagos por estado */
  readonly paymentsByStatus: Counter<'status' | 'provider'>;

  /** Monto total procesado (en centavos) */
  readonly paymentAmountTotal: Counter<'status'>;

  /** Duración de operaciones de pago */
  readonly paymentOperationDuration: Histogram<'operation'>;

  constructor() {
    this.registry = new Registry();

    // === WEBHOOK METRICS INITIALIZATION ===

    this.webhooksReceived = new Counter({
      name: 'pagos_webhooks_received_total',
      help: 'Total webhooks recibidos',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.webhooksProcessed = new Counter({
      name: 'pagos_webhooks_processed_total',
      help: 'Total webhooks procesados exitosamente',
      labelNames: ['type', 'action'],
      registers: [this.registry],
    });

    this.webhooksFailed = new Counter({
      name: 'pagos_webhooks_failed_total',
      help: 'Total webhooks que fallaron',
      labelNames: ['type', 'error_type'],
      registers: [this.registry],
    });

    this.webhookProcessingDuration = new Histogram({
      name: 'pagos_webhook_processing_duration_seconds',
      help: 'Duración del procesamiento de webhooks en segundos',
      labelNames: ['type', 'status'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });

    // === DLQ METRICS INITIALIZATION ===

    this.dlqSize = new Gauge({
      name: 'pagos_dlq_size',
      help: 'Número de webhooks en la Dead Letter Queue',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.dlqEnqueued = new Counter({
      name: 'pagos_dlq_enqueued_total',
      help: 'Total webhooks movidos a DLQ',
      labelNames: ['type', 'reason'],
      registers: [this.registry],
    });

    this.dlqResolved = new Counter({
      name: 'pagos_dlq_resolved_total',
      help: 'Total webhooks resueltos desde DLQ',
      labelNames: ['type', 'resolution'],
      registers: [this.registry],
    });

    // === QUEUE METRICS INITIALIZATION ===

    this.queueSize = new Gauge({
      name: 'pagos_queue_size',
      help: 'Número de jobs en la cola',
      labelNames: ['queue', 'state'],
      registers: [this.registry],
    });

    this.jobRetries = new Counter({
      name: 'pagos_job_retries_total',
      help: 'Total reintentos de jobs',
      labelNames: ['queue'],
      registers: [this.registry],
    });

    // === PAYMENT METRICS INITIALIZATION ===

    this.paymentsByStatus = new Counter({
      name: 'pagos_payments_total',
      help: 'Total pagos por estado',
      labelNames: ['status', 'provider'],
      registers: [this.registry],
    });

    this.paymentAmountTotal = new Counter({
      name: 'pagos_payment_amount_cents_total',
      help: 'Monto total procesado en centavos',
      labelNames: ['status'],
      registers: [this.registry],
    });

    this.paymentOperationDuration = new Histogram({
      name: 'pagos_operation_duration_seconds',
      help: 'Duración de operaciones de pago en segundos',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
      registers: [this.registry],
    });
  }

  onModuleInit() {
    // Métricas por defecto de Node.js (CPU, memoria, event loop, etc.)
    collectDefaultMetrics({
      register: this.registry,
      prefix: 'mateatletas_',
    });
  }

  /**
   * Obtiene todas las métricas en formato Prometheus
   */
  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  /**
   * Obtiene el content-type correcto para la respuesta
   */
  getContentType(): string {
    return this.registry.contentType;
  }

  // === HELPER METHODS ===

  /**
   * Registra un webhook recibido
   */
  recordWebhookReceived(type: string, status: 'queued' | 'rejected'): void {
    this.webhooksReceived.inc({ type, status });
  }

  /**
   * Registra un webhook procesado exitosamente
   */
  recordWebhookProcessed(type: string, action: string): void {
    this.webhooksProcessed.inc({ type, action });
  }

  /**
   * Registra un webhook fallido
   */
  recordWebhookFailed(type: string, errorType: string): void {
    this.webhooksFailed.inc({ type, error_type: errorType });
  }

  /**
   * Mide la duración de procesamiento de un webhook
   */
  observeWebhookDuration(
    type: string,
    status: 'success' | 'failure',
    durationSeconds: number,
  ): void {
    this.webhookProcessingDuration.observe({ type, status }, durationSeconds);
  }

  /**
   * Actualiza el tamaño de la DLQ
   */
  setDlqSize(status: string, size: number): void {
    this.dlqSize.set({ status }, size);
  }

  /**
   * Registra un pago procesado
   */
  recordPayment(status: string, provider: string, amountCents?: number): void {
    this.paymentsByStatus.inc({ status, provider });
    if (amountCents && status === 'approved') {
      this.paymentAmountTotal.inc({ status }, amountCents);
    }
  }

  /**
   * Timer helper para medir operaciones
   * @returns Función para terminar el timer
   */
  startOperationTimer(operation: string): () => void {
    const end = this.paymentOperationDuration.startTimer({ operation });
    return end;
  }
}
