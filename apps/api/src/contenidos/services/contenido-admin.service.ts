import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoContenido } from '@prisma/client';
import {
  CreateContenidoDto,
  UpdateContenidoDto,
  QueryContenidosDto,
} from '../dto';

/**
 * Service para operaciones CRUD de contenidos (Admin)
 * Responsabilidad: Crear, listar, obtener, actualizar y eliminar lecciones
 */
@Injectable()
export class ContenidoAdminService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo contenido como BORRADOR
   * Incluye automáticamente 3 nodos estructurales: Teoría, Práctica, Evaluación
   * @param adminId - ID del admin que crea
   * @param dto - Datos del contenido
   */
  async create(adminId: string, dto: CreateContenidoDto) {
    // Nodos estructurales por defecto (bloqueados, no eliminables)
    const nodosEstructurales = [
      { titulo: 'Teoría', orden: 0, bloqueado: true, contenidoJson: null },
      { titulo: 'Práctica', orden: 1, bloqueado: true, contenidoJson: null },
      { titulo: 'Evaluación', orden: 2, bloqueado: true, contenidoJson: null },
    ];

    return this.prisma.contenido.create({
      data: {
        ...dto,
        creadorId: adminId,
        estado: EstadoContenido.BORRADOR,
        nodos: {
          create: nodosEstructurales,
        },
      },
      include: {
        nodos: { orderBy: { orden: 'asc' } },
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  /**
   * Lista contenidos con filtros y paginación
   * @param query - Filtros y paginación
   */
  async findAll(query: QueryContenidosDto) {
    const where = {
      ...(query.estado && { estado: query.estado }),
      ...(query.casaTipo && { casaTipo: query.casaTipo }),
      ...(query.mundoTipo && { mundoTipo: query.mundoTipo }),
    };

    const [contenidos, total] = await Promise.all([
      this.prisma.contenido.findMany({
        where,
        include: {
          _count: { select: { nodos: true } },
          creador: { select: { id: true, nombre: true, apellido: true } },
        },
        orderBy: [{ estado: 'asc' }, { updatedAt: 'desc' }],
        skip: query.skip,
        take: query.take,
      }),
      this.prisma.contenido.count({ where }),
    ]);

    return {
      data: contenidos,
      meta: {
        total,
        page: query.page ?? 1,
        limit: query.limit ?? 10,
        totalPages: Math.ceil(total / (query.limit ?? 10)),
      },
    };
  }

  /**
   * Obtiene un contenido completo con sus slides
   * @param id - ID del contenido
   */
  async findOne(id: string) {
    const contenido = await this.prisma.contenido.findUnique({
      where: { id },
      include: {
        nodos: { orderBy: { orden: 'asc' } },
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });

    if (!contenido) {
      throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
    }

    return contenido;
  }

  /**
   * Actualiza un contenido existente
   * Solo se puede actualizar si está en BORRADOR
   * @param id - ID del contenido
   * @param dto - Datos a actualizar
   */
  async update(id: string, dto: UpdateContenidoDto) {
    const contenido = await this.findOne(id);

    if (contenido.estado !== EstadoContenido.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden editar contenidos en estado BORRADOR',
      );
    }

    return this.prisma.contenido.update({
      where: { id },
      data: dto,
      include: {
        nodos: { orderBy: { orden: 'asc' } },
        creador: { select: { id: true, nombre: true, apellido: true } },
      },
    });
  }

  /**
   * Elimina un contenido
   * Solo se puede eliminar si está en BORRADOR
   * @param id - ID del contenido
   */
  async remove(id: string) {
    const contenido = await this.findOne(id);

    if (contenido.estado !== EstadoContenido.BORRADOR) {
      throw new BadRequestException(
        'Solo se pueden eliminar contenidos en estado BORRADOR',
      );
    }

    await this.prisma.contenido.delete({ where: { id } });

    return {
      success: true,
      mensaje: `Contenido "${contenido.titulo}" eliminado`,
    };
  }
}
