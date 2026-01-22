import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../core/database/prisma.service';
import { RedisService } from '../../core/redis/redis.service';

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

  // Cache configuration (PASO 3.1.B)
  private readonly CACHE_TTL = 120; // 2 minutos
  private readonly CACHE_PREFIX = 'payment:amount:';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /**
   * Valida el monto de una inscripción mensual (con Redis caching - PASO 3.1.B)
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
    const cacheKey = `${this.CACHE_PREFIX}InscripcionMensual:${inscripcionId}`;
    let expectedAmount: number;

    // 1. Intentar recuperar desde cache
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached !== null) {
        expectedAmount = Number(cached);
        this.logger.debug(`✅ Cache HIT: ${cacheKey}`);
        return this.compareAmounts(
          expectedAmount,
          receivedAmount,
          'InscripcionMensual',
          inscripcionId,
        );
      }
      this.logger.debug(`❌ Cache MISS: ${cacheKey}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Redis error: ${errorMessage} - fallback a DB`);
    }

    // 2. Cache miss → consultar DB
    const inscripcion = await this.prisma.inscripcionMensual.findUnique({
      where: { id: inscripcionId },
      select: {
        precioFinal: true,
      },
    });

    if (!inscripcion) {
      throw new BadRequestException(
        `Inscripción mensual ${inscripcionId} no encontrada`,
      );
    }

    expectedAmount = Number(inscripcion.precioFinal);

    // 3. Guardar en cache
    try {
      await this.redis.set(cacheKey, String(expectedAmount), this.CACHE_TTL);
    } catch {
      // Fallback silencioso
    }

    return this.compareAmounts(
      expectedAmount,
      receivedAmount,
      'InscripcionMensual',
      inscripcionId,
    );
  }

  /**
   * Valida el monto de un pago de colonia (con Redis caching - PASO 3.1.B)
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
    const cacheKey = `${this.CACHE_PREFIX}ColoniaPago:${pagoId}`;
    let expectedAmount: number;

    // 1. Intentar recuperar desde cache
    try {
      const cached = await this.redis.get(cacheKey);
      if (cached !== null) {
        expectedAmount = Number(cached);
        this.logger.debug(`✅ Cache HIT: ${cacheKey}`);
        return this.compareAmounts(
          expectedAmount,
          receivedAmount,
          'ColoniaPago',
          pagoId,
        );
      }
      this.logger.debug(`❌ Cache MISS: ${cacheKey}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.warn(`⚠️ Redis error: ${errorMessage} - fallback a DB`);
    }

    // 2. Cache miss → consultar DB
    const pago = await this.prisma.coloniaPago.findUnique({
      where: { id: pagoId },
      select: {
        monto: true,
      },
    });

    if (!pago) {
      throw new BadRequestException(`Pago de colonia ${pagoId} no encontrado`);
    }

    expectedAmount = Number(pago.monto);

    // 3. Guardar en cache
    try {
      await this.redis.set(cacheKey, String(expectedAmount), this.CACHE_TTL);
    } catch {
      // Fallback silencioso
    }

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
   * Parsea el externalReference para determinar el tipo y extraer el ID,
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
