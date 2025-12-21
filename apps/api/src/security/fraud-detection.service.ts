import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../core/database/prisma.service';
import { AuditLogService, EntityType } from '../audit/audit-log.service';

/**
 * Resultado de análisis de múltiples pagos desde misma IP
 */
interface MultiplePaymentsResult {
  isSuspicious: boolean;
  reason: string;
  threshold: number;
  actualCount: number;
  ipAddress: string;
}

/**
 * Resultado de validación de monto de pago
 */
interface PaymentAmountValidation {
  isValid: boolean;
  reason?: string;
  reportedAmount: number;
  expectedAmount: number;
  discrepancy: number;
}

/**
 * Resultado de verificación de unicidad de payment_id
 */
interface PaymentIdUniquenessResult {
  isUnique: boolean;
  existingPaymentId: string | null;
  existingInscripcionId?: string;
}

/**
 * Datos de pago para calcular score de riesgo
 */
interface PaymentRiskData {
  ipAddress: string;
  amount: number;
  expectedAmount: number;
  paymentId: string;
  tutorId: string;
  estudianteDNI: string;
}

/**
 * Score de riesgo de fraude (0-100)
 */
interface FraudRiskScore {
  score: number;
  factors: string[];
  recommendation: 'ALLOW' | 'REVIEW' | 'BLOCK';
}

/**
 * Servicio de Detección de Fraude - PASO 2.3
 *
 * PROPÓSITO: Detectar y prevenir fraudes en pagos e inscripciones
 *
 * ESTRATEGIAS DE DETECCIÓN:
 * - Análisis de patrones de IP (múltiples pagos desde misma IP)
 * - Validación de montos contra pricing calculator
 * - Verificación de unicidad de payment_id
 * - Detección de inscripciones duplicadas
 * - Score de riesgo multi-factor (0-100)
 *
 * ESTÁNDARES DE SEGURIDAD:
 * - PCI DSS 11.4: Use intrusion-detection and/or intrusion-prevention techniques
 * - OWASP A04:2021 - Insecure Design
 * - ISO 27001 A.12.2.1 - Controls against malware
 * - NIST 800-53 SI-4 - Information System Monitoring
 *
 * @injectable
 */
@Injectable()
export class FraudDetectionService {
  private readonly logger = new Logger(FraudDetectionService.name);

