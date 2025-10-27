import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import {
  RoleHandler,
  UserProfile,
  UserWithPassword,
} from './role-handler.interface';
import * as bcrypt from 'bcrypt';

/**
 * Handler para autenticación y operaciones de Estudiantes
 * Implementa Strategy Pattern para Estudiante role
 */
@Injectable()
export class EstudianteHandler implements RoleHandler {
  constructor(private prisma: PrismaService) {}

  getRoleName(): string {
    return 'estudiante';
  }

  async findUserByEmail(email: string): Promise<UserWithPassword | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { email },
    });
    return estudiante ?? null;
  }

  async findUserById(id: string): Promise<UserWithPassword | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });
    return estudiante ?? null;
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
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: userId },
      include: {
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
        equipo: {
          select: {
            nombre: true,
            color_primario: true,
            color_secundario: true,
          },
        },
        inscripciones_clase: {
          include: {
            clase: {
              select: {
                id: true,
                nombre: true,
                fecha_hora_inicio: true,
                duracion_minutos: true,
              },
            },
          },
          orderBy: {
            fecha_inscripcion: 'desc',
          },
          take: 5, // Últimas 5 inscripciones
        },
      },
    });
    return estudiante ?? null;
  }
}
