import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import {
  CreateNotificacionDto,
  CreateNotificacionInternaDto,
  TipoDestinatario,
} from './dto/create-notificacion.dto';
import { TipoNotificacion, PrioridadNotificacion } from '@prisma/client';

/**
 * Service polimórfico para gestionar notificaciones
 * Soporta: Tutores, Estudiantes, Docentes y Admins
 */
@Injectable()
export class NotificacionesService {
  constructor(private prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS CRUD GENÉRICOS
  // ═══════════════════════════════════════════════════════════════

  /**
   * Crear una notificación (genérico)
   * Valida que exactamente un destinatario esté presente
   */
  async create(dto: CreateNotificacionDto) {
    this.validarDestinatarioUnico(dto);

    return this.prisma.notificacion.create({
      data: {
        tipo: dto.tipo,
        titulo: dto.titulo,
        mensaje: dto.mensaje,
        prioridad: dto.prioridad ?? PrioridadNotificacion.MEDIA,
        tutor_id: dto.tutorId,
        estudiante_id: dto.estudianteId,
        docente_id: dto.docenteId,
        admin_id: dto.adminId,
        metadata: dto.metadata,
        expiraEn: dto.expiraEn,
      },
    });
  }

  /**
   * Obtener notificaciones con paginación
   * @param tipo - Tipo de destinatario
   * @param destinatarioId - ID del destinatario
   * @param soloNoLeidas - Filtrar solo no leídas
   * @param page - Página (default: 1)
   * @param limit - Límite por página (default: 20)
   */
  async findAll(
    tipo: TipoDestinatario,
    destinatarioId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
  ) {
    const skip = (page - 1) * limit;
    const where = {
      ...this.buildWhereClause(tipo, destinatarioId),
      ...(soloNoLeidas && { leida: false }),
    };

    const [notificaciones, total] = await Promise.all([
      this.prisma.notificacion.findMany({
        where,
        orderBy: [{ prioridad: 'desc' }, { createdAt: 'desc' }],
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
   * Contar notificaciones no leídas
   */
  async countNoLeidas(
    tipo: TipoDestinatario,
    destinatarioId: string,
  ): Promise<number> {
    return this.prisma.notificacion.count({
      where: {
        ...this.buildWhereClause(tipo, destinatarioId),
        leida: false,
      },
    });
  }

  /**
   * Marcar una notificación como leída
   */
  async marcarComoLeida(
    id: string,
    tipo: TipoDestinatario,
    destinatarioId: string,
  ) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { id, ...this.buildWhereClause(tipo, destinatarioId) },
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
  async marcarTodasComoLeidas(tipo: TipoDestinatario, destinatarioId: string) {
    return this.prisma.notificacion.updateMany({
      where: {
        ...this.buildWhereClause(tipo, destinatarioId),
        leida: false,
      },
      data: { leida: true },
    });
  }

  /**
   * Eliminar una notificación
   */
  async remove(id: string, tipo: TipoDestinatario, destinatarioId: string) {
    const notificacion = await this.prisma.notificacion.findFirst({
      where: { id, ...this.buildWhereClause(tipo, destinatarioId) },
    });

    if (!notificacion) {
      throw new NotFoundException('Notificación no encontrada');
    }

    return this.prisma.notificacion.delete({ where: { id } });
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS ESPECÍFICOS POR ENTIDAD (Facade para servicios externos)
  // ═══════════════════════════════════════════════════════════════

  // --- TUTORES ---

  async createParaTutor(tutorId: string, dto: CreateNotificacionInternaDto) {
    return this.create({ ...dto, tutorId });
  }

  async findAllTutor(
    tutorId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
  ) {
    return this.findAll('tutor', tutorId, soloNoLeidas, page, limit);
  }

  async countNoLeidasTutor(tutorId: string): Promise<number> {
    return this.countNoLeidas('tutor', tutorId);
  }

  // --- ESTUDIANTES ---

  async createParaEstudiante(
    estudianteId: string,
    dto: CreateNotificacionInternaDto,
  ) {
    return this.create({ ...dto, estudianteId });
  }

  async findAllEstudiante(
    estudianteId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
  ) {
    return this.findAll('estudiante', estudianteId, soloNoLeidas, page, limit);
  }

  async countNoLeidasEstudiante(estudianteId: string): Promise<number> {
    return this.countNoLeidas('estudiante', estudianteId);
  }

  // --- DOCENTES ---

  async createParaDocente(
    docenteId: string,
    dto: CreateNotificacionInternaDto,
  ) {
    return this.create({ ...dto, docenteId });
  }

  async findAllDocente(
    docenteId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
  ) {
    return this.findAll('docente', docenteId, soloNoLeidas, page, limit);
  }

  async countNoLeidasDocente(docenteId: string): Promise<number> {
    return this.countNoLeidas('docente', docenteId);
  }

  // --- ADMINS ---

  async createParaAdmin(adminId: string, dto: CreateNotificacionInternaDto) {
    return this.create({ ...dto, adminId });
  }

  async findAllAdmin(
    adminId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
  ) {
    return this.findAll('admin', adminId, soloNoLeidas, page, limit);
  }

  async countNoLeidasAdmin(adminId: string): Promise<number> {
    return this.countNoLeidas('admin', adminId);
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE NOTIFICACIÓN AUTOMÁTICA (DOCENTES - Legacy compatible)
  // ═══════════════════════════════════════════════════════════════

  async notificarClaseProxima(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
    fechaHora: Date,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_CLASE_PROXIMA,
      titulo: 'Clase próxima',
      mensaje: `La clase "${claseTitulo}" comienza mañana a las ${fechaHora.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
      metadata: { clase_id: claseId },
    });
  }

  async notificarAsistenciaPendiente(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_ASISTENCIA_PENDIENTE,
      titulo: 'Asistencia pendiente',
      mensaje: `Recuerda registrar la asistencia de la clase "${claseTitulo}"`,
      metadata: { clase_id: claseId },
    });
  }

  async notificarEstudianteAlerta(
    docenteId: string,
    estudianteId: string,
    estudianteNombre: string,
    razon: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_ESTUDIANTE_ALERTA,
      titulo: 'Alerta de estudiante',
      mensaje: `${estudianteNombre}: ${razon}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { estudiante_id: estudianteId },
    });
  }

  async notificarClaseCancelada(
    docenteId: string,
    claseId: string,
    claseTitulo: string,
    motivo?: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_CLASE_CANCELADA,
      titulo: 'Clase cancelada',
      mensaje: `La clase "${claseTitulo}" ha sido cancelada${motivo ? ': ' + motivo : ''}`,
      metadata: { clase_id: claseId },
    });
  }

  async notificarLogroEstudiante(
    docenteId: string,
    estudianteId: string,
    estudianteNombre: string,
    logroTitulo: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_LOGRO_ESTUDIANTE,
      titulo: 'Logro desbloqueado',
      mensaje: `${estudianteNombre} ha desbloqueado: ${logroTitulo}`,
      metadata: { estudiante_id: estudianteId },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE NOTIFICACIÓN AUTOMÁTICA (TUTORES)
  // ═══════════════════════════════════════════════════════════════

  async notificarPagoExitoso(
    tutorId: string,
    monto: number,
    descripcion: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
      titulo: 'Pago procesado',
      mensaje: `Tu pago de $${monto.toLocaleString('es-AR')} por "${descripcion}" fue procesado correctamente.`,
      metadata: { monto },
    });
  }

  async notificarPagoFallido(tutorId: string, monto: number, razon: string) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_PAGO_FALLIDO,
      titulo: 'Pago fallido',
      mensaje: `No pudimos procesar tu pago de $${monto.toLocaleString('es-AR')}: ${razon}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { monto, razon },
    });
  }

  async notificarSuscripcionProximaVencer(
    tutorId: string,
    diasRestantes: number,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PROXIMA_VENCER,
      titulo: 'Suscripción próxima a vencer',
      mensaje: `Tu suscripción vence en ${diasRestantes} día${diasRestantes > 1 ? 's' : ''}. Renovála para mantener el acceso.`,
      prioridad:
        diasRestantes <= 3
          ? PrioridadNotificacion.ALTA
          : PrioridadNotificacion.MEDIA,
      metadata: { dias_restantes: diasRestantes },
    });
  }

  async notificarLogroHijo(
    tutorId: string,
    hijoNombre: string,
    hijoId: string,
    logroTitulo: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_LOGRO_HIJO,
      titulo: `${hijoNombre} desbloqueó un logro`,
      mensaje: `${hijoNombre} ha desbloqueado: "${logroTitulo}"`,
      metadata: { estudiante_id: hijoId, logro_titulo: logroTitulo },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE NOTIFICACIÓN AUTOMÁTICA (ESTUDIANTES)
  // ═══════════════════════════════════════════════════════════════

  async notificarLogroDesbloqueado(
    estudianteId: string,
    logroTitulo: string,
    xpGanado: number,
  ) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_LOGRO_DESBLOQUEADO,
      titulo: '¡Logro desbloqueado!',
      mensaje: `Desbloqueaste "${logroTitulo}" y ganaste ${xpGanado} XP`,
      metadata: { logro_titulo: logroTitulo, xp_ganado: xpGanado },
    });
  }

  async notificarNivelSubido(estudianteId: string, nuevoNivel: number) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_NIVEL_SUBIDO,
      titulo: '¡Subiste de nivel!',
      mensaje: `¡Felicitaciones! Ahora sos nivel ${nuevoNivel}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { nuevo_nivel: nuevoNivel },
    });
  }

