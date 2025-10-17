import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../core/database/prisma.service';
import { ProductosService } from '../catalogo/productos.service';
import { MercadoPagoService } from './mercadopago.service';
import { MockPagosService } from './mock-pagos.service';
import { TipoProducto } from '@prisma/client';

/**
 * Servicio principal para gestionar pagos y membresías
 * Orquesta las operaciones entre MercadoPago, Mock y la base de datos
 * Maneja la lógica de negocio de suscripciones y cursos
 */
@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private readonly frontendUrl: string;
  private readonly backendUrl: string;

  constructor(
    private prisma: PrismaService,
    private productosService: ProductosService,
    private configService: ConfigService,
    private mercadoPagoService: MercadoPagoService,
    private mockPagosService: MockPagosService,
  ) {
    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';
  }

  /**
   * Genera una preferencia de pago para suscripción
   * Crea la membresía en estado Pendiente antes de redirigir
   */
  async generarPreferenciaSuscripcion(tutorId: string, productoId?: string) {
    this.logger.log(
      `Generando preferencia de suscripción para tutor ${tutorId}`,
    );

    // Si no se especifica producto, buscar el primer producto de suscripción activo
    let producto;
    if (productoId) {
      producto = await this.productosService.findById(productoId);
    } else {
      const suscripciones = await this.productosService.findSuscripciones();
      if (suscripciones.length === 0) {
        throw new NotFoundException(
          'No hay productos de suscripción disponibles',
        );
      }
      producto = suscripciones[0]; // Tomar el primero (más económico)
    }

    // Validar que sea producto de suscripción
    if (producto.tipo !== TipoProducto.Suscripcion) {
      throw new BadRequestException(
        'El producto especificado no es una suscripción',
      );
    }

    // Obtener info del tutor
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { id: true, email: true, nombre: true, apellido: true },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // 1. Crear membresía en estado Pendiente
    const membresia = await this.prisma.membresia.create({
      data: {
        tutor_id: tutorId,
        producto_id: producto.id,
        estado: 'Pendiente',
        fecha_inicio: null,
        fecha_proximo_pago: null,
      },
    });

    this.logger.log(`Membresía creada en estado Pendiente: ${membresia.id}`);

    // 2. Crear preferencia en MercadoPago (o mock si no está configurado)
    let preference;
    if (this.mercadoPagoService.isMockMode()) {
      // Modo MOCK - simular respuesta de MercadoPago para desarrollo
      preference = this.mockPagosService.createMockMembershipPreference(
        membresia.id,
      );
    } else {
      // Modo REAL - crear preferencia en MercadoPago
      const preferenceData =
        this.mercadoPagoService.buildMembershipPreferenceData(
          producto,
          tutor,
          membresia.id,
          tutorId,
          this.backendUrl,
          this.frontendUrl,
        );

      preference = await this.mercadoPagoService.createPreference(
        preferenceData,
      );
    }

    // 3. Guardar preferencia ID en la membresía
    await this.prisma.membresia.update({
      where: { id: membresia.id },
      data: { preferencia_id: preference.id },
    });

    this.logger.log(
      `Preferencia MP creada: ${preference.id} para membresía ${membresia.id}`,
    );

    return {
      init_point: preference.init_point,
      membresiaId: membresia.id,
      preferenciaId: preference.id,
    };
  }

  /**
   * Genera una preferencia de pago para curso
   */
  async generarPreferenciaCurso(
    tutorId: string,
    estudianteId: string,
    productoId: string,
  ) {
    this.logger.log(
      `Generando preferencia de curso para estudiante ${estudianteId}`,
    );

    // Validar producto
    const producto = await this.productosService.findById(productoId);
    if (producto.tipo !== TipoProducto.Curso) {
      throw new BadRequestException('El producto especificado no es un curso');
    }

    // Validar que el estudiante pertenezca al tutor
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { id: estudianteId, tutor_id: tutorId },
      select: { id: true, nombre: true, apellido: true },
    });

    if (!estudiante) {
      throw new NotFoundException(
        'Estudiante no encontrado o no pertenece al tutor',
      );
    }

    // Validar que no esté ya inscrito
    const inscripcionExistente = await this.prisma.inscripcionCurso.findUnique({
      where: {
        estudiante_id_producto_id: {
          estudiante_id: estudianteId,
          producto_id: productoId,
        },
      },
    });

    if (inscripcionExistente) {
      throw new BadRequestException(
        'El estudiante ya está inscrito en este curso',
      );
    }

    // Obtener tutor info
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
      select: { email: true, nombre: true, apellido: true },
    });

    // 1. Crear inscripción en estado PreInscrito
    const inscripcion = await this.prisma.inscripcionCurso.create({
      data: {
        estudiante_id: estudianteId,
        producto_id: productoId,
        estado: 'PreInscrito',
      },
    });

    this.logger.log(
      `Inscripción creada en estado PreInscrito: ${inscripcion.id}`,
    );

    // 2. Crear preferencia en MercadoPago (o mock si no está configurado)
    let preference;
    if (this.mercadoPagoService.isMockMode()) {
      // Modo MOCK - simular respuesta de MercadoPago para desarrollo
      preference = this.mockPagosService.createMockCoursePreference(
        inscripcion.id,
      );
    } else {
      // Modo REAL - crear preferencia en MercadoPago
      const preferenceData =
        this.mercadoPagoService.buildCoursePreferenceData(
          producto,
          estudiante,
          tutor!,
          inscripcion.id,
          estudianteId,
          this.backendUrl,
          this.frontendUrl,
        );

      preference = await this.mercadoPagoService.createPreference(
        preferenceData,
      );
    }

    // 3. Guardar preferencia ID
    await this.prisma.inscripcionCurso.update({
      where: { id: inscripcion.id },
      data: { preferencia_id: preference.id },
    });

    this.logger.log(
      `Preferencia MP creada: ${preference.id} para inscripción ${inscripcion.id}`,
    );

    return {
      init_point: preference.init_point,
      inscripcionId: inscripcion.id,
      preferenciaId: preference.id,
    };
  }

  /**
   * Procesa una notificación de webhook de MercadoPago
   */
  async procesarWebhookMercadoPago(body: any) {
    this.logger.log('📩 Webhook recibido de MercadoPago');

    // Log sanitizado - NO exponer payload completo que puede contener datos sensibles
    const sanitizedLog = {
      type: body.type,
      action: body.action,
      dataId: body.data?.id,
      liveMode: body.live_mode,
      timestamp: new Date().toISOString(),
    };
    this.logger.debug(`Webhook sanitizado: ${JSON.stringify(sanitizedLog)}`);

    // En modo mock, ignorar webhooks
    if (
      this.mockPagosService.shouldIgnoreWebhook(
        this.mercadoPagoService.isMockMode(),
      )
    ) {
      return { message: 'Mock mode - webhook ignored' };
    }

    const { type, data } = body;

    // Solo procesar notificaciones de pago
    if (type !== 'payment') {
      this.logger.log(`Webhook type ${type} ignorado`);
      return { message: 'Webhook type not handled' };
    }

    const paymentId = data?.id;
    if (!paymentId) {
      this.logger.warn('Webhook sin payment ID');
      return { message: 'No payment ID' };
    }

    try {
      // Obtener detalles del pago desde MercadoPago
      const payment = await this.mercadoPagoService.getPayment(paymentId);

      this.logger.log(
        `Pago ${paymentId} - Estado: ${payment.status} - External Ref: ${payment.external_reference}`,
      );

      // Extraer información del external_reference
      const externalRef = payment.external_reference || '';
      const refParts = externalRef.split('-');

      // Determinar si es membresía o inscripción
      if (refParts[0] === 'membresia') {
        await this.procesarPagoMembresia(payment, refParts);
      } else if (refParts[0] === 'inscripcion') {
        await this.procesarPagoInscripcion(payment, refParts);
      } else {
        this.logger.warn(`External reference format unknown: ${externalRef}`);
      }

      return { message: 'Webhook processed successfully' };
    } catch (error) {
      this.logger.error(`Error procesando webhook: ${error}`);
      throw error;
    }
  }

  /**
   * Procesa pago de membresía según el estado
   */
  private async procesarPagoMembresia(payment: any, refParts: string[]) {
    const membresiaId = refParts[1];

    const membresia = await this.prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: { producto: true },
    });

    if (!membresia) {
      this.logger.error(`Membresía ${membresiaId} no encontrada`);
      return;
    }

    if (payment.status === 'approved') {
      // Pago aprobado - Activar membresía
      const fechaInicio = new Date();
      const duracionMeses = membresia.producto.duracion_meses || 1;
      const fechaProximoPago = new Date(fechaInicio);
      fechaProximoPago.setMonth(fechaProximoPago.getMonth() + duracionMeses);

      await this.prisma.membresia.update({
        where: { id: membresiaId },
        data: {
          estado: 'Activa',
          fecha_inicio: fechaInicio,
          fecha_proximo_pago: fechaProximoPago,
        },
      });

      this.logger.log(`✅ Membresía ${membresiaId} activada`);
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      // Pago rechazado - Cancelar membresía
      await this.prisma.membresia.update({
        where: { id: membresiaId },
        data: { estado: 'Cancelada' },
      });

      this.logger.log(
        `❌ Membresía ${membresiaId} cancelada por pago rechazado`,
      );
    } else {
      // Pago pendiente u otro estado - mantener Pendiente
      this.logger.log(
        `⏳ Membresía ${membresiaId} permanece en Pendiente (estado: ${payment.status})`,
      );
    }
  }

  /**
   * Procesa pago de inscripción a curso según el estado
   */
  private async procesarPagoInscripcion(payment: any, refParts: string[]) {
    const inscripcionId = refParts[1];

    const inscripcion = await this.prisma.inscripcionCurso.findUnique({
      where: { id: inscripcionId },
      include: { producto: true },
    });

    if (!inscripcion) {
      this.logger.error(`Inscripción ${inscripcionId} no encontrada`);
      return;
    }

    if (payment.status === 'approved') {
      // Pago aprobado - Activar inscripción
      await this.prisma.inscripcionCurso.update({
        where: { id: inscripcionId },
        data: { estado: 'Activo' },
      });

      this.logger.log(`✅ Inscripción ${inscripcionId} activada`);
    } else if (
      payment.status === 'rejected' ||
      payment.status === 'cancelled'
    ) {
      // Pago rechazado - Eliminar inscripción
      await this.prisma.inscripcionCurso.delete({
        where: { id: inscripcionId },
      });

      this.logger.log(
        `❌ Inscripción ${inscripcionId} eliminada por pago rechazado`,
      );
    } else {
      this.logger.log(
        `⏳ Inscripción ${inscripcionId} permanece en PreInscrito (estado: ${payment.status})`,
      );
    }
  }

  /**
   * Obtiene la membresía activa de un tutor
   */
  async obtenerMembresiaTutor(tutorId: string) {
    const membresia = await this.prisma.membresia.findFirst({
      where: {
        tutor_id: tutorId,
        estado: { in: ['Activa', 'Pendiente', 'Atrasada'] },
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            duracion_meses: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!membresia) {
      return null;
    }

    return membresia;
  }

  /**
   * Obtiene el estado de una membresía específica (para polling)
   */
  async obtenerEstadoMembresia(membresiaId: string, tutorId: string) {
    const membresia = await this.prisma.membresia.findFirst({
      where: { id: membresiaId, tutor_id: tutorId },
      select: {
        id: true,
        estado: true,
        fecha_inicio: true,
        fecha_proximo_pago: true,
        createdAt: true,
      },
    });

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    return membresia;
  }

  /**
   * Obtiene las inscripciones activas de un estudiante
   */
  async obtenerInscripcionesEstudiante(estudianteId: string, tutorId: string) {
    // Validar que el estudiante pertenezca al tutor
    const estudiante = await this.prisma.estudiante.findFirst({
      where: { id: estudianteId, tutor_id: tutorId },
    });

    if (!estudiante) {
      throw new NotFoundException('Estudiante no encontrado');
    }

    return await this.prisma.inscripcionCurso.findMany({
      where: { estudiante_id: estudianteId },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            precio: true,
            fecha_inicio: true,
            fecha_fin: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Obtiene el historial COMPLETO de pagos de un tutor
   * Para el portal de tutores - pestaña "Pagos"
   * Incluye: todos los pagos (membresías y cursos), con detalles de producto, estudiante y estado
   */
  async obtenerHistorialPagosTutor(tutorId: string) {
    // 1. Verificar que el tutor existe
    const tutor = await this.prisma.tutor.findUnique({
      where: { id: tutorId },
    });

    if (!tutor) {
      throw new NotFoundException('Tutor no encontrado');
    }

    // 2. Obtener membresías del tutor (historial)
    const membresias = await this.prisma.membresia.findMany({
      where: { tutor_id: tutorId },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            descripcion: true,
            tipo: true,
            precio: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 3. Obtener inscripciones a cursos de los estudiantes del tutor
    const estudiantes = await this.prisma.estudiante.findMany({
      where: { tutor_id: tutorId },
      select: { id: true },
    });

    const inscripcionesCursos = await this.prisma.inscripcionCurso.findMany({
      where: {
        estudiante_id: { in: estudiantes.map((e) => e.id) },
      },
      include: {
        producto: {
          select: {
            id: true,
            nombre: true,
            precio: true,
            tipo: true,
          },
        },
        estudiante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Unificar historial (membresías + cursos)
    const historial = [
      ...membresias.map((m) => ({
        id: m.id,
        tipo: 'membresia' as const,
        producto: m.producto,
        estado: m.estado,
        fecha: m.createdAt,
        monto: m.producto.precio,
        estudiante: null,
      })),
      ...inscripcionesCursos.map((i) => ({
        id: i.id,
        tipo: 'curso' as const,
        producto: i.producto,
        estado: i.estado,
        fecha: i.createdAt,
        monto: i.producto.precio,
        estudiante: i.estudiante,
      })),
    ].sort((a, b) => b.fecha.getTime() - a.fecha.getTime());

    // 5. Calcular resumen
    const totalPagos = historial.length;
    const membresiasPagadas = membresias.filter(
      (m) => m.estado === 'Activa',
    ).length;
    const cursosPagados = inscripcionesCursos.filter(
      (i) => i.estado === 'Activo',
    ).length;

    const totalGastado =
      membresias
        .filter((m) => m.estado === 'Activa')
        .reduce((sum, m) => sum + Number(m.producto.precio), 0) +
      inscripcionesCursos
        .filter((i) => i.estado === 'Activo')
        .reduce((sum, i) => sum + Number(i.producto.precio), 0);

    // 6. Obtener membresía activa actual
    const membresiaActual = await this.obtenerMembresiaTutor(tutorId);

    // 7. Obtener inscripciones activas
    const inscripcionesActivas = inscripcionesCursos.filter(
      (i) => i.estado === 'Activo',
    );

    return {
      historial,
      resumen: {
        total_pagos: totalPagos,
        total_gastado: totalGastado,
        membresias_activas: membresiasPagadas,
        cursos_activos: cursosPagados,
      },
      activos: {
        membresia_actual: membresiaActual,
        inscripciones_cursos_activas: inscripcionesActivas,
      },
    };
  }

  /**
   * Activa una membresía manualmente (SOLO PARA TESTING EN MODO MOCK)
   */
  async activarMembresiaMock(membresiaId: string) {
    return this.mockPagosService.activarMembresiaMock(
      membresiaId,
      this.mercadoPagoService.isMockMode(),
    );
  }

  /**
   * Obtiene TODOS los pagos (solo para admin)
   * NOTA: El modelo Pago aún no está implementado en el schema de Prisma.
   */
  async findAllPagos() {
    // TODO: Implementar cuando se agregue el modelo Pago al schema
    return {
      message:
        'El modelo Pago aún no está implementado en el schema. Funcionalidad pendiente.',
      pagos: [],
    };
  }
}
