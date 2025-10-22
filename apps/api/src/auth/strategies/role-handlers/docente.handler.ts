import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { AuthenticableUser, RoleHandler } from './role-handler.interface';
import * as bcrypt from 'bcrypt';

/**
 * Handler para autenticación y operaciones de Docentes
 * Implementa Strategy Pattern para Docente role
 */
@Injectable()
export class DocenteHandler implements RoleHandler {
  constructor(private prisma: PrismaService) {}

  getRoleName(): string {
    return 'docente';
  }

  async findUserByEmail(email: string) {
    return this.prisma.docente.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return this.prisma.docente.findUnique({
      where: { id },
    });
  }

  async validateCredentials(
    user: AuthenticableUser,
    password: string,
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getProfile(userId: string) {
    return this.prisma.docente.findUnique({
      where: { id: userId },
      include: {
        clases: {
          select: {
            id: true,
            nombre: true,
            fecha_hora_inicio: true,
            duracion_minutos: true,
            cupos_maximo: true,
            estado: true,
          },
          orderBy: {
            fecha_hora_inicio: 'desc',
          },
          take: 10, // Últimas 10 clases
        },
        _count: {
          select: {
            clases: true,
          },
        },
      },
    });
  }
}
