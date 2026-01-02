import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { EstadoTarea, PrioridadTarea, TareaAdmin } from '@prisma/client';

/** DTO para crear una tarea */
export interface CreateTareaDto {
  title: string;
  description?: string;
  priority?: PrioridadTarea;
  dueDate?: Date | string;
  assignee?: string;
}

/** DTO para actualizar una tarea */
export interface UpdateTareaDto {
  title?: string;
  description?: string;
  priority?: PrioridadTarea;
  status?: EstadoTarea;
  dueDate?: Date | string | null;
  assignee?: string | null;
}

/**
 * Servicio para gestionar tareas administrativas del dashboard
 */
@Injectable()
export class AdminTareasService {
  constructor(private prisma: PrismaService) {}

  /**
   * Listar todas las tareas (ordenadas por prioridad y fecha)
   */
  async listarTareas(): Promise<TareaAdmin[]> {
    return this.prisma.tareaAdmin.findMany({
      orderBy: [
        { status: 'asc' }, // PENDIENTE primero
        { priority: 'desc' }, // URGENTE/ALTA primero
        { dueDate: 'asc' }, // Más próximas primero
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Obtener una tarea por ID
   */
  async obtenerTarea(id: string): Promise<TareaAdmin | null> {
    return this.prisma.tareaAdmin.findUnique({
      where: { id },
    });
  }

  /**
   * Crear una nueva tarea
   */
  async crearTarea(data: CreateTareaDto): Promise<TareaAdmin> {
    return this.prisma.tareaAdmin.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority ?? PrioridadTarea.MEDIA,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignee: data.assignee,
      },
    });
  }

  /**
   * Actualizar una tarea existente
   */
  async actualizarTarea(id: string, data: UpdateTareaDto): Promise<TareaAdmin> {
    return this.prisma.tareaAdmin.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.priority !== undefined && { priority: data.priority }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.dueDate !== undefined && {
          dueDate: data.dueDate ? new Date(data.dueDate) : null,
        }),
        ...(data.assignee !== undefined && { assignee: data.assignee }),
      },
    });
  }

  /**
   * Toggle estado de tarea (PENDIENTE <-> COMPLETADA)
   */
  async toggleTarea(id: string): Promise<TareaAdmin> {
    const tarea = await this.prisma.tareaAdmin.findUniqueOrThrow({
      where: { id },
    });

    const nuevoEstado =
      tarea.status === EstadoTarea.COMPLETADA
        ? EstadoTarea.PENDIENTE
        : EstadoTarea.COMPLETADA;

    return this.prisma.tareaAdmin.update({
      where: { id },
      data: { status: nuevoEstado },
    });
  }

  /**
   * Eliminar una tarea
   */
  async eliminarTarea(id: string): Promise<void> {
    await this.prisma.tareaAdmin.delete({
      where: { id },
    });
  }
}
