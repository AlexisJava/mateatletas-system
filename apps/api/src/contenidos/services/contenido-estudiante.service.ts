import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido, CasaTipo, MundoTipo } from '@prisma/client';

/**
 * Service para acceso de estudiantes a contenidos publicados
 * Responsabilidad: Lectura de contenidos filtrados por casa del estudiante
 */
@Injectable()
export class ContenidoEstudianteService {
  constructor(private prisma: PrismaService) {}

  /**
   * Obtiene la casa del estudiante
   */
  private async getEstudianteCasa(estudianteId: string): Promise<CasaTipo> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { casa: { select: { tipo: true } } },
    });

    if (!estudiante?.casa) {
      throw new NotFoundException(
        'Estudiante no encontrado o sin casa asignada',
      );
    }

    return estudiante.casa.tipo;
  }

  /**
   * Lista contenidos publicados para la casa del estudiante
   * @param estudianteId - ID del estudiante
   * @param mundoTipo - Filtrar por mundo (opcional)
   */
  async findPublicados(estudianteId: string, mundoTipo?: MundoTipo) {
    const casaTipo = await this.getEstudianteCasa(estudianteId);

    const contenidos = await this.prisma.contenido.findMany({
      where: {
        estado: EstadoContenido.PUBLICADO,
        casaTipo,
        ...(mundoTipo && { mundoTipo }),
      },
      select: {
        id: true,
        titulo: true,
        descripcion: true,
        mundoTipo: true,
        imagenPortada: true,
        duracionMinutos: true,
        orden: true,
        _count: { select: { slides: true } },
      },
      orderBy: [{ orden: 'asc' }, { fechaPublicacion: 'desc' }],
    });

    // Agregar progreso del estudiante a cada contenido
    const progresos = await this.prisma.progresoContenido.findMany({
      where: {
        estudianteId,
        contenidoId: { in: contenidos.map((c) => c.id) },
      },
      select: {
        contenidoId: true,
        slideActual: true,
        completado: true,
      },
    });

    const progresoMap = new Map(progresos.map((p) => [p.contenidoId, p]));

    return contenidos.map((c) => ({
      ...c,
      progreso: progresoMap.get(c.id) ?? null,
    }));
  }

  /**
   * Obtiene un contenido completo para reproducir
   * Valida que el estudiante tiene acceso (mismo casa)
   * @param estudianteId - ID del estudiante
   * @param contenidoId - ID del contenido
   */
  async findOnePublicado(estudianteId: string, contenidoId: string) {
    const casaTipo = await this.getEstudianteCasa(estudianteId);

    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      include: {
        slides: { orderBy: { orden: 'asc' } },
      },
    });

    if (!contenido) {
      throw new NotFoundException(
        `Contenido con ID ${contenidoId} no encontrado`,
      );
    }

    if (contenido.estado !== EstadoContenido.PUBLICADO) {
      throw new NotFoundException('Contenido no disponible');
    }

    if (contenido.casaTipo !== casaTipo) {
      throw new ForbiddenException('No tienes acceso a este contenido');
    }

    // Obtener o crear progreso
    const progreso = await this.prisma.progresoContenido.upsert({
      where: {
        estudianteId_contenidoId: { estudianteId, contenidoId },
      },
      create: {
        estudianteId,
        contenidoId,
        slideActual: 0,
      },
      update: {},
    });

    return { ...contenido, progreso };
  }
}
