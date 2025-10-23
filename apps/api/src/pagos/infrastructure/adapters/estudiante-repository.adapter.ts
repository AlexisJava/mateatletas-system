import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import {
  IEstudianteRepository,
  Estudiante,
} from '../../domain/repositories/estudiante.repository.interface';

/**
 * Adapter para el repositorio de Estudiantes
 * Conecta el módulo de pagos con el módulo de estudiantes
 *
 * Clean Architecture:
 * - Implementa interface del Domain
 * - Usa Prisma directamente (el módulo de estudiantes ya usa Prisma)
 * - Solo expone los métodos necesarios para pagos
 */
@Injectable()
export class EstudianteRepositoryAdapter implements IEstudianteRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async obtenerPorId(id: string): Promise<Estudiante | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tutor_id: true,
      },
    });

    if (!estudiante) {
      return null;
    }

    return {
      id: estudiante.id,
      nombre: estudiante.nombre,
      apellido: estudiante.apellido,
      tutorId: estudiante.tutor_id,
    };
  }

  async obtenerPorIds(ids: readonly string[]): Promise<Estudiante[]> {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        id: { in: [...ids] },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        tutor_id: true,
      },
    });

    return estudiantes.map((e) => ({
      id: e.id,
      nombre: e.nombre,
      apellido: e.apellido,
      tutorId: e.tutor_id,
    }));
  }
}
