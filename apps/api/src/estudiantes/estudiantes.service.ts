import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';

/**
 * Service para gestionar operaciones CRUD de estudiantes
 * Implementa la lógica de negocio y validaciones
 */
@Injectable()
export class EstudiantesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crea un nuevo estudiante asociado a un tutor
   * @param tutorId - ID del tutor que crea el estudiante
   * @param createDto - Datos del estudiante a crear
   * @returns El estudiante creado con sus relaciones
   */
  async create(tutorId: string, createDto: CreateEstudianteDto) {
    // Validar que el tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // Validar equipo si se proporciona
    if (createDto.equipo_id) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: createDto.equipo_id },
      });

      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    // Validar edad
    if (createDto.edad < 3 || createDto.edad > 99) {
      throw new BadRequestException('La edad debe estar entre 3 y 99 años');
    }

    // Crear estudiante
    const estudiante = await this.prisma.estudiante.create({
      data: {
        ...createDto,
        tutor_id: tutorId,
      },
      include: {
        equipo: true,
      },
    });

    return estudiante;
  }

  /**
   * Obtiene todos los estudiantes de un tutor con filtros y paginación
   * @param tutorId - ID del tutor
   * @param query - Filtros y parámetros de paginación
   * @returns Lista de estudiantes con metadata
   */
  async findAllByTutor(tutorId: string, query?: QueryEstudiantesDto) {
    const page = query?.page || 1;
    const limit = query?.limit || 10;
    const skip = (page - 1) * limit;

    // Construir filtros
    const where: any = {
      tutor_id: tutorId,
    };

    if (query?.equipo_id) {
      where.equipo_id = query.equipo_id;
    }

    if (query?.nivel_escolar) {
      where.nivel_escolar = query.nivel_escolar;
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
   * Obtiene un estudiante específico verificando ownership
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @returns El estudiante con sus relaciones
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
   * Actualiza un estudiante existente
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   * @param updateDto - Datos a actualizar
   * @returns El estudiante actualizado
   */
  async update(id: string, tutorId: string, updateDto: UpdateEstudianteDto) {
    // Verificar ownership
    await this.findOne(id, tutorId);

    // Si se cambia equipo_id, validar que el nuevo equipo existe
    if (updateDto.equipo_id) {
      const equipo = await this.prisma.equipo.findUnique({
        where: { id: updateDto.equipo_id },
      });

      if (!equipo) {
        throw new NotFoundException('Equipo no encontrado');
      }
    }

    // Validar edad si se actualiza
    if (updateDto.edad !== undefined) {
      if (updateDto.edad < 3 || updateDto.edad > 99) {
        throw new BadRequestException('La edad debe estar entre 3 y 99 años');
      }
    }

    // Validar que el equipo existe si se está asignando
    if (updateDto.equipo_id) {
      const equipoExists = await this.prisma.equipo.findUnique({
        where: { id: updateDto.equipo_id },
      });

      if (!equipoExists) {
        throw new NotFoundException(
          `Equipo con ID ${updateDto.equipo_id} no encontrado`,
        );
      }
    }

    // Actualizar estudiante
    const estudiante = await this.prisma.estudiante.update({
      where: { id },
      data: updateDto,
      include: {
        equipo: true,
      },
    });

    return estudiante;
  }

  /**
   * Elimina un estudiante
   * @param id - ID del estudiante
   * @param tutorId - ID del tutor (para verificar ownership)
   */
  async remove(id: string, tutorId: string) {
    // Verificar ownership
    await this.findOne(id, tutorId);

    // Eliminar estudiante
    await this.prisma.estudiante.delete({
      where: { id },
    });

    return { message: 'Estudiante eliminado exitosamente' };
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
   * Obtiene estadísticas agregadas de los estudiantes de un tutor
   * @param tutorId - ID del tutor
   * @returns Estadísticas con totales y distribuciones
   */
  async getEstadisticas(tutorId: string) {
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      include: {
        equipo: true,
      },
    });

    // Distribución por nivel escolar
    const porNivel = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        acc[est.nivel_escolar] = (acc[est.nivel_escolar] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    // Distribución por equipo
    const porEquipo = estudiantes.reduce(
      (acc: Record<string, number>, est) => {
        if (est.equipo) {
          acc[est.equipo.nombre] = (acc[est.equipo.nombre] || 0) + 1;
        } else {
          acc['Sin equipo'] = (acc['Sin equipo'] || 0) + 1;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

    // Suma de puntos totales
    const puntosTotales = estudiantes.reduce(
      (sum: number, est) => sum + est.puntos_totales,
      0,
    );

    return {
      total: estudiantes.length,
      por_nivel: porNivel,
      por_equipo: porEquipo,
      puntos_totales: puntosTotales,
    };
  }

  /**
   * Obtiene TODOS los estudiantes (solo para admin)
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
   * Actualiza el avatar de un estudiante
   * @param id - ID del estudiante
   * @param avatarStyle - Estilo de avatar de Dicebear API
   * @returns El estudiante actualizado
   */
  async updateAvatar(id: string, avatarStyle: string) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return await this.prisma.estudiante.update({
      where: { id },
      data: {
        avatar_url: avatarStyle,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        avatar_url: true,
      },
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
        logrosDesbloqueados: {
          include: {
            logro: true,
          },
          orderBy: {
            fecha_obtenido: 'desc',
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
      (a) => a.estado === 'Presente',
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
        logros: estudiante.logrosDesbloqueados?.length || 0,
      },
    };
  }
}
