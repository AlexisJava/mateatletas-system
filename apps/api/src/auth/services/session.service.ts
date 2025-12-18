import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { TokenBlacklistService } from '../token-blacklist.service';

/**
 * Información de una sesión activa
 */
export interface SessionInfo {
  /** JTI del refresh token (ID de sesión) */
  id: string;
  /** IP desde donde se creó */
  ipAddress: string | null;
  /** User agent del dispositivo */
  userAgent: string | null;
  /** Dispositivo parseado del user agent */
  device: string;
  /** Navegador parseado del user agent */
  browser: string;
  /** Fecha de creación de la sesión */
  createdAt: Date;
  /** Última actividad */
  lastUsedAt: Date;
  /** Fecha de expiración */
  expiresAt: Date;
  /** Si es la sesión actual */
  isCurrent: boolean;
}

/**
 * SessionService - Gestión de sesiones activas
 *
 * Permite:
 * - Ver todas las sesiones activas de un usuario
 * - Revocar una sesión específica
 * - Revocar todas las sesiones excepto la actual
 * - Obtener información del dispositivo desde user agent
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly tokenBlacklistService: TokenBlacklistService,
  ) {}

  /**
   * Crea un registro de sesión cuando se genera un refresh token
   *
   * @param jti - JTI único del refresh token
   * @param userId - ID del usuario
   * @param userType - Tipo de usuario
   * @param expiresAt - Fecha de expiración del refresh token
   * @param ipAddress - IP del cliente
   * @param userAgent - User agent del navegador
   */
  async createSession(
    jti: string,
    userId: string,
    userType: string,
    expiresAt: Date,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<void> {
    try {
      await this.prisma.refreshTokenSession.create({
        data: {
          id: jti,
          user_id: userId,
          user_type: userType,
          ip_address: ipAddress ?? null,
          user_agent: userAgent ?? null,
          expiresAt,
          lastUsedAt: new Date(),
          revoked: false,
        },
      });

      this.logger.debug(`Sesión creada para usuario ${userId}, JTI: ${jti}`);
    } catch (error) {
      // Si falla por duplicado (JTI ya existe), ignorar
      this.logger.warn(
        `Error creando sesión: ${error instanceof Error ? error.message : 'Error desconocido'}`,
      );
    }
  }

  /**
   * Actualiza la última actividad de una sesión
   *
   * @param jti - JTI de la sesión
   */
  async updateLastUsed(jti: string): Promise<void> {
    try {
      await this.prisma.refreshTokenSession.update({
        where: { id: jti },
        data: { lastUsedAt: new Date() },
      });
    } catch {
      // Ignorar si la sesión no existe
    }
  }

  /**
   * Obtiene todas las sesiones activas de un usuario
   *
   * @param userId - ID del usuario
   * @param currentJti - JTI de la sesión actual (para marcarla)
   * @returns Lista de sesiones activas
   */
  async getActiveSessions(
    userId: string,
    currentJti?: string,
  ): Promise<SessionInfo[]> {
    const sessions = await this.prisma.refreshTokenSession.findMany({
      where: {
        user_id: userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      orderBy: {
        lastUsedAt: 'desc',
      },
    });

    return sessions.map((session) => {
      const { device, browser } = this.parseUserAgent(session.user_agent);

      return {
        id: session.id,
        ipAddress: session.ip_address,
        userAgent: session.user_agent,
        device,
        browser,
        createdAt: session.createdAt,
        lastUsedAt: session.lastUsedAt,
        expiresAt: session.expiresAt,
        isCurrent: session.id === currentJti,
      };
    });
  }

  /**
   * Revoca una sesión específica
   *
   * @param sessionId - JTI de la sesión a revocar
   * @param userId - ID del usuario (para validar ownership)
   * @param reason - Razón de revocación
   */
  async revokeSession(
    sessionId: string,
    userId: string,
    reason: string = 'user_action',
  ): Promise<void> {
    // 1. Verificar que la sesión pertenece al usuario
    const session = await this.prisma.refreshTokenSession.findFirst({
      where: {
        id: sessionId,
        user_id: userId,
        revoked: false,
      },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    // 2. Marcar sesión como revocada en DB
    await this.prisma.refreshTokenSession.update({
      where: { id: sessionId },
      data: {
        revoked: true,
        revokedReason: reason,
      },
    });

    // 3. Blacklist el JTI en cache (para invalidación inmediata)
    const ttlSeconds = Math.max(
      0,
      Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
    );
    if (ttlSeconds > 0) {
      await this.tokenBlacklistService.blacklistRefreshToken(
        sessionId,
        ttlSeconds,
        reason,
      );
    }

    this.logger.log(`Sesión ${sessionId} revocada para usuario ${userId}`);
  }

  /**
   * Revoca todas las sesiones de un usuario excepto la actual
   *
   * @param userId - ID del usuario
   * @param currentJti - JTI de la sesión actual a preservar
   * @param reason - Razón de revocación
   * @returns Número de sesiones revocadas
   */
  async revokeAllSessionsExceptCurrent(
    userId: string,
    currentJti: string,
    reason: string = 'logout_all',
  ): Promise<number> {
    // 1. Obtener todas las sesiones activas excepto la actual
    const sessions = await this.prisma.refreshTokenSession.findMany({
      where: {
        user_id: userId,
        revoked: false,
        id: {
          not: currentJti,
        },
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // 2. Revocar cada sesión
    for (const session of sessions) {
      await this.prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: {
          revoked: true,
          revokedReason: reason,
        },
      });

      const ttlSeconds = Math.max(
        0,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      );
      if (ttlSeconds > 0) {
        await this.tokenBlacklistService.blacklistRefreshToken(
          session.id,
          ttlSeconds,
          reason,
        );
      }
    }

    this.logger.log(
      `${sessions.length} sesiones revocadas para usuario ${userId} (excepto ${currentJti})`,
    );

    return sessions.length;
  }

  /**
   * Revoca todas las sesiones de un usuario
   *
   * @param userId - ID del usuario
   * @param reason - Razón de revocación
   * @returns Número de sesiones revocadas
   */
  async revokeAllSessions(
    userId: string,
    reason: string = 'security',
  ): Promise<number> {
    const sessions = await this.prisma.refreshTokenSession.findMany({
      where: {
        user_id: userId,
        revoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    for (const session of sessions) {
      await this.prisma.refreshTokenSession.update({
        where: { id: session.id },
        data: {
          revoked: true,
          revokedReason: reason,
        },
      });

      const ttlSeconds = Math.max(
        0,
        Math.floor((session.expiresAt.getTime() - Date.now()) / 1000),
      );
      if (ttlSeconds > 0) {
        await this.tokenBlacklistService.blacklistRefreshToken(
          session.id,
          ttlSeconds,
          reason,
        );
      }
    }

    this.logger.log(
      `Todas las sesiones (${sessions.length}) revocadas para usuario ${userId}`,
    );

    return sessions.length;
  }

  /**
   * Parsea el user agent para extraer dispositivo y navegador
   */
  private parseUserAgent(userAgent: string | null): {
    device: string;
    browser: string;
  } {
    if (!userAgent) {
      return { device: 'Desconocido', browser: 'Desconocido' };
    }

    // Detectar dispositivo
    let device = 'Escritorio';
    if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) {
      if (/iPhone|iPad|iPod/i.test(userAgent)) {
        device = 'iOS';
      } else if (/Android/i.test(userAgent)) {
        device = 'Android';
      } else {
        device = 'Móvil';
      }
    } else if (/Windows/i.test(userAgent)) {
      device = 'Windows';
    } else if (/Mac/i.test(userAgent)) {
      device = 'Mac';
    } else if (/Linux/i.test(userAgent)) {
      device = 'Linux';
    }

    // Detectar navegador
    let browser = 'Otro';
    if (/Chrome/i.test(userAgent) && !/Edge/i.test(userAgent)) {
      browser = 'Chrome';
    } else if (/Firefox/i.test(userAgent)) {
      browser = 'Firefox';
    } else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) {
      browser = 'Safari';
    } else if (/Edge/i.test(userAgent)) {
      browser = 'Edge';
    } else if (/MSIE|Trident/i.test(userAgent)) {
      browser = 'Internet Explorer';
    }

    return { device, browser };
  }

  /**
   * Limpia sesiones expiradas (para cron job)
   */
  async cleanupExpiredSessions(): Promise<number> {
    const result = await this.prisma.refreshTokenSession.deleteMany({
      where: {
        OR: [{ expiresAt: { lt: new Date() } }, { revoked: true }],
      },
    });

    if (result.count > 0) {
      this.logger.log(`Limpiadas ${result.count} sesiones expiradas/revocadas`);
    }

    return result.count;
  }
}
