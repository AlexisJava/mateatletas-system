import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Servicio dedicado a la integración con MercadoPago SDK
 * Maneja la creación de preferencias de pago y consultas de pagos
 */
@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mercadopagoClient: MercadoPagoConfig | null = null;
  private preferenceClient: Preference | null = null;
  private paymentClient: Payment | null = null;
  private readonly mockMode: boolean;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

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
   * Verifica si el servicio está en modo mock
   */
  isMockMode(): boolean {
    return this.mockMode;
  }

  /**
   * Crea una preferencia de pago en MercadoPago
   * @param preferenceData - Datos de la preferencia según el formato de MercadoPago
   * @returns Preferencia creada con id e init_point
   */
  async createPreference(preferenceData: any) {
    if (this.mockMode) {
      throw new Error(
        'MercadoPago está en modo mock. Use MockPagosService para crear preferencias mock.',
      );
    }

    if (!this.preferenceClient) {
      throw new Error('MercadoPago client not initialized');
    }

    this.logger.log('Creando preferencia en MercadoPago');
    const preference = await this.preferenceClient.create({
      body: preferenceData,
    });

    this.logger.log(`Preferencia creada: ${preference.id}`);
    return preference;
  }

  /**
   * Obtiene los detalles de un pago desde MercadoPago
   * @param paymentId - ID del pago en MercadoPago
   * @returns Datos del pago
   */
  async getPayment(paymentId: string) {
    if (this.mockMode) {
      throw new Error(
        'MercadoPago está en modo mock. No se pueden consultar pagos reales.',
      );
    }

    if (!this.paymentClient) {
      throw new Error('MercadoPago client not initialized');
    }

    this.logger.log(`Consultando pago ${paymentId} en MercadoPago`);
    const payment = await this.paymentClient.get({ id: paymentId });

    this.logger.log(
      `Pago ${paymentId} - Estado: ${payment.status} - External Ref: ${payment.external_reference}`,
    );

    return payment;
  }

  /**
   * Construye los datos de una preferencia para membresía
   */
  buildMembershipPreferenceData(
    producto: any,
    tutor: any,
    membresiaId: string,
    tutorId: string,
    backendUrl: string,
    frontendUrl: string,
  ) {
    return {
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
      external_reference: `membresia-${membresiaId}-tutor-${tutorId}-producto-${producto.id}`,
      notification_url: `${backendUrl}/api/pagos/webhook`,
      back_urls: {
        success: `${frontendUrl}/suscripcion/exito?membresiaId=${membresiaId}`,
        failure: `${frontendUrl}/suscripcion/error?membresiaId=${membresiaId}`,
        pending: `${frontendUrl}/suscripcion/pendiente?membresiaId=${membresiaId}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'Mateatletas',
    };
  }

  /**
   * Construye los datos de una preferencia para curso
   */
  buildCoursePreferenceData(
    producto: any,
    estudiante: any,
    tutor: any,
    inscripcionId: string,
    estudianteId: string,
    backendUrl: string,
    frontendUrl: string,
  ) {
    return {
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
        email: tutor.email,
        name: tutor.nombre,
        surname: tutor.apellido,
      },
      external_reference: `inscripcion-${inscripcionId}-estudiante-${estudianteId}-producto-${producto.id}`,
      notification_url: `${backendUrl}/api/pagos/webhook`,
      back_urls: {
        success: `${frontendUrl}/cursos/exito?inscripcionId=${inscripcionId}`,
        failure: `${frontendUrl}/cursos/error?inscripcionId=${inscripcionId}`,
        pending: `${frontendUrl}/cursos/pendiente?inscripcionId=${inscripcionId}`,
      },
      auto_return: 'approved',
      statement_descriptor: 'Mateatletas',
    };
  }
}
