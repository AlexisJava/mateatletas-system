import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  RoleHandler,
  UserProfile,
  UserWithPassword,
} from './role-handler.interface';
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

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { email },
    });
    return docente ?? null;
  }

  async findUserById(id: string): Promise<UserWithPassword | null> {
    const docente = await this.prisma.docente.findUnique({
      where: { id },
    });
    return docente ?? null;
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
    const docente = await this.prisma.docente.findUnique({
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
    return docente ?? null;
  }
}
