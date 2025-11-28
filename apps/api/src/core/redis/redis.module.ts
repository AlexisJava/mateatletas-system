import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisService } from './redis.service';

/**
 * RedisModule - Módulo global de caching con Redis
 *
 * CONFIGURACIÓN:
 * - Global module → disponible en toda la aplicación sin imports
 * - Requiere ConfigModule para leer variables de entorno
 *
 * VARIABLES DE ENTORNO:
 * - REDIS_HOST: Hostname de Redis (default: localhost)
 * - REDIS_PORT: Puerto de Redis (default: 6379)
 * - REDIS_PASSWORD: Contraseña de Redis (opcional)
 *
 * EJEMPLO DE USO:
 * ```typescript
 * @Injectable()
 * export class WebhookIdempotencyService {
 *   constructor(private readonly redis: RedisService) {}
 *
 *   async wasProcessed(paymentId: string): Promise<boolean> {
 *     // 1. Verificar cache
 *     const cached = await this.redis.get(`webhook:processed:${paymentId}`);
 *     if (cached !== null) {
 *       return cached === 'true';
 *     }
 *
 *     // 2. Cache miss → consultar DB
 *     const record = await this.prisma.webhooksProcessed.findUnique({
 *       where: { payment_id: paymentId }
 *     });
 *
 *     // 3. Guardar en cache
 *     await this.redis.set(
 *       `webhook:processed:${paymentId}`,
 *       record ? 'true' : 'false',
 *       300 // TTL: 5 minutos
 *     );
 *
 *     return !!record;
 *   }
 * }
 * ```
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
