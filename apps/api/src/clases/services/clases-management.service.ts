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
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { CrearClaseDto } from '../dto/crear-clase.dto';
import { NotificacionesService } from '../../notificaciones/notificaciones.service';

/**
 * Servicio especializado para gestión CRUD de clases
 * Extraído de ClasesService para separar responsabilidades
 *
 * RESILIENCIA:
 * - cancelarClase(): Usa Promise.allSettled para notificaciones
 *   * Operación principal (cancelar) SIEMPRE funciona
 *   * Notificaciones son best-effort (si fallan, no rompen la cancelación)
 */
@Injectable()
export class ClasesManagementService {
  private readonly logger = new Logger(ClasesManagementService.name);

  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private notificacionesService: NotificacionesService,
  ) {}

  /**
   * Programar una nueva clase (solo Admin)
   */
  async programarClase(dto: CrearClaseDto) {
    // 1. Validar que la ruta curricular existe (si se proporcionó)
    if (dto.rutaCurricularId) {
      const ruta = await this.prisma.rutaCurricular.findUnique({
        where: { id: dto.rutaCurricularId },
      });

      if (!ruta) {
        throw new NotFoundException(
          `Ruta curricular con ID ${dto.rutaCurricularId} no encontrada`,
        );
      }
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

    // 2b. Validar que el sector existe (si se proporcionó)
    if (dto.sectorId) {
      const sector = await this.prisma.sector.findUnique({
        where: { id: dto.sectorId },
      });

      if (!sector) {
        throw new NotFoundException(
          `Sector con ID ${dto.sectorId} no encontrado`,
        );
      }
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
      throw new BadRequestException('La fecha de inicio debe ser en el futuro');
    }

    // 5. Crear la clase
    const clase = await this.prisma.clase.create({
      data: {
        nombre: dto.nombre,
        ruta_curricular_id: dto.rutaCurricularId || null,
        docente_id: dto.docenteId,
        sector_id: dto.sectorId || null,
        fecha_hora_inicio: fechaInicio,
        duracion_minutos: dto.duracionMinutos,
        cupos_maximo: dto.cuposMaximo,
        cupos_ocupados: 0,
        descripcion: dto.descripcion ?? null,
        estado: 'Programada',
        producto_id: dto.productoId ?? null,
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
   * Cancelar una clase programada
   * ⚠️ SECURITY: Requiere autenticación y autorización estricta
   * - Admin: Puede cancelar cualquier clase
   * - Docente: Solo puede cancelar SUS clases
   * - Tutor/Estudiante: NO pueden cancelar clases
   */
  async cancelarClase(id: string, userId: string, userRole: string) {
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
        rutaCurricular: {
          select: { nombre: true },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException('La clase ya está cancelada');
    }

    // ✅ SECURITY FIX: Validación explícita de roles
    if (userRole === 'admin') {
      // Admin puede cancelar cualquier clase
    } else if (userRole === 'docente') {
      // Docente solo puede cancelar SUS clases
      if (clase.docente_id !== userId) {
        throw new ForbiddenException(
          'No tienes permiso para cancelar esta clase',
        );
      }
    } else {
      // Cualquier otro rol (tutor, estudiante) NO puede cancelar
      throw new ForbiddenException(
        'Solo admin y docentes pueden cancelar clases',
      );
    }

    // RESILIENCIA: Usar Promise.allSettled para operaciones críticas + secundarias
    // Operación 1 (CRÍTICA): Cancelar clase - DEBE siempre funcionar
    // Operación 2 (SECUNDARIA): Notificar docente - Best effort, si falla no rompe la cancelación
    const [cancelResult, notificacionResult] = await Promise.allSettled([
      // Operación principal: Cancelar clase
      this.prisma.clase.update({
        where: { id },
        data: {
          estado: 'Cancelada',
          cupos_ocupados: 0, // Liberar todos los cupos
        },
        include: {
          rutaCurricular: { select: { nombre: true } },
          docente: { select: { nombre: true, apellido: true } },
        },
      }),

      // Operación secundaria: Notificar al docente
      this.notificacionesService.notificarClaseCancelada(
        clase.docente_id,
        id,
        `${clase.rutaCurricular?.nombre || 'Clase'} - ${clase.fecha_hora_inicio.toLocaleDateString()}`,
      ),
    ]);

    // Verificar resultado de operación principal
    if (cancelResult.status === 'rejected') {
      this.logger.error(`Error al cancelar clase ${id}:`, cancelResult.reason);
      throw cancelResult.reason;
    }

    const claseActualizada = cancelResult.value;

    // Log de notificación (no crítico si falla)
    if (notificacionResult.status === 'rejected') {
      const reason = notificacionResult.reason as Error;
      this.logger.warn(
        `⚠️ Clase ${id} cancelada exitosamente, pero falló notificación al docente:`,
        reason.message,
      );
    } else {
      this.logger.log(
        `✅ Notificación enviada al docente sobre cancelación de clase ${id}`,
      );
    }

    this.logger.warn(
      `Clase ${id} cancelada. ${clase.inscripciones.length} inscripciones afectadas`,
    );

    return claseActualizada;
  }

  /**
   * Eliminar una clase permanentemente (Solo Admin)
   * @param id - ID de la clase a eliminar
   * @returns Mensaje de confirmación
   */
  async eliminarClase(id: string) {
    // Verificar que la clase existe
    const clase = await this.prisma.clase.findUnique({
      where: { id },
      include: {
        inscripciones: true,
        _count: {
          select: { inscripciones: true },
        },
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${id} no encontrada`);
    }

    // Eliminar la clase (las inscripciones se eliminarán en cascada si está configurado en Prisma)
    await this.prisma.clase.delete({
      where: { id },
    });

    this.logger.log(
      `Clase ${id} eliminada permanentemente. ${clase._count.inscripciones} inscripciones eliminadas`,
    );

    return {
      message: 'Clase eliminada exitosamente',
      claseId: id,
      inscripcionesEliminadas: clase._count.inscripciones,
    };
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
    const where: Prisma.ClaseWhereInput = {};

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
            select: { id: true, estudiante_id: true },
          },
          _count: {
            select: { inscripciones: true },
          },
        },
        orderBy: { fecha_hora_inicio: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.clase.count({ where }),
    ]);

    // Mapear campos de Prisma a formato esperado por frontend
    const clasesFormateadas = clases.map((clase) => ({
      ...clase,
      // Mapear campos con nombres diferentes
      cupo_maximo: clase.cupos_maximo,
      cupo_disponible: clase.cupos_maximo - clase.cupos_ocupados,
      titulo: clase.nombre,
      // Asegurar que ruta_curricular esté presente (alias)
      ruta_curricular: clase.rutaCurricular,
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
    const where: Prisma.ClaseWhereInput = {
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

  /**
   * Obtener una ruta curricular por su ID
   *
   * CACHE: reutiliza los mismos 10 minutos del listado general para evitar
   * consultas repetitivas en formularios que cargan detalles puntuales.
   */
  async obtenerRutaCurricularPorId(id: string) {
    const cacheKey = `ruta_curricular_${id}`;

    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      this.logger.debug(`Ruta curricular ${id} obtenida del cache`);
      return cached;
    }

    const ruta = await this.prisma.rutaCurricular.findUnique({
      where: { id },
    });

    if (!ruta) {
      throw new NotFoundException(`Ruta curricular con ID ${id} no encontrada`);
    }

    await this.cacheManager.set(cacheKey, ruta, 600000);
    return ruta;
  }

  /**
   * Asignar estudiantes a una clase (solo Admin)
   * POST /api/clases/:id/asignar-estudiantes
   *
   * Este endpoint permite al admin inscribir estudiantes directamente a una clase
   * sin necesidad de que el tutor haga la reserva.
   *
   * @param claseId - ID de la clase
   * @param estudianteIds - Array de IDs de estudiantes a asignar
   * @returns Clase actualizada con inscripciones
   */
  async asignarEstudiantesAClase(claseId: string, estudianteIds: string[]) {
    // 1. Verificar que la clase existe y está activa
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
      include: {
        inscripciones: true,
      },
    });

    if (!clase) {
      throw new NotFoundException(`Clase con ID ${claseId} no encontrada`);
    }

    if (clase.estado === 'Cancelada') {
      throw new BadRequestException(
        'No se pueden asignar estudiantes a una clase cancelada',
      );
    }

    // 2. Verificar que hay cupos disponibles
    const cuposDisponibles = clase.cupos_maximo - clase.cupos_ocupados;
    const nuevasInscripciones = estudianteIds.length;

    if (nuevasInscripciones > cuposDisponibles) {
      throw new BadRequestException(
        `No hay suficientes cupos disponibles. Cupos disponibles: ${cuposDisponibles}, intentando asignar: ${nuevasInscripciones}`,
      );
    }

    // 3. Verificar que todos los estudiantes existen
    const estudiantes = await this.prisma.estudiante.findMany({
      where: {
        id: { in: estudianteIds },
      },
      include: {
        tutor: true,
      },
    });

    if (estudiantes.length !== estudianteIds.length) {
      throw new BadRequestException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // 4. Verificar que los estudiantes no estén ya inscritos
    const estudiantesYaInscritos = clase.inscripciones
      .map((i) => i.estudiante_id)
      .filter((id) => estudianteIds.includes(id));

    if (estudiantesYaInscritos.length > 0) {
      throw new BadRequestException(
        `Los siguientes estudiantes ya están inscritos: ${estudiantesYaInscritos.join(', ')}`,
      );
    }

    // 5. Crear las inscripciones en una transacción
    const inscripcionesCreadas = await this.prisma.$transaction(
      async (prisma) => {
        // Crear todas las inscripciones
        const inscripciones = await Promise.all(
          estudiantes.map((estudiante) =>
            prisma.inscripcionClase.create({
              data: {
                clase_id: claseId,
                estudiante_id: estudiante.id,
                tutor_id: estudiante.tutor_id,
                observaciones: 'Asignado por administrador',
              },
              include: {
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                  },
                },
              },
            }),
          ),
        );

        // Actualizar cupos ocupados
        await prisma.clase.update({
          where: { id: claseId },
          data: {
            cupos_ocupados: clase.cupos_ocupados + nuevasInscripciones,
          },
        });

        return inscripciones;
      },
    );

    this.logger.log(
      `Admin asignó ${nuevasInscripciones} estudiantes a clase ${claseId}`,
    );

    return {
      message: `${nuevasInscripciones} estudiante(s) asignado(s) exitosamente`,
      inscripciones: inscripcionesCreadas,
    };
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
                nivel_escolar: true,
                avatar_url: true,
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
            fecha_inscripcion: 'asc',
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
      cuposMaximo: clase.cupos_maximo,
      cuposOcupados: clase.cupos_ocupados,
      cuposDisponibles: clase.cupos_maximo - clase.cupos_ocupados,
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
        nivelEscolar: inscripcion.estudiante.nivel_escolar,
        avatarUrl: inscripcion.estudiante.avatar_url,
        fechaInscripcion: inscripcion.fecha_inscripcion,
        tutor: inscripcion.estudiante.tutor,
      })),
    };
  }
}
