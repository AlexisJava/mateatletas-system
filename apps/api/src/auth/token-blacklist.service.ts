import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { JwtService } from '@nestjs/jwt';

/**
 * Servicio de Token Blacklist
 *
 * ¿QUÉ ES UNA BLACKLIST DE TOKENS?
 * ---------------------------------
 * Imagina que tienes una llave (token JWT) de tu casa.
 * Esa llave tiene fecha de vencimiento (1 mes).
 *
 * Problema: Si pierdes la llave, el ladrón puede usarla durante 1 mes completo.
 * Solución: Crear una "lista negra" de llaves robadas/perdidas.
 *
 * Cuando haces logout:
 * - Tu token (llave) se agrega a la lista negra
 * - Aunque sea válido técnicamente, ya no puede usarse
 * - Es como "cambiar la cerradura" pero solo para esa llave específica
 *
 * ¿POR QUÉ ES IMPORTANTE?
 * -----------------------
 * Sin blacklist:
 *   1. Usuario hace logout
 *   2. Token sigue funcionando hasta expirar
 *   3. Si alguien robó el token, puede seguir usándolo
 *
 * Con blacklist:
 *   1. Usuario hace logout
 *   2. Token se agrega a blacklist
 *   3. Token ya NO funciona, aunque no haya expirado
 *   4. Usuario está protegido inmediatamente
 *
 * ESCENARIOS DE USO:
 * ------------------
 * 1. Logout normal: Usuario cierra sesión voluntariamente
 * 2. Logout por seguridad: Usuario sospecha que su token fue comprometido
 * 3. Logout remoto: Admin invalida sesión de un usuario
 * 4. Cambio de contraseña: Invalidar TODOS los tokens del usuario
 *
 * IMPLEMENTACIÓN:
 * ---------------
 * - Usa Redis (cache) para almacenar tokens invalidados
 * - TTL automático: token se elimina de blacklist cuando expiraría naturalmente
 * - Rendimiento: Redis es ultra rápido (< 1ms por verificación)
 */
@Injectable()
export class TokenBlacklistService {
  private readonly logger = new Logger(TokenBlacklistService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private jwtService: JwtService,
  ) {}

