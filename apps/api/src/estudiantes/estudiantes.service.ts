import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../core/database/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';
import { QueryEstudiantesDto } from './dto/query-estudiantes.dto';
import {
  CrearEstudiantesConTutorDto,
  CredencialesGeneradas,
} from './dto/crear-estudiantes-con-tutor.dto';
import {
  generarUsername,
  generarPasswordTemporal,
  hashPassword,
} from './utils/credenciales.utils';

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
    const where: Prisma.EstudianteWhereInput = {
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
   * Actualiza el avatar 3D (Ready Player Me) del estudiante sin validación de ownership
   * Útil para que el estudiante actualice su propio avatar 3D
   * @param id - ID del estudiante
   * @param avatar_url - URL del avatar de Ready Player Me
   * @returns Estudiante actualizado
   * @throws NotFoundException si no existe
   */
  async updateAvatar3D(id: string, avatar_url: string) {
    // Verificar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Actualizar solo el avatar 3D
    return this.prisma.estudiante.update({
      where: { id },
      data: { avatar_url },
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
  }

  async updateAnimacionIdle(id: string, animacion_idle_url: string) {
    // Verificar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    // Actualizar solo la animación idle
    return this.prisma.estudiante.update({
      where: { id },
      data: { animacion_idle_url },
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
  }

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
  async updateAvatarGradient(id: string, gradientId: number) {
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return await this.prisma.estudiante.update({
      where: { id },
      data: {
        avatar_gradient: gradientId,
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        avatar_gradient: true,
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

  /**
   * TDD: Crear uno o múltiples estudiantes con tutor en un sector
   * @param dto - Datos de estudiantes y tutor
   * @returns Estudiantes creados con credenciales generadas
   */
  async crearEstudiantesConTutor(dto: CrearEstudiantesConTutorDto) {
    // Validar que el sector existe
    const sector = await this.prisma.sector.findUnique({
      where: { id: dto.sectorId },
    });

    if (!sector) {
      throw new BadRequestException('El sector especificado no existe');
    }

    // Buscar si el tutor ya existe por email
    const tutorExistente = await this.prisma.tutor.findFirst({
      where: {
        email: dto.tutor.email,
      },
    });

    const credenciales: CredencialesGeneradas = {
      estudiantes: [],
    };

    let tutor = tutorExistente;

    // Si el tutor no existe, crear uno nuevo
    if (!tutorExistente) {
      const usernameTutor = await generarUsername(
        dto.tutor.nombre,
        dto.tutor.apellido,
        this.prisma,
      );
      const passwordTutor = generarPasswordTemporal();
      const passwordHash = await hashPassword(passwordTutor);

      tutor = await this.prisma.tutor.create({
        data: {
          nombre: dto.tutor.nombre,
          apellido: dto.tutor.apellido,
          dni: dto.tutor.dni,
          telefono: dto.tutor.telefono,
          username: usernameTutor,
          email: dto.tutor.email,
          password_hash: passwordHash,
          password_temporal: passwordTutor,
          debe_cambiar_password: true,
        },
      });

      credenciales.tutor = {
        username: usernameTutor,
        password: passwordTutor,
      };
    }

    // Crear estudiantes en transacción
    const estudiantesCreados = await this.prisma.$transaction(
      async (prisma) => {
        const estudiantesPromises = dto.estudiantes.map(async (estDto) => {
          const usernameEstudiante = await generarUsername(
            estDto.nombre,
            estDto.apellido,
            this.prisma,
          );
          const passwordEstudiante = generarPasswordTemporal();
          const passwordHash = await hashPassword(passwordEstudiante);

          const estudiante = await prisma.estudiante.create({
            data: {
              nombre: estDto.nombre,
              apellido: estDto.apellido,
              edad: estDto.edad,
              nivel_escolar: estDto.nivel_escolar,
              email: estDto.email,
              username: usernameEstudiante,
              password_hash: passwordHash,
              password_temporal: passwordEstudiante,
              debe_cambiar_password: true,
              tutor_id: tutor!.id,
              sector_id: dto.sectorId,
            },
            include: {
              sector: true,
              tutor: true,
            },
          });

          credenciales.estudiantes.push({
            nombre: `${estDto.nombre} ${estDto.apellido}`,
            username: usernameEstudiante,
            password: passwordEstudiante,
          });

          return estudiante;
        });

        return await Promise.all(estudiantesPromises);
      },
    );

    return {
      estudiantes: estudiantesCreados,
      tutor,
      credenciales,
    };
  }

  /**
   * TDD: Copiar estudiante existente a otro sector
   * @param estudianteId - ID del estudiante
   * @param nuevoSectorId - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  async copiarEstudianteASector(estudianteId: string, nuevoSectorId: string) {
    // Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: {
        tutor: true,
      },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar que el sector destino existe
    const sector = await this.prisma.sector.findUnique({
      where: { id: nuevoSectorId },
    });

    if (!sector) {
      throw new BadRequestException('El sector destino no existe');
    }

    // Verificar si ya existe un estudiante con el mismo tutor y nombre en ese sector
    const existeDuplicado = await this.prisma.estudiante.findFirst({
      where: {
        tutor_id: estudiante.tutor_id,
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        sector_id: nuevoSectorId,
      },
    });

    if (existeDuplicado) {
      throw new ConflictException(
        'Este estudiante ya está inscrito en el sector destino',
      );
    }

    // DUPLICAR estudiante en el nuevo sector (crear un nuevo registro)
    const estudianteDuplicado = await this.prisma.estudiante.create({
      data: {
        nombre: estudiante.nombre,
        apellido: estudiante.apellido,
        edad: estudiante.edad,
        nivel_escolar: estudiante.nivel_escolar,
        email: estudiante.email,
        tutor_id: estudiante.tutor_id,
        sector_id: nuevoSectorId,
        // Copiar datos de gamificación
        nivel_actual: estudiante.nivel_actual,
        puntos_totales: estudiante.puntos_totales,
        avatar_gradient: estudiante.avatar_gradient,
        equipo_id: estudiante.equipo_id,
      },
      include: {
        sector: true,
        tutor: true,
      },
    });

    return estudianteDuplicado;
  }

  /**
   * TDD: Buscar estudiante por DNI y copiarlo a otro sector
   * @param dni - DNI del estudiante
   * @param nuevoSectorId - ID del sector destino
   * @returns Estudiante con sector actualizado
   */
  async copiarEstudiantePorDNIASector(email: string, nuevoSectorId: string) {
    // Buscar estudiante por email
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { email },
      include: {
        sector: true,
        tutor: true,
      },
    });

    if (!estudiante) {
      throw new BadRequestException(
        `No se encontró un estudiante con email ${email}`,
      );
    }

    // Usar el método de copiar por ID
    return await this.copiarEstudianteASector(estudiante.id, nuevoSectorId);
  }

  /**
   * TDD: Asignar una clase a un estudiante
   * @param estudianteId - ID del estudiante
   * @param claseId - ID de la clase
   * @returns Inscripción creada
   */
  async asignarClaseAEstudiante(estudianteId: string, claseId: string) {
    // Validar que el estudiante existe
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar que la clase existe
    const clase = await this.prisma.clase.findUnique({
      where: { id: claseId },
    });

    if (!clase) {
      throw new BadRequestException('La clase no existe');
    }

    // Validar que la clase pertenece al sector del estudiante
    if (clase.sector_id !== estudiante.sector_id) {
      throw new BadRequestException(
        'La clase no pertenece al sector del estudiante',
      );
    }

    // Validar cupos disponibles
    if (clase.cupos_ocupados >= clase.cupos_maximo) {
      throw new ConflictException('La clase no tiene cupos disponibles');
    }

    // Validar que no esté ya inscrito
    const inscripcionExistente = await this.prisma.inscripcionClase.findFirst({
      where: {
        estudiante_id: estudianteId,
        clase_id: claseId,
      },
    });

    if (inscripcionExistente) {
      throw new ConflictException(
        'El estudiante ya está inscrito en esta clase',
      );
    }

    // Crear inscripción e incrementar cupos
    const inscripcion = await this.prisma.inscripcionClase.create({
      data: {
        estudiante_id: estudianteId,
        clase_id: claseId,
        tutor_id: estudiante.tutor_id,
      },
    });

    // Incrementar cupos ocupados
    await this.prisma.clase.update({
      where: { id: claseId },
      data: {
        cupos_ocupados: {
          increment: 1,
        },
      },
    });

    return inscripcion;
  }

  /**
   * TDD: Asignar múltiples clases a un estudiante
   * @param estudianteId - ID del estudiante
   * @param clasesIds - Array de IDs de clases
   * @returns Array de inscripciones creadas
   */
  async asignarClasesAEstudiante(estudianteId: string, clasesIds: string[]) {
    // Validar estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
    });

    if (!estudiante) {
      throw new BadRequestException('El estudiante no existe');
    }

    // Validar clases
    const clases = await this.prisma.clase.findMany({
      where: {
        id: {
          in: clasesIds,
        },
      },
    });

    if (clases.length !== clasesIds.length) {
      throw new BadRequestException('Una o más clases no existen');
    }

    // Validar que todas las clases pertenecen al sector
    for (const clase of clases) {
      if (clase.sector_id !== estudiante.sector_id) {
        throw new BadRequestException(
          `La clase ${clase.nombre} no pertenece al sector del estudiante`,
        );
      }

      if (clase.cupos_ocupados >= clase.cupos_maximo) {
        throw new ConflictException(
          `La clase ${clase.nombre} no tiene cupos disponibles`,
        );
      }
    }

    // Crear inscripciones en transacción
    const inscripciones = await this.prisma.$transaction(async (prisma) => {
      const inscripcionesPromises = clasesIds.map(async (claseId) => {
        // Verificar inscripción duplicada
        const existente = await prisma.inscripcionClase.findFirst({
          where: {
            estudiante_id: estudianteId,
            clase_id: claseId,
          },
        });

        if (existente) {
          throw new ConflictException(
            'El estudiante ya está inscrito en una de las clases',
          );
        }

        // Crear inscripción
        const inscripcion = await prisma.inscripcionClase.create({
          data: {
            estudiante_id: estudianteId,
            clase_id: claseId,
            tutor_id: estudiante.tutor_id,
          },
        });

        // Incrementar cupos
        await prisma.clase.update({
          where: { id: claseId },
          data: {
            cupos_ocupados: {
              increment: 1,
            },
          },
        });

        return inscripcion;
      });

      return await Promise.all(inscripcionesPromises);
    });

    return inscripciones;
  }

  /**
   * TDD: Obtener clases disponibles para un estudiante
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
}
