import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  RoleHandler,
  UserProfile,
  UserWithPassword,
} from './role-handler.interface';
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

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { email },
    });
    return admin ?? null;
  }

  async findUserById(id: string): Promise<UserWithPassword | null> {
    const admin = await this.prisma.admin.findUnique({
      where: { id },
    });
    return admin ?? null;
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
    // Admins no tienen relaciones específicas, solo sus datos básicos
    const admin = await this.prisma.admin.findUnique({
      where: { id: userId },
    });
    return admin ?? null;
  }
}
