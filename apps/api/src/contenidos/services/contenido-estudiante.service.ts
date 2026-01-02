import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido, CasaTipo, MundoTipo } from '@prisma/client';
import { NodoService, NodoArbol } from './nodo.service';

/**
 * Service para acceso de estudiantes a contenidos publicados
 * Responsabilidad: Lectura de contenidos filtrados por casa del estudiante
 */
@Injectable()
export class ContenidoEstudianteService {
  constructor(
    private prisma: PrismaService,
    private nodoService: NodoService,
  ) {}

  /**
   * Obtiene la casa del estudiante (puede ser null si no tiene casa asignada)
   */
  private async getEstudianteCasa(
    estudianteId: string,
  ): Promise<CasaTipo | null> {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      select: { casa: { select: { tipo: true } } },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Retornar null si no tiene casa asignada (acceso a todos los contenidos)
    return estudiante.casa?.tipo ?? null;
  }

  /**
   * Lista contenidos publicados para la casa del estudiante
   * Si el estudiante no tiene casa asignada, muestra TODOS los contenidos publicados
   * @param estudianteId - ID del estudiante
   * @param mundoTipo - Filtrar por mundo (opcional)
   */
  async findPublicados(estudianteId: string, mundoTipo?: MundoTipo) {
    const casaTipo = await this.getEstudianteCasa(estudianteId);

    const contenidos = await this.prisma.contenido.findMany({
      where: {
        estado: EstadoContenido.PUBLICADO,
        // Si tiene casa, filtrar por casa; si no, mostrar todos
        ...(casaTipo && { casaTipo }),
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
        _count: { select: { nodos: true } },
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
        nodoActualId: true,
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
   * Valida que el estudiante tiene acceso (mismo casa o sin casa = acceso total)
   * @param estudianteId - ID del estudiante
   * @param contenidoId - ID del contenido
   * @returns Contenido con árbol jerárquico de nodos
   */
  async findOnePublicado(estudianteId: string, contenidoId: string) {
    const casaTipo = await this.getEstudianteCasa(estudianteId);

    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
    });

    if (!contenido) {
      throw new NotFoundException(
        `Contenido con ID ${contenidoId} no encontrado`,
      );
    }

    if (contenido.estado !== EstadoContenido.PUBLICADO) {
      throw new NotFoundException('Contenido no disponible');
    }

    // Validar acceso: si el estudiante tiene casa, debe coincidir
    // Si no tiene casa (casaTipo = null), tiene acceso a todos
    if (casaTipo !== null && contenido.casaTipo !== casaTipo) {
      throw new ForbiddenException('No tienes acceso a este contenido');
    }

    // Obtener árbol jerárquico de nodos
    const nodos: NodoArbol[] = await this.nodoService.getArbol(contenidoId);

    // Obtener o crear progreso
    const progreso = await this.prisma.progresoContenido.upsert({
      where: {
        estudianteId_contenidoId: { estudianteId, contenidoId },
      },
      create: {
        estudianteId,
        contenidoId,
        nodoActualId: null,
      },
      update: {},
    });

    return { ...contenido, nodos, progreso };
  }
}
