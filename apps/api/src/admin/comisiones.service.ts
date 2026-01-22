import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import {
  CreateComisionDto,
  UpdateComisionDto,
  FiltrosComisionDto,
  InscribirEstudiantesDto,
  ActualizarInscripcionDto,
} from './dto/comision.dto';
import { Prisma, EstadoInscripcionComision } from '@prisma/client';
import { AdminEstudiantesService } from './services/admin-estudiantes.service';

/**
 * ComisionesService - CRUD de Comisiones de Productos
 *
 * Las Comisiones son instancias específicas de un Producto tipo Curso o Evento.
 * Ejemplo: "Colonia de Verano 2026" (tipo Evento) puede tener:
 *   - Comisión "QUANTUM Mañana" (turno mañana, casa QUANTUM)
 *   - Comisión "VERTEX Tarde" (turno tarde, casa VERTEX)
 *   - Comisión "PULSAR Tarde" (turno tarde, casa PULSAR)
 *
 * Cada comisión tiene su propio cupo, horario, docente y estudiantes inscritos.
 */
@Injectable()
export class ComisionesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly estudiantesService: AdminEstudiantesService,
  ) {}

  /**
   * Crear una nueva Comisión
   */
  async create(dto: CreateComisionDto) {
    // Validar que el producto existe y es de tipo Curso
    const producto = await this.prisma.producto.findUnique({
      where: { id: dto.productoId },
    });

    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${dto.productoId}`,
      );
    }

    // Cursos y Eventos pueden tener comisiones (turnos)
    if (producto.tipo !== 'Curso' && producto.tipo !== 'Evento') {
      throw new BadRequestException(
        'Las comisiones solo pueden crearse para productos de tipo Curso o Evento',
      );
    }

    // Validar casa si se especifica
    if (dto.casaId) {
      const casa = await this.prisma.casa.findUnique({
        where: { id: dto.casaId },
      });
      if (!casa) {
        throw new NotFoundException(
          `No se encontró la casa con ID ${dto.casaId}`,
        );
      }
    }

    // Validar docente si se especifica
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

    // Validar planificación si se especifica
    if (dto.planificacionId) {
      const planificacion = await this.prisma.planificacion.findUnique({
        where: { id: dto.planificacionId },
      });
      if (!planificacion) {
        throw new NotFoundException(
          `No se encontró la planificación con ID ${dto.planificacionId}`,
        );
      }
    }

    // Crear la comisión
    const comision = await this.prisma.comision.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        productoId: dto.productoId,
        casaId: dto.casaId,
        docenteId: dto.docenteId,
        cupoMaximo: dto.cupoMaximo,
        horario: dto.horario,
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : undefined,
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : undefined,
        activo: dto.activo ?? true,
        planificacionId: dto.planificacionId,
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            emoji: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        planificacion: {
          select: {
            id: true,
            titulo: true,
            cantidadClases: true,
          },
        },
      },
    });

    return {
      success: true,
      data: comision,
      message: `Comisión "${dto.nombre}" creada exitosamente`,
    };
  }

  /**
   * Listar comisiones con filtros opcionales
   */
  async findAll(filtros?: FiltrosComisionDto) {
    const where: Prisma.ComisionWhereInput = {};

    if (filtros?.productoId) {
      where.productoId = filtros.productoId;
    }

    if (filtros?.casaId) {
      where.casaId = filtros.casaId;
    }

    if (filtros?.docenteId) {
      where.docenteId = filtros.docenteId;
    }

    if (filtros?.activo !== undefined) {
      where.activo = filtros.activo;
    }

    const comisiones = await this.prisma.comision.findMany({
      where,
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true,
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            emoji: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
        planificacion: {
          select: {
            id: true,
            titulo: true,
            cantidadClases: true,
          },
        },
        _count: {
          select: {
            inscripciones: true,
          },
        },
      },
      orderBy: [{ producto: { nombre: 'asc' } }, { nombre: 'asc' }],
    });

    type ComisionConContadores = (typeof comisiones)[number];

    return {
      success: true,
      data: comisiones.map((comision: ComisionConContadores) => ({
        ...comision,
        totalInscriptos: comision._count.inscripciones,
        cuposDisponibles: comision.cupoMaximo
          ? comision.cupoMaximo - comision._count.inscripciones
          : null,
      })),
      total: comisiones.length,
    };
  }

  /**
   * Obtener una comisión por ID con todos sus detalles
   */
  async findOne(id: string) {
    const comision = await this.prisma.comision.findUnique({
      where: { id },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            tipo: true,
            precio: true,
            descripcion: true,
          },
        },
        casa: {
          select: {
            id: true,
            nombre: true,
            emoji: true,
          },
        },
        docente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
          },
        },
        planificacion: {
          select: {
            id: true,
            titulo: true,
            cantidadClases: true,
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
                casa: {
                  select: {
                    id: true,
                    nombre: true,
                    emoji: true,
                  },
                },
              },
            },
          },
          orderBy: {
            fechaInscripcion: 'desc',
          },
        },
        _count: {
          select: {
            inscripciones: true,
          },
        },
      },
    });

    if (!comision) {
      throw new NotFoundException(`No se encontró la comisión con ID ${id}`);
    }

    return {
      success: true,
      data: {
        ...comision,
        totalInscriptos: comision._count.inscripciones,
        cuposDisponibles: comision.cupoMaximo
          ? comision.cupoMaximo - comision._count.inscripciones
          : null,
      },
    };
  }

  /**
   * Actualizar una comisión existente
   */
  async update(id: string, dto: UpdateComisionDto) {
    const comisionExistente = await this.prisma.comision.findUnique({
      where: { id },
    });

    if (!comisionExistente) {
      throw new NotFoundException(`No se encontró la comisión con ID ${id}`);
    }

    await this.validateUpdateRelations(dto, comisionExistente.productoId);
    const updateData = this.buildComisionUpdateData(dto);

    const comision = await this.prisma.comision.update({
      where: { id },
      data: updateData,
      include: this.getComisionInclude(),
    });

    return {
      success: true,
      data: this.formatComisionResponse(comision),
      message: 'Comisión actualizada exitosamente',
    };
  }

  /**
   * Valida relaciones antes de actualizar comisión
   */
  private async validateUpdateRelations(
    dto: UpdateComisionDto,
    currentProductoId: string,
  ): Promise<void> {
    if (dto.productoId && dto.productoId !== currentProductoId) {
      await this.validateProductoForComision(dto.productoId);
    }

    if (dto.casaId) {
      const casa = await this.prisma.casa.findUnique({
        where: { id: dto.casaId },
      });
      if (!casa) {
        throw new NotFoundException(
          `No se encontró la casa con ID ${dto.casaId}`,
        );
      }
    }

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

    if (dto.planificacionId) {
      const planificacion = await this.prisma.planificacion.findUnique({
        where: { id: dto.planificacionId },
      });
      if (!planificacion) {
        throw new NotFoundException(
          `No se encontró la planificación con ID ${dto.planificacionId}`,
        );
      }
    }
  }

  /**
   * Valida que el producto sea válido para comisiones
   */
  private async validateProductoForComision(productoId: string): Promise<void> {
    const producto = await this.prisma.producto.findUnique({
      where: { id: productoId },
    });

    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${productoId}`,
      );
    }

    if (producto.tipo !== 'Curso' && producto.tipo !== 'Evento') {
      throw new BadRequestException(
        'Las comisiones solo pueden asociarse a productos de tipo Curso o Evento',
      );
    }
  }

  /**
   * Helper para construir relación connect/disconnect
   */
  private buildRelationUpdate(id: string | null | undefined) {
    if (id === undefined) return undefined;
    return id ? { connect: { id } } : { disconnect: true };
  }

  /**
   * Construye el objeto de actualización para Comision
   */
  private buildComisionUpdateData(
    dto: UpdateComisionDto,
  ): Prisma.ComisionUpdateInput {
    return {
      ...(dto.nombre !== undefined && { nombre: dto.nombre }),
      ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      ...(dto.productoId !== undefined && {
        producto: { connect: { id: dto.productoId } },
      }),
      ...(dto.casaId !== undefined && {
        casa: this.buildRelationUpdate(dto.casaId),
      }),
      ...(dto.docenteId !== undefined && {
        docente: this.buildRelationUpdate(dto.docenteId),
      }),
      ...(dto.planificacionId !== undefined && {
        planificacion: this.buildRelationUpdate(dto.planificacionId),
      }),
      ...(dto.cupoMaximo !== undefined && { cupoMaximo: dto.cupoMaximo }),
      ...(dto.horario !== undefined && { horario: dto.horario }),
      ...(dto.fechaInicio !== undefined && {
        fechaInicio: dto.fechaInicio ? new Date(dto.fechaInicio) : null,
      }),
      ...(dto.fechaFin !== undefined && {
        fechaFin: dto.fechaFin ? new Date(dto.fechaFin) : null,
      }),
      ...(dto.activo !== undefined && { activo: dto.activo }),
    };
  }

  /**
   * Include común para consultas de Comision
   */
  private getComisionInclude() {
    return {
      producto: {
        select: { id: true, nombre: true, tipo: true },
      },
      casa: {
        select: { id: true, nombre: true, emoji: true },
      },
      docente: {
        select: { id: true, nombre: true, apellido: true },
      },
      planificacion: {
        select: { id: true, titulo: true, cantidadClases: true },
      },
      _count: {
        select: { inscripciones: true },
      },
    };
  }

  /**
   * Formatea la respuesta de comisión con campos calculados
   */
  private formatComisionResponse(comision: {
    _count: { inscripciones: number };
    cupoMaximo: number | null;
    [key: string]: unknown;
  }) {
    return {
      ...comision,
      totalInscriptos: comision._count.inscripciones,
      cuposDisponibles: comision.cupoMaximo
        ? comision.cupoMaximo - comision._count.inscripciones
        : null,
    };
  }

  /**
   * Eliminar una comisión (soft delete)
   */
  async remove(id: string) {
    // Verificar que la comisión existe
    const comision = await this.prisma.comision.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            inscripciones: true,
          },
        },
      },
    });

    if (!comision) {
      throw new NotFoundException(`No se encontró la comisión con ID ${id}`);
    }

    // Soft delete - marcar como inactivo
    await this.prisma.comision.update({
      where: { id },
      data: { activo: false },
    });

    return {
      success: true,
      message: `Comisión "${comision.nombre}" desactivada. ${comision._count.inscripciones} inscripciones afectadas.`,
    };
  }

  /**
   * Inscribir estudiantes a una comisión
   */
  async inscribirEstudiantes(comisionId: string, dto: InscribirEstudiantesDto) {
    // Verificar que la comisión existe y está activa
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      include: {
        _count: {
          select: { inscripciones: true },
        },
      },
    });

    if (!comision) {
      throw new NotFoundException(
        `No se encontró la comisión con ID ${comisionId}`,
      );
    }

    if (!comision.activo) {
      throw new BadRequestException(
        'No se pueden inscribir estudiantes en una comisión inactiva',
      );
    }

    // Verificar cupo disponible
    if (comision.cupoMaximo) {
      const cuposDisponibles =
        comision.cupoMaximo - comision._count.inscripciones;
      if (dto.estudiantesIds.length > cuposDisponibles) {
        throw new BadRequestException(
          `No hay suficientes cupos. Disponibles: ${cuposDisponibles}, Solicitados: ${dto.estudiantesIds.length}`,
        );
      }
    }

    // Validar que los estudiantes existan
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { id: { in: dto.estudiantesIds } },
    });

    if (estudiantes.length !== dto.estudiantesIds.length) {
      throw new NotFoundException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // Verificar que no estén ya inscritos
    const inscripcionesExistentes =
      await this.prisma.inscripcionComision.findMany({
        where: {
          comisionId: comisionId,
          estudianteId: { in: dto.estudiantesIds },
        },
      });

    if (inscripcionesExistentes.length > 0) {
      throw new BadRequestException(
        'Uno o más estudiantes ya están inscritos en esta comisión',
      );
    }

    // Crear las inscripciones
    const inscripciones = await this.prisma.$transaction(
      dto.estudiantesIds.map((estudianteId) =>
        this.prisma.inscripcionComision.create({
          data: {
            comisionId: comisionId,
            estudianteId: estudianteId,
            estado: dto.estado || EstadoInscripcionComision.Pendiente,
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

    return {
      success: true,
      data: inscripciones,
      message: `${inscripciones.length} estudiante(s) inscrito(s) exitosamente`,
    };
  }

  /**
   * Actualizar estado de inscripción
   */
  async actualizarInscripcion(
    comisionId: string,
    estudianteId: string,
    dto: ActualizarInscripcionDto,
  ) {
    // Buscar la inscripción
    const inscripcion = await this.prisma.inscripcionComision.findUnique({
      where: {
        comisionId_estudianteId: {
          comisionId: comisionId,
          estudianteId: estudianteId,
        },
      },
    });

    if (!inscripcion) {
      throw new NotFoundException(
        'No se encontró la inscripción del estudiante en esta comisión',
      );
    }

    // Actualizar
    const inscripcionActualizada = await this.prisma.inscripcionComision.update(
      {
        where: { id: inscripcion.id },
        data: {
          estado: dto.estado,
          notas: dto.notas,
        },
        include: {
          estudiante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          comision: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    );

    return {
      success: true,
      data: inscripcionActualizada,
      message: `Estado de inscripción actualizado a ${dto.estado}`,
    };
  }

  /**
   * Remover estudiante de una comisión
   */
  async removerEstudiante(comisionId: string, estudianteId: string) {
    // Buscar la inscripción
    const inscripcion = await this.prisma.inscripcionComision.findUnique({
      where: {
        comisionId_estudianteId: {
          comisionId: comisionId,
          estudianteId: estudianteId,
        },
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
        'El estudiante no está inscrito en esta comisión',
      );
    }

    // Eliminar
    await this.prisma.inscripcionComision.delete({
      where: { id: inscripcion.id },
    });

    return {
      success: true,
      message: `Estudiante ${inscripcion.estudiante.nombre} ${inscripcion.estudiante.apellido} removido de la comisión`,
    };
  }

  /**
   * Crear estudiante nuevo e inscribirlo a una comisión en un solo paso
   * Retorna el estudiante creado, las credenciales y la inscripción
   */
  async crearEstudianteEInscribir(
    comisionId: string,
    dto: {
      nombreEstudiante: string;
      apellidoEstudiante: string;
      edadEstudiante: number;
      nivelEscolar: 'Primaria' | 'Secundaria' | 'Universidad';
      sectorId: string;
      casaId?: string;
      nombreTutor: string;
      apellidoTutor: string;
      emailTutor?: string;
      telefonoTutor?: string;
      dniTutor?: string;
    },
  ) {
    // Verificar que la comisión existe y está activa
    const comision = await this.prisma.comision.findUnique({
      where: { id: comisionId },
      include: {
        _count: {
          select: { inscripciones: true },
        },
      },
    });

    if (!comision) {
      throw new NotFoundException(
        `No se encontró la comisión con ID ${comisionId}`,
      );
    }

    if (!comision.activo) {
      throw new BadRequestException(
        'No se pueden inscribir estudiantes en una comisión inactiva',
      );
    }

    // Verificar cupo disponible
    if (comision.cupoMaximo) {
      const cuposDisponibles =
        comision.cupoMaximo - comision._count.inscripciones;
      if (cuposDisponibles <= 0) {
        throw new BadRequestException(
          'No hay cupos disponibles en esta comisión',
        );
      }
    }

    // Crear el estudiante con credenciales
    const resultadoEstudiante =
      await this.estudiantesService.crearEstudianteConCredenciales(dto);

    // Inscribir al estudiante en la comisión
    const inscripcion = await this.prisma.inscripcionComision.create({
      data: {
        comisionId: comisionId,
        estudianteId: resultadoEstudiante.estudiante.id,
        estado: EstadoInscripcionComision.Confirmada,
      },
      include: {
        comision: {
          select: {
            id: true,
            nombre: true,
          },
        },
      },
    });

    return {
      ...resultadoEstudiante,
      inscripcion: {
        id: inscripcion.id,
        comision: inscripcion.comision,
        estado: inscripcion.estado,
        fechaInscripcion: inscripcion.fechaInscripcion,
      },
    };
  }
}
