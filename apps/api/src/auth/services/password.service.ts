import { Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

/**
 * Resultado de la validación de fortaleza de contraseña
 */
export interface PasswordStrengthResult {
  /** Si la contraseña cumple todos los requisitos */
  valid: boolean;
  /** Lista de errores encontrados */
  errors: string[];
}

/**
 * Resultado de la verificación de contraseña con protección contra timing attacks
 */
export interface PasswordVerifyResult {
  /** Si la contraseña es válida */
  isValid: boolean;
  /** Si se necesita rehash (rounds antiguos) */
  needsRehash: boolean;
  /** Rounds actuales del hash (0 si es dummy) */
  currentRounds: number;
}

/**
 * PasswordService - Servicio centralizado para gestión de contraseñas
 *
 * Responsabilidades:
 * - Hashing de contraseñas con bcrypt
 * - Verificación de contraseñas con protección timing-attack
 * - Validación de fortaleza de contraseñas
 * - Detección de hashes que necesitan rehash (migración gradual)
 *
 * Seguridad:
 * - Usa bcrypt con 12 rounds (NIST SP 800-63B 2025)
 * - Protección contra timing attacks usando dummy hash
 * - Soporte para migración gradual de rounds antiguos
 */
@Injectable()
export class PasswordService {
  private readonly logger = new Logger(PasswordService.name);

  /**
   * Rounds de bcrypt según NIST SP 800-63B 2025
   * 12 rounds = ~250ms en hardware moderno
   */
  readonly BCRYPT_ROUNDS = 12;

  /**
   * Hash dummy para protección contra timing attacks
   * Se usa cuando el usuario no existe para que bcrypt.compare
   * siempre tome el mismo tiempo
   */
  readonly DUMMY_HASH =
    '$2b$12$K4o0xTkH6xQ.0Z3Xm5qPxOq8q5k5kK6kK7kK8kK9kKAkKBkKCkKDe';

  /**
   * Hashea una contraseña usando bcrypt
   *
   * @param password - Contraseña en texto plano
   * @returns Hash de la contraseña
   */
  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.BCRYPT_ROUNDS);
  }

  /**
   * Verifica si una contraseña coincide con su hash
   *
   * @param password - Contraseña en texto plano
   * @param hashedPassword - Hash almacenado
   * @returns true si coinciden, false si no
   */
  async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Verifica una contraseña con protección contra timing attacks
   *
   * Esta función SIEMPRE ejecuta bcrypt.compare, incluso si el usuario
   * no existe (usando un hash dummy). Esto previene que un atacante
   * pueda determinar si un usuario existe basándose en el tiempo de respuesta.
   *
   * @param password - Contraseña en texto plano
   * @param hashedPassword - Hash almacenado (o null/undefined si el usuario no existe)
   * @returns Resultado de la verificación con información adicional
   */
  async verifyWithTimingProtection(
    password: string,
    hashedPassword: string | null | undefined,
  ): Promise<PasswordVerifyResult> {
    const hashToCompare = hashedPassword || this.DUMMY_HASH;
    const isValid = await bcrypt.compare(password, hashToCompare);

    // Si usamos dummy hash, siempre es inválido
    if (!hashedPassword) {
      return {
        isValid: false,
        needsRehash: false,
        currentRounds: 0,
      };
    }

    const currentRounds = this.getRoundsFromHash(hashedPassword);
    const needsRehash = currentRounds > 0 && currentRounds < this.BCRYPT_ROUNDS;

    return {
      isValid,
      needsRehash,
      currentRounds,
    };
  }

  /**
   * Extrae el número de rounds de un hash bcrypt
   *
   * Formato bcrypt: $2b$XX$... donde XX es el número de rounds
   * Ejemplo: $2b$12$abcdef... -> 12 rounds
   *
   * @param hash - Hash de bcrypt
   * @returns Número de rounds, o 0 si el formato es inválido
   */
  getRoundsFromHash(hash: string): number {
    try {
      const parts = hash.split('$');
      if (parts.length < 3) {
        this.logger.warn(
          `Invalid bcrypt hash format: ${hash.substring(0, 10)}...`,
        );
        return 0;
      }
      return parseInt(parts[2], 10);
    } catch {
      this.logger.error('Error extracting rounds from hash');
      return 0;
    }
  }

  /**
   * Determina si un hash necesita ser actualizado a más rounds
   *
   * Útil para migración gradual de contraseñas con rounds antiguos
   *
   * @param hash - Hash de bcrypt existente
   * @returns true si el hash tiene menos rounds que el estándar actual
   */
  needsRehash(hash: string): boolean {
    const currentRounds = this.getRoundsFromHash(hash);
    return currentRounds > 0 && currentRounds < this.BCRYPT_ROUNDS;
  }

  /**
   * Valida la fortaleza de una contraseña
   *
   * Requisitos (alineados con RegisterDto):
   * - Mínimo 8 caracteres
   * - Al menos una letra mayúscula
   * - Al menos una letra minúscula
   * - Al menos un número
   * - Al menos un carácter especial (@$!%*?&)
   *
   * @param password - Contraseña a validar
   * @returns Resultado con validez y lista de errores
   */
  validateStrength(password: string): PasswordStrengthResult {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push('La contraseña debe tener al menos 8 caracteres');
    }

    if (password.length > 128) {
      errors.push('La contraseña no puede superar los 128 caracteres');
    }

    if (!/[A-Z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una mayúscula');
    }

    if (!/[a-z]/.test(password)) {
      errors.push('La contraseña debe contener al menos una minúscula');
    }

    if (!/[0-9]/.test(password)) {
      errors.push('La contraseña debe contener al menos un número');
    }

    if (!/[@$!%*?&]/.test(password)) {
      errors.push(
        'La contraseña debe contener al menos un carácter especial (@$!%*?&)',
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Genera una contraseña temporal segura
   *
   * Útil para crear contraseñas temporales para nuevos usuarios
   * que deben cambiarla en el primer login
   *
   * @param length - Longitud de la contraseña (default: 12)
   * @returns Contraseña generada que cumple requisitos de fortaleza
   */
  generateTemporaryPassword(length: number = 12): string {
    const uppercase = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Sin I, O para evitar confusión
    const lowercase = 'abcdefghjkmnpqrstuvwxyz'; // Sin i, l, o para evitar confusión
    const numbers = '23456789'; // Sin 0, 1 para evitar confusión
    const special = '@$!%*?&';

    // Asegurar al menos uno de cada tipo
    let password =
      uppercase[Math.floor(Math.random() * uppercase.length)] +
      lowercase[Math.floor(Math.random() * lowercase.length)] +
      numbers[Math.floor(Math.random() * numbers.length)] +
      special[Math.floor(Math.random() * special.length)];

    // Completar con caracteres aleatorios
    const allChars = uppercase + lowercase + numbers + special;
    for (let i = password.length; i < length; i++) {
      password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Mezclar los caracteres
    return password
      .split('')
      .sort(() => Math.random() - 0.5)
      .join('');
  }
}
