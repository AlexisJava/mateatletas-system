import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';

/**
 * Resultado de validación de monto
 */
export interface AmountValidationResult {
  /** Indica si la validación pasó */
  isValid: boolean;
  /** Monto esperado según la base de datos */
  expectedAmount: number;
  /** Monto recibido en el pago */
  receivedAmount: number;
  /** Diferencia absoluta entre montos */
  difference?: number;
  /** Razón del fallo (si isValid = false) */
  reason?: string;
}

/**
 * Servicio de Validación de Montos de Pagos
 *
 * PROBLEMA QUE RESUELVE:
 * Actualmente el webhook aprueba cualquier pago sin verificar que el
 * `transaction_amount` coincida con el precio esperado.
 *
 * ESCENARIO DE ATAQUE:
 * 1. Cliente crea inscripción de $5000
 * 2. Atacante intercepta request y cambia monto a $50
 * 3. MercadoPago cobra $50
 * 4. Webhook aprueba porque status='approved'
 * 5. Cliente obtiene servicio de $5000 pagando solo $50
 *
 * SOLUCIÓN:
 * - Antes de aprobar un pago, comparar transaction_amount con precio en DB
 * - Rechazar si la diferencia supera la tolerancia (1% para redondeos)
 * - Emitir evento de fraude detectado para alertas
 *
 * TOLERANCIA:
 * - Se permite 1% de diferencia para manejar redondeos de MercadoPago
 * - Ejemplo: $10,000.00 vs $10,000.50 → VÁLIDO
 * - Ejemplo: $10,000.00 vs $5,000.00 → FRAUDE
 *
 * @injectable
 */
@Injectable()
export class PaymentAmountValidatorService {
  private readonly logger = new Logger(PaymentAmountValidatorService.name);