  async notificarRachaEnRiesgo(estudianteId: string, rachaActual: number) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_RACHA_EN_RIESGO,
      titulo: '¡Tu racha está en riesgo!',
      mensaje: `Entrá hoy para mantener tu racha de ${rachaActual} día${rachaActual > 1 ? 's' : ''}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { racha_actual: rachaActual },
    });
  }

  async notificarBienvenida(estudianteId: string, nombre: string) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_BIENVENIDA,
      titulo: `¡Bienvenido/a ${nombre}!`,
      mensaje: 'Completá tu primera lección para ganar XP y empezar tu racha',
      metadata: { nombre },
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // MÉTODOS DE NOTIFICACIÓN AUTOMÁTICA (ADMINS)
  // ═══════════════════════════════════════════════════════════════

  async notificarNuevoPago(
    adminId: string,
    tutorNombre: string,
    monto: number,
  ) {
    return this.createParaAdmin(adminId, {
      tipo: TipoNotificacion.ADMIN_NUEVO_PAGO,
      titulo: 'Nuevo pago recibido',
      mensaje: `${tutorNombre} realizó un pago de $${monto.toLocaleString('es-AR')}`,
      metadata: { tutor_nombre: tutorNombre, monto },
    });
  }

  async notificarAlertaSistema(
    adminId: string,
    titulo: string,
    descripcion: string,
  ) {
    return this.createParaAdmin(adminId, {
      tipo: TipoNotificacion.ADMIN_ALERTA_SISTEMA,
      titulo,
      mensaje: descripcion,
      prioridad: PrioridadNotificacion.CRITICA,
    });
  }

  // ═══════════════════════════════════════════════════════════════
  // UTILIDADES Y MANTENIMIENTO
  // ═══════════════════════════════════════════════════════════════

  /**
   * Eliminar notificaciones expiradas
   * Ejecutar periódicamente via cron
   */
  async limpiarExpiradas(): Promise<number> {
    const result = await this.prisma.notificacion.deleteMany({
      where: {
        expiraEn: { lt: new Date() },
      },
    });
    return result.count;
  }

  // ═══════════════════════════════════════════════════════════════
  // HELPERS PRIVADOS
  // ═══════════════════════════════════════════════════════════════

  private buildWhereClause(tipo: TipoDestinatario, id: string) {
    switch (tipo) {
      case 'tutor':
        return { tutor_id: id };
      case 'estudiante':
        return { estudiante_id: id };
      case 'docente':
        return { docente_id: id };
      case 'admin':
        return { admin_id: id };
    }
  }

  private validarDestinatarioUnico(dto: CreateNotificacionDto): void {
    const destinatarios = [
      dto.tutorId,
      dto.estudianteId,
      dto.docenteId,
      dto.adminId,
    ].filter(Boolean);

    if (destinatarios.length === 0) {
      throw new BadRequestException(
        'Debe especificar exactamente un destinatario (tutorId, estudianteId, docenteId o adminId)',
      );
    }

    if (destinatarios.length > 1) {
      throw new BadRequestException(
        'Solo puede especificar un destinatario por notificación',
      );
    }
  }
}
