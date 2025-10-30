import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RecursosService } from './recursos.service';

/**
 * Servicio de Tienda - Sistema de canjes de cursos
 *
 * Flujo completo de canje:
 * 1. Estudiante solicita canje con sus monedas
 * 2. Se crea SolicitudCanje pendiente de aprobación del padre
 * 3. Padre recibe notificación y decide:
 *    - padre_paga_todo: Padre paga $100 USD, estudiante no gasta monedas
 *    - hijo_paga_mitad: Estudiante gasta 50% monedas, padre paga 50% USD
 *    - hijo_paga_todo: Estudiante gasta todas las monedas, padre paga $0
 * 4. Si se aprueba, se habilita el curso y se registran las transacciones
 * 5. Si se rechaza, no se gastan monedas y el curso queda disponible
 *
 * Validaciones completas:
 * - Nivel requerido del curso
 * - Monedas suficientes
 * - Curso no canjeado previamente
 * - Solicitud no expirada (7 días)
 * - Permisos de tutor
 */
@Injectable()
export class TiendaService {
  private readonly logger = new Logger(TiendaService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly recursosService: RecursosService,
  ) {}

  /**
   * Obtener catálogo completo de cursos con filtros opcionales
   *
   * @param filtros - Filtros opcionales para categoría, destacados, nuevos, nivel
   * @returns Lista de cursos ordenada por destacados primero, luego por orden
   */
  async obtenerCatalogo(filtros?: {
    categoria?: string;
    destacados?: boolean;
    nuevos?: boolean;
    nivelMaximo?: number;
  }) {
    this.logger.log(`Obteniendo catálogo de cursos con filtros: ${JSON.stringify(filtros)}`);

    const cursos = await this.prisma.cursoCatalogo.findMany({
      where: {
        activo: true,
        ...(filtros?.categoria && { categoria: filtros.categoria }),
        ...(filtros?.destacados && { destacado: true }),
        ...(filtros?.nuevos && { nuevo: true }),
        ...(filtros?.nivelMaximo && {
          nivel_requerido: { lte: filtros.nivelMaximo },
        }),
      },
      orderBy: [{ destacado: 'desc' }, { nuevo: 'desc' }, { orden: 'asc' }],
    });

    this.logger.log(`✅ Catálogo obtenido: ${cursos.length} cursos`);

    return cursos;
  }

  /**
   * Obtener detalles completos de un curso específico
   *
   * @param cursoId - ID del curso
   * @returns Curso con todos sus datos
   * @throws NotFoundException si el curso no existe
   */
  async obtenerCurso(cursoId: string) {
    this.logger.log(`Obteniendo curso: ${cursoId}`);

    const curso = await this.prisma.cursoCatalogo.findUnique({
      where: { id: cursoId },
    });

    if (!curso) {
      this.logger.error(`❌ Curso no encontrado: ${cursoId}`);
      throw new NotFoundException('Curso no encontrado');
    }

    if (!curso.activo) {
      this.logger.warn(`⚠️ Curso inactivo solicitado: ${cursoId}`);
      throw new BadRequestException('Este curso ya no está disponible');
    }

    this.logger.log(`✅ Curso obtenido: ${curso.titulo}`);

    return curso;
  }

