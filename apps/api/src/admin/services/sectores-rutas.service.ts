import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { CreateSectorDto, UpdateSectorDto } from '../dto/sector.dto';
import {
  CreateRutaEspecialidadDto,
  UpdateRutaEspecialidadDto,
  AsignarRutasDocenteDto,
} from '../dto/ruta-especialidad.dto';

/**
 * Servicio para gestionar sectores y rutas de especialidad
 * Permite crear sectores personalizados y rutas dentro de cada sector
 */
@Injectable()
export class SectoresRutasService {
  constructor(private prisma: PrismaService) {}

  // ============================================================================
  // SECTORES
  // ============================================================================

  /**
   * Listar todos los sectores con sus rutas
   */
  async listarSectores() {
    return this.prisma.sector.findMany({
      include: {
        rutas: {
          where: { activo: true },
          orderBy: { nombre: 'asc' },
        },
        _count: {
          select: {
            rutas: true,
            docentes: true,
          },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  /**
   * Obtener un sector por ID con sus rutas
   */
  async obtenerSector(id: string) {
    const sector = await this.prisma.sector.findUnique({
      where: { id },
      include: {
        rutas: {
          where: { activo: true },
          orderBy: { nombre: 'asc' },
        },
        _count: {
          select: {
            rutas: true,
            docentes: true,
          },
        },
      },
    });

    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    return sector;
  }

  /**
   * Crear un nuevo sector
   */
  async crearSector(data: CreateSectorDto) {
    // Verificar que no exista un sector con el mismo nombre
    const existing = await this.prisma.sector.findUnique({
      where: { nombre: data.nombre },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe un sector con el nombre "${data.nombre}"`,
      );
    }

    return this.prisma.sector.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        color: data.color || '#6366F1',
        icono: data.icono || '📚',
        activo: data.activo !== undefined ? data.activo : true,
      },
      include: {
        rutas: true,
      },
    });
  }

  /**
   * Actualizar un sector
   */
  async actualizarSector(id: string, data: UpdateSectorDto) {
    // Verificar que el sector exista
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    // Si se intenta cambiar el nombre, verificar que no exista otro con ese nombre
    if (data.nombre && data.nombre !== sector.nombre) {
      const existing = await this.prisma.sector.findUnique({
        where: { nombre: data.nombre },
      });
      if (existing) {
        throw new ConflictException(
          `Ya existe un sector con el nombre "${data.nombre}"`,
        );
      }
    }

    return this.prisma.sector.update({
      where: { id },
      data,
      include: {
        rutas: true,
      },
    });
  }

  /**
   * Eliminar un sector (soft delete - marcarlo como inactivo)
   */
  async eliminarSector(id: string) {
    const sector = await this.prisma.sector.findUnique({ where: { id } });
    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    // Marcar como inactivo en lugar de eliminar
    return this.prisma.sector.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ============================================================================
  // RUTAS DE ESPECIALIDAD
  // ============================================================================

  /**
   * Listar todas las rutas de especialidad
   */
  async listarRutas(sectorId?: string) {
    return this.prisma.rutaEspecialidad.findMany({
      where: sectorId ? { sectorId } : undefined,
      include: {
        sector: true,
        _count: {
          select: {
            docentes: true,
          },
        },
      },
      orderBy: [{ sector: { nombre: 'asc' } }, { nombre: 'asc' }],
    });
  }

  /**
   * Obtener una ruta por ID
   */
  async obtenerRuta(id: string) {
    const ruta = await this.prisma.rutaEspecialidad.findUnique({
      where: { id },
      include: {
        sector: true,
        docentes: {
          include: {
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return ruta;
  }

  /**
   * Crear una nueva ruta de especialidad
   */
  async crearRuta(data: CreateRutaEspecialidadDto) {
    // Verificar que el sector exista
    const sector = await this.prisma.sector.findUnique({
      where: { id: data.sectorId },
    });

    if (!sector) {
      throw new NotFoundException('Sector no encontrado');
    }

    // Verificar que no exista una ruta con el mismo nombre en el mismo sector
    const existing = await this.prisma.rutaEspecialidad.findUnique({
      where: {
        sectorId_nombre: {
          sectorId: data.sectorId,
          nombre: data.nombre,
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Ya existe una ruta con el nombre "${data.nombre}" en el sector "${sector.nombre}"`,
      );
    }

    return this.prisma.rutaEspecialidad.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        sectorId: data.sectorId,
        activo: data.activo !== undefined ? data.activo : true,
      },
      include: {
        sector: true,
      },
    });
  }

  /**
   * Actualizar una ruta de especialidad
   */
  async actualizarRuta(id: string, data: UpdateRutaEspecialidadDto) {
    const ruta = await this.prisma.rutaEspecialidad.findUnique({
      where: { id },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    // Si se intenta cambiar el nombre o sector, verificar unicidad
    if (data.nombre || data.sectorId) {
      const newNombre = data.nombre || ruta.nombre;
      const newSectorId = data.sectorId || ruta.sectorId;

      const existing = await this.prisma.rutaEspecialidad.findUnique({
        where: {
          sectorId_nombre: {
            sectorId: newSectorId,
            nombre: newNombre,
          },
        },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Ya existe una ruta con el nombre "${newNombre}" en este sector`,
        );
      }
    }

    return this.prisma.rutaEspecialidad.update({
      where: { id },
      data,
      include: {
        sector: true,
      },
    });
  }

  /**
   * Eliminar una ruta (soft delete - marcarlo como inactivo)
   */
  async eliminarRuta(id: string) {
    const ruta = await this.prisma.rutaEspecialidad.findUnique({
      where: { id },
    });
    if (!ruta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    return this.prisma.rutaEspecialidad.update({
      where: { id },
      data: { activo: false },
    });
  }

  // ============================================================================
  // ASIGNACIÓN DE RUTAS A DOCENTES
  // ============================================================================

  /**
   * Obtener las rutas asignadas a un docente
   */
  async obtenerRutasDocente(docenteId: string) {
    return this.prisma.docenteRuta.findMany({
      where: { docenteId },
      include: {
        ruta: {
          include: {
            sector: true,
          },
        },
        sector: true,
      },
    });
  }

  /**
   * Asignar rutas a un docente (reemplaza las asignaciones anteriores)
   */
  async asignarRutasDocente(docenteId: string, data: AsignarRutasDocenteDto) {
    // Verificar que el docente exista
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Obtener información de las rutas
    const rutas = await this.prisma.rutaEspecialidad.findMany({
      where: { id: { in: data.rutaIds } },
      include: { sector: true },
    });

    if (rutas.length !== data.rutaIds.length) {
      throw new NotFoundException('Una o más rutas no existen');
    }

    // Eliminar asignaciones anteriores y crear las nuevas en una transacción
    await this.prisma.$transaction(async (tx) => {
      // Eliminar asignaciones anteriores
      await tx.docenteRuta.deleteMany({
        where: { docenteId },
      });

      // Crear nuevas asignaciones
      for (const ruta of rutas) {
        await tx.docenteRuta.create({
          data: {
            docenteId,
            rutaId: ruta.id,
            sectorId: ruta.sectorId,
          },
        });
      }
    });

    // Devolver las rutas asignadas
    return this.obtenerRutasDocente(docenteId);
  }

  /**
   * Agregar una ruta a un docente (sin eliminar las anteriores)
   */
  async agregarRutaDocente(docenteId: string, rutaId: string) {
    // Verificar que el docente exista
    const docente = await this.prisma.docente.findUnique({
      where: { id: docenteId },
    });

    if (!docente) {
      throw new NotFoundException('Docente no encontrado');
    }

    // Verificar que la ruta exista
    const ruta = await this.prisma.rutaEspecialidad.findUnique({
      where: { id: rutaId },
    });

    if (!ruta) {
      throw new NotFoundException('Ruta no encontrada');
    }

    // Verificar si ya está asignada
    const existing = await this.prisma.docenteRuta.findUnique({
      where: {
        docenteId_rutaId: {
          docenteId,
          rutaId,
        },
      },
    });

    if (existing) {
      throw new ConflictException('El docente ya tiene esta ruta asignada');
    }

    return this.prisma.docenteRuta.create({
      data: {
        docenteId,
        rutaId,
        sectorId: ruta.sectorId,
      },
      include: {
        ruta: {
          include: {
            sector: true,
          },
        },
        sector: true,
      },
    });
  }

  /**
   * Eliminar una ruta de un docente
   */
  async eliminarRutaDocente(docenteId: string, rutaId: string) {
    const asignacion = await this.prisma.docenteRuta.findUnique({
      where: {
        docenteId_rutaId: {
          docenteId,
          rutaId,
        },
      },
    });

    if (!asignacion) {
      throw new NotFoundException('Asignación no encontrada');
    }

    await this.prisma.docenteRuta.delete({
      where: {
        docenteId_rutaId: {
          docenteId,
          rutaId,
        },
      },
    });

    return { message: 'Ruta eliminada del docente correctamente' };
  }
}
