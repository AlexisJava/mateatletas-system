import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import * as bcrypt from 'bcrypt';

/**
 * Tipo de usuario que puede cambiar contraseña
 */
type TipoUsuario = 'estudiante' | 'tutor' | 'docente' | 'admin';

/**
 * Datos mínimos de usuario para cambio de contraseña
 */
interface UserPasswordData {
  id: string;
  password_hash: string | null;
}

/**
 * Resultado del cambio de contraseña
 */
export interface CambiarPasswordResult {
  success: boolean;
  message: string;
}

/**
 * Use Case: Cambiar Contraseña
 *
 * RESPONSABILIDAD ÚNICA:
 * - Cambiar contraseña para cualquier tipo de usuario
 * - Verificar contraseña actual antes de actualizar
 *
 * SEGURIDAD:
 * - Usa bcrypt con 12 rounds (NIST SP 800-63B 2025)
 * - Verifica contraseña actual antes de cambiar
 * - Registra fecha de último cambio
 */
@Injectable()
export class CambiarPasswordUseCase {
  private readonly logger = new Logger(CambiarPasswordUseCase.name);
  private readonly BCRYPT_ROUNDS = 12;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cambia la contraseña de un usuario
   *
   * @param userId - ID del usuario
   * @param passwordActual - Contraseña actual para verificación
   * @param nuevaPassword - Nueva contraseña a establecer
   * @returns Resultado con success y message
   * @throws NotFoundException si el usuario no existe
   * @throws UnauthorizedException si la contraseña actual es incorrecta
   */
  async execute(
    userId: string,
    passwordActual: string,
    nuevaPassword: string,
  ): Promise<CambiarPasswordResult> {
    // 1. Buscar usuario en todas las tablas
    const { usuario, tipoUsuario } = await this.findUser(userId);

    // 2. Verificar contraseña actual
    await this.verifyCurrentPassword(usuario, passwordActual);

    // 3. Hashear nueva contraseña con 12 rounds
    const nuevoHash = await bcrypt.hash(nuevaPassword, this.BCRYPT_ROUNDS);

    // 4. Actualizar usuario
    await this.updatePassword(userId, tipoUsuario, nuevoHash);

    this.logger.log(
      `Contraseña actualizada exitosamente para ${tipoUsuario} ${userId}`,
    );

    return {
      success: true,
      message: 'Contraseña actualizada exitosamente',
    };
  }

  /**
   * Busca usuario en todas las tablas posibles
   */
  private async findUser(
    userId: string,
  ): Promise<{ usuario: UserPasswordData; tipoUsuario: TipoUsuario }> {
    const selectFields = {
      id: true,
      password_hash: true,
    };

    // Intentar estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      select: selectFields,
    });
    if (estudiante) {
      return { usuario: estudiante, tipoUsuario: 'estudiante' };
    }

    // Intentar tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      select: selectFields,
    });
    if (tutor) {
      return { usuario: tutor, tipoUsuario: 'tutor' };
    }

    // Intentar docente
    const docente = await this.prisma.docente.findUnique({
      where: { id: userId },
      select: selectFields,
    });
    if (docente) {
      return { usuario: docente, tipoUsuario: 'docente' };
    }

    // Intentar admin
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
      select: selectFields,
    });
    if (admin) {
      return { usuario: admin, tipoUsuario: 'admin' };
    }

    throw new NotFoundException('Usuario no encontrado');
  }

  /**
   * Verifica que la contraseña actual sea correcta
   */
  private async verifyCurrentPassword(
    usuario: UserPasswordData,
    passwordActual: string,
  ): Promise<void> {
    if (!usuario.password_hash) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    const isValid = await bcrypt.compare(passwordActual, usuario.password_hash);

    if (!isValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }
  }

  /**
   * Actualiza la contraseña en la tabla correspondiente
   */
  private async updatePassword(
    userId: string,
    tipoUsuario: TipoUsuario,
    nuevoHash: string,
  ): Promise<void> {
    const updateData = {
      password_hash: nuevoHash,
      fecha_ultimo_cambio: new Date(),
    };

    switch (tipoUsuario) {
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
  }
}
