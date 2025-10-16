import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
  Inject,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../../core/database/prisma.service';
import { CrearClaseDto } from '../dto/crear-clase.dto';

/**
 * Servicio especializado para gestión CRUD de clases
 * Extraído de ClasesService para separar responsabilidades
 */
@Injectable()
export class ClasesManagementService {
  private readonly logger = new Logger(ClasesManagementService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   * Programar una nueva clase (solo Admin)
   */
  async programarClase(dto: CrearClaseDto) {
    // 1. Validar que la ruta curricular existe
    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id: dto.rutaCurricularId },
    });

    if (!ruta) {
      throw new NotFoundException(
        `Ruta curricular con ID ${dto.rutaCurricularId} no encontrada`,
      );
    }

    // 2. Validar que el docente existe
    const docente = await this.prisma.docente.findUnique({
      where: { id: dto.docenteId },
    });

    if (!docente) {
      throw new NotFoundException(
        `Docente con ID ${dto.docenteId} no encontrado`,
      );
    }

    // 3. Si hay productoId, validar que sea un curso
    if (dto.productoId) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: dto.productoId },
      });

      if (!producto) {
        throw new NotFoundException(
          `Producto con ID ${dto.productoId} no encontrado`,
        );
      }

      if (producto.tipo !== 'Curso') {
        throw new BadRequestException(
          'El producto asociado debe ser de tipo Curso',
        );
      }
    }

    // 4. Validar que la fecha sea futura
    const fechaInicio = new Date(dto.fechaHoraInicio);
    if (fechaInicio <= new Date()) {
      throw new BadRequestException(
        'La fecha de inicio debe ser en el futuro',
      );
    }

    // 5. Crear la clase
    const clase = await this.prisma.clase.create({
      data: {
        ruta_curricular_id: dto.rutaCurricularId,
        docente_id: dto.docenteId,
        fecha_hora_inicio: fechaInicio,
        duracion_minutos: dto.duracionMinutos,
        cupos_maximo: dto.cuposMaximo,
        cupos_ocupados: 0,
        estado: 'Programada',
        producto_id: dto.productoId || null,
      },
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        docente: { select: { nombre: true, apellido: true } },
        producto: {
          select: { nombre: true, tipo: true },
        },
      },
    });

    this.logger.log(`Clase programada: ${clase.id}`);
    return clase;
  }

  /**
   * Cancelar una clase (Admin o Docente de la clase)
   */
  async cancelarClase(id: string, userId?: string, userRole?: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase ya está cancelada');
    }

    // Verificar permisos: Admin puede cancelar cualquier, Docente solo las suyas
    if (userRole === 'docente' && clase.docente_id !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para cancelar esta clase',
      );
    }

    // Actualizar estado de la clase
    const claseActualizada = await this.prisma.clase.update({
      where: { id },
      data: {
        estado: 'Cancelada',
        cupos_ocupados: 0, // Liberar todos los cupos
      },
      include: {
        rutaCurricular: { select: { nombre: true } },
        docente: { select: { nombre: true, apellido: true } },
      },
    });

    this.logger.warn(
      `Clase ${id} cancelada. ${clase.inscripciones.length} inscripciones afectadas`,
    );

    return claseActualizada;
  }

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
      rutaCurricularId?: string;
    },
    page: number = 1,
    limit: number = 50,
  ) {
    const where: any = {};

    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fecha_hora_inicio = {};
      if (filtros.fechaDesde) where.fecha_hora_inicio.gte = filtros.fechaDesde;
      if (filtros.fechaHasta) where.fecha_hora_inicio.lte = filtros.fechaHasta;
    }

    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.docenteId) where.docente_id = filtros.docenteId;
    if (filtros?.rutaCurricularId)
      where.ruta_curricular_id = filtros.rutaCurricularId;

    const skip = (page - 1) * limit;

    const [clases, total] = await Promise.all([
      this.prisma.clase.findMany({
        where,
        include: {
          rutaCurricular: { select: { nombre: true, color: true } },
          docente: { select: { nombre: true, apellido: true } },
          producto: { select: { nombre: true, tipo: true } },
          inscripciones: {
            select: { id: true, estudiante_id: true },
          },
        },
        orderBy: { fecha_hora_inicio: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.clase.count({ where }),
    ]);

    return {
      data: clases,
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
   * - Filtrar clases de cursos específicos si el tutor no tiene inscripción
   */
  async listarClasesParaTutor(tutorId: string) {
    const now = new Date();

    // 1. Obtener estudiantes del tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      include: {
        estudiantes: {
          include: {
            inscripciones_curso: {
              where: { estado: 'Activo' },
              select: { producto_id: true },
            },
          },
        },
      },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // 2. Obtener IDs de productos de cursos activos
    const cursosActivos = new Set<string>();
    tutor.estudiantes.forEach((estudiante) => {
      estudiante.inscripciones_curso.forEach((inscripcion) => {
        cursosActivos.add(inscripcion.producto_id);
      });
    });

    // 3. Buscar clases disponibles
    const clases = await this.prisma.clase.findMany({
      where: {
        estado: 'Programada',
        fecha_hora_inicio: { gte: now },
        OR: [
          { producto_id: null }, // Clases de suscripción general
          { producto_id: { in: Array.from(cursosActivos) } }, // Clases de cursos activos
        ],
      },
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        docente: { select: { nombre: true, apellido: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          where: {
            tutor_id: tutorId,
          },
          select: {
            id: true,
            estudiante_id: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
    });

    return clases;
  }

  /**
   * Obtener calendario de clases para un tutor (filtrado por mes/año)
   * Para el portal de tutores - pestaña "Calendario"
   * Muestra TODAS las clases donde sus estudiantes están inscritos
   */
  async obtenerCalendarioTutor(
    tutorId: string,
    mes?: number,
    anio?: number,
  ) {
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
        fecha_hora_inicio: {
          gte: fechaInicio,
          lte: fechaFin,
        },
        inscripciones: {
          some: {
            estudiante_id: { in: estudiantesIds },
          },
        },
      },
      include: {
        rutaCurricular: {
          select: { nombre: true, color: true },
        },
        docente: {
          select: { nombre: true, apellido: true },
        },
        producto: {
          select: { nombre: true, tipo: true },
        },
        inscripciones: {
          where: {
            estudiante_id: { in: estudiantesIds },
          },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                avatar_url: true,
              },
            },
          },
        },
        asistencias: {
          where: {
            estudiante_id: { in: estudiantesIds },
          },
          select: {
            id: true,
            estudiante_id: true,
            estado: true,
          },
        },
      },
      orderBy: {
        fecha_hora_inicio: 'asc',
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
    const where: any = {
      docente_id: docenteId,
    };

    if (!incluirPasadas) {
      where.fecha_hora_inicio = { gte: new Date() };
    }

    return this.prisma.clase.findMany({
      where,
      include: {
        rutaCurricular: { select: { nombre: true, color: true } },
        producto: { select: { nombre: true, tipo: true } },
        inscripciones: {
          select: {
            id: true,
            estudiante: { select: { nombre: true, apellido: true } },
          },
        },
      },
      orderBy: { fecha_hora_inicio: 'asc' },
    });
  }

  /**
   * Obtener detalles de una clase específica
   */
  async obtenerClase(id: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        rutaCurricular: true,
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
                nivel_escolar: true,
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
   * Obtener rutas curriculares (para formularios)
   *
   * CACHE: Este endpoint está cacheado por 10 minutos
   * Las rutas curriculares rara vez cambian (son datos estáticos)
   */
  async listarRutasCurriculares() {
    const cacheKey = 'rutas_curriculares_all';

    // Intentar obtener del cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug('Rutas curriculares obtenidas del cache');
      return cached;
    }

    // Si no está en cache, consultar la BD
    const rutas = await this.prisma.rutaCurricular.findMany({
      orderBy: { nombre: 'asc' },
    });

    // Guardar en cache por 10 minutos (600000ms)
    await this.cacheManager.set(cacheKey, rutas, 600000);
    this.logger.debug('Rutas curriculares guardadas en cache (10 min)');

    return rutas;
  }
}