  /**
   * Agregar un token a la blacklist
   *
   * @param token - El JWT token a invalidar
   * @param reason - Razón de invalidación (para logging/auditoría)
   *
   * Ejemplo:
   *   await blacklistService.addToBlacklist(token, 'user_logout')
   */
  async addToBlacklist(
    token: string,
    reason: string = 'logout',
  ): Promise<void> {
    try {
      // 1. Decodificar el token para obtener metadata
      const decodedRaw: unknown = this.jwtService.decode(token);
      if (!isDecodedToken(decodedRaw) || !decodedRaw.exp) {
        this.logger.warn(`Intento de blacklist de token inválido: ${reason}`);
        return;
      }
      const decoded: DecodedToken = decodedRaw;

      // 2. Calcular cuánto tiempo falta para que expire el token
      const now = Math.floor(Date.now() / 1000); // Tiempo actual en segundos

      if (!decoded.exp) {
        this.logger.warn('Token sin campo exp, no se puede blacklist');
        return;
      }

      const expiresIn = decoded.exp - now; // Segundos hasta expiración

      if (expiresIn <= 0) {
        // Token ya expiró, no necesita blacklist
        this.logger.debug(
          `Token ya expirado, no se agrega a blacklist: ${reason}`,
        );
        return;
      }

      // 3. Crear clave única para el token en Redis
      const blacklistKey = `blacklist:token:${token}`;

      // 4. Guardar en cache con TTL = tiempo restante hasta expiración
      // Cuando el token expiraría naturalmente, se elimina automáticamente de blacklist
      await this.cacheManager.set(
        blacklistKey,
        {
          reason,
          blacklistedAt: new Date().toISOString(),
          userId: decoded.sub || decoded.id,
          expiresAt: new Date(decoded.exp * 1000).toISOString(),
        },
        expiresIn * 1000, // TTL en milisegundos
      );

      this.logger.log(
        `Token blacklisted - User: ${decoded.sub || decoded.id}, Reason: ${reason}, TTL: ${expiresIn}s`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al agregar token a blacklist: ${err.message}`,
        err.stack,
      );
      // No lanzar error - mejor dejar pasar que romper el flujo
    }
  }

  /**
   * Verificar si un token está en la blacklist
   *
   * @param token - El JWT token a verificar
   * @returns true si está blacklisted, false si es válido
   *
   * Ejemplo:
   *   const isBlacklisted = await blacklistService.isBlacklisted(token)
   *   if (isBlacklisted) {
   *     throw new UnauthorizedException('Token invalidado')
   *   }
   */
  async isBlacklisted(token: string): Promise<boolean> {
    try {
      const blacklistKey = `blacklist:token:${token}`;
      const blacklistedData = await this.cacheManager.get<
        TokenBlacklistEntry | undefined
      >(blacklistKey);

      if (blacklistedData) {
        this.logger.warn(
          `Token blacklisted detectado - Data: ${JSON.stringify(blacklistedData)}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al verificar blacklist: ${err.message}`,
        err.stack,
      );
      // En caso de error de Redis, ser permisivo (no bloquear acceso legítimo)
      return false;
    }
  }

  /**
   * Invalidar TODOS los tokens de un usuario específico
   *
   * Útil para:
   * - Cambio de contraseña (cerrar todas las sesiones)
   * - Cuenta comprometida (logout remoto por admin)
   * - Eliminación de cuenta
   *
   * @param userId - ID del usuario
   * @param reason - Razón de invalidación masiva
   *
   * Ejemplo:
   *   await blacklistService.blacklistAllUserTokens('user-123', 'password_change')
   */
  async blacklistAllUserTokens(userId: string, reason: string): Promise<void> {
    try {
      // Crear una entrada especial que invalida TODOS los tokens del usuario
      const userBlacklistKey = `blacklist:user:${userId}`;

      // TTL de 24 horas (máximo tiempo de vida de un token)
      // Después de 24h, todos los tokens habrán expirado naturalmente
      const ttl = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

      await this.cacheManager.set(
        userBlacklistKey,
        {
          reason,
          blacklistedAt: new Date().toISOString(),
          allTokens: true,
        },
        ttl,
      );

      this.logger.warn(
        `TODOS los tokens del usuario ${userId} fueron invalidados - Reason: ${reason}`,
      );
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al blacklist masivo de usuario: ${err.message}`,
        err.stack,
      );
    }
  }

  /**
   * Verificar si TODOS los tokens de un usuario están blacklisted
   *
   * @param userId - ID del usuario
   * @returns true si todos los tokens del usuario están invalidados
   */
  async isUserBlacklisted(userId: string): Promise<boolean> {
    try {
      const userBlacklistKey = `blacklist:user:${userId}`;
      const blacklistedData = await this.cacheManager.get(userBlacklistKey);

      if (blacklistedData) {
        this.logger.warn(
          `Usuario ${userId} tiene blacklist masiva - Data: ${JSON.stringify(blacklistedData)}`,
        );
        return true;
      }

      return false;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al verificar user blacklist: ${err.message}`,
        err.stack,
      );
      return false;
    }
  }

  /**
   * Limpiar manualmente un token de la blacklist
   * (Normalmente no es necesario, Redis lo hace automáticamente con TTL)
   *
   * @param token - Token a remover de blacklist
   */
  async removeFromBlacklist(token: string): Promise<void> {
    try {
      const blacklistKey = `blacklist:token:${token}`;
      await this.cacheManager.del(blacklistKey);
      this.logger.log(`Token removido de blacklist: ${blacklistKey}`);
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error al remover token de blacklist: ${err.message}`,
        err.stack,
      );
    }
  }
}

interface DecodedToken {
  exp?: number;
  sub?: string;
  id?: string;
}

interface TokenBlacklistEntry {
  reason: string;
  blacklistedAt: string;
  userId?: string;
  expiresAt: string;
}

const isDecodedToken = (value: unknown): value is DecodedToken => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    (record.exp === undefined || typeof record.exp === 'number') &&
    (record.sub === undefined || typeof record.sub === 'string') &&
    (record.id === undefined || typeof record.id === 'string')
  );
};
