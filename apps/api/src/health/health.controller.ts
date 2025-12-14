import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../core/database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';

/**
 * Health Check Controller
 *
 * Proporciona endpoints para monitorear la salud del sistema
 *
 * Endpoints:
 * - GET /health - Health check completo (base de datos, servicios críticos)
 * - GET /health/ready - Readiness probe (¿puede recibir tráfico?)
 * - GET /health/live - Liveness probe (¿está vivo el proceso?)
 */
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
  ) {}

  /**
   * Health Check Completo
   *
   * Verifica:
   * - Conexión a base de datos (Prisma)
   * - Estado general del sistema
   *
   * Respuesta ejemplo:
   * {
   *   "status": "ok",
   *   "info": {
   *     "database": { "status": "up" }
   *   },
   *   "error": {},
   *   "details": {
   *     "database": { "status": "up" }
   *   }
   * }
   */
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Verifica conexión a Prisma
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * Readiness Probe
   *
   * Indica si la aplicación está lista para recibir tráfico
   * Kubernetes/Docker usa esto para saber cuándo enrutar requests
   *
   * Retorna:
   * - 200 OK si el sistema está listo
   * - 503 Service Unavailable si NO está listo
   */
  @Get('ready')
  @HealthCheck()
  async ready(): Promise<HealthCheckResult> {
    return this.health.check([
      // Verifica que Prisma puede conectarse
      () => this.prismaHealth.pingCheck('database', this.prisma),
    ]);
  }

  /**
   * Liveness Probe
   *
   * Indica si la aplicación está viva (proceso corriendo)
   * Kubernetes/Docker usa esto para reiniciar contenedores muertos
   *
   * Retorna:
   * - 200 OK si el proceso está vivo
   * - 503 si el proceso está colgado/muerto
   */
  @Get('live')
  live(): { status: string; timestamp: string; uptime: number } {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