  /**
   * Solicitar canje de curso (estudiante)
   *
   * Validaciones:
   * - Monedas suficientes
   * - Nivel requerido alcanzado
   * - Curso no canjeado previamente
   * - Curso activo
   * - Estudiante tiene tutor asignado
   *
   * @param estudianteId - ID del estudiante
   * @param cursoId - ID del curso a canjear
   * @returns Solicitud de canje pendiente
   * @throws BadRequestException si alguna validación falla
   */
  async solicitarCanje(estudianteId: string, cursoId: string) {
    this.logger.log(`Solicitud de canje: estudiante=${estudianteId}, curso=${cursoId}`);

    // Obtener curso y validar
    const curso = await this.obtenerCurso(cursoId);

    // Obtener recursos del estudiante
    const recursos = await this.recursosService.obtenerRecursos(estudianteId);
    const nivel = this.recursosService.calcularNivel(recursos.xp_total);

    this.logger.log(
      `Recursos estudiante: nivel=${nivel}, monedas=${recursos.monedas_total}`,
    );

    // VALIDACIÓN 1: Nivel requerido
    if (nivel < curso.nivel_requerido) {
      this.logger.warn(
        `❌ Nivel insuficiente: requerido=${curso.nivel_requerido}, actual=${nivel}`,
      );
      throw new BadRequestException(
        `Necesitas nivel ${curso.nivel_requerido} para este curso. Tu nivel actual es ${nivel}. ¡Sigue entrenando para desbloquearlo!`,
      );
    }

    // VALIDACIÓN 2: Monedas suficientes
    if (recursos.monedas_total < curso.precio_monedas) {
      this.logger.warn(
        `❌ Monedas insuficientes: requeridas=${curso.precio_monedas}, actuales=${recursos.monedas_total}`,
      );
      const faltantes = curso.precio_monedas - recursos.monedas_total;
      throw new BadRequestException(
        `No tienes suficientes monedas. Necesitas ${curso.precio_monedas} pero tienes ${recursos.monedas_total}. Te faltan ${faltantes} monedas.`,
      );
    }

    // VALIDACIÓN 3: Curso no canjeado previamente
    const yaCanjeado = await this.prisma.cursoEstudiante.findUnique({
      where: {
        estudiante_id_curso_id: {
          estudiante_id: estudianteId,
          curso_id: cursoId,
        },
      },
    });

    if (yaCanjeado) {
      this.logger.warn(`❌ Curso ya canjeado: ${curso.titulo}`);
      throw new ConflictException('Ya tienes este curso. ¡Ve a tu biblioteca para acceder!');
    }

    // VALIDACIÓN 4: Solicitud pendiente existente
    const solicitudPendiente = await this.prisma.solicitudCanje.findFirst({
      where: {
        estudiante_id: estudianteId,
        curso_id: cursoId,
        estado: 'pendiente',
      },
    });

    if (solicitudPendiente) {
      this.logger.warn(`❌ Solicitud pendiente existente para curso: ${curso.titulo}`);
      throw new ConflictException(
        'Ya tienes una solicitud pendiente para este curso. Espera la respuesta de tu tutor.',
      );
    }

    // VALIDACIÓN 5: Buscar tutor del estudiante
    const estudiante = await this.prisma.estudiante.findUnique({
      where: { id: estudianteId },
      include: { tutor: true },
    });

    if (!estudiante) {
      this.logger.error(`❌ Estudiante no encontrado: ${estudianteId}`);
      throw new NotFoundException('Estudiante no encontrado');
    }

    if (!estudiante.tutor) {
      this.logger.error(`❌ Estudiante sin tutor asignado: ${estudianteId}`);
      throw new BadRequestException(
        'No tienes un tutor asignado. Contacta al administrador.',
      );
    }

    // Crear solicitud de canje (pendiente de aprobación)
    const solicitud = await this.prisma.solicitudCanje.create({
      data: {
        estudiante_id: estudianteId,
        tutor_id: estudiante.tutor.id,
        curso_id: cursoId,
        monedas_usadas: curso.precio_monedas,
        estado: 'pendiente',
        fecha_expiracion: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
      },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(
      `✅ Solicitud de canje creada exitosamente: ${solicitud.id}`,
      {
        estudiante: estudiante.username,
        curso: curso.titulo,
        monedas: curso.precio_monedas,
        precio_usd: curso.precio_usd,
      },
    );

    return solicitud;
  }

  /**
   * Aprobar solicitud de canje (tutor/padre)
   *
   * Opciones de pago:
   * - padre_paga_todo: Padre paga 100% USD, hijo no gasta monedas
   * - hijo_paga_mitad: Hijo gasta 50% monedas, padre paga 50% USD
   * - hijo_paga_todo: Hijo gasta 100% monedas, padre no paga
   *
   * @param solicitudId - ID de la solicitud
   * @param tutorId - ID del tutor aprobando
   * @param opcionPago - Opción de pago seleccionada
   * @param mensajePadre - Mensaje opcional del padre al hijo
   * @returns Solicitud aprobada con datos actualizados
   * @throws BadRequestException si validaciones fallan
   */
  async aprobarCanje(
    solicitudId: string,
    tutorId: string,
    opcionPago: 'padre_paga_todo' | 'hijo_paga_mitad' | 'hijo_paga_todo',
    mensajePadre?: string,
  ) {
    this.logger.log(`Aprobando solicitud: ${solicitudId} por tutor: ${tutorId}`);

    // Obtener solicitud con relaciones
    const solicitud = await this.prisma.solicitudCanje.findUnique({
      where: { id: solicitudId },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });

    if (!solicitud) {
      this.logger.error(`❌ Solicitud no encontrada: ${solicitudId}`);
      throw new NotFoundException('Solicitud no encontrada');
    }

    // VALIDACIÓN: Permiso del tutor
    if (solicitud.tutor_id !== tutorId) {
      this.logger.error(
        `❌ Tutor no autorizado: tutor=${tutorId}, tutor_real=${solicitud.tutor_id}`,
      );
      throw new BadRequestException(
        'No tienes permiso para aprobar esta solicitud. Solo el tutor asignado puede hacerlo.',
      );
    }

    // VALIDACIÓN: Estado pendiente
    if (solicitud.estado !== 'pendiente') {
      this.logger.warn(`❌ Solicitud ya procesada: estado=${solicitud.estado}`);
      throw new BadRequestException(
        `Esta solicitud ya fue ${solicitud.estado === 'aprobada' ? 'aprobada' : 'rechazada'}. No se puede modificar.`,
      );
    }

    // VALIDACIÓN: No expirada
    if (solicitud.fecha_expiracion && new Date() > new Date(solicitud.fecha_expiracion)) {
      this.logger.warn(`❌ Solicitud expirada: ${solicitudId}`);
      throw new BadRequestException(
        'Esta solicitud expiró. El estudiante debe crear una nueva solicitud.',
      );
    }

    // Calcular monedas a gastar y monto del padre
    let monedasAGastar = 0;
    let montoPadre = 0;

    switch (opcionPago) {
      case 'padre_paga_todo':
        monedasAGastar = 0;
        montoPadre = Number(solicitud.curso.precio_usd);
        this.logger.log(`Opción: Padre paga todo ($${montoPadre})`);
        break;
      case 'hijo_paga_mitad':
        monedasAGastar = Math.floor(solicitud.monedas_usadas / 2);
        montoPadre = Number(solicitud.curso.precio_usd) / 2;
        this.logger.log(
          `Opción: 50/50 (${monedasAGastar} monedas + $${montoPadre})`,
        );
        break;
      case 'hijo_paga_todo':
        monedasAGastar = solicitud.monedas_usadas;
        montoPadre = 0;
        this.logger.log(`Opción: Hijo paga todo (${monedasAGastar} monedas)`);
        break;
    }

    // Gastar monedas del estudiante si corresponde
    if (monedasAGastar > 0) {
      this.logger.log(`Gastando ${monedasAGastar} monedas del estudiante...`);

      await this.recursosService.gastarMonedas(
        solicitud.estudiante_id,
        monedasAGastar,
        'canje_curso',
        {
          curso_id: solicitud.curso_id,
          curso_codigo: solicitud.curso.codigo,
          curso_nombre: solicitud.curso.titulo,
          solicitud_id: solicitudId,
          opcion_pago: opcionPago,
          monto_padre: montoPadre,
        },
      );
    }

    // Actualizar solicitud
    const solicitudAprobada = await this.prisma.solicitudCanje.update({
      where: { id: solicitudId },
      data: {
        estado: 'aprobada',
        opcion_pago: opcionPago,
        monto_padre: montoPadre,
        mensaje_padre: mensajePadre || null,
        fecha_decision: new Date(),
      },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });

    // Habilitar curso para el estudiante
    await this.prisma.cursoEstudiante.create({
      data: {
        estudiante_id: solicitud.estudiante_id,
        curso_id: solicitud.curso_id,
        progreso: 0,
        completado: false,
      },
    });

    // Incrementar contador de canjes del curso
    await this.prisma.cursoCatalogo.update({
      where: { id: solicitud.curso_id },
      data: {
        total_canjes: { increment: 1 },
      },
    });

    this.logger.log(
      `✅ Solicitud aprobada exitosamente`,
      {
        solicitud_id: solicitudId,
        estudiante: solicitud.estudiante.username,
        curso: solicitud.curso.titulo,
        opcion_pago: opcionPago,
        monedas_gastadas: monedasAGastar,
        monto_padre: montoPadre,
      },
    );

    return solicitudAprobada;
  }

  /**
   * Rechazar solicitud de canje (tutor/padre)
   *
   * @param solicitudId - ID de la solicitud
   * @param tutorId - ID del tutor rechazando
   * @param mensajePadre - Mensaje opcional explicando el rechazo
   * @returns Solicitud rechazada
   * @throws BadRequestException si validaciones fallan
   */
  async rechazarCanje(
    solicitudId: string,
    tutorId: string,
    mensajePadre?: string,
  ) {
    this.logger.log(`Rechazando solicitud: ${solicitudId} por tutor: ${tutorId}`);

    const solicitud = await this.prisma.solicitudCanje.findUnique({
      where: { id: solicitudId },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });

    if (!solicitud) {
      this.logger.error(`❌ Solicitud no encontrada: ${solicitudId}`);
      throw new NotFoundException('Solicitud no encontrada');
    }

    // VALIDACIÓN: Permiso del tutor
    if (solicitud.tutor_id !== tutorId) {
      this.logger.error(
        `❌ Tutor no autorizado: tutor=${tutorId}, tutor_real=${solicitud.tutor_id}`,
      );
      throw new BadRequestException(
        'No tienes permiso para rechazar esta solicitud. Solo el tutor asignado puede hacerlo.',
      );
    }

    // VALIDACIÓN: Estado pendiente
    if (solicitud.estado !== 'pendiente') {
      this.logger.warn(`❌ Solicitud ya procesada: estado=${solicitud.estado}`);
      throw new BadRequestException(
        `Esta solicitud ya fue ${solicitud.estado === 'aprobada' ? 'aprobada' : 'rechazada'}. No se puede modificar.`,
      );
    }

    const solicitudRechazada = await this.prisma.solicitudCanje.update({
      where: { id: solicitudId },
      data: {
        estado: 'rechazada',
        mensaje_padre: mensajePadre || 'Solicitud rechazada por el tutor',
        fecha_decision: new Date(),
      },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
      },
    });

    this.logger.log(
      `✅ Solicitud rechazada`,
      {
        solicitud_id: solicitudId,
        estudiante: solicitud.estudiante.username,
        curso: solicitud.curso.titulo,
        mensaje: mensajePadre,
      },
    );

    return solicitudRechazada;
  }

  /**
   * Obtener solicitudes pendientes de un tutor
   *
   * @param tutorId - ID del tutor
   * @returns Lista de solicitudes pendientes ordenadas por fecha
   */
  async obtenerSolicitudesPendientes(tutorId: string) {
    this.logger.log(`Obteniendo solicitudes pendientes del tutor: ${tutorId}`);

    const solicitudes = await this.prisma.solicitudCanje.findMany({
      where: {
        tutor_id: tutorId,
        estado: 'pendiente',
        fecha_expiracion: {
          gte: new Date(), // No expiradas
        },
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
            avatar_url: true,
          },
        },
        curso: true,
      },
      orderBy: { fecha_solicitud: 'desc' },
    });

