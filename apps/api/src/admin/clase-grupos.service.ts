import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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
      where: { id: dto.docente_id },
    });

    if (!docente) {
      throw new NotFoundException(
        `No se encontró el docente con ID ${dto.docente_id}`,
      );
    }

    // Validar que los estudiantes existan
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { id: { in: dto.estudiantes_ids } },
      include: { tutor: true },
    });

    if (estudiantes.length !== dto.estudiantes_ids.length) {
      throw new NotFoundException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // Calcular fecha_fin automática para GRUPO_REGULAR
    let fechaFin: Date;
    if (dto.tipo === TipoClaseGrupo.GRUPO_REGULAR && !dto.fecha_fin) {
      // Siempre 15 de diciembre del año lectivo
      fechaFin = new Date(dto.anio_lectivo, 11, 15); // Mes 11 = diciembre (0-indexed)
    } else {
      fechaFin = new Date(dto.fecha_fin!);
    }

    const fechaInicio = new Date(dto.fecha_inicio);

    // Validar que fecha_fin sea posterior a fecha_inicio
    if (fechaFin <= fechaInicio) {
      throw new BadRequestException(
        'La fecha de fin debe ser posterior a la fecha de inicio',
      );
    }

    // Crear el ClaseGrupo con las inscripciones en una transacción
    const claseGrupo = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Crear el grupo
      const grupo = await tx.claseGrupo.create({
        data: {
          grupo_id: dto.grupo_id,
          codigo: dto.codigo,
          nombre: dto.nombre,
          tipo: dto.tipo,
          dia_semana: dto.dia_semana,
          hora_inicio: dto.hora_inicio,
          hora_fin: dto.hora_fin,
          fecha_inicio: fechaInicio,
          fecha_fin: fechaFin,
          anio_lectivo: dto.anio_lectivo,
          cupo_maximo: dto.cupo_maximo,
          docente_id: dto.docente_id,
          ruta_curricular_id: dto.ruta_curricular_id,
          sector_id: dto.sector_id,
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
          rutaCurricular: {
            select: {
              id: true,
              nombre: true,
              color: true,
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
    });

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
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            color: true,
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

    type GrupoConContadores = typeof grupos[number];

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
        rutaCurricular: {
          select: {
            id: true,
            nombre: true,
            color: true,
            descripcion: true,
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
                nivel_escolar: true,
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
    if (dto.docente_id) {
      const docente = await this.prisma.docente.findUnique({
        where: { id: dto.docente_id },
      });

      if (!docente) {
        throw new NotFoundException(
          `No se encontró el docente con ID ${dto.docente_id}`,
        );
      }
    }

    // Preparar los datos a actualizar
    const updateData: Prisma.ClaseGrupoUpdateInput = {};

    if (dto.nombre) updateData.nombre = dto.nombre;
    if (dto.tipo) updateData.tipo = dto.tipo;
    if (dto.dia_semana) updateData.dia_semana = dto.dia_semana;
    if (dto.hora_inicio) updateData.hora_inicio = dto.hora_inicio;
    if (dto.hora_fin) updateData.hora_fin = dto.hora_fin;
    if (dto.fecha_inicio) updateData.fecha_inicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin) updateData.fecha_fin = new Date(dto.fecha_fin);
    if (dto.anio_lectivo) updateData.anio_lectivo = dto.anio_lectivo;
    if (dto.cupo_maximo) updateData.cupo_maximo = dto.cupo_maximo;
    if (dto.docente_id) {
      updateData.docente = { connect: { id: dto.docente_id } };
    }
    if (dto.ruta_curricular_id !== undefined) {
      updateData.rutaCurricular = dto.ruta_curricular_id
        ? { connect: { id: dto.ruta_curricular_id } }
        : { disconnect: true };
    }
    if (dto.sector_id !== undefined) {
      updateData.sector = dto.sector_id
        ? { connect: { id: dto.sector_id } }
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
            rutaCurricular: {
              select: {
                id: true,
                nombre: true,
                color: true,
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

        // Si se especificaron estudiantes_ids, actualizar las inscripciones
        if (dto.estudiantes_ids !== undefined) {
          // Validar que los estudiantes existan
          const estudiantes = await tx.estudiante.findMany({
            where: { id: { in: dto.estudiantes_ids } },
            include: { tutor: true },
          });

          if (estudiantes.length !== dto.estudiantes_ids.length) {
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
