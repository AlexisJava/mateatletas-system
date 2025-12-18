import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '../../domain/constants';
import {
  ACCESS_TOKEN_EXPIRATION,
  ACCESS_TOKEN_COOKIE_MAX_AGE,
  REFRESH_TOKEN_EXPIRATION,
  REFRESH_TOKEN_COOKIE_MAX_AGE,
} from '../../common/constants/security.constants';

/**
 * Tipos de usuario soportados por el sistema de autenticación
 */
export type UserType = 'tutor' | 'docente' | 'admin' | 'estudiante';

/**
 * Payload estándar para tokens JWT de autenticación (access token)
 */
export interface TokenPayload {
  /** ID del usuario (subject) */
  sub: string;
  /** Email o identificador del usuario */
  email: string;
  /** Rol principal (backward compatibility) */
  role: Role;
  /** Array de roles del usuario */
  roles: Role[];
  /** Tipo de token */
  type?: 'access';
}

/**
 * Payload para refresh tokens
 */
export interface RefreshTokenPayload {
  /** ID del usuario (subject) */
  sub: string;
  /** Tipo de token - siempre 'refresh' */
  type: 'refresh';
  /** JWT ID único para blacklisting */
  jti: string;
  /** Issued at (timestamp) */
  iat?: number;
  /** Expiration (timestamp) */
  exp?: number;
}

/**
 * Payload para tokens MFA temporales
 */
export interface MfaTokenPayload {
  /** ID del usuario */
  sub: string;
  /** Email del usuario */
  email: string;
  /** Tipo de token */
  type: 'mfa_pending';
}

/**
 * Resultado de la generación de token
 */
export interface TokenResult {
  /** Token JWT firmado */
  accessToken: string;
  /** Tiempo de expiración en segundos */
  expiresIn: number;
}

/**
 * Resultado de la generación de par de tokens (access + refresh)
 */
export interface TokenPairResult {
  /** Access token JWT */
  accessToken: string;
  /** Refresh token JWT */
  refreshToken: string;
  /** JTI del refresh token (para blacklisting) */
  refreshTokenJti: string;
}

/**
 * Opciones de configuración para cookies de autenticación
 */
interface CookieOptions {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
  path: string;
}

