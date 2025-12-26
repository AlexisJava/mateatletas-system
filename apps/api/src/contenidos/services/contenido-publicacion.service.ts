import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido } from '@prisma/client';

/**
 * Service para gestionar el ciclo de publicación de contenidos
 * Responsabilidad: Cambios de estado (BORRADOR -> PUBLICADO -> ARCHIVADO)
 */
@Injectable()
export class ContenidoPublicacionService {
  constructor(private prisma: PrismaService) {}

  /**
   * Publica un contenido (BORRADOR -> PUBLICADO)
   * Valida que tenga al menos un nodo antes de publicar
   * @param id - ID del contenido
   */
  async publicar(id: string) {
    const contenido = await this.prisma.contenido.findUnique({
      where: { id },
      include: { _count: { select: { nodos: true } } },
    });

    if (!contenido) {
      throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
    }

    if (contenido.estado !== EstadoContenido.BORRADOR) {
      throw new BadRequestException(
        `Solo se pueden publicar contenidos en estado BORRADOR. Estado actual: ${contenido.estado}`,
      );
    }

    if (contenido._count.nodos === 0) {
      throw new BadRequestException(
        'No se puede publicar un contenido sin nodos',
      );
    }

    return this.prisma.contenido.update({
      where: { id },
      data: {
        estado: EstadoContenido.PUBLICADO,
        fechaPublicacion: new Date(),
      },
      include: {
        nodos: { orderBy: { orden: 'asc' } },
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  /**
   * Archiva un contenido (PUBLICADO -> ARCHIVADO)
   * Los contenidos archivados no son visibles para estudiantes
   * @param id - ID del contenido
   */
  async archivar(id: string) {
    const contenido = await this.prisma.contenido.findUnique({
      where: { id },
    });

    if (!contenido) {
      throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
    }

    if (contenido.estado !== EstadoContenido.PUBLICADO) {
      throw new BadRequestException(
        `Solo se pueden archivar contenidos en estado PUBLICADO. Estado actual: ${contenido.estado}`,
      );
    }

    return this.prisma.contenido.update({
      where: { id },
      data: {
        estado: EstadoContenido.ARCHIVADO,
      },
      include: {
        nodos: { orderBy: { orden: 'asc' } },
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }
}
