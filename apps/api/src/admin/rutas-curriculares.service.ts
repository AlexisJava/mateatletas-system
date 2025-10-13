import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CrearRutaDto } from './dto/crear-ruta.dto';
import { ActualizarRutaDto } from './dto/actualizar-ruta.dto';

/**
 * Servicio para gestión de Rutas Curriculares
 * Permite CRUD completo con validaciones
 */
@Injectable()
export class RutasCurricularesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todas las rutas curriculares
   * Incluye conteo de clases asociadas
   */
  async listarTodas() {
    return this.prisma.rutaCurricular.findMany({
      orderBy: { nombre: 'asc' },
      include: {
        _count: {
          select: { clases: true },
        },
      },
    });
  }

  /**
   * Obtener una ruta por ID
   */
  async obtenerPorId(id: string) {
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clases: true },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta curricular no encontrada');
    }

    return ruta;
  }

  /**
   * Crear nueva ruta curricular
   * Valida que el nombre sea único
   */
  async crear(dto: CrearRutaDto) {
    // Verificar si ya existe una ruta con ese nombre
    const exists = await this.prisma.rutaCurricular.findUnique({
      where: { nombre: dto.nombre },
    });

    if (exists) {
      throw new ConflictException('Ya existe una ruta con este nombre');
    }

    return this.prisma.rutaCurricular.create({
      data: {
        nombre: dto.nombre,
        color: dto.color || '#6366F1', // Color por defecto
        descripcion: dto.descripcion,
      },
    });
  }

  /**
   * Actualizar ruta curricular
   * Valida que el nuevo nombre no colisione con otra ruta
   */
  async actualizar(id: string, dto: ActualizarRutaDto) {
    // Verificar que la ruta existe
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta curricular no encontrada');
    }

    // Si se está cambiando el nombre, verificar que no colisione
    if (dto.nombre && dto.nombre !== ruta.nombre) {
      const exists = await this.prisma.rutaCurricular.findFirst({
        where: {
          nombre: dto.nombre,
          id: { not: id },
        },
      });

      if (exists) {
        throw new ConflictException('Ya existe otra ruta con este nombre');
      }
    }

    return this.prisma.rutaCurricular.update({
      where: { id },
      data: dto,
    });
  }

  /**
   * Eliminar ruta curricular
   * Solo permite eliminar si no tiene clases asociadas
   */
  async eliminar(id: string) {
    // Verificar que la ruta existe
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id },
      include: {
        _count: {
          select: { clases: true },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta curricular no encontrada');
    }

    // Verificar que no tenga clases asociadas
    if (ruta._count.clases > 0) {
      throw new ConflictException(
        `No se puede eliminar: hay ${ruta._count.clases} clase(s) asociada(s)`,
      );
    }

    await this.prisma.rutaCurricular.delete({
      where: { id },
    });

    return {
      message: 'Ruta curricular eliminada exitosamente',
      id,
    };
  }
}
