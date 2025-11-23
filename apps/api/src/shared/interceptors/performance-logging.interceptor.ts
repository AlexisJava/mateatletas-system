import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * PerformanceLoggingInterceptor - Monitoreo de Latencia (PASO 3.4)
 *
 * OBJETIVO:
 * Medir y loggear automáticamente la latencia de todos los endpoints HTTP
 * para identificar bottlenecks y degradación de performance.
 *
 * MÉTRICAS CAPTURADAS:
 * - Latencia total del request (ms)
 * - Método HTTP (GET, POST, etc.)
 * - Ruta del endpoint
 * - Status code de respuesta
 * - Timestamp del request
 *
 * USO:
 * Se aplica globalmente en main.ts con app.useGlobalInterceptors()
 * o se puede aplicar a nivel de controller con @UseInterceptors()
 *
 * FORMATO DE LOG:
 * [Performance] GET /api/inscripciones-2026 - 245ms - 200
 *
 * ALERTAS AUTOMÁTICAS:
 * - WARN si latencia > 1000ms (endpoints lentos)
 * - ERROR si latencia > 3000ms (endpoints críticos)
 *
 * @example
 * // En main.ts (aplicación global)
 * app.useGlobalInterceptors(new PerformanceLoggingInterceptor());
 *
 * // En controller específico
 * @UseInterceptors(PerformanceLoggingInterceptor)
 * @Controller('inscripciones-2026')
 * export class Inscripciones2026Controller { ... }
 */
@Injectable()
export class PerformanceLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('PerformanceMonitor');

  // Thresholds de latencia (en ms)
  private readonly SLOW_THRESHOLD = 1000; // 1 segundo
  private readonly CRITICAL_THRESHOLD = 3000; // 3 segundos

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          this.logPerformance(context, startTime, method, url);
        },
        error: (error) => {
          this.logPerformance(context, startTime, method, url, error);
        },
      }),
    );
  }

  private logPerformance(
    context: ExecutionContext,
    startTime: number,
    method: string,
    url: string,
    error?: any,
  ): void {
    const response = context.switchToHttp().getResponse();
    const latency = Date.now() - startTime;
    const statusCode = error ? error.status || 500 : response.statusCode;

    // Construir mensaje de log
    const logMessage = `${method} ${url} - ${latency}ms - ${statusCode}`;

    // Loggear según threshold de latencia
    if (error) {
      this.logger.error(`❌ ${logMessage} - Error: ${error.message}`);
    } else if (latency > this.CRITICAL_THRESHOLD) {
      this.logger.error(`🔴 CRITICAL LATENCY: ${logMessage}`);
    } else if (latency > this.SLOW_THRESHOLD) {
      this.logger.warn(`⚠️ SLOW REQUEST: ${logMessage}`);
    } else {
      this.logger.log(`✅ ${logMessage}`);
    }

    // Métricas estructuradas (para integración con monitoring tools como Datadog, New Relic, etc.)
    this.emitMetrics({
      type: 'http_request',
      method,
      url,
      latency,
      statusCode,
      timestamp: new Date().toISOString(),
      error: error?.message,
    });
  }

  /**
   * Emite métricas en formato estructurado para herramientas de monitoring
   * En producción, esto se puede integrar con:
   * - Datadog APM
   * - New Relic
   * - Prometheus
   * - CloudWatch (AWS)
   */
  private emitMetrics(metrics: {
    type: string;
    method: string;
    url: string;
    latency: number;
    statusCode: number;
    timestamp: string;
    error?: string;
  }): void {
    // Por ahora solo loggeamos en formato JSON
    // En producción, aquí iría la integración con el servicio de monitoring
    if (process.env.NODE_ENV === 'production') {
      // Ejemplo: datadog.increment('http.requests', 1, tags);
      // Ejemplo: newrelic.recordMetric('Custom/Latency', metrics.latency);
      this.logger.debug(JSON.stringify(metrics));
    }
  }
}
