import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { TipoEvento } from '@prisma/client';

/**
 * Servicio de Eventos
 *
 * Gestiona el calendario de eventos del docente:
 * - Recordatorios personales
 * - Reuniones
 * - Tareas pendientes
 * - Cumpleaños de estudiantes
 * - Eventos generales
 *
 * Características:
 * - CRUD completo de eventos
 * - Filtrado por rango de fechas (para vista de calendario)
 * - Eventos de todo el día
 * - Sistema de recordatorios con minutos de anticipación
 * - Colores personalizables
 */
@Injectable()
export class EventosService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear un nuevo evento
   */
  async create(docenteId: string, createEventoDto: CreateEventoDto) {
    return this.prisma.evento.create({
      data: {
        ...createEventoDto,
        docente_id: docenteId,
      },
    });
  }

  /**
   * Obtener todos los eventos de un docente
   * Con filtros opcionales por rango de fechas
   */
  async findAll(
    docenteId: string,
    fechaInicio?: Date,
    fechaFin?: Date,
  ) {
    const where: any = { docente_id: docenteId };

    // Si se especifica rango de fechas, filtrar
    if (fechaInicio || fechaFin) {
      where.fecha_inicio = {};
      if (fechaInicio) {
        where.fecha_inicio.gte = fechaInicio;
      }
      if (fechaFin) {
        where.fecha_inicio.lte = fechaFin;
      }
    }

    return this.prisma.evento.findMany({
      where,
      orderBy: { fecha_inicio: 'asc' },
    });
  }

  /**
   * Obtener eventos del mes actual
   * Útil para la vista mensual del calendario
   */
  async findEventosDelMes(docenteId: string, year: number, month: number) {
    // Calcular primer y último día del mes
    const primerDia = new Date(year, month - 1, 1);
    const ultimoDia = new Date(year, month, 0, 23, 59, 59);

    return this.findAll(docenteId, primerDia, ultimoDia);
  }

  /**
   * Obtener eventos de la semana actual
   * Útil para la vista semanal del calendario
   */
  async findEventosDeLaSemana(docenteId: string, fecha: Date) {
    // Calcular inicio de semana (lunes)
    const inicioSemana = new Date(fecha);
    inicioSemana.setDate(fecha.getDate() - fecha.getDay() + 1);
    inicioSemana.setHours(0, 0, 0, 0);

    // Calcular fin de semana (domingo)
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    finSemana.setHours(23, 59, 59, 999);

    return this.findAll(docenteId, inicioSemana, finSemana);
  }

  /**
   * Obtener eventos del día
   * Útil para la vista diaria y notificaciones
   */
  async findEventosDelDia(docenteId: string, fecha: Date) {
    const inicioDia = new Date(fecha);
    inicioDia.setHours(0, 0, 0, 0);

    const finDia = new Date(fecha);
    finDia.setHours(23, 59, 59, 999);

    return this.findAll(docenteId, inicioDia, finDia);
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
    });

    if (!evento) {
      throw new NotFoundException('Evento no encontrado');
    }

    return evento;
  }

  /**
   * Actualizar un evento
   */
  async update(id: string, docenteId: string, updateEventoDto: UpdateEventoDto) {
    // Verificar que el evento existe y pertenece al docente
    await this.findOne(id, docenteId);

    return this.prisma.evento.update({
      where: { id },
      data: updateEventoDto,
    });
  }

  /**
   * Eliminar un evento
   */
  async remove(id: string, docenteId: string) {
    // Verificar que el evento existe y pertenece al docente
    await this.findOne(id, docenteId);

    return this.prisma.evento.delete({
      where: { id },
    });
  }

  /**
   * Obtener eventos próximos con recordatorio
   * Para enviar notificaciones automáticas
   */
  async findEventosConRecordatorioProximo(docenteId: string) {
    const ahora = new Date();
    const dentroDe2Horas = new Date(ahora.getTime() + 2 * 60 * 60 * 1000);

    return this.prisma.evento.findMany({
      where: {
        docente_id: docenteId,
        recordatorio: true,
        fecha_inicio: {
          gte: ahora,
          lte: dentroDe2Horas,
        },
      },
      orderBy: { fecha_inicio: 'asc' },
    });
  }

  /**
   * Contar eventos del docente
   * Por tipo (opcional)
   */
  async countEventos(docenteId: string, tipo?: TipoEvento): Promise<number> {
    return this.prisma.evento.count({
      where: {
        docente_id: docenteId,
        ...(tipo && { tipo }),
      },
    });
  }

  /**
   * Obtener estadísticas de eventos
   */
  async getEstadisticas(docenteId: string) {
    const [total, recordatorios, reuniones, tareas, cumpleaños] =
      await Promise.all([
        this.countEventos(docenteId),
        this.countEventos(docenteId, TipoEvento.Recordatorio),
        this.countEventos(docenteId, TipoEvento.Reunion),
        this.countEventos(docenteId, TipoEvento.TareaPendiente),
        this.countEventos(docenteId, TipoEvento.Cumpleaños),
      ]);

    return {
      total,
      recordatorios,
      reuniones,
      tareas,
      cumpleaños,
    };
  }
}
