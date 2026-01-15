import { Controller, Get, Header, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Response } from 'express';
import { Public } from '../../auth/decorators/public.decorator';
import { PrometheusService } from './prometheus.service';

/**
 * MetricsController
 *
 * Expone el endpoint /metrics para scraping de Prometheus.
 *
 * Uso en Grafana/Prometheus:
 * ```yaml
 * scrape_configs:
 *   - job_name: 'mateatletas-api'
 *     static_configs:
 *       - targets: ['api:3001']
 *     metrics_path: '/metrics'
 * ```
 *
 * @security Este endpoint es público pero NO debe exponerse externamente.
 *           Usar firewall/network policy para restringir acceso a Prometheus.
 */
@ApiExcludeController()
@Controller('metrics')
export class MetricsController {
  constructor(private readonly prometheusService: PrometheusService) {}

  /**
   * Endpoint de métricas Prometheus
   *
   * Retorna todas las métricas en formato text/plain compatible con Prometheus.
   * Incluye métricas custom de pagos + métricas por defecto de Node.js.
   */
  @Public()
  @Get()
  @Header('Cache-Control', 'no-store')
  async getMetrics(@Res() res: Response): Promise<void> {
    const metrics = await this.prometheusService.getMetrics();
    const contentType = this.prometheusService.getContentType();

    res.setHeader('Content-Type', contentType);
    res.send(metrics);
  }
}
