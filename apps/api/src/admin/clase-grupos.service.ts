import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { NotificacionesService } from '../notificaciones/notificaciones.service';
import { CrearClaseGrupoDto } from './dto/crear-clase-grupo.dto';
import { ActualizarClaseGrupoDto } from './dto/actualizar-clase-grupo.dto';
import { TipoClaseGrupo, Prisma } from '@prisma/client';

import { DiaSemana } from '@prisma/client';

const DIA_SEMANA_LABELS: Record<DiaSemana, string> = {
  LUNES: 'Lunes',
  MARTES: 'Martes',
  MIERCOLES: 'Miércoles',
  JUEVES: 'Jueves',
  VIERNES: 'Viernes',
  SABADO: 'Sábado',
  DOMINGO: 'Domingo',
};

@Injectable()
export class ClaseGruposService {
  private readonly logger = new Logger(ClaseGruposService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificacionesService: NotificacionesService,
  ) {}

  /**
   * Crear un nuevo ClaseGrupo con estudiantes inscritos
   */
  async crearClaseGrupo(dto: CrearClaseGrupoDto) {
    // Validar que el nombre no exista (nombre es unique, código puede repetirse)
    const existente = await this.prisma.claseGrupo.findUnique({
      where: { nombre: dto.nombre },
    });

    if (existente) {
      throw new BadRequestException(
        `Ya existe un grupo con el nombre "${dto.nombre}"`,
      );
    }

    // Validar que el grupo pedagógico exista
    const grupoPedagogico = await this.prisma.grupoPedagogico.findUnique({
      where: { id: dto.grupoId },
    });

    if (!grupoPedagogico) {
      throw new NotFoundException(
        `No se encontró el grupo pedagógico con ID ${dto.grupoId}`,
      );
    }

    // Validar que el docente exista
    const docente = await this.prisma.docente.findUnique({
      where: { id: dto.docenteId },
    });

    if (!docente) {
      throw new NotFoundException(
        `No se encontró el docente con ID ${dto.docenteId}`,
      );
    }

    // Validar que los estudiantes existan
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { id: { in: dto.estudiantesIds } },
      include: { tutor: true },
    });

    if (estudiantes.length !== dto.estudiantesIds.length) {
      throw new NotFoundException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // Calcular fechaFin automática para GRUPO_REGULAR
    let fechaFin: Date;
    // Usar comparación de string para evitar problemas de enum
    const esGrupoRegular =
      dto.tipo === TipoClaseGrupo.GRUPO_REGULAR ||
      (dto.tipo as string) === 'GRUPO_REGULAR';

    if (esGrupoRegular && !dto.fechaFin) {
      // Siempre 15 de diciembre del año lectivo
      fechaFin = new Date(dto.anioLectivo, 11, 15); // Mes 11 = diciembre (0-indexed)
    } else if (dto.fechaFin) {
      fechaFin = new Date(dto.fechaFin);
    } else {
      // Fallback: Si no es GRUPO_REGULAR y no hay fechaFin, usar 15/dic del año lectivo
      fechaFin = new Date(dto.anioLectivo, 11, 15);
    }

    const fechaInicio = new Date(dto.fechaInicio);

    // Validar que fechaFin sea posterior a fechaInicio
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Crear el ClaseGrupo con las inscripciones en una transacción
    const claseGrupo = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const grupo = await tx.claseGrupo.create({
          data: {
            grupoId: dto.grupoId,
            codigo: dto.codigo,
            nombre: dto.nombre,
            tipo: dto.tipo,
            diaSemana: dto.diaSemana,
            horaInicio: dto.horaInicio,
            horaFin: dto.horaFin,
            fechaInicio: fechaInicio,
            fechaFin: fechaFin,
            anioLectivo: dto.anioLectivo,
            cupoMaximo: dto.cupoMaximo,
            docenteId: dto.docenteId,
            sectorId: dto.sectorId,
            nivel: dto.nivel,
            productoId: dto.productoId, // FASE 3: Vincular con producto (Club)
            activo: true,
          },
          include: {
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
            sector: {
              select: {
                id: true,
                nombre: true,
                color: true,
              },
            },
          },
        });

        // Crear las inscripciones de los estudiantes
        type EstudianteConTutor = Prisma.EstudianteGetPayload<{
          include: { tutor: true };
        }>;

        const inscripciones = await Promise.all(
          estudiantes.map((estudiante: EstudianteConTutor) =>
            tx.inscripcionClaseGrupo.create({
              data: {
                claseGrupoId: grupo.id,
                estudianteId: estudiante.id,
                tutorId: estudiante.tutorId,
                fechaInscripcion: new Date(),
              },
              include: {
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    edad: true,
                  },
                },
                tutor: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            }),
          ),
        );

        return {
          ...grupo,
          inscripciones,
          totalInscriptos: inscripciones.length,
        };
      },
    );

    // Notificar al docente que fue asignado a este horario
    this.notificarDocenteAsignado(
      dto.docenteId,
      claseGrupo.id,
      dto.nombre,
      dto.diaSemana,
      dto.horaInicio,
      dto.horaFin,
    );

    return {
      success: true,
      data: claseGrupo,
      message: `Grupo ${dto.codigo} creado exitosamente con ${claseGrupo.totalInscriptos} estudiantes`,
    };
  }

  /**
   * Listar todos los ClaseGrupos con filtros opcionales
   * NOTA: Parámetros en camelCase para consistencia con frontend
   */
  async listarClaseGrupos(params?: {
    anioLectivo?: number;
    activo?: boolean;
    docenteId?: string;
    tipo?: TipoClaseGrupo;
    grupoId?: string;
    productoId?: string; // FASE 3: Filtro por producto (para Clubs)
  }) {
    // DEBUG: Ver qué parámetros llegan
    this.logger.debug(
      `[listarClaseGrupos] params recibidos: ${JSON.stringify(params)}`,
    );

    const where: Prisma.ClaseGrupoWhereInput = {};

    if (params?.anioLectivo !== undefined) {
      where.anioLectivo = params.anioLectivo;
    }

    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }

    if (params?.docenteId) {
      where.docenteId = params.docenteId;
    }

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    if (params?.grupoId) {
      where.grupoId = params.grupoId;
    }

    // FASE 3: Filtro por producto (para listar horarios de un Club específico)
    if (params?.productoId) {
      where.productoId = params.productoId;
    }

    const grupos = await this.prisma.claseGrupo.findMany({
      where,
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        sector: {
          select: {
            id: true,
            nombre: true,
          },
        },
        // IMPORTANTE: Usar vista unificada para lecturas (incluye inscripciones manuales + suscripción 2026)
        inscripcionesUnificadas: {
          where: { estado: 'ACTIVA' },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
              },
            },
          },
        },
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
            asistencias: true,
          },
        },
      },
      orderBy: [{ diaSemana: 'asc' }, { horaInicio: 'asc' }],
    });

    type GrupoConContadores = (typeof grupos)[number];

    return {
      success: true,
      data: grupos.map((grupo: GrupoConContadores) => ({
        ...grupo,
        // Mapear inscripcionesUnificadas a inscripciones para mantener compatibilidad API
        inscripciones: grupo.inscripcionesUnificadas,
        totalInscriptos: grupo._count.inscripcionesUnificadas,
        totalAsistencias: grupo._count.asistencias,
        cuposDisponibles:
          grupo.cupoMaximo - grupo._count.inscripcionesUnificadas,
      })),
      total: grupos.length,
    };
  }

  /**
   * Obtener un ClaseGrupo por ID con todos sus detalles
   */
  async obtenerClaseGrupo(id: string) {
    const grupo = await this.prisma.claseGrupo.findUnique({
      where: { id },
      include: {
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        sector: {
          select: {
            id: true,
            nombre: true,
            color: true,
          },
        },
        // IMPORTANTE: Usar vista unificada para lecturas (incluye inscripciones manuales + suscripción 2026)
        inscripcionesUnificadas: {
          where: { estado: 'ACTIVA' },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                edad: true,
                nivelEscolar: true,
              },
            },
            tutor: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
                telefono: true,
              },
            },
          },
          orderBy: {
            estudiante: {
              apellido: 'asc',
            },
          },
        },
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
            asistencias: true,
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(`No se encontró el grupo con ID ${id}`);
    }

    return {
      success: true,
      data: {
        ...grupo,
        // Mapear inscripcionesUnificadas a inscripciones para mantener compatibilidad API
        inscripciones: grupo.inscripcionesUnificadas,
        totalInscriptos: grupo._count.inscripcionesUnificadas,
        totalAsistencias: grupo._count.asistencias,
        cuposDisponibles:
          grupo.cupoMaximo - grupo._count.inscripcionesUnificadas,
      },
    };
  }

  /**
   * Actualizar un ClaseGrupo existente
   */
  async actualizarClaseGrupo(id: string, dto: ActualizarClaseGrupoDto) {
    // Verificar que el grupo existe
    const grupoExistente = await this.prisma.claseGrupo.findUnique({
      where: { id },
      include: {
        inscripciones: true,
      },
    });

    if (!grupoExistente) {
      throw new NotFoundException(`No se encontró el grupo con ID ${id}`);
    }

    // Si se está cambiando el nombre, verificar que no exista otro con ese nombre
    if (dto.nombre && dto.nombre !== grupoExistente.nombre) {
      const existente = await this.prisma.claseGrupo.findUnique({
        where: { nombre: dto.nombre },
      });

      if (existente) {
        throw new BadRequestException(
          `Ya existe un grupo con el nombre "${dto.nombre}"`,
        );
      }
    }

    // Si se está cambiando el docente, validar que exista
    if (dto.docenteId) {
      const docente = await this.prisma.docente.findUnique({
        where: { id: dto.docenteId },
      });

      if (!docente) {
        throw new NotFoundException(
          `No se encontró el docente con ID ${dto.docenteId}`,
        );
      }
    }

    // Preparar los datos a actualizar
    const updateData = this.buildUpdateData(dto);

    // Actualizar en transacción
    const claseGrupo = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Actualizar el grupo
        const grupoActualizado = await tx.claseGrupo.update({
          where: { id },
          data: updateData,
          include: {
            docente: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                email: true,
              },
            },
            sector: {
              select: {
                id: true,
                nombre: true,
                color: true,
              },
            },
          },
        });

        // Si se especificaron estudiantesIds, actualizar las inscripciones
        if (dto.estudiantesIds !== undefined) {
          // Validar que los estudiantes existan
          const estudiantes = await tx.estudiante.findMany({
            where: { id: { in: dto.estudiantesIds } },
            include: { tutor: true },
          });

          if (estudiantes.length !== dto.estudiantesIds.length) {
            throw new NotFoundException(
              'Uno o más estudiantes no fueron encontrados',
            );
          }

          // Eliminar todas las inscripciones actuales
          await tx.inscripcionClaseGrupo.deleteMany({
            where: { claseGrupoId: id },
          });

          // Crear las nuevas inscripciones
          type EstudianteConTutorUpdate = Prisma.EstudianteGetPayload<{
            include: { tutor: true };
          }>;

          await Promise.all(
            estudiantes.map((estudiante: EstudianteConTutorUpdate) =>
              tx.inscripcionClaseGrupo.create({
                data: {
                  claseGrupoId: id,
                  estudianteId: estudiante.id,
                  tutorId: estudiante.tutorId,
                  fechaInscripcion: new Date(),
                },
              }),
            ),
          );
        }

        // Obtener el grupo con las inscripciones actualizadas
        const inscripciones = await tx.inscripcionClaseGrupo.findMany({
          where: { claseGrupoId: id },
          include: {
            estudiante: {
              select: {
                id: true,
                nombre: true,
                apellido: true,
                edad: true,
              },
            },
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

        return {
          ...grupoActualizado,
          inscripciones,
          totalInscriptos: inscripciones.length,
        };
      },
    );

    // Si cambió el docente, notificar al nuevo docente
    if (dto.docenteId && dto.docenteId !== grupoExistente.docenteId) {
      const nombre = dto.nombre || grupoExistente.nombre;
      const diaSemana = dto.diaSemana ?? grupoExistente.diaSemana;
      const horaInicio = dto.horaInicio || grupoExistente.horaInicio;
      const horaFin = dto.horaFin || grupoExistente.horaFin;

      this.notificarDocenteAsignado(
        dto.docenteId,
        id,
        nombre,
        diaSemana,
        horaInicio,
        horaFin,
      );
    }

    return {
      success: true,
      data: claseGrupo,
      message: `Grupo actualizado exitosamente`,
    };
  }

  /**
   * Eliminar un ClaseGrupo (soft delete)
   */
  async eliminarClaseGrupo(id: string) {
    // Verificar que el grupo existe
    // IMPORTANTE: Usar vista unificada para contar inscripciones activas (incluye manuales + suscripción 2026)
    const grupoExistente = await this.prisma.claseGrupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
          },
        },
      },
    });

    if (!grupoExistente) {
      throw new NotFoundException(`No se encontró el grupo con ID ${id}`);
    }

    // Soft delete - marcar como inactivo
    await this.prisma.claseGrupo.update({
      where: { id },
      data: { activo: false },
    });

    return {
      success: true,
      message: `Horario desactivado exitosamente. ${grupoExistente._count.inscripcionesUnificadas} inscripciones fueron desactivadas.`,
    };
  }

  /**
   * Eliminar un ClaseGrupo permanentemente (hard delete)
   * Solo permitido si no tiene inscripciones activas
   */
  async eliminarClaseGrupoPermanente(id: string) {
    // Verificar que el grupo existe
    const grupoExistente = await this.prisma.claseGrupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
          },
        },
      },
    });

    if (!grupoExistente) {
      throw new NotFoundException(`No se encontró el grupo con ID ${id}`);
    }

    // No permitir hard delete si tiene inscripciones activas
    if (grupoExistente._count.inscripcionesUnificadas > 0) {
      throw new BadRequestException(
        `No se puede eliminar permanentemente un horario con ${grupoExistente._count.inscripcionesUnificadas} inscripciones activas. ` +
          `Desactívelo primero o elimine las inscripciones.`,
      );
    }

    // Eliminar inscripciones manuales inactivas asociadas
    await this.prisma.inscripcionClaseGrupo.deleteMany({
      where: { claseGrupoId: id },
    });

    // Eliminar registros de asistencia asociados
    await this.prisma.asistenciaClaseGrupo.deleteMany({
      where: { claseGrupoId: id },
    });

    // Hard delete del ClaseGrupo
    await this.prisma.claseGrupo.delete({
      where: { id },
    });

    return {
      success: true,
      message: `Horario eliminado permanentemente.`,
    };
  }

  /**
   * Agregar estudiantes a un ClaseGrupo existente
   */
  async agregarEstudiantes(claseGrupoId: string, estudiantesIds: string[]) {
    // Verificar que el grupo existe
    // IMPORTANTE: Usar vista unificada para contar inscripciones activas (incluye manuales + suscripción 2026)
    const grupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      include: {
        _count: {
          select: {
            inscripcionesUnificadas: {
              where: { estado: 'ACTIVA' },
            },
          },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(
        `No se encontró el grupo con ID ${claseGrupoId}`,
      );
    }

    // Verificar que no se exceda el cupo máximo
    const cuposDisponibles =
      grupo.cupoMaximo - grupo._count.inscripcionesUnificadas;
    if (estudiantesIds.length > cuposDisponibles) {
      throw new BadRequestException(
        `No hay suficientes cupos disponibles. Disponibles: ${cuposDisponibles}, Solicitados: ${estudiantesIds.length}`,
      );
    }

    // Validar que los estudiantes existan
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { id: { in: estudiantesIds } },
      include: { tutor: true },
    });

    if (estudiantes.length !== estudiantesIds.length) {
      throw new NotFoundException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // Verificar que los estudiantes no estén ya inscritos (usar vista unificada para incluir ambas fuentes)
    const inscripcionesExistentes =
      await this.prisma.inscripcionUnificada.findMany({
        where: {
          claseGrupoId: claseGrupoId,
          estudianteId: { in: estudiantesIds },
          estado: 'ACTIVA',
        },
      });

    if (inscripcionesExistentes.length > 0) {
      throw new BadRequestException(
        'Uno o más estudiantes ya están inscritos en este horario',
      );
    }

    // Crear las inscripciones en transacción para evitar race conditions
    const nuevasInscripciones = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        return await Promise.all(
          estudiantes.map((estudiante) =>
            tx.inscripcionClaseGrupo.create({
              data: {
                claseGrupoId: claseGrupoId,
                estudianteId: estudiante.id,
                tutorId: estudiante.tutorId,
                fechaInscripcion: new Date(),
              },
              include: {
                estudiante: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    edad: true,
                  },
                },
                tutor: {
                  select: {
                    id: true,
                    nombre: true,
                    apellido: true,
                    email: true,
                  },
                },
              },
            }),
          ),
        );
      },
    );

    return {
      success: true,
      data: nuevasInscripciones,
      message: `${nuevasInscripciones.length} estudiante(s) agregado(s) exitosamente`,
    };
  }

  /**
   * Remover un estudiante de un ClaseGrupo
   * NOTA: Solo puede remover inscripciones manuales. Las inscripciones via suscripción
   * deben cancelarse desde el portal tutor.
   */
  async removerEstudiante(claseGrupoId: string, estudianteId: string) {
    // Verificar que el grupo existe
    const grupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
    });

    if (!grupo) {
      throw new NotFoundException(
        `No se encontró el grupo con ID ${claseGrupoId}`,
      );
    }

    // Verificar que la inscripción existe usando vista unificada
    const inscripcionUnificada =
      await this.prisma.inscripcionUnificada.findFirst({
        where: {
          claseGrupoId: claseGrupoId,
          estudianteId: estudianteId,
          estado: 'ACTIVA',
        },
        include: {
          estudiante: {
            select: {
              nombre: true,
              apellido: true,
            },
          },
        },
      });

    if (!inscripcionUnificada) {
      throw new NotFoundException(
        `El estudiante no está inscrito en este horario`,
      );
    }

    // Solo se pueden eliminar inscripciones manuales desde admin
    if (inscripcionUnificada.fuente === 'SUSCRIPCION_2026') {
      throw new BadRequestException(
        `Esta inscripción proviene de una suscripción familiar. ` +
          `Debe cancelarse desde el portal del tutor o modificando la suscripción.`,
      );
    }

    // Buscar la inscripción manual para eliminarla
    const inscripcionManual = await this.prisma.inscripcionClaseGrupo.findFirst(
      {
        where: {
          claseGrupoId: claseGrupoId,
          estudianteId: estudianteId,
          fechaBaja: null,
        },
      },
    );

    if (!inscripcionManual) {
      throw new NotFoundException(
        `No se encontró la inscripción manual para eliminar`,
      );
    }

    // Eliminar la inscripción (soft delete con fecha_baja)
    await this.prisma.inscripcionClaseGrupo.update({
      where: { id: inscripcionManual.id },
      data: { fechaBaja: new Date() },
    });

    return {
      success: true,
      message: `Estudiante ${inscripcionUnificada.estudiante.nombre} ${inscripcionUnificada.estudiante.apellido} removido exitosamente`,
    };
  }

  /**
   * Construye el objeto de actualización para ClaseGrupo
   */
  private buildUpdateData(
    dto: ActualizarClaseGrupoDto,
  ): Prisma.ClaseGrupoUpdateInput {
    const updateData: Prisma.ClaseGrupoUpdateInput = {};

    if (dto.nombre) updateData.nombre = dto.nombre;
    if (dto.tipo) updateData.tipo = dto.tipo;
    if (dto.diaSemana) updateData.diaSemana = dto.diaSemana;
    if (dto.horaInicio) updateData.horaInicio = dto.horaInicio;
    if (dto.horaFin) updateData.horaFin = dto.horaFin;
    if (dto.fechaInicio) updateData.fechaInicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) updateData.fechaFin = new Date(dto.fechaFin);
    if (dto.anioLectivo) updateData.anioLectivo = dto.anioLectivo;
    if (dto.cupoMaximo) updateData.cupoMaximo = dto.cupoMaximo;
    if (dto.docenteId) {
      updateData.docente = { connect: { id: dto.docenteId } };
    }
    if (dto.sectorId !== undefined) {
      updateData.sector = dto.sectorId
        ? { connect: { id: dto.sectorId } }
        : { disconnect: true };
    }
    if (dto.nivel !== undefined) updateData.nivel = dto.nivel;

    return updateData;
  }

  /**
   * Notifica al docente que fue asignado a un ClaseGrupo
   * Ejecuta en background (fire-and-forget) para no bloquear la respuesta
   */
  private notificarDocenteAsignado(
    docenteId: string,
    claseGrupoId: string,
    nombre: string,
    diaSemana: DiaSemana,
    horaInicio: string,
    horaFin: string,
  ): void {
    const diaSemanaLabel = DIA_SEMANA_LABELS[diaSemana] || diaSemana;

    this.notificacionesService
      .notificarClaseAsignada(
        docenteId,
        claseGrupoId,
        nombre,
        diaSemanaLabel,
        horaInicio,
        horaFin,
      )
      .then(() => {
        this.logger.log(
          `Notificación enviada a docente ${docenteId} por ClaseGrupo ${claseGrupoId}`,
        );
      })
      .catch((err: Error) => {
        this.logger.error(
          `Error al notificar docente ${docenteId}: ${err.message}`,
        );
      });
  }
}
