import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { createHash, randomBytes } from 'crypto';
import { ConfigService } from '@nestjs/config';

/**
 * Servicio de Rotación de Secrets
 *
 * PROPÓSITO:
 * Gestionar la rotación periódica de secretos críticos del sistema
 * para minimizar el impacto de posibles compromisos de seguridad.
 *
 * PROBLEMA QUE RESUELVE:
 * - Secrets estáticos (JWT_SECRET, WEBHOOK_SECRET) nunca expiran
 * - Si un secret se compromete, TODO el sistema está comprometido
 * - No hay alertas ni recordatorios para rotar secrets
 *
 * SOLUCIÓN:
 * - Monitoreo de edad de secrets (cada 90 días)
 * - Alertas 7 días antes de expiración
 * - Período de gracia donde ambos secrets son válidos
 * - Historial completo para auditoría
 *
 * SECRETS GESTIONADOS:
 * - JWT_SECRET: Para firmar y verificar tokens de autenticación
 * - MERCADOPAGO_WEBHOOK_SECRET: Para validar webhooks de MercadoPago
 *
 * FLUJO DE ROTACIÓN (Manual - Requiere intervención del Admin):
 * 1. Cronjob diario detecta secrets próximos a expirar (83+ días)
 * 2. Sistema crea alerta CRITICAL en audit logs
 * 3. Admin genera nuevo secret manualmente (comando CLI o endpoint)
 * 4. Admin actualiza variables de entorno en infraestructura
 * 5. Sistema marca el viejo secret como "expired" después de 7 días
 *
 * IMPORTANTE:
 * - NO almacenamos los secrets reales en base de datos (solo hashes SHA-256)
 * - Los secrets reales SOLO existen en variables de entorno
 * - El hash SHA-256 permite verificar que el secret en .env es el correcto
 *
 * @injectable
 */
@Injectable()
export class SecretRotationService {
  private readonly logger = new Logger(SecretRotationService.name);

  // Configuración de rotación
  private readonly ROTATION_DAYS = 90; // Rotar cada 90 días
  private readonly WARNING_DAYS_BEFORE = 7; // Alertar 7 días antes
  private readonly GRACE_PERIOD_DAYS = 7; // Período donde ambos secrets son válidos

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Inicializa el sistema de rotación en el primer arranque
   * Registra los secrets actuales si no existen en la BD
   */
  async onModuleInit(): Promise<void> {
    await this.initializeSecretTracking();
  }

  /**
   * Cronjob que se ejecuta diariamente a las 9:00 AM
   * Verifica si hay secrets próximos a expirar y emite alertas
   */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkSecretExpiration(): Promise<void> {
    this.logger.log('🔍 Verificando expiración de secrets...');

    const jwtCheck = await this.checkSecretStatus('JWT_SECRET');
    const webhookCheck = await this.checkSecretStatus('WEBHOOK_SECRET');

    if (jwtCheck.needsRotation || webhookCheck.needsRotation) {
      this.logger.warn('⚠️ ATENCIÓN: Hay secrets que necesitan rotación');
    } else {
      this.logger.log('✅ Todos los secrets están actualizados');
    }
  }

  /**
   * Inicializa el tracking de secrets en el primer arranque
   * Si no existen registros, crea los iniciales con los secrets actuales
   */
  private async initializeSecretTracking(): Promise<void> {
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const webhookSecret = this.configService.get<string>(
      'MERCADOPAGO_WEBHOOK_SECRET',
    );

    if (!jwtSecret || !webhookSecret) {
      this.logger.error(
        '❌ CRÍTICO: JWT_SECRET o WEBHOOK_SECRET no configurados en variables de entorno',
      );
      return;
    }

    // Verificar si ya existen secrets activos
    const existingJwt = await this.prisma.secretRotation.findFirst({
      where: { secretType: 'JWT_SECRET', status: 'active' },
    });

    const existingWebhook = await this.prisma.secretRotation.findFirst({
      where: { secretType: 'WEBHOOK_SECRET', status: 'active' },
    });

    // Si no existen, crear los registros iniciales
    if (!existingJwt) {
      await this.registerNewSecret('JWT_SECRET', jwtSecret, 1);
      this.logger.log('✅ JWT_SECRET registrado en sistema de rotación');
    }

    if (!existingWebhook) {
      await this.registerNewSecret('WEBHOOK_SECRET', webhookSecret, 1);
      this.logger.log('✅ WEBHOOK_SECRET registrado en sistema de rotación');
    }
  }

  /**
   * Registra un nuevo secret en la base de datos
   *
   * @param type - Tipo de secret (JWT_SECRET o WEBHOOK_SECRET)
   * @param secret - El secret en texto plano (NO se guarda, solo su hash)
   * @param version - Versión del secret
   * @returns El registro creado
   */
  private async registerNewSecret(
    type: string,
    secret: string,
    version: number,
  ): Promise<{ id: string; expiresAt: Date }> {
    const hash = this.hashSecret(secret);
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + this.ROTATION_DAYS);

    const record = await this.prisma.secretRotation.create({
      data: {
        secretType: type,
        version,
        secretHash: hash,
        status: 'active',
        createdAt: now,
        expiresAt: expiresAt,
      },
    });

    this.logger.log(
      `📝 Secret ${type} v${version} registrado. Expira: ${expiresAt.toISOString()}`,
    );

