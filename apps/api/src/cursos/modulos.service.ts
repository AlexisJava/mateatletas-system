import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateModuloDto } from './dto/create-modulo.dto';
import { UpdateModuloDto } from './dto/update-modulo.dto';
import { CreateLeccionDto } from './dto/create-leccion.dto';
import { UpdateLeccionDto } from './dto/update-leccion.dto';

/**
 * Service for managing course modules and lessons
 *
 * Responsibilities:
 * - Module CRUD operations
 * - Lesson CRUD operations
 * - Module-lesson relationships
 * - Content management and ordering
 * - Points and duration calculations
 */
@Injectable()
export class ModulosService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // MÓDULOS
  // ============================================================================

  /**
   * Create a new module within a course
   */
  async createModulo(productoId: string, createModuloDto: CreateModuloDto) {
    // Verify that the product exists and is type Curso
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(`Producto con ID ${productoId} no encontrado`);
    }

    if (producto.tipo !== 'Curso') {
      throw new BadRequestException('El producto debe ser de tipo Curso');
    }

    // Create the module
    return this.prisma.modulo.create({
      data: {
        producto_id: productoId,
        ...createModuloDto,
      },
      include: {
        lecciones: {
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  /**
   * Get all modules of a course
   */
  async findModulosByProducto(productoId: string) {
    return this.prisma.modulo.findMany({
      where: { producto_id: productoId },
      orderBy: { orden: 'asc' },
      include: {
        lecciones: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
          select: {
            id: true,
            titulo: true,
            descripcion: true,
            tipo_contenido: true,
            orden: true,
            puntos_por_completar: true,
            duracion_estimada_minutos: true,
            leccion_prerequisito_id: true,
          },
        },
      },
    });
  }

  /**
   * Get a specific module with its lessons
   */
  async findOneModulo(id: string) {
    const modulo = await this.prisma.modulo.findUnique({
      where: { id },
      include: {
        lecciones: {
          where: { activo: true },
          orderBy: { orden: 'asc' },
        },
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
      },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${id} no encontrado`);
    }

    return modulo;
  }

  /**
   * Update a module
   */
  async updateModulo(id: string, updateModuloDto: UpdateModuloDto) {
    // Verify that it exists
    await this.findOneModulo(id);

    return this.prisma.modulo.update({
      where: { id },
      data: updateModuloDto,
      include: {
        lecciones: {
          orderBy: { orden: 'asc' },
        },
      },
    });
  }

  /**
   * Delete a module (and its lessons by cascade)
   */
  async removeModulo(id: string) {
    // Verify that it exists
    await this.findOneModulo(id);

    return this.prisma.modulo.delete({
      where: { id },
    });
  }

  /**
   * Reorder modules of a course
   */
  async reordenarModulos(productoId: string, ordenIds: string[]) {
    const updates = ordenIds.map((id, index) =>
      this.prisma.modulo.update({
        where: { id },
        data: { orden: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Módulos reordenados exitosamente' };
  }

  // ============================================================================
  // LECCIONES
  // ============================================================================

  /**
   * Create a new lesson within a module
   */
  async createLeccion(moduloId: string, createLeccionDto: CreateLeccionDto) {
    // Verify that the module exists
    const modulo = await this.prisma.modulo.findUnique({
      where: { id: moduloId },
    });

    if (!modulo) {
      throw new NotFoundException(`Módulo con ID ${moduloId} no encontrado`);
    }

    // If there is a prerequisite, verify that it exists
    if (createLeccionDto.leccion_prerequisito_id) {
      const prerequisito = await this.prisma.leccion.findUnique({
        where: { id: createLeccionDto.leccion_prerequisito_id },
      });

      if (!prerequisito) {
        throw new NotFoundException('Lección prerequisito no encontrada');
      }
    }

    // Create the lesson
    const leccion = await this.prisma.leccion.create({
      data: {
        modulo_id: moduloId,
        ...createLeccionDto,
      },
      include: {
        modulo: {
          select: {
            id: true,
            titulo: true,
            producto_id: true,
          },
        },
        logro: true,
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    // Update module total points
    await this.recalcularPuntosModulo(moduloId);

    return leccion;
  }

  /**
   * Get all lessons of a module
   */
  async findLeccionesByModulo(moduloId: string) {
    return this.prisma.leccion.findMany({
      where: {
        modulo_id: moduloId,
        activo: true,
      },
      orderBy: { orden: 'asc' },
      include: {
        logro: {
          select: {
            id: true,
            nombre: true,
            icono: true,
            puntos: true,
          },
        },
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });
  }

  /**
   * Get a specific lesson with all its content
   */
  async findOneLeccion(id: string) {
    const leccion = await this.prisma.leccion.findUnique({
      where: { id },
      include: {
        modulo: {
          include: {
            producto: {
              select: {
                id: true,
                nombre: true,
              },
            },
          },
        },
        logro: true,
        leccionPrerequisito: {
          select: {
            id: true,
            titulo: true,
          },
        },
      },
    });

    if (!leccion) {
      throw new NotFoundException(`Lección con ID ${id} no encontrada`);
    }

    return leccion;
  }

  /**
   * Update a lesson
   */
  async updateLeccion(id: string, updateLeccionDto: UpdateLeccionDto) {
    // Verify that it exists
    await this.findOneLeccion(id);

    const leccion = await this.prisma.leccion.update({
      where: { id },
      data: updateLeccionDto,
      include: {
        modulo: true,
        logro: true,
      },
    });

    // Recalculate module points if puntos_por_completar changed
    if (updateLeccionDto.puntos_por_completar !== undefined) {
      await this.recalcularPuntosModulo(leccion.modulo_id);
    }

    return leccion;
  }

  /**
   * Delete a lesson
   */
  async removeLeccion(id: string) {
    const leccion = await this.findOneLeccion(id);

    await this.prisma.leccion.delete({
      where: { id },
    });

    // Recalculate module points
    await this.recalcularPuntosModulo(leccion.modulo_id);

    return { message: 'Lección eliminada exitosamente' };
  }

  /**
   * Reorder lessons of a module
   */
  async reordenarLecciones(moduloId: string, ordenIds: string[]) {
    const updates = ordenIds.map((id, index) =>
      this.prisma.leccion.update({
        where: { id },
        data: { orden: index + 1 },
      })
    );

    await this.prisma.$transaction(updates);

    return { message: 'Lecciones reordenadas exitosamente' };
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  /**
   * Recalculate total points and duration of a module
   */
  private async recalcularPuntosModulo(moduloId: string) {
    const lecciones = await this.prisma.leccion.findMany({
      where: {
        modulo_id: moduloId,
        activo: true,
      },
    });

    const puntosTotales = lecciones.reduce(
      (sum, l) => sum + (l.puntos_por_completar || 0),
      0
    );

    const duracionTotal = lecciones.reduce(
      (sum, l) => sum + (l.duracion_estimada_minutos || 0),
      0
    );

    await this.prisma.modulo.update({
      where: { id: moduloId },
      data: {
        puntos_totales: puntosTotales,
        duracion_estimada_minutos: duracionTotal,
      },
    });
  }
}
