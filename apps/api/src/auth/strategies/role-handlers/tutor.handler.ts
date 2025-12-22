import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  RoleHandler,
  UserProfile,
  UserWithPassword,
} from './role-handler.interface';
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

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { email },
    });
    return tutor ?? null;
  }

  async findUserById(id: string): Promise<UserWithPassword | null> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id },
    });
    return tutor ?? null;
  }

  async validateCredentials(
    user: UserWithPassword,
    password: string,
  ): Promise<boolean> {
    if (!user.password_hash) {
      return false; // Usuario sin password no puede autenticarse
    }
    return bcrypt.compare(password, user.password_hash);
  }

  async getProfile(userId: string): Promise<UserProfile | null> {
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: userId },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            edad: true,
            nivel_actual: true,
            recursos: {
              select: {
                xp_total: true,
              },
            },
          },
        },
      },
    });
    return tutor ?? null;
  }
}
