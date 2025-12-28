import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido } from '@prisma/client';
import { CreateNodoDto, UpdateNodoDto, ReordenarNodosDto } from '../dto';

/**
 * Tipo para el árbol de nodos (estructura jerárquica)
 */
export interface NodoArbol {
  id: string;
  parentId: string | null;
  titulo: string;
  bloqueado: boolean;
  orden: number;
  contenidoJson: string | null;
  hijos: NodoArbol[];
}

/**
 * Service para gestionar nodos jerárquicos dentro de un contenido
 * Responsabilidad: CRUD de nodos con soporte para estructura de árbol
 *
 * Reglas de negocio:
 * - Nodos con bloqueado=true no pueden ser eliminados (Teoría, Práctica, Evaluación)
 * - Nodos con hijos.length > 0 son contenedores (no editables directamente)
 * - Nodos con hijos.length === 0 son hojas (editables con contenidoJson)
 */
@Injectable()
export class NodoService {
  constructor(private prisma: PrismaService) {}

  /**
   * Valida que el contenido existe y está en BORRADOR
   */
  private async validateContenidoEditable(contenidoId: string) {
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      select: { id: true, estado: true, titulo: true },
    });

    if (!contenido) {
      throw new NotFoundException(
        `Contenido con ID ${contenidoId} no encontrado`,
      );
    }

    if (contenido.estado !== EstadoContenido.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden modificar nodos de contenidos en estado BORRADOR',
      );
    }

    return contenido;
  }

  /**
   * Obtiene el árbol completo de nodos de un contenido
   * @param contenidoId - ID del contenido
   * @throws NotFoundException si el contenido no existe
   */
  async getArbol(contenidoId: string) {
    // Primero validar que el contenido existe
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: contenidoId },
      select: { id: true },
    });

    if (!contenido) {
      throw new NotFoundException(
        `Contenido con ID ${contenidoId} no encontrado`,
      );
    }

    const nodos = await this.prisma.nodoContenido.findMany({
      where: { contenidoId },
      orderBy: { orden: 'asc' },
    });

    // Construir árbol desde lista plana
    return this.buildTree(nodos);
  }

  /**
   * Construye estructura de árbol desde lista plana
   */
  private buildTree(
    nodos: Array<{
      id: string;
      parentId: string | null;
      titulo: string;
      bloqueado: boolean;
      orden: number;
      contenidoJson: string | null;
    }>,
  ): NodoArbol[] {
    const nodosMap = new Map<string, NodoArbol>();
    const raices: NodoArbol[] = [];

    // Primer paso: crear mapa con hijos vacíos
    nodos.forEach((nodo) => {
      nodosMap.set(nodo.id, { ...nodo, hijos: [] });
    });

    // Segundo paso: asignar hijos a padres
    nodos.forEach((nodo) => {
      const nodoConHijos = nodosMap.get(nodo.id)!;
      if (nodo.parentId) {
        const padre = nodosMap.get(nodo.parentId);
        if (padre) {
          padre.hijos.push(nodoConHijos);
        }
      } else {
        raices.push(nodoConHijos);
      }
    });

    // Ordenar hijos por orden recursivamente
    const sortHijos = (nodo: NodoArbol): void => {
      nodo.hijos.sort((a, b) => a.orden - b.orden);
      nodo.hijos.forEach(sortHijos);
    };
    raices.forEach(sortHijos);

    return raices.sort((a, b) => a.orden - b.orden);
  }

  /**
   * Agrega un nuevo nodo al contenido
   * @param contenidoId - ID del contenido
   * @param dto - Datos del nodo
   */
  async addNodo(contenidoId: string, dto: CreateNodoDto) {
    await this.validateContenidoEditable(contenidoId);

    // Validar que el padre existe si se especifica
    if (dto.parentId) {
      const padre = await this.prisma.nodoContenido.findUnique({
        where: { id: dto.parentId },
        select: { id: true, contenidoId: true },
      });

      if (!padre) {
        throw new NotFoundException(
          `Nodo padre con ID ${dto.parentId} no encontrado`,
        );
      }

      if (padre.contenidoId !== contenidoId) {
        throw new BadRequestException(
          'El nodo padre debe pertenecer al mismo contenido',
        );
      }
    }

    // Si no se especifica orden, agregar al final entre hermanos
    let orden = dto.orden;
    if (orden === undefined) {
      const lastSibling = await this.prisma.nodoContenido.findFirst({
        where: { contenidoId, parentId: dto.parentId ?? null },
        orderBy: { orden: 'desc' },
        select: { orden: true },
      });
      orden = (lastSibling?.orden ?? -1) + 1;
    }

    return this.prisma.nodoContenido.create({
      data: {
        contenidoId,
        parentId: dto.parentId,
        titulo: dto.titulo,
        contenidoJson: dto.contenidoJson,
        orden,
        bloqueado: false,
      },
    });
  }

  /**
   * Actualiza un nodo existente
   * @param nodoId - ID del nodo
   * @param dto - Datos a actualizar
   */
  async updateNodo(nodoId: string, dto: UpdateNodoDto) {
    const nodo = await this.prisma.nodoContenido.findUnique({
      where: { id: nodoId },
      select: { id: true, contenidoId: true, bloqueado: true },
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo con ID ${nodoId} no encontrado`);
    }

    await this.validateContenidoEditable(nodo.contenidoId);

    // Nodos bloqueados solo pueden actualizar contenidoJson, no titulo
    if (nodo.bloqueado && dto.titulo) {
      throw new BadRequestException(
        'No se puede cambiar el título de nodos estructurales (Teoría, Práctica, Evaluación)',
      );
    }

    return this.prisma.nodoContenido.update({
      where: { id: nodoId },
      data: dto,
    });
  }

  /**
   * Elimina un nodo
   * @param nodoId - ID del nodo
   */
  async removeNodo(nodoId: string) {
    const nodo = await this.prisma.nodoContenido.findUnique({
      where: { id: nodoId },
      select: { id: true, contenidoId: true, titulo: true, bloqueado: true },
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo con ID ${nodoId} no encontrado`);
    }

    if (nodo.bloqueado) {
      throw new BadRequestException(
        `No se puede eliminar el nodo "${nodo.titulo}" porque es estructural`,
      );
    }

    await this.validateContenidoEditable(nodo.contenidoId);

    // Cascade delete eliminará los hijos automáticamente
    await this.prisma.nodoContenido.delete({ where: { id: nodoId } });

    return { success: true, mensaje: `Nodo "${nodo.titulo}" eliminado` };
  }

  /**
   * Reordena múltiples nodos
   * @param contenidoId - ID del contenido
   * @param dto - Nuevas posiciones de nodos
   * @throws BadRequestException si algún nodo no pertenece al contenido
   */
  async reordenar(contenidoId: string, dto: ReordenarNodosDto) {
    await this.validateContenidoEditable(contenidoId);

    // Validar que TODOS los nodos pertenezcan al contenido especificado
    const nodoIds = dto.orden.map((item) => item.nodoId);
    const nodosExistentes = await this.prisma.nodoContenido.findMany({
      where: { id: { in: nodoIds } },
      select: { id: true, contenidoId: true },
    });

    // Verificar que encontramos todos los nodos
    if (nodosExistentes.length !== nodoIds.length) {
      const encontrados = new Set(nodosExistentes.map((n) => n.id));
      const noEncontrados = nodoIds.filter((id) => !encontrados.has(id));
      throw new BadRequestException(
        `Nodos no encontrados: ${noEncontrados.join(', ')}`,
      );
    }

    // Verificar que todos pertenecen al contenido correcto
    const nodosDeOtroContenido = nodosExistentes.filter(
      (n) => n.contenidoId !== contenidoId,
    );
    if (nodosDeOtroContenido.length > 0) {
      throw new BadRequestException(
        `Los siguientes nodos no pertenecen al contenido especificado: ${nodosDeOtroContenido.map((n) => n.id).join(', ')}`,
      );
    }

    // Actualizar orden de cada nodo en transacción
    await this.prisma.$transaction(
      dto.orden.map((item) =>
        this.prisma.nodoContenido.update({
          where: { id: item.nodoId },
          data: { orden: item.orden },
        }),
      ),
    );

    // Retornar árbol actualizado
    return this.getArbol(contenidoId);
  }

  /**
   * Mueve un nodo a otro padre
   * @param nodoId - ID del nodo a mover
   * @param nuevoParentId - ID del nuevo padre (null para raíz)
   */
  async moverNodo(nodoId: string, nuevoParentId: string | null) {
    const nodo = await this.prisma.nodoContenido.findUnique({
      where: { id: nodoId },
      select: { id: true, contenidoId: true, bloqueado: true, titulo: true },
    });

    if (!nodo) {
      throw new NotFoundException(`Nodo con ID ${nodoId} no encontrado`);
    }

    if (nodo.bloqueado) {
      throw new BadRequestException(
        `No se puede mover el nodo "${nodo.titulo}" porque es estructural`,
      );
    }

    await this.validateContenidoEditable(nodo.contenidoId);

    // Validar que el nuevo padre existe y pertenece al mismo contenido
    if (nuevoParentId) {
      const nuevoPadre = await this.prisma.nodoContenido.findUnique({
        where: { id: nuevoParentId },
        select: { id: true, contenidoId: true },
      });

      if (!nuevoPadre) {
        throw new NotFoundException(
          `Nuevo nodo padre con ID ${nuevoParentId} no encontrado`,
        );
      }

      if (nuevoPadre.contenidoId !== nodo.contenidoId) {
        throw new BadRequestException(
          'El nuevo padre debe pertenecer al mismo contenido',
        );
      }

      // Evitar ciclos: el nuevo padre no puede ser descendiente del nodo
      const esDescendiente = await this.esDescendiente(nuevoParentId, nodoId);
      if (esDescendiente) {
        throw new BadRequestException(
          'No se puede mover un nodo a uno de sus descendientes',
        );
      }
    }

    // Obtener último orden entre nuevos hermanos
    const lastSibling = await this.prisma.nodoContenido.findFirst({
      where: { contenidoId: nodo.contenidoId, parentId: nuevoParentId },
      orderBy: { orden: 'desc' },
      select: { orden: true },
    });

    return this.prisma.nodoContenido.update({
      where: { id: nodoId },
      data: {
        parentId: nuevoParentId,
        orden: (lastSibling?.orden ?? -1) + 1,
      },
    });
  }

  /**
   * Verifica si un nodo es descendiente de otro
   * Optimizado: carga todos los nodos del contenido en 1 query y verifica en memoria
   */
  private async esDescendiente(
    posibleDescendienteId: string,
    ancestroId: string,
  ): Promise<boolean> {
    // Primero obtener el contenidoId del nodo
    const nodo = await this.prisma.nodoContenido.findUnique({
      where: { id: posibleDescendienteId },
      select: { contenidoId: true, parentId: true },
    });

    if (!nodo) {
      return false;
    }

    // Cargar todos los nodos del contenido en una sola query
    const todosLosNodos = await this.prisma.nodoContenido.findMany({
      where: { contenidoId: nodo.contenidoId },
      select: { id: true, parentId: true },
    });

    // Construir mapa para búsqueda O(1)
    const nodosMap = new Map<string, string | null>();
    todosLosNodos.forEach((n) => nodosMap.set(n.id, n.parentId));

    // Subir por la cadena de ancestros en memoria
    let actualParentId = nodo.parentId;
    while (actualParentId) {
      if (actualParentId === ancestroId) {
        return true;
      }
      actualParentId = nodosMap.get(actualParentId) ?? null;
    }

    return false;
  }
}
