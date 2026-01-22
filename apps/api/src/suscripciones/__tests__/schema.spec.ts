/**
 * Tests de Schema Prisma para Suscripciones
 *
 * Verifican que los modelos y enums de Prisma están correctamente generados.
 * Estos tests NO requieren conexión a base de datos - solo verifican
 * que los tipos TypeScript generados por Prisma existen y son correctos.
 *
 * Para tests de integración con DB real, ver schema.integration.spec.ts
 */
import {
  Prisma,
  EstadoSuscripcion,
  IntervaloSuscripcion,
} from '@prisma/client';

describe('Schema de Suscripciones (Tipos Prisma)', () => {
  describe('Enums', () => {
    describe('EstadoSuscripcion', () => {
      it('debe tener todos los estados definidos', () => {
        expect(EstadoSuscripcion.PENDIENTE).toBe('PENDIENTE');
        expect(EstadoSuscripcion.ACTIVA).toBe('ACTIVA');
        expect(EstadoSuscripcion.EN_GRACIA).toBe('EN_GRACIA');
        expect(EstadoSuscripcion.MOROSA).toBe('MOROSA');
        expect(EstadoSuscripcion.PAUSADA).toBe('PAUSADA');
        expect(EstadoSuscripcion.CANCELADA).toBe('CANCELADA');
      });

      it('debe tener exactamente 6 estados', () => {
        const estados = Object.values(EstadoSuscripcion);
        expect(estados).toHaveLength(6);
      });
    });

    describe('IntervaloSuscripcion', () => {
      it('debe tener todos los intervalos definidos', () => {
        expect(IntervaloSuscripcion.DIARIO).toBe('DIARIO');
        expect(IntervaloSuscripcion.SEMANAL).toBe('SEMANAL');
        expect(IntervaloSuscripcion.MENSUAL).toBe('MENSUAL');
        expect(IntervaloSuscripcion.ANUAL).toBe('ANUAL');
      });

      it('debe tener exactamente 4 intervalos', () => {
        const intervalos = Object.values(IntervaloSuscripcion);
        expect(intervalos).toHaveLength(4);
      });
    });
  });

  describe('PlanSuscripcion', () => {
    it('debe tener los campos requeridos en el tipo', () => {
      // Verificar que el tipo existe y tiene la estructura correcta
      const planInput: Prisma.PlanSuscripcionCreateInput = {
        nombre: 'STEAM_LIBROS',
        precioBase: 40000,
      };

      expect(planInput.nombre).toBe('STEAM_LIBROS');
      expect(planInput.precioBase).toBe(40000);
    });

    it('debe permitir campos opcionales', () => {
      const planInput: Prisma.PlanSuscripcionCreateInput = {
        nombre: 'STEAM_ASINCRONICO',
        descripcion: 'Plan con clases asincrónicas',
        precioBase: 65000,
        moneda: 'ARS',
        intervalo: IntervaloSuscripcion.MENSUAL,
        intervaloCantidad: 1,
        activo: true,
      };

      expect(planInput.descripcion).toBe('Plan con clases asincrónicas');
      expect(planInput.moneda).toBe('ARS');
      expect(planInput.intervalo).toBe(IntervaloSuscripcion.MENSUAL);
    });

    it('debe tener select fields definidos', () => {
      const select: Prisma.PlanSuscripcionSelect = {
        id: true,
        nombre: true,
        descripcion: true,
        precioBase: true,
        moneda: true,
        intervalo: true,
        intervaloCantidad: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
        suscripciones: true,
      };

      expect(select.id).toBe(true);
      expect(select.suscripciones).toBe(true);
    });
  });

  describe('Suscripcion', () => {
    it('debe requerir tutorId, planId y precioFinal', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutorId: 'tutor-123',
        planId: 'plan-123',
        precioFinal: 40000,
      };

      expect(suscripcionInput.tutorId).toBe('tutor-123');
      expect(suscripcionInput.planId).toBe('plan-123');
      expect(suscripcionInput.precioFinal).toBe(40000);
    });

    it('debe permitir campos de MercadoPago', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutorId: 'tutor-123',
        planId: 'plan-123',
        precioFinal: 40000,
        mpPreapprovalId: 'preapproval-mp-123',
        mpStatus: 'authorized',
      };

      expect(suscripcionInput.mpPreapprovalId).toBe('preapproval-mp-123');
      expect(suscripcionInput.mpStatus).toBe('authorized');
    });

    it('debe permitir campos de grace period', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutorId: 'tutor-123',
        planId: 'plan-123',
        precioFinal: 40000,
        diasGraciaUsados: 2,
        fechaInicioGracia: new Date(),
      };

      expect(suscripcionInput.diasGraciaUsados).toBe(2);
      expect(suscripcionInput.fechaInicioGracia).toBeInstanceOf(Date);
    });

    // REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
    // Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
    // Los campos fecha_pausa y fechaFin_pausa existen en el schema por compatibilidad
    // con MercadoPago (que puede enviar estado PAUSED), pero NO se usan activamente.

    it('debe permitir campos de cancelación', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutorId: 'tutor-123',
        planId: 'plan-123',
        precioFinal: 40000,
        estado: EstadoSuscripcion.CANCELADA,
        fechaCancelacion: new Date(),
        motivoCancelacion: 'Solicitud del usuario',
        canceladoPor: 'tutor',
      };

      expect(suscripcionInput.motivoCancelacion).toBe('Solicitud del usuario');
      expect(suscripcionInput.canceladoPor).toBe('tutor');
    });

    it('debe tener select fields con relaciones', () => {
      const select: Prisma.SuscripcionSelect = {
        id: true,
        tutorId: true,
        planId: true,
        estado: true,
        precioFinal: true,
        tutor: true,
        plan: true,
        pagos: true,
        historial: true,
      };

      expect(select.tutor).toBe(true);
      expect(select.plan).toBe(true);
      expect(select.pagos).toBe(true);
      expect(select.historial).toBe(true);
    });
  });

  describe('PagoSuscripcion', () => {
    it('debe requerir campos de pago', () => {
      const pagoInput: Prisma.PagoSuscripcionUncheckedCreateInput = {
        suscripcionId: 'suscripcion-123',
        mpPaymentId: 'payment-mp-123',
        mpStatus: 'approved',
        monto: 40000,
        periodo_inicio: new Date(),
        periodo_fin: new Date(),
      };

      expect(pagoInput.suscripcionId).toBe('suscripcion-123');
      expect(pagoInput.mp_paymentId).toBe('payment-mp-123');
      expect(pagoInput.mpStatus).toBe('approved');
      expect(pagoInput.monto).toBe(40000);
    });

    it('debe permitir campos opcionales', () => {
      const pagoInput: Prisma.PagoSuscripcionUncheckedCreateInput = {
        suscripcionId: 'suscripcion-123',
        mpPaymentId: 'payment-mp-123',
        mpStatus: 'approved',
        monto: 40000,
        moneda: 'ARS',
        periodo_inicio: new Date(),
        periodo_fin: new Date(),
        intento_numero: 2,
        metadata: { tipo: 'cobro_automatico' },
      };

      expect(pagoInput.moneda).toBe('ARS');
      expect(pagoInput.intento_numero).toBe(2);
      expect(pagoInput.metadata).toEqual({ tipo: 'cobro_automatico' });
    });

    it('debe tener select fields con relación', () => {
      const select: Prisma.PagoSuscripcionSelect = {
        id: true,
        suscripcionId: true,
        mpPaymentId: true,
        monto: true,
        suscripcion: true,
      };

      expect(select.suscripcion).toBe(true);
    });
  });

  describe('HistorialEstadoSuscripcion', () => {
    it('debe permitir registrar cambios de estado', () => {
      const historialInput: Prisma.HistorialEstadoSuscripcionUncheckedCreateInput =
        {
          suscripcionId: 'suscripcion-123',
          estadoAnterior: EstadoSuscripcion.PENDIENTE,
          estadoNuevo: EstadoSuscripcion.ACTIVA,
          motivo: 'Primer pago confirmado',
          realizadoPor: 'mercadopago',
        };

      expect(historialInput.estadoAnterior).toBe(EstadoSuscripcion.PENDIENTE);
      expect(historialInput.estadoNuevo).toBe(EstadoSuscripcion.ACTIVA);
      expect(historialInput.motivo).toBe('Primer pago confirmado');
    });

    it('debe permitir estadoAnterior null (primer estado)', () => {
      const historialInput: Prisma.HistorialEstadoSuscripcionUncheckedCreateInput =
        {
          suscripcionId: 'suscripcion-123',
          estadoAnterior: null,
          estadoNuevo: EstadoSuscripcion.PENDIENTE,
          motivo: 'Suscripción creada',
        };

      expect(historialInput.estadoAnterior).toBeNull();
    });

    it('debe soportar metadata JSON', () => {
      const metadata = {
        mpPaymentId: '12345',
        monto: 40000,
        fechaCobro: new Date().toISOString(),
      };

      const historialInput: Prisma.HistorialEstadoSuscripcionUncheckedCreateInput =
        {
          suscripcionId: 'suscripcion-123',
          estadoNuevo: EstadoSuscripcion.ACTIVA,
          metadata,
        };

      expect(historialInput.metadata).toEqual(metadata);
    });

    it('debe tener select fields con relación', () => {
      const select: Prisma.HistorialEstadoSuscripcionSelect = {
        id: true,
        suscripcionId: true,
        estadoAnterior: true,
        estadoNuevo: true,
        suscripcion: true,
      };

      expect(select.suscripcion).toBe(true);
    });
  });

  describe('Relación Tutor-Suscripcion', () => {
    it('debe existir campo suscripciones en TutorSelect', () => {
      const select: Prisma.TutorSelect = {
        id: true,
        nombre: true,
        suscripciones: true,
      };

      expect(select.suscripciones).toBe(true);
    });

    it('debe poder incluir suscripciones en queries de Tutor', () => {
      const include: Prisma.TutorInclude = {
        suscripciones: {
          where: { estado: EstadoSuscripcion.ACTIVA },
          include: { plan: true },
        },
      };

      expect(include.suscripciones).toBeDefined();
    });
  });

  describe('Índices únicos', () => {
    it('mpPreapprovalId debe ser unique (verificable por where)', () => {
      // Si el campo es unique, Prisma genera un tipo WhereUniqueInput con ese campo
      const whereUnique: Prisma.SuscripcionWhereUniqueInput = {
        mpPreapprovalId: 'preapproval-123',
      };

      expect(whereUnique.mpPreapprovalId).toBe('preapproval-123');
    });

    it('mp_paymentId en PagoSuscripcion debe ser unique', () => {
      const whereUnique: Prisma.PagoSuscripcionWhereUniqueInput = {
        mpPaymentId: 'payment-123',
      };

      expect(whereUnique.mp_paymentId).toBe('payment-123');
    });
  });
});
