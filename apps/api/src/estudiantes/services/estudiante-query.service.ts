import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../core/database/prisma.service';
import { QueryEstudiantesDto } from '../dto/query-estudiantes.dto';

/**
 * Service para operaciones de LECTURA de estudiantes
 * Responsabilidad: Solo queries (GET operations) - CQRS Pattern
 */
@Injectable()
export class EstudianteQueryService {
  constructor(private prisma: PrismaService) {}

  /**
   * Busca estudiantes de un tutor con filtros y paginación
   * @param tutorId - ID del tutor
   * @param query - Filtros y parámetros de paginación
   * @returns Lista de estudiantes con metadata
   */
  async findAllByTutor(tutorId: string, query?: QueryEstudiantesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: Prisma.EstudianteWhereInput = {
      tutor_id: tutorId,
    };

    if (query?.equipoId) {
      where.equipoId = query.equipoId;
    }

    if (query?.nivelEscolar) {
      where.nivelEscolar = query.nivelEscolar;
    }

    // Ejecutar consultas en paralelo
    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        where,
        include: {
          equipo: true,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.estudiante.count({ where }),
    ]);

    return {
      data: estudiantes,
      metadata: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Busca un estudiante por ID sin validación de ownership
   * Útil para que el estudiante acceda a sus propios datos
   * @param id - ID del estudiante
   * @returns Estudiante encontrado
   * @throws NotFoundException si no existe
   */
  async findOneById(id: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        equipo: true,
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  /**
   * Obtiene un estudiante específico verificando ownership
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns El estudiante con sus relaciones
   * @throws NotFoundException si no existe o no pertenece al tutor
   */
  async findOne(id: string, tutorId: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
      include: {
        equipo: true,
        tutor: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
          },
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (estudiante.tutor_id !== tutorId) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return estudiante;
  }

  /**
   * Obtiene TODOS los estudiantes (solo para admin)
   * @param page - Número de página
   * @param limit - Límite de resultados por página
   * @returns Lista completa de estudiantes con tutor y equipo
   */
  async findAll(page: number = 1, limit: number = 50) {
    const skip = (page - 1) * limit;

    const [estudiantes, total] = await Promise.all([
      this.prisma.estudiante.findMany({
        include: {
          tutor: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
            },
          },
          equipo: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.estudiante.count(),
    ]);

    return {
      data: estudiantes,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Cuenta el total de estudiantes de un tutor
   * @param tutorId - ID del tutor
   * @returns Número total de estudiantes
   */
  async countByTutor(tutorId: string): Promise<number> {
    return this.prisma.estudiante.count({
      where: { tutor_id: tutorId },
    });
  }

  /**
   * Obtiene el detalle COMPLETO de un estudiante
   * Incluye: gamificación, asistencias, inscripciones, estadísticas
   * Para el portal de tutores - pestaña "Mis Hijos"
   * @param estudianteId - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns Detalle completo del estudiante con todas sus métricas
   */
  async getDetalleCompleto(estudianteId: string, tutorId: string) {
    // Verificar que el estudiante pertenece al tutor
    const estudiante = await this.prisma.estudiante.findFirst({
      where: {
        id: estudianteId,
        tutor_id: tutorId,
      },
      include: {
        equipo: true,
        logros_desbloqueados: {
          include: {
            logro: true,
          },
          orderBy: {
            fecha_desbloqueo: 'desc',
          },
        },
        inscripciones_clase: {
          include: {
            clase: {
              include: {
                rutaCurricular: true,
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
          orderBy: {
            clase: {
              fecha_hora_inicio: 'desc',
            },
          },
          take: 10, // Últimas 10 inscripciones
        },
        asistencias: {
          include: {
            clase: {
              include: {
                rutaCurricular: true,
              },
            },
          },
          orderBy: {
            clase: {
              fecha_hora_inicio: 'desc',
            },
          },
          take: 20, // Últimas 20 asistencias
        },
      },
    });

    if (!estudiante) {
      throw new NotFoundException(
        'Estudiante no encontrado o no pertenece a este tutor',
      );
    }

    // Calcular estadísticas
    const totalClases = estudiante.asistencias.length;
    const clasesPresente = estudiante.asistencias.filter(
      (a: { estado: string }) => a.estado === 'Presente',
    ).length;
    const tasaAsistencia =
      totalClases > 0 ? Math.round((clasesPresente / totalClases) * 100) : 0;

    return {
      ...estudiante,
      estadisticas: {
        total_clases: totalClases,
        clases_presente: clasesPresente,
        tasa_asistencia: tasaAsistencia,
        nivel: estudiante.nivel_actual,
        puntos: estudiante.puntos_totales,
        logros: estudiante.logros_desbloqueados?.length || 0,
      },
    };
  }

  /**
   * Obtiene clases disponibles para un estudiante en su sector
   * @param estudianteId - ID del estudiante
   * @returns Array de clases del sector con cupos disponibles
   */
  async obtenerClasesDisponiblesParaEstudiante(estudianteId: string) {
    // Validar estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Obtener clases del sector con cupos disponibles
    const clases = await this.prisma.clase.findMany({
      where: {
        sector_id: estudiante.sector_id,
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        sector: true,
      },
    });

    // Filtrar las que tienen cupos disponibles
    return clases.filter((clase) => clase.cupos_ocupados < clase.cupos_maximo);
  }

  /**
   * Obtener la próxima clase del estudiante (más cercana en el tiempo)
   * @param estudianteId - ID del estudiante
   * @returns La próxima clase programada o null si no hay ninguna
   */
  async obtenerProximaClase(estudianteId: string) {
    const ahora = new Date();

    // Buscar en clases grupales (ClaseGrupo)
    const proximaClaseGrupo = await this.prisma.claseGrupo.findFirst({
      where: {
        inscripciones: {
          some: {
            estudiante_id: estudianteId,
          },
        },
        activo: true,
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
        grupo: {
          select: {
            id: true,
            codigo: true,
            nombre: true,
            link_meet: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc', // Podemos usar createdAt como referencia temporal
      },
    });

    // Si encontramos clase grupal, calcular la próxima fecha según el día de la semana
    if (proximaClaseGrupo) {
      // Mapeo de enum DiaSemana de Prisma a índices de JavaScript (0=Domingo, 6=Sábado)
      const diasSemanaMap: Record<string, number> = {
        'DOMINGO': 0,
        'LUNES': 1,
        'MARTES': 2,
        'MIERCOLES': 3,
        'JUEVES': 4,
        'VIERNES': 5,
        'SABADO': 6,
      };
      const diaActual = ahora.getDay();
      const diaClase = diasSemanaMap[proximaClaseGrupo.dia_semana] ?? -1;

      // Parsear hora (formato "HH:MM")
      const [horas, minutos] = proximaClaseGrupo.hora_inicio.split(':').map(Number);

      let diasHasta = diaClase - diaActual;

      // Si es hoy mismo, verificar si la hora ya pasó
      if (diasHasta === 0) {
        const horaClase = horas * 60 + minutos;
        const horaActual = ahora.getHours() * 60 + ahora.getMinutes();
        if (horaActual >= horaClase) {
          // La clase de hoy ya pasó, próxima semana
          diasHasta = 7;
        }
      } else if (diasHasta < 0) {
        // El día ya pasó esta semana, próxima semana
        diasHasta += 7;
      }

      const fechaProxima = new Date(ahora);
      fechaProxima.setDate(ahora.getDate() + diasHasta);
      fechaProxima.setHours(horas, minutos, 0, 0);

      // Calcular duración en minutos desde hora_inicio y hora_fin
      const [horaFinH, horaFinM] = proximaClaseGrupo.hora_fin.split(':').map(Number);
      const duracionMinutos = (horaFinH * 60 + horaFinM) - (horas * 60 + minutos);

      return {
        tipo: 'grupo' as const,
        id: proximaClaseGrupo.id,
        nombre: proximaClaseGrupo.nombre,
        codigo: proximaClaseGrupo.codigo,
        fecha_hora_inicio: fechaProxima,
        duracion_minutos: duracionMinutos,
        docente: proximaClaseGrupo.docente,
        ruta_curricular: proximaClaseGrupo.rutaCurricular,
        dia_semana: proximaClaseGrupo.dia_semana,
        hora_inicio: proximaClaseGrupo.hora_inicio,
        link_meet: proximaClaseGrupo.grupo?.link_meet,
      };
    }

    // Si no hay clase grupal, buscar en clases individuales (Clase)
    const proximaClaseIndividual = await this.prisma.clase.findFirst({
      where: {
        inscripciones: {
          some: {
            estudiante_id: estudianteId,
          },
        },
        fecha_hora_inicio: {
          gte: ahora,
        },
        estado: 'Programada',
      },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
          },
        },
      },
      orderBy: {
        fecha_hora_inicio: 'asc',
      },
    });

    if (proximaClaseIndividual) {
      return {
        tipo: 'individual' as const,
        id: proximaClaseIndividual.id,
        fecha_hora_inicio: proximaClaseIndividual.fecha_hora_inicio,
        duracion_minutos: proximaClaseIndividual.duracion_minutos,
        docente: proximaClaseIndividual.docente,
        ruta_curricular: proximaClaseIndividual.rutaCurricular,
        estado: proximaClaseIndividual.estado,
      };
    }

    return null;
  }

  /**
   * Obtener compañeros de ClaseGrupo del estudiante
   * Retorna todos los estudiantes inscritos en el mismo ClaseGrupo que el estudiante actual
   * @param estudianteId - ID del estudiante
   * @returns Lista de compañeros con sus puntos totales
   */
  async obtenerCompanerosDeClase(estudianteId: string) {
    // Buscar el ClaseGrupo al que pertenece el estudiante
    const inscripcion = await this.prisma.inscripcionClaseGrupo.findFirst({
      where: {
        estudiante_id: estudianteId,
      },
      include: {
        claseGrupo: true,
      },
    });

    if (!inscripcion) {
      return [];
    }

    // Obtener todos los estudiantes inscritos en el mismo ClaseGrupo
    const companeros = await this.prisma.estudiante.findMany({
      where: {
        inscripciones_clase_grupo: {
          some: {
            clase_grupo_id: inscripcion.clase_grupo_id,
          },
        },
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        puntos_totales: true,
      },
      orderBy: {
        puntos_totales: 'desc',
      },
    });

    return companeros.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      apellido: c.apellido,
      puntos: c.puntos_totales,
    }));
  }

  /**
   * Obtener los sectores (Matemática, Programación, Ciencias) en los que está inscrito el estudiante
   * Agrupa los grupos por sector para mostrar en el portal del estudiante
   * @param estudianteId - ID del estudiante autenticado
   * @returns Array de sectores con sus grupos y metadata
   */
  async obtenerMisSectores(estudianteId: string) {
    // 1. Obtener todas las inscripciones del estudiante con grupos y sectores
    const inscripciones = await this.prisma.inscripcionClaseGrupo.findMany({
      where: {
        estudiante_id: estudianteId,
        fecha_baja: null, // Solo inscripciones activas
      },
      include: {
        claseGrupo: {
          include: {
            grupo: {
              include: {
                sector: true,
              },
            },
          },
        },
      },
    });

    // 2. Extraer sectores únicos
    const sectoresMap = new Map<string, {
      id: string;
      nombre: string;
      descripcion: string | null;
      color: string;
      icono: string;
      grupos: Array<{
        id: string;
        codigo: string;
        nombre: string;
        link_meet: string | null;
      }>;
    }>();

    for (const inscripcion of inscripciones) {
      const grupo = inscripcion.claseGrupo.grupo;
      const sector = grupo.sector;

      if (!sector) continue; // Saltar grupos sin sector

      // Si el sector no está en el map, agregarlo
      if (!sectoresMap.has(sector.id)) {
        sectoresMap.set(sector.id, {
          id: sector.id,
          nombre: sector.nombre,
          descripcion: sector.descripcion,
          color: sector.color,
          icono: sector.icono,
          grupos: [],
        });
      }

      // Agregar grupo al sector (evitar duplicados)
      const sectorData = sectoresMap.get(sector.id)!;
      const grupoExiste = sectorData.grupos.some(g => g.id === grupo.id);

      if (!grupoExiste) {
        sectorData.grupos.push({
          id: grupo.id,
          codigo: grupo.codigo,
          nombre: grupo.nombre,
          link_meet: grupo.link_meet,
        });
      }
    }

    // 3. Convertir Map a Array y ordenar por nombre
    return Array.from(sectoresMap.values()).sort((a, b) =>
      a.nombre.localeCompare(b.nombre)
    );
  }
}
