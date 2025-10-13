import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../core/database/prisma.service';
import { ProductosService } from '../catalogo/productos.service';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { TipoProducto } from '@prisma/client';

/**
 * Servicio para gestionar pagos a través de MercadoPago
 * Maneja la creación de preferencias de pago y procesamiento de webhooks
 */
@Injectable()
export class PagosService {
  private readonly logger = new Logger(PagosService.name);
  private mercadopagoClient: MercadoPagoConfig | null = null;
  private preferenceClient: Preference | null = null;
  private paymentClient: Payment | null = null;
  private readonly frontendUrl: string;
  private readonly backendUrl: string;
  private readonly mockMode: boolean;

  constructor(
    private prisma: PrismaService,
    private productosService: ProductosService,
    private configService: ConfigService,
  ) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    this.frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:3000';
    this.backendUrl =
      this.configService.get<string>('BACKEND_URL') || 'http://localhost:3001';

    // Verificar si MercadoPago está configurado
    if (!accessToken || accessToken.includes('XXXXXXXX')) {
      this.logger.warn(
        '⚠️  MercadoPago en MODO MOCK - Configure MERCADOPAGO_ACCESS_TOKEN para usar MercadoPago real',
      );
      this.mockMode = true;
    } else {
      // Inicializar clientes de MercadoPago solo si hay credenciales
      this.mockMode = false;
      this.mercadopagoClient = new MercadoPagoConfig({
        accessToken,
        options: { timeout: 5000 },
      });

      this.preferenceClient = new Preference(this.mercadopagoClient);
      this.paymentClient = new Payment(this.mercadopagoClient);

      this.logger.log('✅ MercadoPago SDK initialized successfully');
    }
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
    if (this.mockMode) {
      // Modo MOCK - simular respuesta de MercadoPago para desarrollo
      const mockPreferenceId = `MOCK-PREF-${Date.now()}`;
      const mockInitPoint = `${this.frontendUrl}/mock-checkout?membresiaId=${membresia.id}&tipo=suscripcion`;

      this.logger.warn(`🧪 MOCK MODE: Simulando preferencia de pago para membresía ${membresia.id}`);

      preference = {
        id: mockPreferenceId,
        init_point: mockInitPoint,
      };
    } else {
      // Modo REAL - crear preferencia en MercadoPago
      preference = await this.preferenceClient!.create({
        body: {
          items: [
            {
              id: producto.id,
              title: producto.nombre,
              description: producto.descripcion || undefined,
              quantity: 1,
              unit_price: Number(producto.precio),
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: tutor.email,
            name: tutor.nombre,
            surname: tutor.apellido,
          },
          external_reference: `membresia-${membresia.id}-tutor-${tutorId}-producto-${producto.id}`,
          notification_url: `${this.backendUrl}/api/pagos/webhook`,
          back_urls: {
            success: `${this.frontendUrl}/suscripcion/exito?membresiaId=${membresia.id}`,
            failure: `${this.frontendUrl}/suscripcion/error?membresiaId=${membresia.id}`,
            pending: `${this.frontendUrl}/suscripcion/pendiente?membresiaId=${membresia.id}`,
          },
          auto_return: 'approved',
          statement_descriptor: 'Mateatletas',
        },
      });
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
      throw new BadRequestException('El estudiante ya está inscrito en este curso');
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

    this.logger.log(`Inscripción creada en estado PreInscrito: ${inscripcion.id}`);

    // 2. Crear preferencia en MercadoPago (o mock si no está configurado)
    let preference;
    if (this.mockMode) {
      // Modo MOCK - simular respuesta de MercadoPago para desarrollo
      const mockPreferenceId = `MOCK-PREF-${Date.now()}`;
      const mockInitPoint = `${this.frontendUrl}/mock-checkout?inscripcionId=${inscripcion.id}&tipo=curso`;

      this.logger.warn(`🧪 MOCK MODE: Simulando preferencia de pago para inscripción ${inscripcion.id}`);

      preference = {
        id: mockPreferenceId,
        init_point: mockInitPoint,
      };
    } else {
      // Modo REAL - crear preferencia en MercadoPago
      preference = await this.preferenceClient!.create({
        body: {
          items: [
            {
              id: producto.id,
              title: `${producto.nombre} - ${estudiante.nombre} ${estudiante.apellido}`,
              description: producto.descripcion || undefined,
              quantity: 1,
              unit_price: Number(producto.precio),
              currency_id: 'ARS',
            },
          ],
          payer: {
            email: tutor!.email,
            name: tutor!.nombre,
            surname: tutor!.apellido,
          },
          external_reference: `inscripcion-${inscripcion.id}-estudiante-${estudianteId}-producto-${productoId}`,
          notification_url: `${this.backendUrl}/api/pagos/webhook`,
          back_urls: {
            success: `${this.frontendUrl}/cursos/exito?inscripcionId=${inscripcion.id}`,
            failure: `${this.frontendUrl}/cursos/error?inscripcionId=${inscripcion.id}`,
            pending: `${this.frontendUrl}/cursos/pendiente?inscripcionId=${inscripcion.id}`,
          },
          auto_return: 'approved',
          statement_descriptor: 'Mateatletas',
        },
      });
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
    this.logger.debug(`Webhook body: ${JSON.stringify(body)}`);

    // En modo mock, ignorar webhooks
    if (this.mockMode) {
      this.logger.warn('🧪 MOCK MODE: Webhook ignorado (use endpoints manuales para testing)');
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
      const payment = await this.paymentClient!.get({ id: paymentId });

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
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      // Pago rechazado - Cancelar membresía
      await this.prisma.membresia.update({
        where: { id: membresiaId },
        data: { estado: 'Cancelada' },
      });

      this.logger.log(`❌ Membresía ${membresiaId} cancelada por pago rechazado`);
    } else {
      // Pago pendiente u otro estado - mantener Pendiente
      this.logger.log(`⏳ Membresía ${membresiaId} permanece en Pendiente (estado: ${payment.status})`);
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
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      // Pago rechazado - Eliminar inscripción
      await this.prisma.inscripcionCurso.delete({
        where: { id: inscripcionId },
      });

      this.logger.log(`❌ Inscripción ${inscripcionId} eliminada por pago rechazado`);
    } else {
      this.logger.log(`⏳ Inscripción ${inscripcionId} permanece en PreInscrito (estado: ${payment.status})`);
    }
  }

  /**
   * Obtiene la membresía activa de un tutor
   */
  async obtenerMembresiaTutor(tutorId: string) {
    const membresia = await this.prisma.membresia.findFirst({
      where: {
        tutor_id: tutorId,
        estado: { in: ['Activa', 'Pendiente'] },
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
   * Activa una membresía manualmente (SOLO PARA TESTING EN MODO MOCK)
   */
  async activarMembresiaMock(membresiaId: string) {
    if (!this.mockMode) {
      throw new BadRequestException(
        'Este endpoint solo está disponible en modo mock',
      );
    }

    const membresia = await this.prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: { producto: true },
    });

    if (!membresia) {
      throw new NotFoundException('Membresía no encontrada');
    }

    const now = new Date();
    const duracionMeses = membresia.producto.duracion_meses || 1;
    const fechaFin = new Date(now);
    fechaFin.setMonth(fechaFin.getMonth() + duracionMeses);

    const membresiaActualizada = await this.prisma.membresia.update({
      where: { id: membresiaId },
      data: {
        estado: 'Activa',
        fecha_inicio: now,
        fecha_proximo_pago: fechaFin,
      },
    });

    this.logger.log(
      `🧪 MOCK: Membresía ${membresiaId} activada manualmente`,
    );

    return {
      message: 'Membresía activada exitosamente (modo mock)',
      membresia: membresiaActualizada,
    };
  }
}
