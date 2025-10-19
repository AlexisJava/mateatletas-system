import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { TokenBlacklistService } from '../token-blacklist.service';

/**
 * Guard de Token Blacklist
 *
 * ¿QUÉ HACE?
 * ----------
 * Antes de permitir acceso a un endpoint protegido:
 * 1. Extrae el token JWT del header Authorization
 * 2. Verifica si ese token específico está en blacklist
 * 3. Verifica si TODOS los tokens del usuario están en blacklist
 * 4. Si está blacklisted → ❌ Rechaza con 401 Unauthorized
 * 5. Si está limpio → ✅ Permite continuar
 *
 * ORDEN DE GUARDS:
 * ----------------
 * 1. JwtAuthGuard - Verifica que el token sea válido técnicamente
 * 2. TokenBlacklistGuard - Verifica que el token NO esté invalidado
 * 3. RolesGuard - Verifica permisos del usuario
 *
 * Es importante que vaya DESPUÉS de JwtAuthGuard porque:
 * - Necesita que el token ya esté decodificado
 * - Necesita acceso a req.user (que JwtAuthGuard agrega)
 *
 * EJEMPLO DE USO:
 * ---------------
 * @Controller('api/admin')
 * @UseGuards(JwtAuthGuard, TokenBlacklistGuard, RolesGuard)
 * export class AdminController {
 *   // Si el usuario hizo logout, su token está blacklisted
 *   // Este guard lo detectará y rechazará el request
 * }
 */
@Injectable()
export class TokenBlacklistGuard implements CanActivate {
  private readonly logger = new Logger(TokenBlacklistGuard.name);

  constructor(
    private reflector: Reflector,
    private tokenBlacklistService: TokenBlacklistService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Verificar si la ruta está marcada como @Public() o similar
    const isPublic = this.reflector.getAllAndOverride<boolean>('isPublic', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      // Rutas públicas no necesitan verificación de blacklist
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();

    // 2. Extraer el token del header Authorization
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      // Si no hay token, otro guard (JwtAuthGuard) se encargará
      // No es responsabilidad de este guard validar la presencia del token
      return true;
    }

    // 3. Verificar si el token específico está en blacklist
    const isTokenBlacklisted = await this.tokenBlacklistService.isBlacklisted(token);

    if (isTokenBlacklisted) {
      this.logger.warn(
        `Token blacklisted rechazado - IP: ${request.ip}, URL: ${request.url}`,
      );
      throw new UnauthorizedException(
        'Token invalidado. Por favor, inicia sesión nuevamente.',
      );
    }

    // 4. Verificar si TODOS los tokens del usuario están blacklisted
    // (por ejemplo, después de cambio de contraseña)
    const user = (request as any).user;
    if (user && user.id) {
      const isUserBlacklisted = await this.tokenBlacklistService.isUserBlacklisted(user.id);

      if (isUserBlacklisted) {
        this.logger.warn(
          `Usuario ${user.id} con blacklist masiva - IP: ${request.ip}, URL: ${request.url}`,
        );
        throw new UnauthorizedException(
          'Tu sesión ha sido invalidada. Por favor, inicia sesión nuevamente.',
        );
      }
    }

    // ✅ Token limpio, permitir acceso
    return true;
  }

  /**
   * Extrae el token JWT del header Authorization
   *
   * Formato esperado: "Bearer <token>"
   *
   * @param request - Request de Express
   * @returns El token JWT sin el prefijo "Bearer ", o null si no existe
   */
  private extractTokenFromHeader(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
