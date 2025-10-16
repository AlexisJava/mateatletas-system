import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import {
  CreateTareaDto,
  CreateRecordatorioDto,
  CreateNotaDto,
} from './dto/create-evento.dto';
import {
  UpdateTareaDto,
  UpdateRecordatorioDto,
  UpdateNotaDto,
} from './dto/update-evento.dto';
import { TipoEvento, Prisma } from '@prisma/client';

/**
 * Servicio de Eventos - Sistema de Calendario Completo
 *
 * Gestiona el calendario de eventos del docente con arquitectura polimórfica:
 * - CLASE: Referencias a clases del sistema para reprogramación
 * - TAREA: Sistema robusto de tareas con subtareas, archivos, recurrencia
 * - RECORDATORIO: Recordatorios simples
 * - NOTA: Notas de texto largo
 *
 * Características:
 * - CRUD completo para cada tipo de evento
 * - Filtrado avanzado por fechas, tipo, categoría
 * - Sistema de búsqueda
 * - Gestión de subtareas y archivos (para TAREA)
 * - Drag & Drop support (actualización de fechas)
 * - Exportación (JSON, iCal compatible)
 */
@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  // ==================== CREAR EVENTOS ====================

  /**
   * Crear una Tarea completa
   */
  async createTarea(docenteId: string, dto: CreateTareaDto) {
    return this.prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: TipoEvento.TAREA,
        fecha_inicio: new Date(dto.fecha_inicio),
        fecha_fin: new Date(dto.fecha_fin),
        es_todo_el_dia: dto.es_todo_el_dia ?? false,
        docente_id: docenteId,
        clase_id: dto.clase_id,
        tarea: {
          create: {
            estado: dto.estado ?? 'PENDIENTE',
            prioridad: dto.prioridad ?? 'MEDIA',
            porcentaje_completado: dto.porcentaje_completado ?? 0,
            categoria: dto.categoria,
            etiquetas: dto.etiquetas ?? [],
            subtareas: (dto.subtareas ?? []) as unknown as Prisma.InputJsonValue,
            archivos: (dto.archivos ?? []) as unknown as Prisma.InputJsonValue,
            clase_relacionada_id: dto.clase_relacionada_id,
            estudiante_relacionado_id: dto.estudiante_relacionado_id,
            tiempo_estimado_minutos: dto.tiempo_estimado_minutos,
            tiempo_real_minutos: dto.tiempo_real_minutos,
            recurrencia: dto.recurrencia as unknown as Prisma.InputJsonValue,
            recordatorios: (dto.recordatorios ?? []) as unknown as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        tarea: true,
        clase: true,
      },
    });
  }

  /**
   * Crear un Recordatorio
   */
  async createRecordatorio(docenteId: string, dto: CreateRecordatorioDto) {
    return this.prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: TipoEvento.RECORDATORIO,
        fecha_inicio: new Date(dto.fecha_inicio),
        fecha_fin: new Date(dto.fecha_fin),
        es_todo_el_dia: dto.es_todo_el_dia ?? false,
        docente_id: docenteId,
        clase_id: dto.clase_id,
        recordatorio: {
          create: {
            completado: dto.completado ?? false,
            color: dto.color ?? '#6366f1',
          },
        },
      },
      include: {
        recordatorio: true,
        clase: true,
      },
    });
  }

  /**
   * Crear una Nota
   */
  async createNota(docenteId: string, dto: CreateNotaDto) {
    return this.prisma.evento.create({
      data: {
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: TipoEvento.NOTA,
        fecha_inicio: new Date(dto.fecha_inicio),
        fecha_fin: new Date(dto.fecha_fin),
        es_todo_el_dia: dto.es_todo_el_dia ?? false,
        docente_id: docenteId,
        clase_id: dto.clase_id,
        nota: {
          create: {
            contenido: dto.contenido,
            categoria: dto.categoria,
            color: dto.color ?? '#8b5cf6',
          },
        },
      },
      include: {
        nota: true,
        clase: true,
      },
    });
  }

  // ==================== LEER EVENTOS ====================

  /**
   * Obtener todos los eventos de un docente con filtros
   */
  async findAll(
    docenteId: string,
    options?: {
      fechaInicio?: Date;
      fechaFin?: Date;
      tipo?: TipoEvento;
      busqueda?: string;
    },
  ) {
    const where: Prisma.EventoWhereInput = {
      docente_id: docenteId,
    };

    // Filtro por rango de fechas
    if (options?.fechaInicio || options?.fechaFin) {
      where.fecha_inicio = {};
      if (options.fechaInicio) {
        where.fecha_inicio.gte = options.fechaInicio;
      }
      if (options.fechaFin) {
        where.fecha_inicio.lte = options.fechaFin;
      }
    }

    // Filtro por tipo
    if (options?.tipo) {
      where.tipo = options.tipo;
    }

    // Búsqueda por título o descripción
    if (options?.busqueda) {
      where.OR = [
        { titulo: { contains: options.busqueda, mode: 'insensitive' } },
        { descripcion: { contains: options.busqueda, mode: 'insensitive' } },
      ];
    }

    return this.prisma.evento.findMany({
      where,
      include: {
        tarea: true,
        recordatorio: true,
        nota: true,
        clase: {
          include: {
            rutaCurricular: true,
          },
        },
      },
      orderBy: { fecha_inicio: 'asc' },
    });
  }

  /**
   * Obtener un evento por ID
   */
  async findOne(id: string, docenteId: string) {
    const evento = await this.prisma.evento.findFirst({
      where: {
        id,
        docente_id: docenteId,
      },
      include: {
        tarea: true,
        recordatorio: true,
        nota: true,
        clase: {
          include: {
            rutaCurricular: true,
          },
        },
      },
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return evento;
  }

  /**
   * Obtener eventos de la Vista Agenda (próximos días agrupados)
   */
  async getVistaAgenda(docenteId: string) {
    const ahora = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hace7Dias.getDate() - 7);
    const enUnMes = new Date();
    enUnMes.setDate(enUnMes.getDate() + 30);

    const eventos = await this.findAll(docenteId, {
      fechaInicio: hace7Dias,
      fechaFin: enUnMes,
    });

    // Agrupar por días
    const grupos = {
      hoy: [] as any[],
      manana: [] as any[],
      proximos7Dias: [] as any[],
      masAdelante: [] as any[],
    };

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const en7Dias = new Date(hoy);
    en7Dias.setDate(en7Dias.getDate() + 7);

    eventos.forEach((evento) => {
      const fechaEvento = new Date(evento.fecha_inicio);
      fechaEvento.setHours(0, 0, 0, 0);

      if (fechaEvento.getTime() === hoy.getTime()) {
        grupos.hoy.push(evento);
      } else if (fechaEvento.getTime() === manana.getTime()) {
        grupos.manana.push(evento);
      } else if (fechaEvento <= en7Dias) {
        grupos.proximos7Dias.push(evento);
      } else {
        grupos.masAdelante.push(evento);
      }
    });

    return grupos;
  }

  /**
   * Obtener eventos de la Vista Semana (grid semanal)
   */
  async getVistaSemana(docenteId: string, fecha: Date) {
    // Calcular inicio de semana (lunes)
    const inicioSemana = new Date(fecha);
    const day = inicioSemana.getDay();
    const diff = inicioSemana.getDate() - day + (day === 0 ? -6 : 1);
    inicioSemana.setDate(diff);
    inicioSemana.setHours(0, 0, 0, 0);

    // Calcular fin de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return this.findAll(docenteId, {
      fechaInicio: inicioSemana,
      fechaFin: finSemana,
    });
  }

  // ==================== ACTUALIZAR EVENTOS ====================

  /**
   * Actualizar una Tarea
   */
  async updateTarea(id: string, docenteId: string, dto: UpdateTareaDto) {
    const evento = await this.findOne(id, docenteId);

    if (evento.tipo !== TipoEvento.TAREA) {
      throw new BadRequestException('El evento no es una tarea');
    }

    const updateData: any = {};

    // Actualizar campos del evento base
    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.fecha_inicio !== undefined)
      updateData.fecha_inicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin !== undefined)
      updateData.fecha_fin = new Date(dto.fecha_fin);
    if (dto.es_todo_el_dia !== undefined)
      updateData.es_todo_el_dia = dto.es_todo_el_dia;
    if (dto.clase_id !== undefined) updateData.clase_id = dto.clase_id;

    // Actualizar campos de la tarea
    const tareaUpdate: any = {};
    if (dto.estado !== undefined) tareaUpdate.estado = dto.estado;
    if (dto.prioridad !== undefined) tareaUpdate.prioridad = dto.prioridad;
    if (dto.porcentaje_completado !== undefined)
      tareaUpdate.porcentaje_completado = dto.porcentaje_completado;
    if (dto.categoria !== undefined) tareaUpdate.categoria = dto.categoria;
    if (dto.etiquetas !== undefined) tareaUpdate.etiquetas = dto.etiquetas;
    if (dto.subtareas !== undefined)
      tareaUpdate.subtareas = dto.subtareas as unknown as Prisma.InputJsonValue;
    if (dto.archivos !== undefined)
      tareaUpdate.archivos = dto.archivos as unknown as Prisma.InputJsonValue;
    if (dto.clase_relacionada_id !== undefined)
      tareaUpdate.clase_relacionada_id = dto.clase_relacionada_id;
    if (dto.estudiante_relacionado_id !== undefined)
      tareaUpdate.estudiante_relacionado_id = dto.estudiante_relacionado_id;
    if (dto.tiempo_estimado_minutos !== undefined)
      tareaUpdate.tiempo_estimado_minutos = dto.tiempo_estimado_minutos;
    if (dto.tiempo_real_minutos !== undefined)
      tareaUpdate.tiempo_real_minutos = dto.tiempo_real_minutos;
    if (dto.recurrencia !== undefined)
      tareaUpdate.recurrencia = dto.recurrencia as unknown as Prisma.InputJsonValue;
    if (dto.recordatorios !== undefined)
      tareaUpdate.recordatorios = dto.recordatorios as unknown as Prisma.InputJsonValue;

    // Marcar como completada si porcentaje es 100
    if (dto.porcentaje_completado === 100) {
      tareaUpdate.completedAt = new Date();
      tareaUpdate.estado = 'COMPLETADA';
    }

    if (Object.keys(tareaUpdate).length > 0) {
      updateData.tarea = {
        update: tareaUpdate,
      };
    }

    return this.prisma.evento.update({
      where: { id },
      data: updateData,
      include: {
        tarea: true,
        clase: true,
      },
    });
  }

  /**
   * Actualizar un Recordatorio
   */
  async updateRecordatorio(
    id: string,
    docenteId: string,
    dto: UpdateRecordatorioDto,
  ) {
    const evento = await this.findOne(id, docenteId);

    if (evento.tipo !== TipoEvento.RECORDATORIO) {
      throw new BadRequestException('El evento no es un recordatorio');
    }

    const updateData: any = {};

    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.fecha_inicio !== undefined)
      updateData.fecha_inicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin !== undefined)
      updateData.fecha_fin = new Date(dto.fecha_fin);
    if (dto.es_todo_el_dia !== undefined)
      updateData.es_todo_el_dia = dto.es_todo_el_dia;
    if (dto.clase_id !== undefined) updateData.clase_id = dto.clase_id;

    const recordatorioUpdate: any = {};
    if (dto.completado !== undefined)
      recordatorioUpdate.completado = dto.completado;
    if (dto.color !== undefined) recordatorioUpdate.color = dto.color;

    if (Object.keys(recordatorioUpdate).length > 0) {
      updateData.recordatorio = {
        update: recordatorioUpdate,
      };
    }

    return this.prisma.evento.update({
      where: { id },
      data: updateData,
      include: {
        recordatorio: true,
        clase: true,
      },
    });
  }

  /**
   * Actualizar una Nota
   */
  async updateNota(id: string, docenteId: string, dto: UpdateNotaDto) {
    const evento = await this.findOne(id, docenteId);

    if (evento.tipo !== TipoEvento.NOTA) {
      throw new BadRequestException('El evento no es una nota');
    }

    const updateData: any = {};

    if (dto.titulo !== undefined) updateData.titulo = dto.titulo;
    if (dto.descripcion !== undefined) updateData.descripcion = dto.descripcion;
    if (dto.fecha_inicio !== undefined)
      updateData.fecha_inicio = new Date(dto.fecha_inicio);
    if (dto.fecha_fin !== undefined)
      updateData.fecha_fin = new Date(dto.fecha_fin);
    if (dto.es_todo_el_dia !== undefined)
      updateData.es_todo_el_dia = dto.es_todo_el_dia;
    if (dto.clase_id !== undefined) updateData.clase_id = dto.clase_id;

    const notaUpdate: any = {};
    if (dto.contenido !== undefined) notaUpdate.contenido = dto.contenido;
    if (dto.categoria !== undefined) notaUpdate.categoria = dto.categoria;
    if (dto.color !== undefined) notaUpdate.color = dto.color;

    if (Object.keys(notaUpdate).length > 0) {
      updateData.nota = {
        update: notaUpdate,
      };
    }

    return this.prisma.evento.update({
      where: { id },
      data: updateData,
      include: {
        nota: true,
        clase: true,
      },
    });
  }

  /**
   * Actualizar fechas de un evento (para Drag & Drop)
   */
  async updateFechas(
    id: string,
    docenteId: string,
    fechaInicio: Date,
    fechaFin: Date,
  ) {
    await this.findOne(id, docenteId);

    return this.prisma.evento.update({
      where: { id },
      data: {
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
      },
      include: {
        tarea: true,
        recordatorio: true,
        nota: true,
      },
    });
  }

  // ==================== ELIMINAR EVENTOS ====================

  /**
   * Eliminar un evento
   */
  async remove(id: string, docenteId: string) {
    await this.findOne(id, docenteId);

    return this.prisma.evento.delete({
      where: { id },
    });
  }

  // ==================== ESTADÍSTICAS Y REPORTES ====================

  /**
   * Obtener estadísticas del calendario
   */
  async getEstadisticas(docenteId: string) {
    const [totalTareas, totalRecordatorios, totalNotas, tareasPendientes, tareasCompletadas] =
      await Promise.all([
        this.prisma.evento.count({
          where: { docente_id: docenteId, tipo: TipoEvento.TAREA },
        }),
        this.prisma.evento.count({
          where: { docente_id: docenteId, tipo: TipoEvento.RECORDATORIO },
        }),
        this.prisma.evento.count({
          where: { docente_id: docenteId, tipo: TipoEvento.NOTA },
        }),
        this.prisma.tarea.count({
          where: {
            evento: { docente_id: docenteId },
            estado: 'PENDIENTE',
          },
        }),
        this.prisma.tarea.count({
          where: {
            evento: { docente_id: docenteId },
            estado: 'COMPLETADA',
          },
        }),
      ]);

    return {
      totalTareas,
      totalRecordatorios,
      totalNotas,
      tareasPendientes,
      tareasCompletadas,
      total: totalTareas + totalRecordatorios + totalNotas,
    };
  }
}
