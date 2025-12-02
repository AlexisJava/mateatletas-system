import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { Role } from '../../domain/constants';

/**
 * Tipos de usuario soportados por el sistema de autenticación
 */
export type UserType = 'tutor' | 'docente' | 'admin' | 'estudiante';

/**
 * Payload estándar para tokens JWT de autenticación
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
 * - Generación de tokens JWT de autenticación
 * - Generación de tokens MFA temporales
 * - Gestión de cookies httpOnly para tokens
 * - Verificación de tokens
 *
 * Este servicio fue extraído de AuthService para:
 * - Reducir el tamaño del servicio monolítico
 * - Centralizar la lógica de tokens en un solo lugar
 * - Facilitar testing y mantenimiento
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

  /**
   * Genera un token JWT de autenticación
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
      role: normalizedRoles[0],
      roles: normalizedRoles,
    };

    return this.jwtService.sign(payload);
  }

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

  /**
   * Verifica y decodifica un token de autenticación
   *
   * @param token - Token JWT a verificar
   * @returns Payload del token si es válido, null si es inválido
   */
  verifyAccessToken(token: string): TokenPayload | null {
    try {
      return this.jwtService.verify<TokenPayload>(token);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene la configuración de cookie para tokens de autenticación
   *
   * @returns Opciones de cookie configuradas según el entorno
   */
  private getCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: this.isProduction,
      sameSite: 'lax',
      maxAge: this.isProduction ? 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 1h prod, 7d dev
      path: '/',
    };
  }

  /**
   * Establece el token de autenticación como cookie httpOnly
   *
   * @param res - Response de Express
   * @param token - Token JWT a establecer
   */
  setTokenCookie(res: Response, token: string): void {
    const cookieOptions = this.getCookieOptions();

    res.cookie('auth-token', token, cookieOptions);

    this.logger.debug('Cookie auth-token establecida');
  }

  /**
   * Limpia la cookie de autenticación
   *
   * @param res - Response de Express
   */
  clearTokenCookie(res: Response): void {
    const cookieOptions = this.getCookieOptions();

    res.clearCookie('auth-token', {
      httpOnly: cookieOptions.httpOnly,
      secure: cookieOptions.secure,
      sameSite: cookieOptions.sameSite,
      path: cookieOptions.path,
    });

    this.logger.debug('Cookie auth-token eliminada');
  }

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

    const value = parseInt(match[1], 10);
    const unit = match[2];

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