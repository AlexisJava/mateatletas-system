import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CrearClaseGrupoDto } from './dto/crear-clase-grupo.dto';
import { ActualizarClaseGrupoDto } from './dto/actualizar-clase-grupo.dto';
import { TipoClaseGrupo, Prisma } from '@prisma/client';

@Injectable()
export class ClaseGruposService {
  constructor(private readonly prisma: PrismaService) {}

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

    // Calcular fecha_fin automática para GRUPO_REGULAR
    let fechaFin: Date;
    if (dto.tipo === TipoClaseGrupo.GRUPO_REGULAR && !dto.fechaFin) {
      // Siempre 15 de diciembre del año lectivo
      fechaFin = new Date(dto.anioLectivo, 11, 15); // Mes 11 = diciembre (0-indexed)
    } else {
      fechaFin = new Date(dto.fechaFin!);
    }

    const fechaInicio = new Date(dto.fechaInicio);

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Crear el ClaseGrupo con las inscripciones en una transacción
    const claseGrupo = await this.prisma.$transaction(
      async (tx: Prisma.TransactionClient) => {
        // Crear el grupo
        const grupo = await tx.claseGrupo.create({
          data: {
            grupo_id: dto.grupoId,
            codigo: dto.codigo,
            nombre: dto.nombre,
            tipo: dto.tipo,
            dia_semana: dto.diaSemana,
            hora_inicio: dto.horaInicio,
            hora_fin: dto.horaFin,
            fecha_inicio: fechaInicio,
            fecha_fin: fechaFin,
            anio_lectivo: dto.anioLectivo,
            cupo_maximo: dto.cupoMaximo,
            docente_id: dto.docenteId,
            sector_id: dto.sectorId,
            nivel: dto.nivel,
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
                clase_grupo_id: grupo.id,
                estudiante_id: estudiante.id,
                tutor_id: estudiante.tutor_id,
                fecha_inscripcion: new Date(),
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
          total_inscriptos: inscripciones.length,
        };
      },
    );

    return {
      success: true,
      data: claseGrupo,
      message: `Grupo ${dto.codigo} creado exitosamente con ${claseGrupo.total_inscriptos} estudiantes`,
    };
  }

  /**
   * Listar todos los ClaseGrupos con filtros opcionales
   */
  async listarClaseGrupos(params?: {
    anio_lectivo?: number;
    activo?: boolean;
    docente_id?: string;
    tipo?: TipoClaseGrupo;
    grupo_id?: string;
  }) {
    const where: Prisma.ClaseGrupoWhereInput = {};

    if (params?.anio_lectivo !== undefined) {
      where.anio_lectivo = params.anio_lectivo;
    }

    if (params?.activo !== undefined) {
      where.activo = params.activo;
    }

    if (params?.docente_id) {
      where.docente_id = params.docente_id;
    }

    if (params?.tipo) {
      where.tipo = params.tipo;
    }

    if (params?.grupo_id) {
      where.grupo_id = params.grupo_id;
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
        inscripciones: {
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
            inscripciones: true,
            asistencias: true,
          },
        },
      },
      orderBy: [{ dia_semana: 'asc' }, { hora_inicio: 'asc' }],
    });

    type GrupoConContadores = (typeof grupos)[number];

    return {
      success: true,
      data: grupos.map((grupo: GrupoConContadores) => ({
        ...grupo,
        total_inscriptos: grupo._count.inscripciones,
        total_asistencias: grupo._count.asistencias,
        cupos_disponibles: grupo.cupo_maximo - grupo._count.inscripciones,
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
        inscripciones: {
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
            inscripciones: true,
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
        total_inscriptos: grupo._count.inscripciones,
        total_asistencias: grupo._count.asistencias,
        cupos_disponibles: grupo.cupo_maximo - grupo._count.inscripciones,
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
    const updateData: Prisma.ClaseGrupoUpdateInput = {};

    if (dto.nombre) updateData.nombre = dto.nombre;
    if (dto.tipo) updateData.tipo = dto.tipo;
    if (dto.diaSemana) updateData.dia_semana = dto.diaSemana;
    if (dto.horaInicio) updateData.hora_inicio = dto.horaInicio;
    if (dto.horaFin) updateData.hora_fin = dto.horaFin;
    if (dto.fechaInicio) updateData.fecha_inicio = new Date(dto.fechaInicio);
    if (dto.fechaFin) updateData.fecha_fin = new Date(dto.fechaFin);
    if (dto.anioLectivo) updateData.anio_lectivo = dto.anioLectivo;
    if (dto.cupoMaximo) updateData.cupo_maximo = dto.cupoMaximo;
    if (dto.docenteId) {
      updateData.docente = { connect: { id: dto.docenteId } };
    }
    if (dto.sectorId !== undefined) {
      updateData.sector = dto.sectorId
        ? { connect: { id: dto.sectorId } }
        : { disconnect: true };
    }
    if (dto.nivel !== undefined) updateData.nivel = dto.nivel;

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
            where: { clase_grupo_id: id },
          });

          // Crear las nuevas inscripciones
          type EstudianteConTutorUpdate = Prisma.EstudianteGetPayload<{
            include: { tutor: true };
          }>;

          await Promise.all(
            estudiantes.map((estudiante: EstudianteConTutorUpdate) =>
              tx.inscripcionClaseGrupo.create({
                data: {
                  clase_grupo_id: id,
                  estudiante_id: estudiante.id,
                  tutor_id: estudiante.tutor_id,
                  fecha_inscripcion: new Date(),
                },
              }),
            ),
          );
        }

        // Obtener el grupo con las inscripciones actualizadas
        const inscripciones = await tx.inscripcionClaseGrupo.findMany({
          where: { clase_grupo_id: id },
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
          total_inscriptos: inscripciones.length,
        };
      },
    );

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
    const grupoExistente = await this.prisma.claseGrupo.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscripciones: true,
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
      message: `Horario eliminado exitosamente. ${grupoExistente._count.inscripciones} inscripciones fueron desactivadas.`,
    };
  }

  /**
   * Agregar estudiantes a un ClaseGrupo existente
   */
  async agregarEstudiantes(claseGrupoId: string, estudiantesIds: string[]) {
    // Verificar que el grupo existe
    const grupo = await this.prisma.claseGrupo.findUnique({
      where: { id: claseGrupoId },
      include: {
        _count: {
          select: { inscripciones: true },
        },
      },
    });

    if (!grupo) {
      throw new NotFoundException(
        `No se encontró el grupo con ID ${claseGrupoId}`,
      );
    }

    // Verificar que no se exceda el cupo máximo
    const cuposDisponibles = grupo.cupo_maximo - grupo._count.inscripciones;
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

    // Verificar que los estudiantes no estén ya inscritos
    const inscripcionesExistentes =
      await this.prisma.inscripcionClaseGrupo.findMany({
        where: {
          clase_grupo_id: claseGrupoId,
          estudiante_id: { in: estudiantesIds },
        },
      });

    if (inscripcionesExistentes.length > 0) {
      throw new BadRequestException(
        'Uno o más estudiantes ya están inscritos en este horario',
      );
    }

    // Crear las inscripciones
    const nuevasInscripciones = await Promise.all(
      estudiantes.map((estudiante) =>
        this.prisma.inscripcionClaseGrupo.create({
          data: {
            clase_grupo_id: claseGrupoId,
            estudiante_id: estudiante.id,
            tutor_id: estudiante.tutor_id,
            fecha_inscripcion: new Date(),
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
      success: true,
      data: nuevasInscripciones,
      message: `${nuevasInscripciones.length} estudiante(s) agregado(s) exitosamente`,
    };
  }

  /**
   * Remover un estudiante de un ClaseGrupo
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

    // Verificar que la inscripción existe
    const inscripcion = await this.prisma.inscripcionClaseGrupo.findFirst({
      where: {
        clase_grupo_id: claseGrupoId,
        estudiante_id: estudianteId,
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

    if (!inscripcion) {
      throw new NotFoundException(
        `El estudiante no está inscrito en este horario`,
      );
    }

    // Eliminar la inscripción
    await this.prisma.inscripcionClaseGrupo.delete({
      where: { id: inscripcion.id },
    });

    return {
      success: true,
      message: `Estudiante ${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido} removido exitosamente`,
    };
  }
}