  // Tolerancia de 1% para diferencias por redondeo
  private readonly TOLERANCE_PERCENTAGE = 0.01;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Valida el monto de una inscripción mensual
   *
   * @param inscripcionId - ID de la inscripción
   * @param receivedAmount - Monto recibido en el pago
   * @returns Resultado de la validación
   * @throws BadRequestException si la inscripción no existe
   */
  async validateInscripcionMensual(
    inscripcionId: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    const inscripcion = await this.prisma.inscripcionMensual.findUnique({
      where: { id: inscripcionId },
      select: {
        precio_final: true,
      },
    });

    if (!inscripcion) {
      throw new BadRequestException(
        `Inscripción mensual ${inscripcionId} no encontrada`,
      );
    }

    const expectedAmount = Number(inscripcion.precio_final);

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      'InscripcionMensual',
      inscripcionId,
    );
  }

  /**
   * Valida el monto de una membresía
   *
   * @param membresiaId - ID de la membresía
   * @param receivedAmount - Monto recibido en el pago
   * @returns Resultado de la validación
   * @throws BadRequestException si la membresía no existe
   */
  async validateMembresia(
    membresiaId: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    const membresia = await this.prisma.membresia.findUnique({
      where: { id: membresiaId },
      include: {
        producto: true,
      },
    });

    if (!membresia) {
      throw new BadRequestException(
        `Membresía ${membresiaId} no encontrada`,
      );
    }

    const expectedAmount = Number(membresia.producto.precio);

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      'Membresia',
      membresiaId,
    );
  }

  /**
   * Valida el monto de una inscripción 2026
   *
   * @param inscripcionId - ID de la inscripción 2026
   * @param receivedAmount - Monto recibido en el pago
   * @returns Resultado de la validación
   * @throws BadRequestException si la inscripción no existe
   */
  async validateInscripcion2026(
    inscripcionId: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    const inscripcion = await this.prisma.inscripcion2026.findUnique({
      where: { id: inscripcionId },
      select: {
        total_mensual_actual: true,
      },
    });

    if (!inscripcion) {
      throw new BadRequestException(
        `Inscripción 2026 ${inscripcionId} no encontrada`,
      );
    }

    const expectedAmount = Number(inscripcion.total_mensual_actual);

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      'Inscripcion2026',
      inscripcionId,
    );
  }

  /**
   * Valida el monto de un pago de inscripción 2026 (mensualidad o matrícula)
   *
   * @param pagoId - ID del pago
   * @param receivedAmount - Monto recibido
   * @returns Resultado de la validación
   * @throws BadRequestException si el pago no existe
   */
  async validatePagoInscripcion2026(
    pagoId: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    const pago = await this.prisma.pagoInscripcion2026.findUnique({
      where: { id: pagoId },
      select: {
        monto: true,
        tipo: true,
      },
    });

    if (!pago) {
      throw new BadRequestException(
        `Pago inscripción 2026 ${pagoId} no encontrado`,
      );
    }

    const expectedAmount = Number(pago.monto);

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      `PagoInscripcion2026-${pago.tipo}`,
      pagoId,
    );
  }

  /**
   * Valida el monto de un pago de colonia
   *
   * @param pagoId - ID del pago de colonia
   * @param receivedAmount - Monto recibido
   * @returns Resultado de la validación
   * @throws BadRequestException si el pago no existe
   */
  async validateColoniaPago(
    pagoId: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    const pago = await this.prisma.coloniaPago.findUnique({
      where: { id: pagoId },
      select: {
        monto: true,
      },
    });

    if (!pago) {
      throw new BadRequestException(
        `Pago de colonia ${pagoId} no encontrado`,
      );
    }

    const expectedAmount = Number(pago.monto);

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      'ColoniaPago',
      pagoId,
    );
  }

  /**
   * Compara montos con tolerancia y retorna resultado de validación
   *
   * @param expected - Monto esperado
   * @param received - Monto recibido
   * @param type - Tipo de entidad (para logging)
   * @param entityId - ID de la entidad (para logging)
   * @returns Resultado de la validación
   */
  private compareAmounts(
    expected: number,
    received: number,
    type: string,
    entityId: string,
  ): AmountValidationResult {
    const difference = Math.abs(expected - received);
    const tolerance = expected * this.TOLERANCE_PERCENTAGE;

    const isValid = difference <= tolerance;

    if (!isValid) {
      this.logger.error(
        `🚨 FRAUDE DETECTADO - Validación de monto FALLIDA
        Tipo: ${type}
        ID: ${entityId}
        Esperado: $${expected.toFixed(2)}
        Recibido: $${received.toFixed(2)}
        Diferencia: $${difference.toFixed(2)}
        Tolerancia permitida: $${tolerance.toFixed(2)} (1%)
        ⚠️ ESTE PAGO NO SERÁ PROCESADO`,
      );
    } else {
      this.logger.log(
        `✅ Validación de monto exitosa - ${type} ${entityId}: Esperado $${expected.toFixed(2)}, Recibido $${received.toFixed(2)}`,
      );
    }

    return {
      isValid,
      expectedAmount: expected,
      receivedAmount: received,
      difference,
      reason: isValid
        ? undefined
        : `Amount mismatch: expected $${expected.toFixed(2)}, received $${received.toFixed(2)}. Difference of $${difference.toFixed(2)} exceeds tolerance of $${tolerance.toFixed(2)}`,
    };
  }

  /**
   * Valida monto según tipo de external reference (helper genérico)
   *
   * Parsea el external_reference para determinar el tipo y extraer el ID,
   * luego delega al método específico.
   *
   * @param externalRef - External reference del pago
   * @param receivedAmount - Monto recibido
   * @returns Resultado de la validación
   * @throws BadRequestException si el formato es inválido
   */
  async validateByExternalReference(
    externalRef: string,
    receivedAmount: number,
  ): Promise<AmountValidationResult> {
    // Inscripción mensual: "inscripcion-{id}-estudiante-{id}-producto-{id}"
    if (
      externalRef.startsWith('inscripcion-') &&
      externalRef.includes('-estudiante-')
    ) {
      const match = externalRef.match(/inscripcion-([^-]+)/);
      const inscripcionId = match ? match[1] : null;

      if (inscripcionId) {
        return this.validateInscripcionMensual(inscripcionId, receivedAmount);
      }
    }

    // Membresía: "membresia-{id}-tutor-{id}-producto-{id}"
    if (externalRef.startsWith('membresia-')) {
      const match = externalRef.match(/membresia-([^-]+)/);
      const membresiaId = match ? match[1] : null;

      if (membresiaId) {
        return this.validateMembresia(membresiaId, receivedAmount);
      }
    }

    // Inscripción 2026: "inscripcion2026-{id}-tutor-{id}-tipo-{tipo}"
    if (externalRef.startsWith('inscripcion2026-')) {
      const match = externalRef.match(/inscripcion2026-([^-]+)/);
      const inscripcionId = match ? match[1] : null;

      if (inscripcionId) {
        return this.validateInscripcion2026(inscripcionId, receivedAmount);
      }
    }

    // ID directo (puede ser colonia u otro)
    if (/^[a-zA-Z0-9-_]+$/.test(externalRef)) {
      // Intentar como pago de colonia
      try {
        return await this.validateColoniaPago(externalRef, receivedAmount);
      } catch {
        // Si falla, puede ser otro tipo
      }
    }

    throw new BadRequestException(
      `Cannot determine payment type from external reference: ${externalRef}`,
    );
  }
}
