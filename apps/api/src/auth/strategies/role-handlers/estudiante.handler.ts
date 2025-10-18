import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/database/prisma.service';
import { RoleHandler } from './role-handler.interface';
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

  async findUserByEmail(email: string) {
    return this.prisma.estudiante.findUnique({
      where: { email },
    });
  }

  async findUserById(id: string) {
    return this.prisma.estudiante.findUnique({
      where: { id },
    });
  }

  async validateCredentials(user: any, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }

  async getProfile(userId: string) {
    return this.prisma.estudiante.findUnique({
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
  }
}
