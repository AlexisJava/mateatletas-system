import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { CircuitBreaker } from '../common/circuit-breaker/circuit-breaker';

/**
 * Servicio dedicado a la integración con MercadoPago SDK
 * Maneja la creación de preferencias de pago y consultas de pagos
 *
 * CIRCUIT BREAKER PROTECTION:
 * - createPreference: Protegido con circuit breaker (5 fallos → abre circuito)
 * - getPayment: Protegido con circuit breaker (5 fallos → abre circuito)
 * - Timeout: 5 segundos por request
 * - Reset timeout: 60 segundos antes de reintentar
 * - Fallback: Retorna error detallado cuando circuito está abierto
 */
@Injectable()
export class MercadoPagoService {
  private readonly logger = new Logger(MercadoPagoService.name);
  private mercadopagoClient: MercadoPagoConfig | null = null;
  private preferenceClient: Preference | null = null;
  private paymentClient: Payment | null = null;
  private readonly mockMode: boolean;

  // Circuit Breakers for external API calls
  private readonly preferenceCircuitBreaker: CircuitBreaker;
  private readonly paymentCircuitBreaker: CircuitBreaker;

  constructor(private configService: ConfigService) {
    const accessToken = this.configService.get<string>(
      'MERCADOPAGO_ACCESS_TOKEN',
    );

    // Inicializar Circuit Breakers
    this.preferenceCircuitBreaker = new CircuitBreaker({
      name: 'MercadoPago-CreatePreference',
      failureThreshold: 3, // 3 fallos consecutivos abren el circuito
      resetTimeout: 60000, // 60 segundos antes de reintentar
      fallback: () => {
        throw new Error(
          'MercadoPago API is temporarily unavailable (circuit breaker OPEN). Please try again later.',
        );
      },
    });

    this.paymentCircuitBreaker = new CircuitBreaker({
      name: 'MercadoPago-GetPayment',
      failureThreshold: 3, // 3 fallos consecutivos abren el circuito
      resetTimeout: 60000, // 60 segundos antes de reintentar
      fallback: () => {
        throw new Error(
          'MercadoPago Payment API is temporarily unavailable (circuit breaker OPEN). Please try again later.',
        );
      },
    });

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
        options: { timeout: 5000 }, // 5 segundos timeout
      });

      this.preferenceClient = new Preference(this.mercadopagoClient);
      this.paymentClient = new Payment(this.mercadopagoClient);

      this.logger.log(
        '✅ MercadoPago SDK initialized successfully with Circuit Breaker protection',
      );
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
   *
   * CIRCUIT BREAKER PROTECTION:
   * - Protegido contra fallos repetidos de la API de MercadoPago
   * - 3 fallos consecutivos → circuito abre (rechaza requests por 60s)
   * - Timeout: 5 segundos por request
   * - Fallback: Error claro indicando que API no disponible
   *
   * @param preferenceData - Datos de la preferencia según el formato de MercadoPago
   * @returns Preferencia creada con id e init_point
   */
  async createPreference(preferenceData: Parameters<Preference['create']>[0]['body']) {
    if (this.mockMode) {
      throw new Error(
        'MercadoPago está en modo mock. Use MockPagosService para crear preferencias mock.',
      );
    }

    if (!this.preferenceClient) {
      throw new Error('MercadoPago client not initialized');
    }

    this.logger.log('Creando preferencia en MercadoPago (con Circuit Breaker)');

    // Ejecutar con circuit breaker protection
    const preference = await this.preferenceCircuitBreaker.execute(async () => {
      return await this.preferenceClient!.create({
        body: preferenceData,
      });
    });

    this.logger.log(`Preferencia creada exitosamente: ${preference.id}`);
    return preference;
  }

  /**
   * Obtiene los detalles de un pago desde MercadoPago
   *
   * CIRCUIT BREAKER PROTECTION:
   * - Protegido contra fallos repetidos de la API de MercadoPago
   * - 3 fallos consecutivos → circuito abre (rechaza requests por 60s)
   * - Timeout: 5 segundos por request
   * - Fallback: Error claro indicando que API no disponible
   *
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

    this.logger.log(
      `Consultando pago ${paymentId} en MercadoPago (con Circuit Breaker)`,
    );

    // Ejecutar con circuit breaker protection
    const payment = await this.paymentCircuitBreaker.execute(async () => {
      return await this.paymentClient!.get({ id: paymentId });
    });

    this.logger.log(
      `Pago ${paymentId} consultado exitosamente - Estado: ${payment.status} - External Ref: ${payment.external_reference}`,
    );

    return payment;
  }

  /**
   * Obtiene métricas de los circuit breakers (para monitoring)
   */
  getCircuitBreakerMetrics() {
    return {
      createPreference: this.preferenceCircuitBreaker.getMetrics(),
      getPayment: this.paymentCircuitBreaker.getMetrics(),
    };
  }

  /**
   * Construye los datos de una preferencia para membresía
   */
  buildMembershipPreferenceData(
    producto: { id: string; nombre: string; descripcion?: string; precio: number },
    tutor: { email: string; nombre?: string; apellido?: string },
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
    producto: { id: string; nombre: string; descripcion?: string; precio: number },
    estudiante: { nombre: string; apellido?: string },
    tutor: { email: string; nombre?: string; apellido?: string },
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
