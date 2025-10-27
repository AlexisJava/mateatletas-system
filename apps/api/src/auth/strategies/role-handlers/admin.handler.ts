import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { RoleHandler, UserWithPassword } from './role-handler.interface';
import * as bcrypt from 'bcrypt';

/**
 * Handler para autenticación y operaciones de Admins
 * Implementa Strategy Pattern para Admin role
 */
@Injectable()
export class AdminHandler implements RoleHandler {
  constructor(private prisma: PrismaService) {}

  getRoleName(): string {
    return 'admin';
  }

  async findUserByEmail(email: string) {
    return this.prisma.admin.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return this.prisma.admin.findUnique({
      where: { id },
    });
  }

  async validateCredentials(user: UserWithPassword, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getProfile(userId: string) {
    // Admins no tienen relaciones específicas, solo sus datos básicos
    return this.prisma.admin.findUnique({
      where: { id: userId },
    });
  }
}
