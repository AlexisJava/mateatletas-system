import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Servicio de Login Attempts
 *
 * Maneja el registro y validación de intentos de login para prevenir brute force attacks.
 *
 * CARACTERÍSTICAS:
 * - Registra todos los intentos de login (exitosos y fallidos)
 * - Bloquea cuenta tras 5 intentos fallidos en 15 minutos
 * - Limpia intentos automáticamente tras login exitoso
 * - Rastrea IP para auditoría de seguridad
 */
@Injectable()
export class LoginAttemptService {
  constructor(private prisma: PrismaService) {}

  /**
   * Verificar y registrar intento de login
   *
   * @param email - Email del usuario
   * @param ip - IP del cliente
   * @param success - Si el login fue exitoso
   * @throws TooManyRequestsException si hay 5+ intentos fallidos en 15 min
   */
  async checkAndRecordAttempt(
    email: string,
    ip: string,
    success: boolean,
  ): Promise<void> {
    // 1. Registrar intento en la base de datos
    await this.prisma.$executeRaw`
      INSERT INTO login_attempts (id, email, ip, success, created_at)
      VALUES (gen_random_uuid(), ${email}, ${ip}, ${success}, NOW())
    `;

    // 2. Si el login fue exitoso, limpiar intentos fallidos anteriores
    if (success) {
      await this.clearAttempts(email);
      return;
    }

    // 3. Si fue fallido, verificar cantidad de intentos recientes
    const recentFailures = await this.prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count FROM login_attempts
      WHERE email = ${email}
      AND success = false
      AND created_at > NOW() - INTERVAL '15 minutes'
    `;

    const failureCount = Number(recentFailures[0].count);

    // 4. Si hay 5 o más fallos, bloquear cuenta temporalmente
    if (failureCount >= 5) {
      throw new HttpException(
        'Demasiados intentos fallidos. Cuenta bloqueada por 15 minutos.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /**
   * Limpiar intentos de login de un usuario
   * (Se ejecuta automáticamente tras login exitoso)
   *
   * @param email - Email del usuario
   */
  async clearAttempts(email: string): Promise<void> {
    await this.prisma.$executeRaw`
      DELETE FROM login_attempts WHERE email = ${email}
    `;
  }
}