/**
 * TokenService - Servicio centralizado para gestión de tokens JWT
 *
 * Responsabilidades:
 * - Generación de access tokens (corta duración)
 * - Generación de refresh tokens (larga duración, rotación)
 * - Generación de tokens MFA temporales
 * - Gestión de cookies httpOnly para tokens
 * - Verificación de tokens
 *
 * Arquitectura de tokens:
 * - Access Token: 15min (prod) / 1h (dev) - para autenticar requests
 * - Refresh Token: 7 días - para renovar access tokens
 * - MFA Token: 5min - para completar login con MFA
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);
  private readonly isProduction: boolean;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.isProduction =
      this.configService.get<string>('NODE_ENV') === 'production';
  }

  // ============================================================================
  // ACCESS TOKEN
  // ============================================================================

  /**
   * Genera un access token JWT de autenticación
   *
   * @param userId - ID del usuario
   * @param email - Email o identificador del usuario
   * @param roles - Array de roles del usuario
   * @returns Token JWT firmado
   */
  generateAccessToken(
    userId: string,
    email: string,
    roles: Role[] | Role = [Role.TUTOR],
  ): string {
    const rolesArray = Array.isArray(roles) ? roles : [roles];
    const normalizedRoles = rolesArray.length > 0 ? rolesArray : [Role.TUTOR];

    const payload: TokenPayload = {
      sub: userId,
      email,
      role: normalizedRoles[0] ?? Role.TUTOR,
      roles: normalizedRoles,
      type: 'access',
    };

    return this.jwtService.sign(payload, {
      expiresIn: ACCESS_TOKEN_EXPIRATION,
    });
  }

  /**
   * Verifica y decodifica un access token
   *
   * @param token - Token JWT a verificar
   * @returns Payload del token si es válido, null si es inválido
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      const payload = this.jwtService.verify<TokenPayload>(token);

      // Rechazar si es un refresh token
      if ((payload as unknown as RefreshTokenPayload).type === 'refresh') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // REFRESH TOKEN
  // ============================================================================

  /**
   * Genera un refresh token JWT
   *
   * Características:
   * - Larga duración (7 días)
   * - Contiene JTI único para blacklisting individual
   * - Solo contiene userId (sub), no roles/email
   * - Tipo 'refresh' para distinguirlo de access tokens
   *
   * @param userId - ID del usuario
   * @returns Objeto con token y JTI
   */
  generateRefreshToken(userId: string): { token: string; jti: string } {
    const jti = uuidv4();

    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
      jti,
    };

    const token = this.jwtService.sign(payload, {
      expiresIn: REFRESH_TOKEN_EXPIRATION,
    });

    this.logger.debug(
      `Refresh token generado para usuario ${userId}, JTI: ${jti}`,
    );

    return { token, jti };
  }

  /**
   * Verifica y decodifica un refresh token
   *
   * @param token - Refresh token a verificar
   * @returns Payload del token si es válido
   * @throws UnauthorizedException si el token es inválido o no es refresh token
   */
  verifyRefreshToken(token: string): RefreshTokenPayload {
    try {
      const payload = this.jwtService.verify<RefreshTokenPayload>(token);

      // Verificar que sea un refresh token
      if (payload.type !== 'refresh') {
        this.logger.warn('Token no es de tipo refresh');
        throw new UnauthorizedException('Token inválido');
      }

      // Verificar que tenga JTI
      if (!payload.jti) {
        this.logger.warn('Refresh token sin JTI');
        throw new UnauthorizedException('Token inválido');
      }

      return payload;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      this.logger.warn('Error verificando refresh token', error);
      throw new UnauthorizedException('Refresh token inválido o expirado');
    }
  }

  /**
   * Genera un par de tokens (access + refresh)
   *
   * Útil para login y refresh, donde necesitamos ambos tokens
   *
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @param roles - Roles del usuario
   * @returns Par de tokens con JTI del refresh
   */
  generateTokenPair(
    userId: string,
    email: string,
    roles: Role[] | Role = [Role.TUTOR],
  ): TokenPairResult {
    const accessToken = this.generateAccessToken(userId, email, roles);
    const { token: refreshToken, jti: refreshTokenJti } =
      this.generateRefreshToken(userId);

    return {
      accessToken,
      refreshToken,
      refreshTokenJti,
    };
  }

  /**
   * Calcula el tiempo restante hasta expiración de un refresh token
   *
   * @param payload - Payload del refresh token
   * @returns Segundos hasta expiración, o 0 si ya expiró
   */
  getRefreshTokenTtl(payload: RefreshTokenPayload): number {
    if (!payload.exp) {
      return 0;
    }

    const now = Math.floor(Date.now() / 1000);
    const ttl = payload.exp - now;

    return ttl > 0 ? ttl : 0;
  }

  // ============================================================================
  // MFA TOKEN
  // ============================================================================

  /**
   * Genera un token temporal para verificación MFA
   *
   * Este token:
   * - Es válido solo 5 minutos
   * - Solo puede usarse en el endpoint de verificación MFA
   * - Contiene tipo 'mfa_pending' para distinguirlo de tokens regulares
   *
   * @param userId - ID del usuario
   * @param email - Email del usuario
   * @returns Token JWT temporal para MFA
   */
  generateMfaToken(userId: string, email: string): string {
    const payload: MfaTokenPayload = {
      sub: userId,
      email,
      type: 'mfa_pending',
    };

    return this.jwtService.sign(payload, {
      expiresIn: '5m',
    });
  }

  /**
   * Verifica y decodifica un token MFA
   *
   * @param token - Token MFA a verificar
   * @returns Payload del token si es válido, null si es inválido
   */
  verifyMfaToken(token: string): MfaTokenPayload | null {
    try {
      const payload = this.jwtService.verify<MfaTokenPayload>(token);

      if (payload.type !== 'mfa_pending') {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }

  // ============================================================================
  // COOKIE MANAGEMENT
  // ============================================================================

  /**
   * Obtiene la configuración de cookie para access tokens
   */
  private getAccessTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE,
      path: '/',
    };
  }

  /**
   * Obtiene la configuración de cookie para refresh tokens
   */
  private getRefreshTokenCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE,
      path: '/',
    };
  }

  /**
   * @deprecated Use getAccessTokenCookieOptions instead
   */
  private getCookieOptions(): CookieOptions {
    return this.getAccessTokenCookieOptions();
  }

  /**
   * Establece el access token como cookie httpOnly
   *
   * @param res - Response de Express
   * @param token - Access token JWT
   */
  setTokenCookie(res: Response, token: string): void {
    const cookieOptions = this.getAccessTokenCookieOptions();
    res.cookie('auth-token', token, cookieOptions);
    this.logger.debug('Cookie auth-token establecida');
  }

  /**
   * Establece el refresh token como cookie httpOnly
   *
   * @param res - Response de Express
   * @param token - Refresh token JWT
   */
  setRefreshTokenCookie(res: Response, token: string): void {
    const cookieOptions = this.getRefreshTokenCookieOptions();
    res.cookie('refresh-token', token, cookieOptions);
    this.logger.debug('Cookie refresh-token establecida');
  }

  /**
   * Establece ambos tokens (access y refresh) como cookies
   *
   * @param res - Response de Express
   * @param accessToken - Access token JWT
   * @param refreshToken - Refresh token JWT
   */
  setTokenCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ): void {
    this.setTokenCookie(res, accessToken);
    this.setRefreshTokenCookie(res, refreshToken);
  }

  /**
   * Limpia la cookie de access token
   *
   * @param res - Response de Express
   */
  clearTokenCookie(res: Response): void {
    const cookieOptions = this.getAccessTokenCookieOptions();

    res.clearCookie('auth-token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    this.logger.debug('Cookie auth-token eliminada');
  }

  /**
   * Limpia la cookie de refresh token
   *
   * @param res - Response de Express
   */
  clearRefreshTokenCookie(res: Response): void {
    const cookieOptions = this.getRefreshTokenCookieOptions();

    res.clearCookie('refresh-token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    this.logger.debug('Cookie refresh-token eliminada');
  }

  /**
   * Limpia ambas cookies de autenticación
   *
   * @param res - Response de Express
   */
  clearAllTokenCookies(res: Response): void {
    this.clearTokenCookie(res);
    this.clearRefreshTokenCookie(res);
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Parsea el tiempo de expiración de un string a segundos
   *
   * @param expiresIn - String de expiración (e.g., '1h', '7d', '5m')
   * @returns Tiempo en segundos
   */
  parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 3600; // default 1 hour
    }

    const value = parseInt(match[1] ?? '0', 10);
    const unit = match[2] ?? 's';

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }
}
