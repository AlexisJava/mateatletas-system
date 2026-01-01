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
      where: { id: dto.producto_id },
    });

    if (!producto) {
      throw new NotFoundException(
        `No se encontró el producto con ID ${dto.producto_id}`,
      );
    }

    // Cursos y Eventos pueden tener comisiones (turnos)
    if (producto.tipo !== 'Curso' && producto.tipo !== 'Evento') {
      throw new BadRequestException(
        'Las comisiones solo pueden crearse para productos de tipo Curso o Evento',
      );
    }

    // Validar casa si se especifica
    if (dto.casa_id) {
      const casa = await this.prisma.casa.findUnique({
        where: { id: dto.casa_id },
      });
      if (!casa) {
        throw new NotFoundException(
          `No se encontró la casa con ID ${dto.casa_id}`,
        );
      }
    }

    // Validar docente si se especifica
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

    // Crear la comisión
    const comision = await this.prisma.comision.create({
      data: {
        nombre: dto.nombre,
        descripcion: dto.descripcion,
        producto_id: dto.producto_id,
        casa_id: dto.casa_id,
        docente_id: dto.docente_id,
        cupo_maximo: dto.cupo_maximo,
        horario: dto.horario,
        fecha_inicio: dto.fecha_inicio ? new Date(dto.fecha_inicio) : undefined,
        fecha_fin: dto.fecha_fin ? new Date(dto.fecha_fin) : undefined,
        activo: dto.activo ?? true,
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

    if (filtros?.producto_id) {
      where.producto_id = filtros.producto_id;
    }

    if (filtros?.casa_id) {
      where.casa_id = filtros.casa_id;
    }

    if (filtros?.docente_id) {
      where.docente_id = filtros.docente_id;
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
        total_inscriptos: comision._count.inscripciones,
        cupos_disponibles: comision.cupo_maximo
          ? comision.cupo_maximo - comision._count.inscripciones
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
            fecha_inscripcion: 'desc',
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
        total_inscriptos: comision._count.inscripciones,
        cupos_disponibles: comision.cupo_maximo
          ? comision.cupo_maximo - comision._count.inscripciones
          : null,
      },
    };
  }

  /**
   * Actualizar una comisión existente
   */
  async update(id: string, dto: UpdateComisionDto) {
    // Verificar que la comisión existe
    const comisionExistente = await this.prisma.comision.findUnique({
      where: { id },
    });

    if (!comisionExistente) {
      throw new NotFoundException(`No se encontró la comisión con ID ${id}`);
    }

    // Validar producto si se cambia
    if (dto.producto_id && dto.producto_id !== comisionExistente.producto_id) {
      const producto = await this.prisma.producto.findUnique({
        where: { id: dto.producto_id },
      });

      if (!producto) {
        throw new NotFoundException(
          `No se encontró el producto con ID ${dto.producto_id}`,
        );
      }

      if (producto.tipo !== 'Curso' && producto.tipo !== 'Evento') {
        throw new BadRequestException(
          'Las comisiones solo pueden asociarse a productos de tipo Curso o Evento',
        );
      }
    }

    // Validar casa si se especifica
    if (dto.casa_id) {
      const casa = await this.prisma.casa.findUnique({
        where: { id: dto.casa_id },
      });
      if (!casa) {
        throw new NotFoundException(
          `No se encontró la casa con ID ${dto.casa_id}`,
        );
      }
    }

    // Validar docente si se especifica
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

    // Preparar datos de actualización
    const updateData: Prisma.ComisionUpdateInput = {};

    if (dto.nombre !== undefined) updateData.nombre = dto.nombre;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.producto_id !== undefined) {
      updateData.producto = { connect: { id: dto.producto_id } };
    }
    if (dto.casa_id !== undefined) {
      updateData.casa = dto.casa_id
        ? { connect: { id: dto.casa_id } }
        : { disconnect: true };
    }
    if (dto.docente_id !== undefined) {
      updateData.docente = dto.docente_id
        ? { connect: { id: dto.docente_id } }
        : { disconnect: true };
    }
    if (dto.cupo_maximo !== undefined) updateData.cupo_maximo = dto.cupo_maximo;
    if (dto.horario !== undefined) updateData.horario = dto.horario;
    if (dto.fecha_inicio !== undefined) {
      updateData.fecha_inicio = dto.fecha_inicio
        ? new Date(dto.fecha_inicio)
        : null;
    }
    if (dto.fecha_fin !== undefined) {
      updateData.fecha_fin = dto.fecha_fin ? new Date(dto.fecha_fin) : null;
    }
    if (dto.activo !== undefined) updateData.activo = dto.activo;

    const comision = await this.prisma.comision.update({
      where: { id },
      data: updateData,
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
        _count: {
          select: {
            inscripciones: true,
          },
        },
      },
    });

    return {
      success: true,
      data: {
        ...comision,
        total_inscriptos: comision._count.inscripciones,
        cupos_disponibles: comision.cupo_maximo
          ? comision.cupo_maximo - comision._count.inscripciones
          : null,
      },
      message: 'Comisión actualizada exitosamente',
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
    if (comision.cupo_maximo) {
      const cuposDisponibles =
        comision.cupo_maximo - comision._count.inscripciones;
      if (dto.estudiantes_ids.length > cuposDisponibles) {
        throw new BadRequestException(
          `No hay suficientes cupos. Disponibles: ${cuposDisponibles}, Solicitados: ${dto.estudiantes_ids.length}`,
        );
      }
    }

    // Validar que los estudiantes existan
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { id: { in: dto.estudiantes_ids } },
    });

    if (estudiantes.length !== dto.estudiantes_ids.length) {
      throw new NotFoundException(
        'Uno o más estudiantes no fueron encontrados',
      );
    }

    // Verificar que no estén ya inscritos
    const inscripcionesExistentes =
      await this.prisma.inscripcionComision.findMany({
        where: {
          comision_id: comisionId,
          estudiante_id: { in: dto.estudiantes_ids },
        },
      });

    if (inscripcionesExistentes.length > 0) {
      throw new BadRequestException(
        'Uno o más estudiantes ya están inscritos en esta comisión',
      );
    }

    // Crear las inscripciones
    const inscripciones = await this.prisma.$transaction(
      dto.estudiantes_ids.map((estudianteId) =>
        this.prisma.inscripcionComision.create({
          data: {
            comision_id: comisionId,
            estudiante_id: estudianteId,
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
        comision_id_estudiante_id: {
          comision_id: comisionId,
          estudiante_id: estudianteId,
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
        comision_id_estudiante_id: {
          comision_id: comisionId,
          estudiante_id: estudianteId,
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
    if (comision.cupo_maximo) {
      const cuposDisponibles =
        comision.cupo_maximo - comision._count.inscripciones;
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
        comision_id: comisionId,
        estudiante_id: resultadoEstudiante.estudiante.id,
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
        fecha_inscripcion: inscripcion.fecha_inscripcion,
      },
    };
  }
}
