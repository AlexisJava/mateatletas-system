import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { UserType } from './user-lookup.service';

/**
 * UserUpdateService - Actualizaciones de datos de usuario
 *
 * Responsabilidades:
 * - Actualizar password_hash
 * - Actualizar datos de password (hash + fecha)
 * - Actualizar códigos MFA de backup
 *
 * Extraído de UserLookupService para respetar SRP
 */
@Injectable()
export class UserUpdateService {
  private readonly logger = new Logger(UserUpdateService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Actualiza el password_hash de un usuario
   * Usado después de verificación exitosa cuando needsRehash=true
   *
   * @param userId - ID del usuario
   * @param userType - Tipo de usuario
   * @param newHash - Nuevo hash de password
   */
  async updatePasswordHash(
    userId: string,
    userType: UserType,
    newHash: string,
  ): Promise<void> {
    const updateData = { password_hash: newHash };

    switch (userType) {
      case 'estudiante':
        await this.prisma.estudiante.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'tutor':
        await this.prisma.tutor.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'docente':
        await this.prisma.docente.update({
          where: { id: userId },
          data: updateData,
        });
        break;
      case 'admin':
        await this.prisma.admin.update({
          where: { id: userId },
          data: updateData,
        });
        break;
    }

    this.logger.log(`Password hash updated for ${userType} ${userId}`);
  }

  /**
   * Actualiza los datos de password de un usuario
   * Usado por cambiarPassword()
   *
   * @param userId - ID del usuario
   * @param userType - Tipo de usuario
   * @param data - Datos a actualizar
   */
  async updatePasswordData(
    userId: string,
    userType: UserType,
    data: {
      password_hash: string;
      fecha_ultimo_cambio: Date;
    },
  ): Promise<void> {
    switch (userType) {
      case 'estudiante':
        await this.prisma.estudiante.update({
          where: { id: userId },
          data,
        });
        break;
      case 'tutor':
        await this.prisma.tutor.update({
          where: { id: userId },
          data,
        });
        break;
      case 'docente':
        await this.prisma.docente.update({
          where: { id: userId },
          data,
        });
        break;
      case 'admin':
        await this.prisma.admin.update({
          where: { id: userId },
          data,
        });
        break;
    }

    this.logger.log(`Password data updated for ${userType} ${userId}`);
  }

  /**
   * Elimina códigos de backup MFA usados
   * Usado por completeMfaLogin()
   *
   * @param userId - ID del admin
   * @param updatedCodes - Array de códigos restantes
   */
  async updateAdminMfaBackupCodes(
    userId: string,
    updatedCodes: string[],
  ): Promise<void> {
    await this.prisma.admin.update({
      where: { id: userId },
      data: { mfa_backup_codes: updatedCodes },
    });

    this.logger.log(`MFA backup codes updated for admin ${userId}`);
  }
}
