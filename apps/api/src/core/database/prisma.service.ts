import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Database Connection with Connection Pooling
 *
 * CONFIGURACIÓN DE POOL (vía variables de entorno):
 * - DATABASE_POOL_SIZE: Conexiones en el pool (default: 10, prod recomendado: 20-50)
 * - DATABASE_POOL_TIMEOUT: Timeout para obtener conexión en ms (default: 30000)
 *
 * SEGURIDAD:
 * - No hardcodea credenciales - usa DATABASE_URL de env
 * - Valida parámetros de pool para evitar DoS por configuración incorrecta
 * - Logging sin exponer datos sensibles
 *
 * PARA ALTA CONCURRENCIA (1000+ usuarios):
 * - Usar con PgBouncer externo (Railway Pooler)
 * - O aumentar DATABASE_POOL_SIZE a 50
 *
 * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-prismaclient/connection-pool
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    // Obtener configuración de pool desde variables de entorno
    const poolSize = PrismaService.validatePoolSize(
      configService.get<number>('DATABASE_POOL_SIZE'),
    );
    const poolTimeout = PrismaService.validatePoolTimeout(
      configService.get<number>('DATABASE_POOL_TIMEOUT'),
    );

    // Configurar Prisma con pool settings
    super({
      datasources: {
        db: {
          url: PrismaService.buildConnectionUrl(
            configService.get<string>('DATABASE_URL'),
            poolSize,
            poolTimeout,
          ),
        },
      },
      log:
        configService.get<string>('NODE_ENV') === 'development'
          ? ['query', 'warn', 'error']
          : ['warn', 'error'],
    });

    this.logger.log(
      `Pool configurado: size=${poolSize}, timeout=${poolTimeout}ms`,
    );
  }

  /**
   * Valida el tamaño del pool para evitar configuraciones peligrosas
   * @param size - Tamaño configurado
   * @returns Tamaño validado (entre 5 y 100)
   */
  private static validatePoolSize(size: number | undefined): number {
    const DEFAULT_POOL_SIZE = 10;
    const MIN_POOL_SIZE = 5;
    const MAX_POOL_SIZE = 100;

    if (size === undefined || isNaN(size)) {
      return DEFAULT_POOL_SIZE;
    }

    if (size < MIN_POOL_SIZE) {
      return MIN_POOL_SIZE;
    }

    if (size > MAX_POOL_SIZE) {
      return MAX_POOL_SIZE;
    }

    return size;
  }

  /**
   * Valida el timeout del pool
   * @param timeout - Timeout configurado en ms
   * @returns Timeout validado (entre 5000 y 60000 ms)
   */
  private static validatePoolTimeout(timeout: number | undefined): number {
    const DEFAULT_TIMEOUT = 30000;
    const MIN_TIMEOUT = 5000;
    const MAX_TIMEOUT = 60000;

    if (timeout === undefined || isNaN(timeout)) {
      return DEFAULT_TIMEOUT;
    }

    if (timeout < MIN_TIMEOUT) {
      return MIN_TIMEOUT;
    }

    if (timeout > MAX_TIMEOUT) {
      return MAX_TIMEOUT;
    }

    return timeout;
  }

  /**
   * Construye la URL de conexión con parámetros de pool
   * SEGURIDAD: No loguea la URL completa (contiene credenciales)
   */
  private static buildConnectionUrl(
    baseUrl: string | undefined,
    poolSize: number,
    poolTimeout: number,
  ): string {
    if (!baseUrl) {
      throw new Error(
        'DATABASE_URL no configurada. Verificar variables de entorno.',
      );
    }

    // Si ya tiene parámetros de pool en la URL, no duplicar
    if (
      baseUrl.includes('connection_limit') ||
      baseUrl.includes('pool_timeout')
    ) {
      return baseUrl;
    }

    // Agregar parámetros de pool a la URL
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}connection_limit=${poolSize}&pool_timeout=${poolTimeout}`;
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.$connect();
      this.logger.log('✅ Prisma conectado a la base de datos');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`❌ Error conectando a la base de datos: ${message}`);
      throw error;
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Prisma desconectado');
  }
}
