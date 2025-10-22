import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateEquipoDto } from './dto/create-equipo.dto';
import { UpdateEquipoDto } from './dto/update-equipo.dto';
import { QueryEquiposDto } from './dto/query-equipos.dto';

/**
 * Servicio para gestionar operaciones CRUD de Equipos
 * Maneja toda la lógica de negocio relacionada con los equipos de gamificación
 */
@Injectable()
export class EquiposService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo equipo
   * Valida que el nombre sea único antes de crear
   *
   * @param createDto - Datos del equipo a crear
   * @returns Equipo creado con relaciones
   * @throws ConflictException si el nombre ya existe
   */
  async create(createDto: CreateEquipoDto) {
    // Validar que el nombre no exista
    const existingEquipo = await this.prisma.equipo.findUnique({
      where: { nombre: createDto.nombre },
    });

    if (existingEquipo) {
      throw new ConflictException(
        `Ya existe un equipo con el nombre "${createDto.nombre}"`,
      );
    }

    // Crear el equipo
    const equipo = await this.prisma.equipo.create({
      data: {
        nombre: createDto.nombre,
        color_primario: createDto.color_primario,
        color_secundario: createDto.color_secundario,
        icono_url: createDto.icono_url,
      },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
          },
        },
      },
    });

    return equipo;
  }

  /**
   * Obtener todos los equipos con filtros y paginación
   *
   * @param query - Parámetros de filtrado y paginación
   * @returns Lista de equipos con metadata
   */
  async findAll(query: QueryEquiposDto) {
    const page = parseInt(query.page || '1') || 1;
    const limit = parseInt(query.limit || '10') || 10;
    const skip = (page - 1) * limit;
    const sortBy = query.sortBy || 'nombre';
    const order = query.order || 'asc';

    // Construir filtros
    const where: any = {};

    if (query.search) {
      where.nombre = {
        contains: query.search,
        mode: 'insensitive',
      };
    }

    // Contar total de registros
    const total = await this.prisma.equipo.count({ where });

    // Obtener equipos con paginación
    const equipos = await this.prisma.equipo.findMany({
      where,
      skip,
      take: limit,
      orderBy: { [sortBy]: order },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
          },
        },
      },
    });

    return {
      data: equipos,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtener un equipo por ID con sus estudiantes
   *
   * @param id - ID del equipo
   * @returns Equipo con relaciones
   * @throws NotFoundException si el equipo no existe
   */
  async findOne(id: string) {
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
            nivel_actual: true,
            tutor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
          orderBy: {
            puntos_totales: 'desc', // Ordenar por puntos descendente
          },
        },
      },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    return equipo;
  }

  /**
   * Actualizar un equipo existente
   *
   * @param id - ID del equipo
   * @param updateDto - Datos a actualizar
   * @returns Equipo actualizado
   * @throws NotFoundException si el equipo no existe
   * @throws ConflictException si el nuevo nombre ya existe
   */
  async update(id: string, updateDto: UpdateEquipoDto) {
    // Verificar que el equipo existe
    const equipoExistente = await this.prisma.equipo.findUnique({
      where: { id },
    });

    if (!equipoExistente) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    // Si se está actualizando el nombre, validar que no exista
    if (updateDto.nombre && updateDto.nombre !== equipoExistente.nombre) {
      const nombreDuplicado = await this.prisma.equipo.findUnique({
        where: { nombre: updateDto.nombre },
      });

      if (nombreDuplicado) {
        throw new ConflictException(
          `Ya existe un equipo con el nombre "${updateDto.nombre}"`,
        );
      }
    }

    // Actualizar el equipo
    const equipoActualizado = await this.prisma.equipo.update({
      where: { id },
      data: updateDto,
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
          },
        },
      },
    });

    return equipoActualizado;
  }

  /**
   * Eliminar un equipo
   * Los estudiantes asociados NO se eliminan, solo se desvinculan (equipo_id se pone en NULL)
   * gracias a onDelete: SetNull en el schema
   *
   * @param id - ID del equipo
   * @throws NotFoundException si el equipo no existe
   */
  async remove(id: string) {
    // Verificar que el equipo existe
    const equipo = await this.prisma.equipo.findUnique({
      where: { id },
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
    });

    if (!equipo) {
      throw new NotFoundException(`Equipo con ID ${id} no encontrado`);
    }

    // Eliminar el equipo
    // Los estudiantes se desvinculan automáticamente (equipo_id = NULL)
    await this.prisma.equipo.delete({
      where: { id },
    });

    return {
      message: 'Equipo eliminado exitosamente',
      estudiantesDesvinculados: equipo._count.estudiantes,
    };
  }

  /**
   * Obtener estadísticas generales de equipos
   * Útil para dashboards y visualizaciones
   *
   * @returns Estadísticas agregadas
   */
  async getEstadisticas() {
    const equipos = await this.prisma.equipo.findMany({
      include: {
        _count: {
          select: { estudiantes: true },
        },
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    const totalEquipos = equipos.length;
    const totalEstudiantes = equipos.reduce(
      (sum, equipo) => sum + equipo._count.estudiantes,
      0,
    );

    return {
      totalEquipos,
      totalEstudiantes,
      promedioEstudiantesPorEquipo:
        totalEquipos > 0
          ? Math.round((totalEstudiantes / totalEquipos) * 10) / 10
          : 0,
      ranking: equipos.map((equipo, index) => ({
        posicion: index + 1,
        id: equipo.id,
        nombre: equipo.nombre,
        puntos_totales: equipo.puntos_totales,
        cantidad_estudiantes: equipo._count.estudiantes,
      })),
    };
  }

  /**
   * Recalcular puntos totales de un equipo
   * Suma los puntos de todos los estudiantes del equipo
   *
   * @param id - ID del equipo
   * @returns Equipo con puntos actualizados
   */
  async recalcularPuntos(id: string) {
    const equipo = await this.findOne(id);

    // Sumar puntos de todos los estudiantes
    const puntosTotales = equipo.estudiantes.reduce(
      (sum, estudiante) => sum + estudiante.puntos_totales,
      0,
    );

    // Actualizar el equipo
    return this.prisma.equipo.update({
      where: { id },
      data: { puntos_totales: puntosTotales },
      include: {
        estudiantes: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            puntos_totales: true,
          },
        },
      },
    });
  }
}
