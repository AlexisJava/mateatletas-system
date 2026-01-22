import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Servicio especializado para consultas (queries) de clases
 *
 * Responsabilidad: Solo operaciones de lectura
 * - Listar clases con filtros y paginación
 * - Obtener detalles de clases
 * - Calendarios para tutores
 *
 * IMPORTANTE: No ejecuta operaciones de escritura
 */
@Injectable()
export class ClaseQueryService {
  private readonly logger = new Logger(ClaseQueryService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Listar todas las clases (Admin) con paginación
   * @param filtros - Filtros opcionales para búsqueda
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 50)
   */
  async listarTodasLasClases(
    filtros?: {
      fechaDesde?: Date;
      fechaHasta?: Date;
      estado?: 'Programada' | 'Cancelada';
      docenteId?: string;
    },
    page: number = 1,
    limit: number = 50,
  ) {
    const where: Prisma.ClaseWhereInput = {};

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fechaHoraInicio = {};
      if (filtros.fechaDesde) where.fechaHoraInicio.gte = filtros.fechaDesde;
      if (filtros.fechaHasta) where.fechaHoraInicio.lte = filtros.fechaHasta;
    }

    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.docenteId) where.docenteId = filtros.docenteId;

    const skip = (page - 1) * limit;

    const [clases, total] = await Promise.all([
      this.prisma.clase.findMany({
        where,
        include: {
          docente: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
          sector: {
            select: {
              id: true,
              nombre: true,
              icono: true,
              color: true,
            },
          },
          producto: { select: { nombre: true, tipo: true } },
          inscripciones: {
            select: { id: true, estudianteId: true },
          },
          _count: {
            select: { inscripciones: true },
          },
        },
        orderBy: { fechaHoraInicio: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.clase.count({ where }),
    ]);

    // Mapear campos de Prisma a formato esperado por frontend
    const clasesFormateadas = clases.map((clase) => ({
      ...clase,
      // Mapear campos con nombres diferentes
      cupoMaximo: clase.cuposMaximo,
      cupoDisponible: clase.cuposMaximo - clase.cuposOcupados,
      titulo: clase.nombre,
    }));

    return {
      data: clasesFormateadas,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Listar clases disponibles para tutores
   * - Solo clases programadas
   * - Solo clases futuras
   */
  async listarClasesParaTutor(tutorId: string) {
    const now = new Date();

    // Verificar que el tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { id: true },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // Buscar clases disponibles
    const clases = await this.prisma.clase.findMany({
      where: {
        estado: 'Programada',
        fechaHoraInicio: { gte: now },
      },
      include: {
        docente: { select: { nombre: true, apellido: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          where: {
            tutorId: tutorId,
          },
          select: {
            id: true,
            estudianteId: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fechaHoraInicio: 'asc' },
    });

    return clases;
  }

  /**
   * Obtener calendario de clases para un tutor (filtrado por mes/año)
   * Para el portal de tutores - pestaña "Calendario"
   * Muestra TODAS las clases donde sus estudiantes están inscritos
   */
  async obtenerCalendarioTutor(tutorId: string, mes?: number, anio?: number) {
    // 1. Si no se proporciona mes/año, usar fecha actual
    const ahora = new Date();
    const mesSeleccionado = mes ?? ahora.getMonth() + 1; // getMonth() retorna 0-11
    const anioSeleccionado = anio ?? ahora.getFullYear();

    // 2. Validar mes
    if (mesSeleccionado < 1 || mesSeleccionado > 12) {
      throw new BadRequestException('El mes debe estar entre 1 y 12');
    }

    // 3. Calcular rango de fechas del mes
    const fechaInicio = new Date(anioSeleccionado, mesSeleccionado - 1, 1);
    const fechaFin = new Date(anioSeleccionado, mesSeleccionado, 0, 23, 59, 59);

    // 4. Obtener estudiantes del tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        estudiantes: {
          select: { id: true },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    const estudiantesIds = tutor.estudiantes.map((e) => e.id);

    if (estudiantesIds.length === 0) {
      return {
        mes: mesSeleccionado,
        anio: anioSeleccionado,
        clases: [],
        total: 0,
      };
    }

    // 5. Buscar clases donde los estudiantes del tutor están inscritos
    const clases = await this.prisma.clase.findMany({
      where: {
        fechaHoraInicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        inscripciones: {
          some: {
            estudianteId: { in: estudiantesIds },
          },
        },
      },
      include: {
        docente: {
          select: { nombre: true, apellido: true },
        },
        producto: {
          select: { nombre: true, tipo: true },
        },
        inscripciones: {
          where: {
            estudianteId: { in: estudiantesIds },
          },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatarGradient: true,
              },
            },
          },
        },
        asistencias: {
          where: {
            estudianteId: { in: estudiantesIds },
          },
          select: {
            id: true,
            estudianteId: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fechaHoraInicio: 'asc',
      },
    });

    return {
      mes: mesSeleccionado,
      anio: anioSeleccionado,
      clases,
      total: clases.length,
    };
  }

  /**
   * Listar clases de un docente
   */
  async listarClasesDeDocente(docenteId: string, incluirPasadas = false) {
    const where: Prisma.ClaseWhereInput = {
      docenteId: docenteId,
    };

    if (!incluirPasadas) {
      where.fechaHoraInicio = { gte: new Date() };
    }

    return this.prisma.clase.findMany({
      where,
      include: {
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          select: {
            id: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fechaHoraInicio: 'asc' },
    });
  }

  /**
   * Obtener detalles de una clase específica
   */
  async obtenerClase(id: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        docente: {
          select: { id: true, nombre: true, apellido: true, titulo: true },
        },
        producto: {
          select: { nombre: true, tipo: true, descripcion: true },
        },
        inscripciones: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                nivelEscolar: true,
              },
            },
            tutor: {
              select: { nombre: true, apellido: true, email: true },
            },
          },
        },
        asistencias: {
          include: {
            estudiante: {
              select: { nombre: true, apellido: true },
            },
          },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    return clase;
  }

  /**
   * Obtener estudiantes inscritos en una clase
   * GET /api/clases/:id/estudiantes
   *
   * @param claseId - ID de la clase
   * @returns Lista de estudiantes inscritos
   */
  async obtenerEstudiantesDeClase(claseId: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        sector: {
          select: {
            id: true,
            nombre: true,
            color: true,
            icono: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        inscripciones: {
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                nivelEscolar: true,
                avatarGradient: true,
                tutor: {
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
          orderBy: {
            fechaInscripcion: 'asc',
          },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    return {
      claseId: clase.id,
      nombre: clase.nombre,
      cuposMaximo: clase.cuposMaximo,
      cuposOcupados: clase.cuposOcupados,
      cuposDisponibles: clase.cuposMaximo - clase.cuposOcupados,
      docente: {
        id: clase.docente.id,
        nombre: clase.docente.nombre,
        apellido: clase.docente.apellido,
        sector: clase.sector, // Ahora usa el sector de la clase directamente
      },
      estudiantes: clase.inscripciones.map((inscripcion) => ({
        inscripcionId: inscripcion.id,
        estudianteId: inscripcion.estudiante.id,
        nombre: inscripcion.estudiante.nombre,
        apellido: inscripcion.estudiante.apellido,
        nivelEscolar: inscripcion.estudiante.nivelEscolar,
        avatarUrl: inscripcion.estudiante.avatarGradient,
        fechaInscripcion: inscripcion.fechaInscripcion,
        tutor: inscripcion.estudiante.tutor,
      })),
    };
  }
}
