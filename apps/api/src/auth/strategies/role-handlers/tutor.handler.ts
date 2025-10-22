import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { RoleHandler } from './role-handler.interface';
import * as bcrypt from 'bcrypt';

/**
 * Handler para autenticación y operaciones de Tutores
 * Implementa Strategy Pattern para Tutor role
 */
@Injectable()
export class TutorHandler implements RoleHandler {
  constructor(private prisma: PrismaService) {}

  getRoleName(): string {
    return 'tutor';
  }

  async findUserByEmail(email: string) {
    return this.prisma.tutor.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return this.prisma.tutor.findUnique({
      where: { id },
    });
  }

  async validateCredentials(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getProfile(userId: string) {
    return this.prisma.tutor.findUnique({
      where: { id: userId },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            edad: true,
            nivel_actual: true,
            puntos_totales: true,
          },
        },
      },
    });
  }
}
