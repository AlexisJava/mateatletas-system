import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { CreateNotificacionDto } from './dto/create-notificacion.dto';
import { TipoNotificacion } from '@prisma/client';

@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Crear una notificación para un docente
   */
  async create(createNotificacionDto: CreateNotificacionDto) {
    return this.prisma.notificacion.create({
      data: {
        tipo: createNotificacionDto.tipo,
        titulo: createNotificacionDto.titulo,
        mensaje: createNotificacionDto.mensaje,
        docente_id: createNotificacionDto.docenteId,
        metadata: createNotificacionDto.metadata,
      },
    });
  }

  /**
   * Obtener todas las notificaciones de un docente con paginación
   * Ordenadas por fecha (más recientes primero)
   * @param docenteId - ID del docente
   * @param soloNoLeidas - Filtrar solo no leídas (default: false)
   * @param page - Número de página (default: 1)
   * @param limit - Registros por página (default: 20)
   */
  async findAll(
    docenteId: string,
    soloNoLeidas = false,
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      docente_id: docenteId,
      ...(soloNoLeidas && { leida: false }),
    };

    const [notificaciones, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.notificacion.count({ where }),
    ]);

    return {
      data: notificaciones,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Contar notificaciones no leídas de un docente
   */
  async countNoLeidas(docenteId: string): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        docente_id: docenteId,
        leida: false,
      },
    });
  }

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(id: string, docenteId: string) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { id, docente_id: docenteId },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notificacion.update({
      where: { id },
      data: { leida: true },
    });
  }

  /**
   * Marcar todas las notificaciones como leídas
   */
  async marcarTodasComoLeidas(docenteId: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        docente_id: docenteId,
        leida: false,
      },
      data: {
        leida: true,
      },
    });
  }

  /**
   * Eliminar una notificación
   */
  async remove(id: string, docenteId: string) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { id, docente_id: docenteId },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notificacion.delete({
      where: { id },
    });
  }

  /**
   * MÉTODOS AUXILIARES PARA CREAR NOTIFICACIONES AUTOMÁTICAS
   */

  /**
   * Crear notificación de clase próxima (24h antes)
   */
  async notificarClaseProxima(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
    fechaHora: Date,
  ) {
    return this.create({
      tipo: TipoNotificacion.ClaseProxima,
      titulo: 'Clase próxima',
      mensaje: `La clase "${claseTitulo}" comienza mañana a las ${fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      docenteId: docenteId,
      metadata: { clase_id: claseId },
    });
  }

  /**
   * Crear notificación de asistencia pendiente
   */
  async notificarAsistenciaPendiente(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
  ) {
    return this.create({
      tipo: TipoNotificacion.AsistenciaPendiente,
      titulo: 'Asistencia pendiente',
      mensaje: `Recuerda registrar la asistencia de la clase "${claseTitulo}"`,
      docenteId: docenteId,
      metadata: { clase_id: claseId },
    });
  }

  /**
   * Crear notificación de alerta de estudiante
   */
  async notificarEstudianteAlerta(
    docenteId: string,
    estudianteId: string,
    estudianteNombre: string,
    razon: string,
  ) {
    return this.create({
      tipo: TipoNotificacion.EstudianteAlerta,
      titulo: 'Alerta de estudiante',
      mensaje: `${estudianteNombre}: ${razon}`,
      docenteId: docenteId,
      metadata: { estudiante_id: estudianteId },
    });
  }

  /**
   * Crear notificación de clase cancelada
   */
  async notificarClaseCancelada(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
    motivo?: string,
  ) {
    return this.create({
      tipo: TipoNotificacion.ClaseCancelada,
      titulo: 'Clase cancelada',
      mensaje: `La clase "${claseTitulo}" ha sido cancelada${motivo ? ': ' + motivo : ''}`,
      docenteId: docenteId,
      metadata: { clase_id: claseId },
    });
  }

  /**
   * Crear notificación de logro de estudiante
   */
  async notificarLogroEstudiante(
    docenteId: string,
    estudianteId: string,
    estudianteNombre: string,
    logroTitulo: string,
  ) {
    return this.create({
      tipo: TipoNotificacion.LogroEstudiante,
      titulo: 'Logro desbloqueado',
      mensaje: `${estudianteNombre} ha desbloqueado: ${logroTitulo}`,
      docenteId: docenteId,
      metadata: { estudiante_id: estudianteId },
    });
  }
}
