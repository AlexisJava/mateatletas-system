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
        precio_base: 40000,
      };

      expect(planInput.nombre).toBe('STEAM_LIBROS');
      expect(planInput.precio_base).toBe(40000);
    });

    it('debe permitir campos opcionales', () => {
      const planInput: Prisma.PlanSuscripcionCreateInput = {
        nombre: 'STEAM_ASINCRONICO',
        descripcion: 'Plan con clases asincrónicas',
        precio_base: 65000,
        moneda: 'ARS',
        intervalo: IntervaloSuscripcion.MENSUAL,
        intervalo_cantidad: 1,
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
        precio_base: true,
        moneda: true,
        intervalo: true,
        intervalo_cantidad: true,
        activo: true,
        created_at: true,
        updated_at: true,
        suscripciones: true,
      };

      expect(select.id).toBe(true);
      expect(select.suscripciones).toBe(true);
    });
  });

  describe('Suscripcion', () => {
    it('debe requerir tutor_id, plan_id y precio_final', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: 40000,
      };

      expect(suscripcionInput.tutor_id).toBe('tutor-123');
      expect(suscripcionInput.plan_id).toBe('plan-123');
      expect(suscripcionInput.precio_final).toBe(40000);
    });

    it('debe permitir campos de MercadoPago', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: 40000,
        mp_preapproval_id: 'preapproval-mp-123',
        mp_status: 'authorized',
      };

      expect(suscripcionInput.mp_preapproval_id).toBe('preapproval-mp-123');
      expect(suscripcionInput.mp_status).toBe('authorized');
    });

    it('debe permitir campos de grace period', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: 40000,
        dias_gracia_usados: 2,
        fecha_inicio_gracia: new Date(),
      };

      expect(suscripcionInput.dias_gracia_usados).toBe(2);
      expect(suscripcionInput.fecha_inicio_gracia).toBeInstanceOf(Date);
    });

    // REGLA DE NEGOCIO: Las suscripciones NO SE PAUSAN.
    // Si el tutor no paga, se cancela. Si quiere volver, crea una nueva.
    // Los campos fecha_pausa y fecha_fin_pausa existen en el schema por compatibilidad
    // con MercadoPago (que puede enviar estado PAUSED), pero NO se usan activamente.

    it('debe permitir campos de cancelación', () => {
      const suscripcionInput: Prisma.SuscripcionUncheckedCreateInput = {
        tutor_id: 'tutor-123',
        plan_id: 'plan-123',
        precio_final: 40000,
        estado: EstadoSuscripcion.CANCELADA,
        fecha_cancelacion: new Date(),
        motivo_cancelacion: 'Solicitud del usuario',
        cancelado_por: 'tutor',
      };

      expect(suscripcionInput.motivo_cancelacion).toBe('Solicitud del usuario');
      expect(suscripcionInput.cancelado_por).toBe('tutor');
    });

    it('debe tener select fields con relaciones', () => {
      const select: Prisma.SuscripcionSelect = {
        id: true,
        tutor_id: true,
        plan_id: true,
        estado: true,
        precio_final: true,
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
        suscripcion_id: 'suscripcion-123',
        mp_payment_id: 'payment-mp-123',
        mp_status: 'approved',
        monto: 40000,
        periodo_inicio: new Date(),
        periodo_fin: new Date(),
      };

      expect(pagoInput.suscripcion_id).toBe('suscripcion-123');
      expect(pagoInput.mp_payment_id).toBe('payment-mp-123');
      expect(pagoInput.mp_status).toBe('approved');
      expect(pagoInput.monto).toBe(40000);
    });

    it('debe permitir campos opcionales', () => {
      const pagoInput: Prisma.PagoSuscripcionUncheckedCreateInput = {
        suscripcion_id: 'suscripcion-123',
        mp_payment_id: 'payment-mp-123',
        mp_status: 'approved',
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
        suscripcion_id: true,
        mp_payment_id: true,
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
          suscripcion_id: 'suscripcion-123',
          estado_anterior: EstadoSuscripcion.PENDIENTE,
          estado_nuevo: EstadoSuscripcion.ACTIVA,
          motivo: 'Primer pago confirmado',
          realizado_por: 'mercadopago',
        };

      expect(historialInput.estado_anterior).toBe(EstadoSuscripcion.PENDIENTE);
      expect(historialInput.estado_nuevo).toBe(EstadoSuscripcion.ACTIVA);
      expect(historialInput.motivo).toBe('Primer pago confirmado');
    });

    it('debe permitir estado_anterior null (primer estado)', () => {
      const historialInput: Prisma.HistorialEstadoSuscripcionUncheckedCreateInput =
        {
          suscripcion_id: 'suscripcion-123',
          estado_anterior: null,
          estado_nuevo: EstadoSuscripcion.PENDIENTE,
          motivo: 'Suscripción creada',
        };

      expect(historialInput.estado_anterior).toBeNull();
    });

    it('debe soportar metadata JSON', () => {
      const metadata = {
        mp_payment_id: '12345',
        monto: 40000,
        fecha_cobro: new Date().toISOString(),
      };

      const historialInput: Prisma.HistorialEstadoSuscripcionUncheckedCreateInput =
        {
          suscripcion_id: 'suscripcion-123',
          estado_nuevo: EstadoSuscripcion.ACTIVA,
          metadata,
        };

      expect(historialInput.metadata).toEqual(metadata);
    });

    it('debe tener select fields con relación', () => {
      const select: Prisma.HistorialEstadoSuscripcionSelect = {
        id: true,
        suscripcion_id: true,
        estado_anterior: true,
        estado_nuevo: true,
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
    it('mp_preapproval_id debe ser unique (verificable por where)', () => {
      // Si el campo es unique, Prisma genera un tipo WhereUniqueInput con ese campo
      const whereUnique: Prisma.SuscripcionWhereUniqueInput = {
        mp_preapproval_id: 'preapproval-123',
      };

      expect(whereUnique.mp_preapproval_id).toBe('preapproval-123');
    });

    it('mp_payment_id en PagoSuscripcion debe ser unique', () => {
      const whereUnique: Prisma.PagoSuscripcionWhereUniqueInput = {
        mp_payment_id: 'payment-123',
      };

      expect(whereUnique.mp_payment_id).toBe('payment-123');
    });
  });
});
