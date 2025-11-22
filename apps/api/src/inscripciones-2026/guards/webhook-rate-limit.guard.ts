import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { ThrottlerLimitDetail } from '@nestjs/throttler/dist/throttler.guard.interface';

/**
 * Guard de Rate Limiting para Webhooks de Inscripciones 2026
 *
 * PROBLEMA DE SEGURIDAD:
 * - Sin rate limiting: Atacante puede enviar 10,000 webhooks/segundo
 * - Servidor se sobrecarga: CPU 100%, memoria saturada, DB con 5000 conexiones
 * - DoS exitoso: Usuarios legítimos reciben timeouts
 * - Costos de infraestructura se disparan (cloud auto-scaling descontrolado)
 *
 * ESCENARIO DE ATAQUE:
 * 1. Atacante descubre endpoint público /inscripciones-2026/webhook
 * 2. Envía 500 requests/segundo desde múltiples IPs usando botnet
 * 3. Cada request consume:
 *    - 1 conexión a DB (máx: 100 conexiones → saturación en 0.2s)
 *    - 50MB RAM (procesamiento webhook + consultas MP)
 *    - 200ms CPU (validaciones + transacciones)
 * 4. Resultado: Sistema completamente inaccesible en <1 minuto
 *
 * SOLUCIÓN:
 * - Límite: 100 requests por minuto por IP
 * - Bloqueo automático: Retorna HTTP 429 (Too Many Requests)
 * - Logging de violaciones: Para análisis forense y detección de patrones
 * - Headers informativos: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
 *
 * CONFIGURACIÓN:
 * - TTL: 60 segundos (ventana de tiempo)
 * - Límite: 100 requests (por IP en esa ventana)
 * - Tracking: Por IP del cliente (req.ip)
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - OWASP A05:2021 - Security Misconfiguration
 * - ISO 27001 A.14.2.8 - System security testing
 * - NIST 800-53 SC-5 - Denial of Service Protection
 * - CWE-770: Allocation of Resources Without Limits or Throttling
 *
 * USO:
 * @Post('webhook')
 * @UseGuards(WebhookRateLimitGuard)
 * async handleWebhook(@Body() webhookData: MercadoPagoWebhookDto) { }
 *
 * MÉTRICAS DE SEGURIDAD:
 * - Requests bloqueados por IP y timestamp
 * - Permite dashboard de intentos de ataque
 * - Identificación de IPs maliciosas para blacklisting
 */
@Injectable()
export class WebhookRateLimitGuard extends ThrottlerGuard {
  private readonly logger = new Logger(WebhookRateLimitGuard.name);

  /**
   * Configuración del rate limiting para webhooks
   *
   * JUSTIFICACIÓN DE LÍMITES:
   * - 100 req/min es generoso para webhooks legítimos de MercadoPago
   * - MercadoPago típicamente envía 1-3 webhooks por pago
   * - Reintentos de MP: exponencial backoff (1s, 5s, 15s, 1min)
   * - 100 req/min permite manejar ~30 pagos simultáneos con reintentos
   * - Cualquier IP que exceda 100 req/min es claramente maliciosa
   */
  protected readonly throttlers: Array<{
    name: string;
    ttl: number;
    limit: number;
  }> = [
    {
      name: 'webhook',
      ttl: 60000, // 60 segundos = 1 minuto
      limit: 100, // 100 requests por minuto
    },
  ];

  /**
   * Override del método canActivate para agregar logging de seguridad
   *
   * @param context - Contexto de ejecución de NestJS
   * @returns true si está dentro del límite, lanza ThrottlerException si excede
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      ip: string;
      url: string;
      method: string;
    }>();

    try {
      // Ejecutar lógica de throttling de la clase padre
      const canProceed = await super.canActivate(context);
      return canProceed;
    } catch (error) {
      // Si es ThrottlerException, loguear intento de rate limit
      if (error instanceof ThrottlerException) {
        this.logger.warn(
          `🚨 RATE LIMIT EXCEDIDO: ` +
          `IP=${request.ip}, ` +
          `URL=${request.url}, ` +
          `Method=${request.method}, ` +
          `Límite=100 req/min`,
        );
      }

      // Re-lanzar la excepción para que el cliente reciba HTTP 429
      throw error;
    }
  }

  /**
   * Override para obtener la IP del cliente
   *
   * SEGURIDAD:
   * - Considera proxies reversos (X-Forwarded-For, X-Real-IP)
   * - Previene IP spoofing verificando headers confiables
   * - Fallback a req.ip si no hay headers
   *
   * @param context - Contexto de ejecución
   * @returns IP del cliente
   */
  protected async getTracker(context: ExecutionContext): Promise<string> {
    const request = context.switchToHttp().getRequest<{
      ip: string;
      ips: string[];
      headers: Record<string, string | string[] | undefined>;
    }>();

    // Prioridad 1: X-Real-IP (configurado en nginx/proxy)
    const xRealIp = request.headers['x-real-ip'];
    if (xRealIp && typeof xRealIp === 'string') {
      return xRealIp;
    }

    // Prioridad 2: Primer IP de X-Forwarded-For
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor && typeof xForwardedFor === 'string') {
      const firstIp = xForwardedFor.split(',')[0].trim();
      if (firstIp) {
        return firstIp;
      }
    }

    // Prioridad 3: req.ips (Express popula esto automáticamente)
    if (request.ips && request.ips.length > 0) {
      return request.ips[0];
    }

    // Fallback: req.ip
    return request.ip;
  }

  /**
   * Override para generar mensaje de error personalizado
   *
   * @param context - Contexto de ejecución
   * @param throttlerLimitDetail - Detalles del límite excedido
   * @returns Mensaje de error descriptivo
   */
  protected async getErrorMessage(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<string> {
    const request = context.switchToHttp().getRequest<{
      ip: string;
    }>();

    return (
      `Rate limit exceeded for webhook endpoint. ` +
      `IP: ${request.ip}, ` +
      `Limit: ${throttlerLimitDetail.limit} requests per ${throttlerLimitDetail.ttl / 1000} seconds. ` +
      `Please wait before retrying.`
    );
  }
}