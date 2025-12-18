import { Injectable } from '@nestjs/common';
import {
  EstadoPago,
  EstadoMercadoPago,
  mapearEstadoMercadoPago,
} from '../../domain/constants';

import {
  EstadoMembresia,
  EstadoPago as EstadoPagoPrisma,
} from '@prisma/client';

/**
 * Resultado de mapeo para estados de membresía
 */
export interface EstadoMembresiaResult {
  estadoPago: EstadoPago;
  estadoMembresia: EstadoMembresia; // Pendiente, Activa, Atrasada, Cancelada
}

/**
 * Resultado de mapeo para estados de inscripción (estado_pago enum Prisma)
 */
export interface EstadoInscripcionResult {
  estadoPago: EstadoPago;
  estadoInscripcion: EstadoPagoPrisma; // Pendiente, Pagado, Vencido, Parcial, Becado
}

/**
 * Servicio de mapeo de estados de pago
 *
 * Responsabilidades:
 * - Mapear estados de MercadoPago a estados internos del sistema
 * - Mapear estados de pago a estados de membresía
 * - Mapear estados de pago a estados de inscripción
 * - Validar estados de pago
 *
 * Este servicio centraliza toda la lógica de mapeo de estados
 * que antes estaba duplicada en múltiples lugares (shotgun surgery)
 */
@Injectable()
export class PaymentStateMapperService {
  /**
   * Mapea estado de MercadoPago a estado interno de pago
   *
   * Usa la función centralizada de domain/constants
   *
   * @param estadoMP - Estado de MercadoPago (approved, rejected, etc.)
   * @returns Estado interno del sistema
   */
  mapearEstadoPago(estadoMP: string): EstadoPago {
    return mapearEstadoMercadoPago(estadoMP);
  }

  /**
   * Mapea estado de pago a estado de membresía
   *
   * Reglas de negocio:
   * - PAGADO → Activa (membresía habilitada)
   * - CANCELADO/RECHAZADO → Pendiente (permitir reintentar)
   * - EXPIRADO → Atrasada (membresía vencida)
   * - PENDIENTE → Pendiente (esperando confirmación)
   * - REEMBOLSADO → Cancelada (refund/chargeback, pierde acceso inmediatamente)
   *
   * @param estadoPago - Estado interno de pago
   * @returns Estado de membresía según reglas de negocio (EstadoMembresia de Prisma)
   */
  mapearEstadoMembresia(
    estadoPago: EstadoPago,
  ): EstadoMembresiaResult['estadoMembresia'] {
    switch (estadoPago) {
      case EstadoPago.PAGADO:
        return EstadoMembresia.Activa;
      case EstadoPago.CANCELADO:
      case EstadoPago.RECHAZADO:
        return EstadoMembresia.Pendiente; // Permitir reintentar
      case EstadoPago.EXPIRADO:
        return EstadoMembresia.Atrasada;
      case EstadoPago.REEMBOLSADO:
        // CRÍTICO: Refund o chargeback debe desactivar la membresía
        // El usuario pierde acceso inmediatamente
        return EstadoMembresia.Cancelada;
      case EstadoPago.PENDIENTE:
      default:
        return EstadoMembresia.Pendiente;
    }
  }

  /**
   * Mapea estado de pago interno a estado de inscripción (EstadoPago de Prisma)
   *
   * Reglas de negocio:
   * - PAGADO → Pagado (inscripción pagada)
   * - CANCELADO/RECHAZADO → Pendiente (permitir reintentar)
   * - EXPIRADO → Vencido (pago vencido)
   * - PENDIENTE → Pendiente (esperando confirmación)
   * - REEMBOLSADO → Vencido (refund/chargeback, inscripción invalidada)
   *
   * @param estadoPago - Estado interno de pago
   * @returns Estado de inscripción según reglas de negocio (EstadoPago de Prisma)
   */
  mapearEstadoInscripcion(
    estadoPago: EstadoPago,
  ): EstadoInscripcionResult['estadoInscripcion'] {
    switch (estadoPago) {
      case EstadoPago.PAGADO:
        return EstadoPagoPrisma.Pagado;
      case EstadoPago.CANCELADO:
      case EstadoPago.RECHAZADO:
        return EstadoPagoPrisma.Pendiente; // Permitir reintentar
      case EstadoPago.EXPIRADO:
      case EstadoPago.REEMBOLSADO:
        // Refund/chargeback invalida la inscripción (usa Vencido ya que no hay Cancelado en enum)
        return EstadoPagoPrisma.Vencido;
      case EstadoPago.PENDIENTE:
      default:
        return EstadoPagoPrisma.Pendiente;
    }
  }

  /**
   * Procesa estado completo de membresía desde MercadoPago
   *
   * Combina mapeo de estado MP → estado pago → estado membresía
   *
   * @param estadoMP - Estado de MercadoPago
   * @returns Objeto con estado de pago y estado de membresía
   */
  procesarEstadoMembresia(estadoMP: string): EstadoMembresiaResult {
    const estadoPago = this.mapearEstadoPago(estadoMP);
    const estadoMembresia = this.mapearEstadoMembresia(estadoPago);

    return { estadoPago, estadoMembresia };
  }

  /**
   * Procesa estado completo de inscripción desde MercadoPago
   *
   * Combina mapeo de estado MP → estado pago → estado inscripción
   *
   * @param estadoMP - Estado de MercadoPago
   * @returns Objeto con estado de pago y estado de inscripción
   */
  procesarEstadoInscripcion(estadoMP: string): EstadoInscripcionResult {
    const estadoPago = this.mapearEstadoPago(estadoMP);
    const estadoInscripcion = this.mapearEstadoInscripcion(estadoPago);

    return { estadoPago, estadoInscripcion };
  }

  /**
   * Valida si un estado de MercadoPago es válido
   *
   * @param estadoMP - Estado a validar
   * @returns true si el estado es válido
   */
  esEstadoValido(estadoMP: string): boolean {
    return Object.values(EstadoMercadoPago).includes(
      estadoMP as EstadoMercadoPago,
    );
  }

  /**
   * Determina si un estado representa un pago exitoso
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si el pago fue exitoso
   */
  esPagoExitoso(estadoPago: EstadoPago): boolean {
    return estadoPago === EstadoPago.PAGADO;
  }

  /**
   * Determina si un estado representa un pago fallido
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si el pago falló
   */
  esPagoFallido(estadoPago: EstadoPago): boolean {
    return [EstadoPago.RECHAZADO, EstadoPago.CANCELADO].includes(estadoPago);
  }

  /**
   * Determina si un estado permite reintentar el pago
   *
   * @param estadoPago - Estado de pago a evaluar
   * @returns true si se puede reintentar
   */
  permiteReintentar(estadoPago: EstadoPago): boolean {
    return [
      EstadoPago.PENDIENTE,
      EstadoPago.RECHAZADO,
      EstadoPago.CANCELADO,
    ].includes(estadoPago);
  }
}