    this.logger.log(`✅ Solicitudes pendientes encontradas: ${solicitudes.length}`);

    return solicitudes;
  }

  /**
   * Obtener historial de solicitudes de un tutor (todas)
   *
   * @param tutorId - ID del tutor
   * @returns Lista de todas las solicitudes
   */
  async obtenerHistorialSolicitudes(tutorId: string) {
    this.logger.log(`Obteniendo historial de solicitudes del tutor: ${tutorId}`);

    return this.prisma.solicitudCanje.findMany({
      where: {
        tutor_id: tutorId,
      },
      include: {
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            username: true,
          },
        },
        curso: true,
      },
      orderBy: { fecha_solicitud: 'desc' },
      take: 50, // Últimas 50
    });
  }

  /**
   * Obtener cursos canjeados del estudiante
   *
   * @param estudianteId - ID del estudiante
   * @returns Lista de cursos con progreso
   */
  async obtenerCursosEstudiante(estudianteId: string) {
    this.logger.log(`Obteniendo cursos del estudiante: ${estudianteId}`);

    const cursos = await this.prisma.cursoEstudiante.findMany({
      where: { estudiante_id: estudianteId },
      include: { curso: true },
      orderBy: { fecha_inicio: 'desc' },
    });

    this.logger.log(`✅ Cursos del estudiante: ${cursos.length}`);

    return cursos;
  }

  /**
   * Actualizar progreso de un curso
   *
   * @param estudianteId - ID del estudiante
   * @param cursoId - ID del curso
   * @param progreso - Porcentaje de progreso (0-100)
   * @returns Curso actualizado
   */
  async actualizarProgresoCurso(
    estudianteId: string,
    cursoId: string,
    progreso: number,
  ) {
    this.logger.log(
      `Actualizando progreso: estudiante=${estudianteId}, curso=${cursoId}, progreso=${progreso}%`,
    );

    if (progreso < 0 || progreso > 100) {
      throw new BadRequestException('El progreso debe estar entre 0 y 100');
    }

    const completado = progreso === 100;

    return this.prisma.cursoEstudiante.update({
      where: {
        estudiante_id_curso_id: {
          estudiante_id: estudianteId,
          curso_id: cursoId,
        },
      },
      data: {
        progreso,
        completado,
        ...(completado && { fecha_completado: new Date() }),
      },
      include: { curso: true },
    });
  }

  /**
   * Obtener solicitudes de canje del estudiante
   *
   * @param estudianteId - ID del estudiante
   * @returns Lista de solicitudes del estudiante (todas, ordenadas por fecha)
   */
  async obtenerSolicitudesEstudiante(estudianteId: string) {
    this.logger.log(`Obteniendo solicitudes de estudiante: ${estudianteId}`);

    const solicitudes = await this.prisma.solicitudCanje.findMany({
      where: {
        estudiante_id: estudianteId,
      },
      include: {
        curso: true,
        estudiante: {
          select: {
            id: true,
            username: true,
          },
        },
      },
      orderBy: { fecha_solicitud: 'desc' },
      take: 50,
    });

    this.logger.log(`✅ Solicitudes encontradas: ${solicitudes.length}`, {
      estudiante: estudianteId,
      pendientes: solicitudes.filter((s) => s.estado === 'pendiente').length,
      aprobadas: solicitudes.filter((s) => s.estado === 'aprobada').length,
      rechazadas: solicitudes.filter((s) => s.estado === 'rechazada').length,
    });

    return solicitudes;
  }
}
