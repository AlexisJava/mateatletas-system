/**
 * Tests de Constantes para Suscripciones
 *
 * REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
 * Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
 *
 * Verifican:
 * - Mapeo de estados MP PreApproval → EstadoSuscripcion interno
 * - Cálculo de descuento familiar (hijo 1 = 0%, hijo 2 = 10%, hijo 3 = 20%, etc.)
 * - Constantes de grace period (3 días)
 * - Precios de planes
 */
import {
  GRACE_PERIOD_DIAS,
  NOTIFICACION_PRE_COBRO_DIAS,
  PLANES_PRECIOS,
  TipoPlan,
} from '../domain/constants/suscripcion.constants';

import {
  DESCUENTO_POR_HIJO_ADICIONAL,
  calcularDescuentoFamiliar,
  calcularPrecioConDescuento,
} from '../domain/constants/descuento-familiar.constants';

import {
  MpPreapprovalStatus,
  mapearEstadoPreapproval,
  esEstadoActivo,
  esEstadoFinal,
} from '../domain/constants/mp-preapproval-status.constants';

import { EstadoSuscripcion } from '@prisma/client';

describe('Constantes de Suscripción', () => {
  describe('suscripcion.constants', () => {
    describe('GRACE_PERIOD_DIAS', () => {
      it('debe ser 3 días', () => {
        expect(GRACE_PERIOD_DIAS).toBe(3);
      });
    });

    // REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
    // Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.

    describe('NOTIFICACION_PRE_COBRO_DIAS', () => {
      it('debe ser 3 días antes del cobro', () => {
        expect(NOTIFICACION_PRE_COBRO_DIAS).toBe(3);
      });
    });

    describe('PLANES_PRECIOS', () => {
      it('debe tener precio de STEAM_LIBROS = 40000', () => {
        expect(PLANES_PRECIOS[TipoPlan.STEAM_LIBROS]).toBe(40000);
      });

      it('debe tener precio de STEAM_ASINCRONICO = 65000', () => {
        expect(PLANES_PRECIOS[TipoPlan.STEAM_ASINCRONICO]).toBe(65000);
      });

      it('debe tener precio de STEAM_SINCRONICO = 95000', () => {
        expect(PLANES_PRECIOS[TipoPlan.STEAM_SINCRONICO]).toBe(95000);
      });

      it('debe tener exactamente 3 planes definidos', () => {
        expect(Object.keys(PLANES_PRECIOS)).toHaveLength(3);
      });
    });
  });

  describe('descuento-familiar.constants', () => {
    describe('DESCUENTO_POR_HIJO_ADICIONAL', () => {
      it('debe ser 10%', () => {
        expect(DESCUENTO_POR_HIJO_ADICIONAL).toBe(10);
      });
    });

    describe('calcularDescuentoFamiliar', () => {
      it('debe retornar 0% para el primer hijo', () => {
        expect(calcularDescuentoFamiliar(1)).toBe(0);
      });

      it('debe retornar 10% para el segundo hijo', () => {
        expect(calcularDescuentoFamiliar(2)).toBe(10);
      });

      it('debe retornar 20% para el tercer hijo', () => {
        expect(calcularDescuentoFamiliar(3)).toBe(20);
      });

      it('debe retornar 30% para el cuarto hijo', () => {
        expect(calcularDescuentoFamiliar(4)).toBe(30);
      });

      it('debe retornar 0% para numeroHijo <= 0 (inválido)', () => {
        expect(calcularDescuentoFamiliar(0)).toBe(0);
        expect(calcularDescuentoFamiliar(-1)).toBe(0);
      });

      it('debe tener un máximo de 50% de descuento', () => {
        // Para evitar descuentos mayores al 50%
        expect(calcularDescuentoFamiliar(10)).toBeLessThanOrEqual(50);
      });
    });

    describe('calcularPrecioConDescuento', () => {
      it('debe calcular precio sin descuento para primer hijo', () => {
        const precioBase = 40000;
        const resultado = calcularPrecioConDescuento(precioBase, 1);

        expect(resultado.precioBase).toBe(40000);
        expect(resultado.descuentoPorcentaje).toBe(0);
        expect(resultado.descuentoMonto).toBe(0);
        expect(resultado.precioFinal).toBe(40000);
      });

      it('debe calcular 10% descuento para segundo hijo', () => {
        const precioBase = 40000;
        const resultado = calcularPrecioConDescuento(precioBase, 2);

        expect(resultado.precioBase).toBe(40000);
        expect(resultado.descuentoPorcentaje).toBe(10);
        expect(resultado.descuentoMonto).toBe(4000);
        expect(resultado.precioFinal).toBe(36000);
      });

      it('debe calcular 20% descuento para tercer hijo', () => {
        const precioBase = 65000;
        const resultado = calcularPrecioConDescuento(precioBase, 3);

        expect(resultado.precioBase).toBe(65000);
        expect(resultado.descuentoPorcentaje).toBe(20);
        expect(resultado.descuentoMonto).toBe(13000);
        expect(resultado.precioFinal).toBe(52000);
      });

      it('debe manejar números decimales correctamente', () => {
        const precioBase = 95000;
        const resultado = calcularPrecioConDescuento(precioBase, 2);

        // 10% de 95000 = 9500
        expect(resultado.descuentoMonto).toBe(9500);
        expect(resultado.precioFinal).toBe(85500);
      });
    });
  });

  describe('mp-preapproval-status.constants', () => {
    describe('MpPreapprovalStatus enum', () => {
      it('debe tener todos los estados de MercadoPago PreApproval', () => {
        expect(MpPreapprovalStatus.PENDING).toBe('pending');
        expect(MpPreapprovalStatus.AUTHORIZED).toBe('authorized');
        expect(MpPreapprovalStatus.PAUSED).toBe('paused');
        expect(MpPreapprovalStatus.CANCELLED).toBe('cancelled');
      });
    });

    describe('mapearEstadoPreapproval', () => {
      it('debe mapear pending → PENDIENTE', () => {
        expect(mapearEstadoPreapproval(MpPreapprovalStatus.PENDING)).toBe(
          EstadoSuscripcion.PENDIENTE,
        );
      });

      it('debe mapear authorized → ACTIVA', () => {
        expect(mapearEstadoPreapproval(MpPreapprovalStatus.AUTHORIZED)).toBe(
          EstadoSuscripcion.ACTIVA,
        );
      });

      it('debe mapear paused → PAUSADA', () => {
        expect(mapearEstadoPreapproval(MpPreapprovalStatus.PAUSED)).toBe(
          EstadoSuscripcion.PAUSADA,
        );
      });

      it('debe mapear cancelled → CANCELADA', () => {
        expect(mapearEstadoPreapproval(MpPreapprovalStatus.CANCELLED)).toBe(
          EstadoSuscripcion.CANCELADA,
        );
      });

      it('debe mapear estados desconocidos a PENDIENTE', () => {
        expect(
          mapearEstadoPreapproval('unknown_status' as MpPreapprovalStatus),
        ).toBe(EstadoSuscripcion.PENDIENTE);
      });

      it('debe ser case-insensitive', () => {
        expect(
          mapearEstadoPreapproval('AUTHORIZED' as MpPreapprovalStatus),
        ).toBe(EstadoSuscripcion.ACTIVA);
        expect(
          mapearEstadoPreapproval('Authorized' as MpPreapprovalStatus),
        ).toBe(EstadoSuscripcion.ACTIVA);
      });
    });

    describe('esEstadoActivo', () => {
      it('debe retornar true para authorized', () => {
        expect(esEstadoActivo(MpPreapprovalStatus.AUTHORIZED)).toBe(true);
      });

      it('debe retornar false para pending', () => {
        expect(esEstadoActivo(MpPreapprovalStatus.PENDING)).toBe(false);
      });

      it('debe retornar false para paused', () => {
        expect(esEstadoActivo(MpPreapprovalStatus.PAUSED)).toBe(false);
      });

      it('debe retornar false para cancelled', () => {
        expect(esEstadoActivo(MpPreapprovalStatus.CANCELLED)).toBe(false);
      });
    });

    describe('esEstadoFinal', () => {
      it('debe retornar true para cancelled', () => {
        expect(esEstadoFinal(MpPreapprovalStatus.CANCELLED)).toBe(true);
      });

      it('debe retornar false para pending', () => {
        expect(esEstadoFinal(MpPreapprovalStatus.PENDING)).toBe(false);
      });

      it('debe retornar false para authorized', () => {
        expect(esEstadoFinal(MpPreapprovalStatus.AUTHORIZED)).toBe(false);
      });

      it('debe retornar false para paused', () => {
        expect(esEstadoFinal(MpPreapprovalStatus.PAUSED)).toBe(false);
      });
    });
  });

  describe('Reglas de Negocio Integradas', () => {
    describe('Escenario: Familia con 3 hijos en plan STEAM_LIBROS', () => {
      it('debe calcular precios correctos para cada hijo', () => {
        const precioBase = PLANES_PRECIOS[TipoPlan.STEAM_LIBROS];

        const hijo1 = calcularPrecioConDescuento(precioBase, 1);
        const hijo2 = calcularPrecioConDescuento(precioBase, 2);
        const hijo3 = calcularPrecioConDescuento(precioBase, 3);

        // Hijo 1: $40,000 (0% descuento)
        expect(hijo1.precioFinal).toBe(40000);

        // Hijo 2: $36,000 (10% descuento)
        expect(hijo2.precioFinal).toBe(36000);

        // Hijo 3: $32,000 (20% descuento)
        expect(hijo3.precioFinal).toBe(32000);

        // Total familia: $108,000 en lugar de $120,000
        const totalFamilia =
          hijo1.precioFinal + hijo2.precioFinal + hijo3.precioFinal;
        expect(totalFamilia).toBe(108000);

        // Ahorro total: $12,000
        const ahorroTotal =
          hijo1.descuentoMonto + hijo2.descuentoMonto + hijo3.descuentoMonto;
        expect(ahorroTotal).toBe(12000);
      });
    });

    describe('Escenario: Grace period y mora', () => {
      it('debe calcular correctamente el período de gracia', () => {
        // Usar UTC para evitar problemas de timezone
        const fechaCobro = new Date(Date.UTC(2025, 0, 15)); // 15 enero 2025 UTC
        const fechaLimiteGracia = new Date(fechaCobro);
        fechaLimiteGracia.setUTCDate(
          fechaLimiteGracia.getUTCDate() + GRACE_PERIOD_DIAS,
        );

        expect(fechaLimiteGracia.getUTCDate()).toBe(18); // 15 + 3 días
      });
    });

    describe('Escenario: Notificación pre-cobro', () => {
      it('debe calcular fecha de notificación correctamente', () => {
        // Usar UTC para evitar problemas de timezone
        const fechaProximoCobro = new Date(Date.UTC(2025, 1, 1)); // 1 feb 2025 UTC
        const fechaNotificacion = new Date(fechaProximoCobro);
        fechaNotificacion.setUTCDate(
          fechaNotificacion.getUTCDate() - NOTIFICACION_PRE_COBRO_DIAS,
        );

        expect(fechaNotificacion.getUTCDate()).toBe(29); // 1 feb - 3 días = 29 ene
        expect(fechaNotificacion.getUTCMonth()).toBe(0); // Enero
      });
    });
  });
});
