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
        tutorId: dto.tutorId,
        estudianteId: dto.estudianteId,
        docenteId: dto.docenteId,
        adminId: dto.adminId,
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
   * @param tipoNotificacion - Filtrar por tipo de notificación
   * @param busqueda - Buscar en título y mensaje
   */
  async findAll(
    tipo: TipoDestinatario,
    destinatarioId: string,
    soloNoLeidas = false,
    page = 1,
    limit = 20,
    tipoNotificacion?: string,
    busqueda?: string,
  ) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {
      ...this.buildWhereClause(tipo, destinatarioId),
      ...(soloNoLeidas && { leida: false }),
      ...(tipoNotificacion && { tipo: tipoNotificacion as TipoNotificacion }),
      ...(busqueda && {
        OR: [
          { titulo: { contains: busqueda, mode: 'insensitive' } },
          { mensaje: { contains: busqueda, mode: 'insensitive' } },
        ],
      }),
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
    tipoNotificacion?: string,
    busqueda?: string,
  ) {
    return this.findAll(
      'docente',
      docenteId,
      soloNoLeidas,
      page,
      limit,
      tipoNotificacion,
      busqueda,
    );
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
      metadata: { claseId: claseId },
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
      metadata: { claseId: claseId },
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
      metadata: { estudianteId: estudianteId },
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
      metadata: { claseId: claseId },
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
      metadata: { estudianteId: estudianteId },
    });
  }

  /**
   * Notificar al docente que fue asignado a un nuevo ClaseGrupo/horario
   */
  async notificarClaseAsignada(
    docenteId: string,
    claseGrupoId: string,
    claseGrupoNombre: string,
    diaSemana: string,
    horaInicio: string,
    horaFin: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_CLASE_ASIGNADA,
      titulo: 'Nueva clase asignada',
      mensaje: `Te asignaron el horario "${claseGrupoNombre}" - ${diaSemana} de ${horaInicio} a ${horaFin}`,
      metadata: {
        claseGrupoId: claseGrupoId,
        diaSemana: diaSemana,
        horaInicio: horaInicio,
        horaFin: horaFin,
      },
    });
  }

  /**
   * Notificar al docente que fue asignado a una comisión de producto
   * Sprint A - Admin → Docente
   */
  async notificarComisionAsignada(
    docenteId: string,
    comisionId: string,
    comisionNombre: string,
    productoNombre: string,
    horario?: string,
  ) {
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_COMISION_ASIGNADA,
      titulo: 'Nueva comisión asignada',
      mensaje: `Te asignaron la comisión "${comisionNombre}" de ${productoNombre}${horario ? ` (${horario})` : ''}`,
      metadata: {
        comisionId: comisionId,
        comisionNombre: comisionNombre,
        productoNombre: productoNombre,
        ...(horario && { horario }),
      },
    });
  }

  /**
   * Notificar al docente que fue asignado estratégicamente a Casa o Mundo
   * Sprint A - Admin → Docente
   */
  async notificarAsignacionEstrategica(
    docenteId: string,
    tipoAsignacion: 'CASA' | 'MUNDO',
    nombre: string,
  ) {
    const tipoPretty = tipoAsignacion === 'CASA' ? 'Casa' : 'Mundo';
    return this.createParaDocente(docenteId, {
      tipo: TipoNotificacion.DOCENTE_ASIGNACION_ESTRATEGICA,
      titulo: `${tipoPretty} asignada`,
      mensaje: `Te asignaron a ${tipoPretty} ${nombre}. Podés ver tus estudiantes en el portal.`,
      metadata: {
        tipoAsignacion: tipoAsignacion,
        nombre: nombre,
      },
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
      metadata: { diasRestantes: diasRestantes },
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
      metadata: { estudianteId: hijoId, logroTitulo: logroTitulo },
    });
  }

  /**
   * Notificar pago manual registrado por admin
   * Sprint A - Admin → Tutor
   */
  async notificarPagoManualRegistrado(
    tutorId: string,
    monto: number,
    concepto: string,
    registradoPor: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_PAGO_EXITOSO,
      titulo: 'Pago registrado',
      mensaje: `Se registró un pago de $${monto.toLocaleString('es-AR')} por "${concepto}"`,
      metadata: { monto, concepto, registradoPor, esPagoManual: true },
    });
  }

  /**
   * Notificar beca asignada a estudiante
   * Sprint A - Admin → Tutor
   */
  async notificarBecaAsignada(
    tutorId: string,
    estudianteNombre: string,
    estudianteId: string,
    tipoBeca: string,
    porcentajeDescuento: number,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_BECA_ASIGNADA,
      titulo: 'Beca asignada',
      mensaje: `${estudianteNombre} recibió una beca "${tipoBeca}" con ${porcentajeDescuento}% de descuento`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        estudianteId: estudianteId,
        tipoBeca: tipoBeca,
        porcentajeDescuento: porcentajeDescuento,
      },
    });
  }

  /**
   * Notificar cambio de tier de suscripción
   * Sprint A - Admin → Tutor
   */
  async notificarCambioTier(
    tutorId: string,
    tierAnterior: string,
    tierNuevo: string,
    razon?: string,
  ) {
    const esUpgrade = this.esTierSuperior(tierNuevo, tierAnterior);
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_CAMBIO_TIER,
      titulo: esUpgrade ? 'Plan mejorado' : 'Cambio de plan',
      mensaje: `Tu plan cambió de ${tierAnterior} a ${tierNuevo}${razon ? `. Motivo: ${razon}` : ''}`,
      prioridad: esUpgrade
        ? PrioridadNotificacion.MEDIA
        : PrioridadNotificacion.ALTA,
      metadata: {
        tierAnterior: tierAnterior,
        tierNuevo: tierNuevo,
        esUpgrade: esUpgrade,
        ...(razon && { razon }),
      },
    });
  }

  /**
   * Notificar suscripción reactivada
   * Sprint A - Admin → Tutor
   */
  async notificarSuscripcionReactivada(tutorId: string, planNombre: string) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_REACTIVADA,
      titulo: 'Suscripción reactivada',
      mensaje: `Tu suscripción "${planNombre}" fue reactivada. Ya podés acceder a todos los beneficios.`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { planNombre: planNombre },
    });
  }

  /**
   * Notificar suscripción pausada
   * Sprint A - Admin → Tutor
   */
  async notificarSuscripcionPausadaATutor(
    tutorId: string,
    planNombre: string,
    motivo?: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_SUSCRIPCION_PAUSADA,
      titulo: 'Suscripción pausada',
      mensaje: `Tu suscripción "${planNombre}" fue pausada${motivo ? `. Motivo: ${motivo}` : ''}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { planNombre: planNombre, ...(motivo && { motivo }) },
    });
  }

  /**
   * Notificar al tutor que se asignó tarea al hijo
   * Sprint A - Docente → Tutor
   */
  async notificarTareaAsignadaATutor(
    tutorId: string,
    estudianteNombre: string,
    estudianteId: string,
    tareaTitulo: string,
    tareaId: string,
    fechaVencimiento?: Date,
  ) {
    const fechaStr = fechaVencimiento
      ? ` para el ${fechaVencimiento.toLocaleDateString('es-AR')}`
      : '';
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_TAREA_ASIGNADA_HIJO,
      titulo: 'Nueva tarea asignada',
      mensaje: `${estudianteNombre} tiene una nueva tarea: "${tareaTitulo}"${fechaStr}`,
      metadata: {
        estudianteId: estudianteId,
        tareaId: tareaId,
        tareaTitulo: tareaTitulo,
        ...(fechaVencimiento && {
          fechaVencimiento: fechaVencimiento.toISOString(),
        }),
      },
    });
  }

  /**
   * Notificar al tutor que se canceló clase de su hijo
   * Sprint A - Docente → Tutor
   */
  async notificarClaseCanceladaATutor(
    tutorId: string,
    estudianteNombre: string,
    estudianteId: string,
    claseNombre: string,
    claseId: string,
    fechaOriginal: Date,
    motivo?: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_CLASE_CANCELADA_HIJO,
      titulo: 'Clase cancelada',
      mensaje: `La clase "${claseNombre}" de ${estudianteNombre} del ${fechaOriginal.toLocaleDateString('es-AR')} fue cancelada${motivo ? `: ${motivo}` : ''}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        estudianteId: estudianteId,
        claseId: claseId,
        claseNombre: claseNombre,
        fechaOriginal: fechaOriginal.toISOString(),
        ...(motivo && { motivo }),
      },
    });
  }

  /**
   * Notificar al tutor una observación urgente del docente
   * Sprint A - Docente → Tutor
   */
  async notificarObservacionUrgente(
    tutorId: string,
    estudianteNombre: string,
    estudianteId: string,
    docenteNombre: string,
    observacion: string,
    observacionId: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_MENSAJE_DOCENTE,
      titulo: `Mensaje de ${docenteNombre}`,
      mensaje: `Sobre ${estudianteNombre}: ${observacion.substring(0, 100)}${observacion.length > 100 ? '...' : ''}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        estudianteId: estudianteId,
        docenteNombre: docenteNombre,
        observacionId: observacionId,
        observacionCompleta: observacion,
      },
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
      metadata: { logroTitulo: logroTitulo, xpGanado: xpGanado },
    });
  }

  async notificarNivelSubido(estudianteId: string, nuevoNivel: number) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_NIVEL_SUBIDO,
      titulo: '¡Subiste de nivel!',
      mensaje: `¡Felicitaciones! Ahora sos nivel ${nuevoNivel}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { nuevoNivel: nuevoNivel },
    });
  }

  async notificarRachaEnRiesgo(estudianteId: string, rachaActual: number) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_RACHA_EN_RIESGO,
      titulo: '¡Tu racha está en riesgo!',
      mensaje: `Entrá hoy para mantener tu racha de ${rachaActual} día${rachaActual > 1 ? 's' : ''}`,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: { rachaActual: rachaActual },
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
      metadata: { tutorNombre: tutorNombre, monto },
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
  // MÉTODOS DE NOTIFICACIÓN AUTOMÁTICA (ANUNCIOS)
  // ═══════════════════════════════════════════════════════════════

  /**
   * Notificar al tutor un anuncio importante del docente
   * Sprint C - Docente → Tutor
   */
  async notificarAnuncioImportanteATutor(
    tutorId: string,
    docenteNombre: string,
    anuncioId: string,
    anuncioTitulo: string,
    comisionId?: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_ANUNCIO_IMPORTANTE,
      titulo: `📢 Anuncio de ${docenteNombre}`,
      mensaje: anuncioTitulo,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        anuncioId,
        docenteNombre,
        ...(comisionId && { comisionId }),
      },
    });
  }

  /**
   * Notificar al tutor un anuncio urgente del docente
   * Sprint C - Docente → Tutor
   */
  async notificarAnuncioUrgenteATutor(
    tutorId: string,
    docenteNombre: string,
    anuncioId: string,
    anuncioTitulo: string,
    comisionId?: string,
  ) {
    return this.createParaTutor(tutorId, {
      tipo: TipoNotificacion.TUTOR_ANUNCIO_URGENTE,
      titulo: `🚨 URGENTE de ${docenteNombre}`,
      mensaje: anuncioTitulo,
      prioridad: PrioridadNotificacion.CRITICA,
      metadata: {
        anuncioId,
        docenteNombre,
        ...(comisionId && { comisionId }),
      },
    });
  }

  /**
   * Notificar al estudiante un anuncio importante
   * Sprint C - Docente → Estudiante
   */
  async notificarAnuncioImportanteAEstudiante(
    estudianteId: string,
    docenteNombre: string,
    anuncioId: string,
    anuncioTitulo: string,
    comisionId?: string,
  ) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_ANUNCIO_IMPORTANTE,
      titulo: '📢 Nuevo anuncio',
      mensaje: anuncioTitulo,
      prioridad: PrioridadNotificacion.ALTA,
      metadata: {
        anuncioId,
        docenteNombre,
        ...(comisionId && { comisionId }),
      },
    });
  }

  /**
   * Notificar al estudiante un anuncio urgente
   * Sprint C - Docente → Estudiante
   */
  async notificarAnuncioUrgenteAEstudiante(
    estudianteId: string,
    docenteNombre: string,
    anuncioId: string,
    anuncioTitulo: string,
    comisionId?: string,
  ) {
    return this.createParaEstudiante(estudianteId, {
      tipo: TipoNotificacion.ESTUDIANTE_ANUNCIO_URGENTE,
      titulo: '🚨 Anuncio URGENTE',
      mensaje: anuncioTitulo,
      prioridad: PrioridadNotificacion.CRITICA,
      metadata: {
        anuncioId,
        docenteNombre,
        ...(comisionId && { comisionId }),
      },
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
        return { tutorId: id };
      case 'estudiante':
        return { estudianteId: id };
      case 'docente':
        return { docenteId: id };
      case 'admin':
        return { adminId: id };
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

  /**
   * Determina si un tier es superior a otro
   * Orden: STEAM_LIBROS < STEAM_ASINCRONICO < STEAM_SINCRONICO
   */
  private esTierSuperior(tierNuevo: string, tierAnterior: string): boolean {
    const ordenTiers: Record<string, number> = {
      STEAM_LIBROS: 1,
      STEAM_ASINCRONICO: 2,
      STEAM_SINCRONICO: 3,
    };
    const ordenNuevo = ordenTiers[tierNuevo] ?? 0;
    const ordenAnterior = ordenTiers[tierAnterior] ?? 0;
    return ordenNuevo > ordenAnterior;
  }
}