    return record;
  }

  /**
   * Verifica el estado de un secret específico
   *
   * @param type - Tipo de secret a verificar
   * @returns Estado del secret con información de rotación
   */
  async checkSecretStatus(type: string): Promise<{
    needsRotation: boolean;
    daysUntilExpiration: number;
    currentVersion: number;
    expiresAt: Date | null;
  }> {
    const activeSecret = await this.prisma.secretRotation.findFirst({
      where: { secretType: type, status: 'active' },
      orderBy: { version: 'desc' },
    });

    if (!activeSecret) {
      this.logger.error(
        `❌ No se encontró secret activo para ${type}. Ejecutar inicialización.`,
      );
      return {
        needsRotation: true,
        daysUntilExpiration: 0,
        currentVersion: 0,
        expiresAt: null,
      };
    }

    const now = new Date();
    const daysUntilExpiration = Math.floor(
      (activeSecret.expiresAt.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    const needsRotation = daysUntilExpiration <= this.WARNING_DAYS_BEFORE;

    if (needsRotation) {
      this.logger.warn(
        `⚠️ ${type} v${activeSecret.version} expira en ${daysUntilExpiration} días. ROTAR AHORA.`,
      );
    }

    return {
      needsRotation,
      daysUntilExpiration,
      currentVersion: activeSecret.version,
      expiresAt: activeSecret.expiresAt,
    };
  }

  /**
   * Genera un nuevo secret aleatorio y seguro
   *
   * @param length - Longitud del secret en bytes (default: 64)
   * @returns Secret aleatorio en formato base64
   */
  generateNewSecret(length = 64): string {
    return randomBytes(length).toString('base64');
  }

  /**
   * Crea un hash SHA-256 del secret para almacenamiento seguro
   *
   * @param secret - Secret en texto plano
   * @returns Hash SHA-256 en formato hexadecimal
   */
  private hashSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
  }

  /**
   * Verifica si el secret en variables de entorno coincide con el hash almacenado
   *
   * @param type - Tipo de secret a verificar
   * @returns true si el secret coincide, false caso contrario
   */
  async verifyCurrentSecret(type: string): Promise<boolean> {
    let currentSecret: string | undefined;

    if (type === 'JWT_SECRET') {
      currentSecret = this.configService.get<string>('JWT_SECRET');
    } else if (type === 'WEBHOOK_SECRET') {
      currentSecret = this.configService.get<string>(
        'MERCADOPAGO_WEBHOOK_SECRET',
      );
    }

    if (!currentSecret) {
      this.logger.error(`❌ ${type} no configurado en variables de entorno`);
      return false;
    }

    const activeSecret = await this.prisma.secretRotation.findFirst({
      where: { secretType: type, status: 'active' },
      orderBy: { version: 'desc' },
    });

    if (!activeSecret) {
      this.logger.error(`❌ No hay secret activo para ${type} en la BD`);
      return false;
    }

    const currentHash = this.hashSecret(currentSecret);
    const matches = currentHash === activeSecret.secretHash;

    if (!matches) {
      this.logger.error(
        `🚨 CRITICAL: El ${type} en variables de entorno NO coincide con el hash en BD`,
      );
      this.logger.error(`Expected hash: ${activeSecret.secretHash}`);
      this.logger.error(`Actual hash: ${currentHash}`);
    }

    return matches;
  }

  /**
   * Obtiene el historial completo de rotaciones de un secret
   *
   * @param type - Tipo de secret
   * @returns Array de rotaciones ordenadas por versión descendente
   */
  async getSecretHistory(type: string): Promise<
    Array<{
      version: number;
      status: string;
      createdAt: Date;
      expiresAt: Date;
      rotatedAt: Date | null;
    }>
  > {
    const history = await this.prisma.secretRotation.findMany({
      where: { secretType: type },
      orderBy: { version: 'desc' },
      select: {
        version: true,
        status: true,
        createdAt: true,
        expiresAt: true,
        rotatedAt: true,
      },
    });

    return history;
  }

  /**
   * Endpoint de salud para verificar estado de todos los secrets
   * Útil para dashboards de seguridad y monitoreo
   */
  async getSecurityHealth(): Promise<{
    jwt_secret: {
      needsRotation: boolean;
      daysUntilExpiration: number;
      currentVersion: number;
    };
    webhook_secret: {
      needsRotation: boolean;
      daysUntilExpiration: number;
      currentVersion: number;
    };
    overallStatus: 'healthy' | 'warning' | 'critical';
  }> {
    const jwtStatus = await this.checkSecretStatus('JWT_SECRET');
    const webhookStatus = await this.checkSecretStatus('WEBHOOK_SECRET');

    let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';

    if (
      jwtStatus.daysUntilExpiration <= 0 ||
      webhookStatus.daysUntilExpiration <= 0
    ) {
      overallStatus = 'critical';
    } else if (jwtStatus.needsRotation || webhookStatus.needsRotation) {
      overallStatus = 'warning';
    }

    return {
      jwt_secret: {
        needsRotation: jwtStatus.needsRotation,
        daysUntilExpiration: jwtStatus.daysUntilExpiration,
        currentVersion: jwtStatus.currentVersion,
      },
      webhook_secret: {
        needsRotation: webhookStatus.needsRotation,
        daysUntilExpiration: webhookStatus.daysUntilExpiration,
        currentVersion: webhookStatus.currentVersion,
      },
      overallStatus: overallStatus,
    };
  }
}
