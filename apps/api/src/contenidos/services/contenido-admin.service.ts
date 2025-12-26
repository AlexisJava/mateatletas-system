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
   * @param adminId - ID del admin que crea
   * @param dto - Datos del contenido
   */
  async create(adminId: string, dto: CreateContenidoDto) {
    const { slides, ...contenidoData } = dto;

    return this.prisma.contenido.create({
      data: {
        ...contenidoData,
        creadorId: adminId,
        estado: EstadoContenido.BORRADOR,
        slides: slides?.length
          ? {
              create: slides.map((slide, index) => ({
                titulo: slide.titulo,
                contenidoJson: slide.contenidoJson,
                orden: slide.orden ?? index,
              })),
            }
          : undefined,
      },
      include: {
        slides: { orderBy: { orden: 'asc' } },
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
          _count: { select: { slides: true } },
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
        slides: { orderBy: { orden: 'asc' } },
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
        slides: { orderBy: { orden: 'asc' } },
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
