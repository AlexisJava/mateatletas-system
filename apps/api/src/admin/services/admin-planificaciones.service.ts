import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import {
  CrearPlanificacionDto,
  ActualizarPlanificacionDto,
  ActualizarClasePlanificacionDto,
  AgregarTareaDto,
  PlanificacionResponse,
} from '../dto/planificacion.dto';

/**
 * Servicio de Planificaciones para Admin
 *
 * Responsabilidades:
 * - CRUD de Planificaciones
 * - Gestión de ClasePlanificacion
 * - Asignación de contenidos a clases
 * - Gestión de tareas por clase
 * - Publicación de planificaciones
 */
@Injectable()
export class AdminPlanificacionesService {
  private readonly logger = new Logger(AdminPlanificacionesService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Crear nueva planificación con N clases vacías
   * @param dto - Datos de la planificación
   * @param creadorId - ID del admin que crea la planificación
   */
  async crear(
    dto: CrearPlanificacionDto,
    creadorId: string,
  ): Promise<PlanificacionResponse> {
    this.logger.log(
      `Creando planificación: ${dto.titulo} por admin ${creadorId}`,
    );

    // Crear contenidos vacíos para teoría y práctica de cada clase
    const planificacion = await this.prisma.$transaction(async (tx) => {
      // 1. Crear contenidos vacíos para cada clase
      const clasesData = [];
      for (let i = 1; i <= dto.cantidad_clases; i++) {
        // Crear contenido de teoría
        const teoria = await tx.contenido.create({
          data: {
            titulo: `${dto.titulo} - Clase ${i} (Teoría)`,
            casaTipo: dto.casa_tipo,
            mundoTipo: dto.mundo_tipo,
            estado: 'BORRADOR',
            tipo: 'LECCION',
            creadorId: creadorId,
          },
        });

        // Crear nodos raíz para teoría
        await tx.nodoContenido.createMany({
          data: [
            {
              contenidoId: teoria.id,
              titulo: 'Teoría',
              bloqueado: true,
              orden: 0,
            },
            {
              contenidoId: teoria.id,
              titulo: 'Práctica',
              bloqueado: true,
              orden: 1,
            },
            {
              contenidoId: teoria.id,
              titulo: 'Evaluación',
              bloqueado: true,
              orden: 2,
            },
          ],
        });

        // Crear contenido de práctica
        const practica = await tx.contenido.create({
          data: {
            titulo: `${dto.titulo} - Clase ${i} (Práctica)`,
            casaTipo: dto.casa_tipo,
            mundoTipo: dto.mundo_tipo,
            estado: 'BORRADOR',
            tipo: 'TAREA',
            creadorId: creadorId,
          },
        });

        // Crear nodos raíz para práctica
        await tx.nodoContenido.createMany({
          data: [
            {
              contenidoId: practica.id,
              titulo: 'Teoría',
              bloqueado: true,
              orden: 0,
            },
            {
              contenidoId: practica.id,
              titulo: 'Práctica',
              bloqueado: true,
              orden: 1,
            },
            {
              contenidoId: practica.id,
              titulo: 'Evaluación',
              bloqueado: true,
              orden: 2,
            },
          ],
        });

        clasesData.push({
          numero: i,
          titulo: `Clase ${i}`,
          descripcion: null,
          teoria_id: teoria.id,
          practica_id: practica.id,
        });
      }

      // 2. Crear la planificación
      const nuevaPlanificacion = await tx.planificacion.create({
        data: {
          titulo: dto.titulo,
          descripcion: dto.descripcion ?? null,
          cantidad_clases: dto.cantidad_clases,
          casa_tipo: dto.casa_tipo,
          mundo_tipo: dto.mundo_tipo,
          estado: 'BORRADOR',
          clases: {
            create: clasesData,
          },
        },
        include: {
          clases: {
            include: {
              teoria: {
                select: { id: true, titulo: true, estado: true },
              },
              practica: {
                select: { id: true, titulo: true, estado: true },
              },
              tareas: {
                include: {
                  contenido: {
                    select: { id: true, titulo: true },
                  },
                },
              },
            },
            orderBy: { numero: 'asc' },
          },
        },
      });

      return nuevaPlanificacion;
    });

    this.logger.log(`Planificación creada: ${planificacion.id}`);
    return this.mapToResponse(planificacion);
  }

  /**
   * Obtener planificación por ID con todas sus clases
   */
  async obtenerPorId(id: string): Promise<PlanificacionResponse> {
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id },
      include: {
        clases: {
          include: {
            teoria: {
              select: { id: true, titulo: true, estado: true },
            },
            practica: {
              select: { id: true, titulo: true, estado: true },
            },
            tareas: {
              include: {
                contenido: {
                  select: { id: true, titulo: true },
                },
              },
              orderBy: { orden: 'asc' },
            },
          },
          orderBy: { numero: 'asc' },
        },
      },
    });

    if (!planificacion) {
      throw new NotFoundException('Planificación no encontrada');
    }

    return this.mapToResponse(planificacion);
  }

  /**
   * Listar planificaciones con paginación y filtros
   */
  async listar(options?: {
    page?: number;
    limit?: number;
    estado?: 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO';
    casa_tipo?: 'QUANTUM' | 'VERTEX' | 'PULSAR';
    mundo_tipo?: 'MATEMATICA' | 'PROGRAMACION' | 'CIENCIAS';
  }) {
    const page = options?.page ?? 1;
    const limit = Math.min(options?.limit ?? 20, 100);
    const skip = (page - 1) * limit;

    const where = {
      ...(options?.estado && { estado: options.estado }),
      ...(options?.casa_tipo && { casa_tipo: options.casa_tipo }),
      ...(options?.mundo_tipo && { mundo_tipo: options.mundo_tipo }),
    };

    const [planificaciones, total] = await Promise.all([
      this.prisma.planificacion.findMany({
        where,
        include: {
          clases: {
            include: {
              teoria: {
                select: { id: true, titulo: true, estado: true },
              },
              practica: {
                select: { id: true, titulo: true, estado: true },
              },
            },
            orderBy: { numero: 'asc' },
          },
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.planificacion.count({ where }),
    ]);

    return {
      data: planificaciones.map((p) => this.mapToResponse(p)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Actualizar metadata de planificación
   */
  async actualizar(
    id: string,
    dto: ActualizarPlanificacionDto,
  ): Promise<PlanificacionResponse> {
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id },
    });

    if (!planificacion) {
      throw new NotFoundException('Planificación no encontrada');
    }

    if (planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden editar planificaciones en borrador',
      );
    }

    const updated = await this.prisma.planificacion.update({
      where: { id },
      data: {
        ...(dto.titulo && { titulo: dto.titulo }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
      },
      include: {
        clases: {
          include: {
            teoria: {
              select: { id: true, titulo: true, estado: true },
            },
            practica: {
              select: { id: true, titulo: true, estado: true },
            },
            tareas: {
              include: {
                contenido: {
                  select: { id: true, titulo: true },
                },
              },
              orderBy: { orden: 'asc' },
            },
          },
          orderBy: { numero: 'asc' },
        },
      },
    });

    return this.mapToResponse(updated);
  }

  /**
   * Actualizar una clase de planificación
   */
  async actualizarClase(
    claseId: string,
    dto: ActualizarClasePlanificacionDto,
  ): Promise<PlanificacionResponse> {
    const clase = await this.prisma.clasePlanificacion.findUnique({
      where: { id: claseId },
      include: {
        planificacion: true,
      },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    if (clase.planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden editar clases de planificaciones en borrador',
      );
    }

    // Validar que los contenidos existan si se proporcionan
    if (dto.teoria_id) {
      const teoria = await this.prisma.contenido.findUnique({
        where: { id: dto.teoria_id },
      });
      if (!teoria) {
        throw new NotFoundException('Contenido de teoría no encontrado');
      }
    }

    if (dto.practica_id) {
      const practica = await this.prisma.contenido.findUnique({
        where: { id: dto.practica_id },
      });
      if (!practica) {
        throw new NotFoundException('Contenido de práctica no encontrado');
      }
    }

    await this.prisma.clasePlanificacion.update({
      where: { id: claseId },
      data: {
        ...(dto.titulo && { titulo: dto.titulo }),
        ...(dto.descripcion !== undefined && { descripcion: dto.descripcion }),
        ...(dto.teoria_id && { teoria_id: dto.teoria_id }),
        ...(dto.practica_id && { practica_id: dto.practica_id }),
      },
    });

    return this.obtenerPorId(clase.planificacion_id);
  }

  /**
   * Agregar tarea a una clase
   */
  async agregarTarea(
    claseId: string,
    dto: AgregarTareaDto,
  ): Promise<PlanificacionResponse> {
    const clase = await this.prisma.clasePlanificacion.findUnique({
      where: { id: claseId },
      include: {
        planificacion: true,
        tareas: true,
      },
    });

    if (!clase) {
      throw new NotFoundException('Clase no encontrada');
    }

    if (clase.planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden agregar tareas a planificaciones en borrador',
      );
    }

    // Validar que el contenido exista
    const contenido = await this.prisma.contenido.findUnique({
      where: { id: dto.contenido_id },
    });

    if (!contenido) {
      throw new NotFoundException('Contenido no encontrado');
    }

    // Verificar que no exista ya esa tarea
    const tareaExistente = clase.tareas.find(
      (t) => t.contenido_id === dto.contenido_id,
    );
    if (tareaExistente) {
      throw new BadRequestException('La tarea ya está asignada a esta clase');
    }

    // Calcular orden si no se proporciona
    const orden = dto.orden ?? clase.tareas.length;

    await this.prisma.tareaClase.create({
      data: {
        clase_id: claseId,
        contenido_id: dto.contenido_id,
        orden,
        obligatoria: dto.obligatoria ?? false,
      },
    });

    return this.obtenerPorId(clase.planificacion_id);
  }

  /**
   * Eliminar tarea de una clase
   */
  async eliminarTarea(
    claseId: string,
    tareaId: string,
  ): Promise<PlanificacionResponse> {
    const tarea = await this.prisma.tareaClase.findUnique({
      where: { id: tareaId },
      include: {
        clase: {
          include: {
            planificacion: true,
          },
        },
      },
    });

    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    if (tarea.clase.id !== claseId) {
      throw new BadRequestException('La tarea no pertenece a esta clase');
    }

    if (tarea.clase.planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden eliminar tareas de planificaciones en borrador',
      );
    }

    await this.prisma.tareaClase.delete({
      where: { id: tareaId },
    });

    return this.obtenerPorId(tarea.clase.planificacion_id);
  }

  /**
   * Publicar planificación
   */
  async publicar(id: string): Promise<PlanificacionResponse> {
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id },
      include: {
        clases: {
          include: {
            teoria: true,
            practica: true,
          },
        },
      },
    });

    if (!planificacion) {
      throw new NotFoundException('Planificación no encontrada');
    }

    if (planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException('La planificación no está en borrador');
    }

    // Validar que todas las clases tengan teoría y práctica con contenido
    for (const clase of planificacion.clases) {
      if (!clase.teoria_id || !clase.practica_id) {
        throw new BadRequestException(
          `La clase ${clase.numero} no tiene teoría o práctica asignada`,
        );
      }

      // Verificar que los contenidos estén publicados o tengan nodos
      const [teoriaNodes, practicaNodes] = await Promise.all([
        this.prisma.nodoContenido.count({
          where: { contenidoId: clase.teoria_id },
        }),
        this.prisma.nodoContenido.count({
          where: { contenidoId: clase.practica_id },
        }),
      ]);

      if (teoriaNodes < 3) {
        throw new BadRequestException(
          `La teoría de la clase ${clase.numero} no tiene contenido`,
        );
      }

      if (practicaNodes < 3) {
        throw new BadRequestException(
          `La práctica de la clase ${clase.numero} no tiene contenido`,
        );
      }
    }

    // Publicar la planificación y todos sus contenidos
    await this.prisma.$transaction(async (tx) => {
      // Publicar planificación
      await tx.planificacion.update({
        where: { id },
        data: { estado: 'PUBLICADO' },
      });

      // Publicar todos los contenidos de teoría y práctica
      for (const clase of planificacion.clases) {
        await tx.contenido.updateMany({
          where: {
            id: { in: [clase.teoria_id, clase.practica_id] },
          },
          data: { estado: 'PUBLICADO' },
        });
      }
    });

    return this.obtenerPorId(id);
  }

  /**
   * Eliminar planificación (solo borradores)
   */
  async eliminar(id: string): Promise<{ success: boolean; mensaje: string }> {
    const planificacion = await this.prisma.planificacion.findUnique({
      where: { id },
      include: {
        clases: true,
        asignaciones: true,
      },
    });

    if (!planificacion) {
      throw new NotFoundException('Planificación no encontrada');
    }

    if (planificacion.estado !== 'BORRADOR') {
      throw new BadRequestException(
        'Solo se pueden eliminar planificaciones en borrador',
      );
    }

    if (planificacion.asignaciones.length > 0) {
      throw new BadRequestException(
        'No se puede eliminar una planificación con asignaciones activas',
      );
    }

    // Eliminar planificación (cascade eliminará clases y tareas)
    await this.prisma.planificacion.delete({
      where: { id },
    });

    return {
      success: true,
      mensaje: 'Planificación eliminada correctamente',
    };
  }

  /**
   * Mapear modelo Prisma a response
   */
  private mapToResponse(planificacion: {
    id: string;
    titulo: string;
    descripcion: string | null;
    cantidad_clases: number;
    casa_tipo: string;
    mundo_tipo: string;
    estado: string;
    created_at: Date;
    updated_at: Date;
    clases: Array<{
      id: string;
      numero: number;
      titulo: string;
      descripcion: string | null;
      teoria_id: string;
      practica_id: string;
      teoria?: { id: string; titulo: string; estado: string } | null;
      practica?: { id: string; titulo: string; estado: string } | null;
      tareas?: Array<{
        id: string;
        contenido_id: string;
        orden: number;
        obligatoria: boolean;
        contenido: { id: string; titulo: string };
      }>;
    }>;
  }): PlanificacionResponse {
    return {
      id: planificacion.id,
      titulo: planificacion.titulo,
      descripcion: planificacion.descripcion,
      cantidad_clases: planificacion.cantidad_clases,
      casa_tipo: planificacion.casa_tipo as 'QUANTUM' | 'VERTEX' | 'PULSAR',
      mundo_tipo: planificacion.mundo_tipo as
        | 'MATEMATICA'
        | 'PROGRAMACION'
        | 'CIENCIAS',
      estado: planificacion.estado as 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO',
      created_at: planificacion.created_at,
      updated_at: planificacion.updated_at,
      clases: planificacion.clases.map((c) => ({
        id: c.id,
        numero: c.numero,
        titulo: c.titulo,
        descripcion: c.descripcion,
        teoria_id: c.teoria_id,
        practica_id: c.practica_id,
        teoria: c.teoria
          ? {
              id: c.teoria.id,
              titulo: c.teoria.titulo,
              estado: c.teoria.estado as 'BORRADOR' | 'PUBLICADO' | 'ARCHIVADO',
            }
          : undefined,
        practica: c.practica
          ? {
              id: c.practica.id,
              titulo: c.practica.titulo,
              estado: c.practica.estado as
                | 'BORRADOR'
                | 'PUBLICADO'
                | 'ARCHIVADO',
            }
          : undefined,
        tareas: c.tareas?.map((t) => ({
          id: t.id,
          contenido_id: t.contenido_id,
          orden: t.orden,
          obligatoria: t.obligatoria,
          contenido: {
            id: t.contenido.id,
            titulo: t.contenido.titulo,
          },
        })),
      })),
    };
  }
}
