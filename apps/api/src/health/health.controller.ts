import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  HealthCheckResult,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../core/database/prisma.service';
import { Public } from '../auth/decorators/public.decorator';
import {
  RedisHealthIndicator,
  CacheHealthIndicator,
  ThrottlerHealthIndicator,
} from './indicators';

/**
 * Health Check Controller
 *
 * Proporciona endpoints para monitorear la salud del sistema.
 * Todos los endpoints son públicos (@Public) para permitir
 * acceso desde load balancers y Kubernetes probes.
 *
 * Endpoints:
 * - GET /health - Health check completo (todos los servicios)
 * - GET /health/ready - Readiness probe (servicios críticos)
 * - GET /health/live - Liveness probe (proceso vivo)
 */
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaService,
    private memory: MemoryHealthIndicator,
    private redisHealth: RedisHealthIndicator,
    private cacheHealth: CacheHealthIndicator,
    private throttlerHealth: ThrottlerHealthIndicator,
  ) {}

  /**
   * Health Check Completo
   *
   * Verifica todos los servicios:
   * - database: Conexión a PostgreSQL (Prisma)
   * - redis: Conexión a Redis
   * - cache: Sistema de cache L1+L2
   * - throttler: Rate limiting
   * - memory: Uso de memoria del proceso
   *
   * Respuesta ejemplo:
   * {
   *   "status": "ok",
   *   "info": {
   *     "database": { "status": "up" },
   *     "redis": { "status": "up", "latencyMs": 2 },
   *     "cache": { "status": "up", "hitRate": "85.0%" },
   *     "throttler": { "status": "up", "redisAvailable": true },
   *     "memory_heap": { "status": "up" }
   *   },
   *   "error": {},
   *   "details": { ... }
   * }
   */
  @Get()
  @HealthCheck()
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Servicios críticos
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.redisHealth.isHealthy('redis'),
      // Servicios secundarios
      () => this.cacheHealth.isHealthy('cache'),
      () => this.throttlerHealth.isHealthy('throttler'),
      // Recursos del sistema
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB threshold
    ]);
  }

  /**
   * Readiness Probe
   *
   * Indica si la aplicación está lista para recibir tráfico.
   * Kubernetes/Docker usa esto para saber cuándo enrutar requests.
   *
   * Solo verifica servicios críticos:
   * - database: Sin BD no puede funcionar
   * - redis: Necesario para sesiones, cache, rate limiting
   *
   * Retorna:
   * - 200 OK si el sistema está listo
   * - 503 Service Unavailable si NO está listo
   */
  @Get('ready')
  @HealthCheck()
  async ready(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.redisHealth.isHealthy('redis'),
    ]);
  }

  /**
   * Liveness Probe
   *
   * Indica si la aplicación está viva (proceso corriendo).
   * Kubernetes/Docker usa esto para reiniciar contenedores muertos.
   *
   * No verifica dependencias externas - solo que el proceso responde.
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
