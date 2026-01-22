import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { Tutor } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from '../../common/constants/security.constants';

/**
 * Tipo de retorno: Tutor sin passwordHash
 */
export type TutorWithoutPassword = Omit<Tutor, 'passwordHash'>;

/**
 * Use Case: Validar Credenciales de Usuario
 *
 * RESPONSABILIDAD ÚNICA:
 * - Validar email + password contra la base de datos
 * - Migrar hashes de bcrypt con rounds antiguos (10 → 12)
 * - Retornar usuario sin passwordHash si es válido
 *
 * SEGURIDAD (NIST SP 800-63B 2025):
 * - Bcrypt con 12 rounds mínimo
 * - Migración gradual (fire-and-forget) de hashes antiguos
 * - No exponer información sobre existencia de usuarios
 */
@Injectable()
export class ValidateCredentialsUseCase {
  private readonly logger = new Logger(ValidateCredentialsUseCase.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida credenciales de un tutor
   *
   * @param email - Email del tutor
   * @param password - Contraseña en texto plano
   * @returns Tutor sin passwordHash si es válido, null si no
   */
  async execute(
    email: string,
    password: string,
  ): Promise<TutorWithoutPassword | null> {
    try {
      const tutor = await this.prisma.tutor.findUnique({
        where: { email },
      });

      if (!tutor) {
        return null;
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        tutor.passwordHash,
      );

      if (!isPasswordValid) {
        return null;
      }

      // ✅ SECURITY: Rehash password if using old rounds (gradual migration)
      await this.rehashIfNeeded(tutor, password);

      // Retornar tutor sin passwordHash
      const { passwordHash, ...result } = tutor;
      void passwordHash; // Evitar warning de variable no usada
      return result;
    } catch (error) {
      // Log del error sin exponer detalles al cliente
      this.logger.error(
        'Error en validateCredentials',
        error instanceof Error ? error.stack : error,
      );
      return null;
    }
  }

  /**
   * Rehashea la contraseña si usa rounds antiguos
   * Operación fire-and-forget para no bloquear el login
   *
   * @param tutor - Tutor con passwordHash
   * @param password - Contraseña en texto plano
   */
  private async rehashIfNeeded(tutor: Tutor, password: string): Promise<void> {
    const currentRounds = this.getRoundsFromHash(tutor.passwordHash);

    if (currentRounds < BCRYPT_ROUNDS) {
      this.logger.log(
        `Rehashing password for tutor ${tutor.id} from ${currentRounds} to ${BCRYPT_ROUNDS} rounds`,
      );

      try {
        const newHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

        await this.prisma.tutor.update({
          where: { id: tutor.id },
          data: { passwordHash: newHash },
        });

        this.logger.log(`Password rehashed successfully for tutor ${tutor.id}`);
      } catch (error) {
        // Fire-and-forget: no bloquear login si falla el rehash
        this.logger.error(
          `Failed to rehash password for tutor ${tutor.id}`,
          error instanceof Error ? error.stack : error,
        );
      }
    }
  }

  /**
   * Extrae el número de rounds de un hash de bcrypt
   *
   * Formato de bcrypt hash: $2b$XX$... donde XX es el número de rounds
   * Ejemplo: $2b$12$abcdef... -> 12 rounds
   *
   * @param hash - Hash de bcrypt
   * @returns Número de rounds usado en el hash
   */
  private getRoundsFromHash(hash: string): number {
    try {
      const parts = hash.split('$');
      const roundsPart = parts[2];
      if (!roundsPart) {
        this.logger.warn(
          `Invalid bcrypt hash format: ${hash.substring(0, 10)}...`,
        );
        return 0;
      }
      return parseInt(roundsPart, 10);
    } catch (error) {
      this.logger.error(
        'Error extracting rounds from hash',
        error instanceof Error ? error.stack : error,
      );
      return 0;
    }
  }
}