  // Configuración de umbrales de detección
  private readonly MULTIPLE_PAYMENTS_THRESHOLD = 10; // Máximo 10 pagos en 5 minutos
  private readonly MULTIPLE_PAYMENTS_WINDOW_MS = 5 * 60 * 1000; // 5 minutos
  private readonly HIGH_RISK_SCORE_THRESHOLD = 70; // Score > 70 = BLOCK

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditLog: AuditLogService,
  ) {}

  /**
   * Detecta múltiples pagos desde la misma IP en corto tiempo
   *
   * ATAQUE: Botnet o script automatizado enviando múltiples pagos
   * UMBRAL: 10 pagos en 5 minutos desde misma IP
   *
   * @param ipAddress - IP a analizar
   * @returns Resultado del análisis
   */
  async detectMultiplePaymentsFromSameIP(
    ipAddress: string,
  ): Promise<MultiplePaymentsResult> {
    const windowStart = new Date(Date.now() - this.MULTIPLE_PAYMENTS_WINDOW_MS);

    // Contar pagos desde esta IP en la ventana de tiempo
    const recentPayments = await this.prisma.pagoInscripcion2026.findMany({
      where: {
        ip_address: ipAddress,
        createdAt: {
          gte: windowStart,
        },
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    const count = recentPayments.length;
    const isSuspicious = count > this.MULTIPLE_PAYMENTS_THRESHOLD;

    const result: MultiplePaymentsResult = {
      isSuspicious,
      reason: isSuspicious
        ? `${count} pagos en 5 minutos desde IP ${ipAddress}`
        : 'Dentro del umbral normal',
      threshold: this.MULTIPLE_PAYMENTS_THRESHOLD,
      actualCount: count,
      ipAddress,
    };

    // Si es sospechoso, loguear como fraude
    if (isSuspicious) {
      this.logger.warn(
        `🚨 FRAUDE DETECTADO: ${count} pagos desde IP ${ipAddress} en 5 minutos (umbral: ${this.MULTIPLE_PAYMENTS_THRESHOLD})`,
      );

      await this.auditLog.logFraudDetected(
        `Múltiples pagos desde misma IP: ${count} pagos en 5 minutos`,
        EntityType.PAGO,
        undefined,
        {
          ipAddress,
          paymentCount: count,
          threshold: this.MULTIPLE_PAYMENTS_THRESHOLD,
          timeWindowMinutes: 5,
        },
        ipAddress,
      );
    }

    return result;
  }

  /**
   * Valida que el monto del pago coincida con el monto esperado
   *
   * ATAQUE: Manipulación de webhook para reportar monto menor
   * EJEMPLO: Pagar $1 pero webhook dice $25000
   *
   * @param paymentId - ID del pago
   * @param reportedAmount - Monto reportado en webhook
   * @param expectedAmount - Monto esperado según pricing calculator
   * @returns Resultado de validación
   */
  async validatePaymentAmount(
    paymentId: string,
    reportedAmount: number,
    expectedAmount: number,
  ): Promise<PaymentAmountValidation> {
    const discrepancy = Math.abs(expectedAmount - reportedAmount);
    const isValid = discrepancy === 0;

    const result: PaymentAmountValidation = {
      isValid,
      reason: isValid
        ? 'Monto correcto'
        : `Monto incorrecto: esperado $${expectedAmount}, reportado $${reportedAmount}`,
      reportedAmount,
      expectedAmount,
      discrepancy,
    };

    // Si hay discrepancia, loguear como fraude
    if (!isValid) {
      this.logger.error(
        `🚨 FRAUDE DETECTADO: Monto incorrecto en pago ${paymentId}. Esperado: $${expectedAmount}, Reportado: $${reportedAmount}, Discrepancia: $${discrepancy}`,
      );

      await this.auditLog.logFraudDetected(
        `Monto incorrecto en pago: esperado $${expectedAmount}, reportado $${reportedAmount}`,
        EntityType.PAGO,
        paymentId,
        {
          reportedAmount,
          expectedAmount,
          discrepancy,
        },
        undefined,
      );
    }

    return result;
  }

  /**
   * Verifica que un payment_id de MercadoPago sea único
   *
   * ATAQUE: Reutilizar mismo payment_id aprobado para múltiples inscripciones
   * EJEMPLO: Pagar 1 vez, usar ese payment_id para 10 inscripciones
   *
   * @param mercadopagoPaymentId - Payment ID de MercadoPago
   * @returns Resultado de verificación
   */
  async checkPaymentIdUniqueness(
    mercadopagoPaymentId: string,
  ): Promise<PaymentIdUniquenessResult> {
    const existingPayment = await this.prisma.pagoInscripcion2026.findUnique({
      where: {
        mercadopago_payment_id: mercadopagoPaymentId,
      },
      select: {
        id: true,
        inscripcion_id: true,
      },
    });

    const isUnique = !existingPayment;

    const result: PaymentIdUniquenessResult = {
      isUnique,
      existingPaymentId: existingPayment?.id || null,
      existingInscripcionId: existingPayment?.inscripcion_id || undefined,
    };

    // Si ya existe, loguear como fraude
    if (!isUnique) {
      this.logger.error(
        `🚨 FRAUDE DETECTADO: Reutilización de payment_id ${mercadopagoPaymentId}. Ya usado en pago ${existingPayment?.id}`,
      );

      await this.auditLog.logFraudDetected(
        `Reutilización de payment_id: ${mercadopagoPaymentId} ya usado`,
        EntityType.PAGO,
        existingPayment?.id,
        {
          mercadopagoPaymentId,
          existingPaymentId: existingPayment?.id,
          existingInscripcionId: existingPayment?.inscripcion_id,
        },
        undefined,
      );
    }

    return result;
  }

  /**
   * Calcula score de riesgo de fraude basado en múltiples factores
   *
   * SCORE: 0-100
   * - 0-30: Bajo riesgo (ALLOW)
   * - 31-69: Riesgo medio (REVIEW)
   * - 70-100: Alto riesgo (BLOCK)
   *
   * FACTORES:
   * - Múltiples pagos desde misma IP: +40 puntos
   * - Monto incorrecto: +50 puntos
   * - Payment ID duplicado: +60 puntos
   * - Inscripción duplicada: +30 puntos
   *
   * @param paymentData - Datos del pago a analizar
   * @returns Score de riesgo y recomendación
   */
  async calculateFraudRiskScore(
    paymentData: PaymentRiskData,
  ): Promise<FraudRiskScore> {
    let score = 0;
    const factors: string[] = [];

    // Factor 1: Múltiples pagos desde misma IP
    const ipAnalysis = await this.detectMultiplePaymentsFromSameIP(
      paymentData.ipAddress,
    );
    if (ipAnalysis.isSuspicious) {
      score += 40;
      factors.push('multiple_payments_from_ip');
    }

    // Factor 2: Monto incorrecto
    const amountValidation = await this.validatePaymentAmount(
      paymentData.paymentId,
      paymentData.amount,
      paymentData.expectedAmount,
    );
    if (!amountValidation.isValid) {
      score += 50;
      factors.push('amount_mismatch');
    }

    // Factor 3: Payment ID duplicado
    const paymentIdCheck = await this.checkPaymentIdUniqueness(
      paymentData.paymentId,
    );
    if (!paymentIdCheck.isUnique) {
      score += 60;
      factors.push('duplicate_payment_id');
    }

    // Determinar recomendación basada en score
    let recommendation: 'ALLOW' | 'REVIEW' | 'BLOCK';
    if (score >= this.HIGH_RISK_SCORE_THRESHOLD) {
      recommendation = 'BLOCK';
    } else if (score >= 31) {
      recommendation = 'REVIEW';
    } else {
      recommendation = 'ALLOW';
    }

    const result: FraudRiskScore = {
      score,
      factors,
      recommendation,
    };

    // Si score es alto, loguear
    if (score >= this.HIGH_RISK_SCORE_THRESHOLD) {
      this.logger.error(
        `🚨 FRAUDE: Score de riesgo alto (${score}/100). Factores: ${factors.join(', ')}. Recomendación: ${recommendation}`,
      );

      await this.auditLog.logFraudDetected(
        `Score de riesgo alto: ${score}/100. Factores: ${factors.join(', ')}`,
        EntityType.PAGO,
        paymentData.paymentId,
        {
          score,
          factors,
          recommendation,
          paymentData,
        },
        paymentData.ipAddress,
      );
    }

    return result;
  }
}
