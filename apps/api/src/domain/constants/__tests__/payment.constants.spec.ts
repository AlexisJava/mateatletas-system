import {
  EstadoPago,
  EstadoMercadoPago,
  MERCADOPAGO_TO_ESTADO_PAGO,
  mapearEstadoMercadoPago,
  TipoExternalReference,
  EXTERNAL_REFERENCE_FORMATS,
  parseExternalReference,
  esExternalReferenceValido,
  getTipoExternalReference,
} from '../payment.constants';

describe('Payment Constants', () => {
  describe('mapearEstadoMercadoPago', () => {
    it('debe mapear approved a PAGADO', () => {
      expect(mapearEstadoMercadoPago('approved')).toBe(EstadoPago.PAGADO);
    });

    it('debe mapear authorized a PAGADO', () => {
      expect(mapearEstadoMercadoPago('authorized')).toBe(EstadoPago.PAGADO);
    });

    it('debe mapear pending a PENDIENTE', () => {
      expect(mapearEstadoMercadoPago('pending')).toBe(EstadoPago.PENDIENTE);
    });

    it('debe mapear in_process a PENDIENTE', () => {
      expect(mapearEstadoMercadoPago('in_process')).toBe(EstadoPago.PENDIENTE);
    });

    it('debe mapear rejected a RECHAZADO', () => {
      expect(mapearEstadoMercadoPago('rejected')).toBe(EstadoPago.RECHAZADO);
    });

    it('debe mapear cancelled a CANCELADO', () => {
      expect(mapearEstadoMercadoPago('cancelled')).toBe(EstadoPago.CANCELADO);
    });

    it('debe mapear refunded a REEMBOLSADO', () => {
      expect(mapearEstadoMercadoPago('refunded')).toBe(EstadoPago.REEMBOLSADO);
    });

    it('debe mapear charged_back a REEMBOLSADO', () => {
      expect(mapearEstadoMercadoPago('charged_back')).toBe(
        EstadoPago.REEMBOLSADO,
      );
    });

    it('debe devolver PENDIENTE para estados desconocidos', () => {
      expect(mapearEstadoMercadoPago('unknown_status')).toBe(
        EstadoPago.PENDIENTE,
      );
    });
  });

  describe('EXTERNAL_REFERENCE_FORMATS', () => {
    describe('claseInscripcion', () => {
      it('debe generar formato correcto', () => {
        const result = EXTERNAL_REFERENCE_FORMATS.claseInscripcion(
          'clase123',
          'estudiante456',
          '2025-03-15',
        );

        expect(result).toBe(
          'CLASE_INSCRIPCION:clase123:estudiante456:2025-03-15',
        );
      });
    });

    describe('cursoInscripcion', () => {
      it('debe generar formato correcto', () => {
        const result = EXTERNAL_REFERENCE_FORMATS.cursoInscripcion(
          'curso789',
          'estudiante456',
        );

        expect(result).toBe('CURSO_INSCRIPCION:curso789:estudiante456');
      });
    });

    describe('estudianteRecarga', () => {
      it('debe generar formato correcto', () => {
        const result = EXTERNAL_REFERENCE_FORMATS.estudianteRecarga(
          'estudiante456',
          1500,
        );

        expect(result).toBe('ESTUDIANTE_RECARGA:estudiante456:1500');
      });
    });
  });

  describe('parseExternalReference', () => {
    describe('CLASE_INSCRIPCION', () => {
      it('debe parsear formato válido', () => {
        const externalRef =
          'CLASE_INSCRIPCION:clase123:estudiante456:2025-03-15';
        const result = parseExternalReference(externalRef);

        expect(result).toEqual({
          tipo: TipoExternalReference.CLASE_INSCRIPCION,
          claseId: 'clase123',
          estudianteId: 'estudiante456',
          fecha: '2025-03-15',
        });
      });

      it('debe devolver null si faltan partes', () => {
        const externalRef = 'CLASE_INSCRIPCION:clase123:estudiante456';
        const result = parseExternalReference(externalRef);

        expect(result).toBeNull();
      });
    });

    describe('CURSO_INSCRIPCION', () => {
      it('debe parsear formato válido', () => {
        const externalRef = 'CURSO_INSCRIPCION:curso789:estudiante456';
        const result = parseExternalReference(externalRef);

        expect(result).toEqual({
          tipo: TipoExternalReference.CURSO_INSCRIPCION,
          cursoId: 'curso789',
          estudianteId: 'estudiante456',
        });
      });

      it('debe devolver null si faltan partes', () => {
        const externalRef = 'CURSO_INSCRIPCION:curso789';
        const result = parseExternalReference(externalRef);

        expect(result).toBeNull();
      });
    });

    describe('ESTUDIANTE_RECARGA', () => {
      it('debe parsear formato válido', () => {
        const externalRef = 'ESTUDIANTE_RECARGA:estudiante456:1500';
        const result = parseExternalReference(externalRef);

        expect(result).toEqual({
          tipo: TipoExternalReference.ESTUDIANTE_RECARGA,
          estudianteId: 'estudiante456',
          monto: 1500,
        });
      });

      it('debe devolver null si faltan partes', () => {
        const externalRef = 'ESTUDIANTE_RECARGA:estudiante456';
        const result = parseExternalReference(externalRef);

        expect(result).toBeNull();
      });

      it('debe parsear montos decimales', () => {
        const externalRef = 'ESTUDIANTE_RECARGA:estudiante456:1500.50';
        const result = parseExternalReference(externalRef);

        expect(result).toEqual({
          tipo: TipoExternalReference.ESTUDIANTE_RECARGA,
          estudianteId: 'estudiante456',
          monto: 1500.5,
        });
      });
    });

    it('debe devolver null para tipos desconocidos', () => {
      const externalRef = 'UNKNOWN_TYPE:param1:param2';
      const result = parseExternalReference(externalRef);

      expect(result).toBeNull();
    });

    it('debe devolver null para formato inválido', () => {
      const externalRef = 'invalid-format';
      const result = parseExternalReference(externalRef);

      expect(result).toBeNull();
    });
  });

  describe('esExternalReferenceValido', () => {
    it('debe validar formato CLASE_INSCRIPCION', () => {
      const externalRef = 'CLASE_INSCRIPCION:clase123:estudiante456:2025-03-15';
      expect(esExternalReferenceValido(externalRef)).toBe(true);
    });

    it('debe validar formato CURSO_INSCRIPCION', () => {
      const externalRef = 'CURSO_INSCRIPCION:curso789:estudiante456';
      expect(esExternalReferenceValido(externalRef)).toBe(true);
    });

    it('debe validar formato ESTUDIANTE_RECARGA', () => {
      const externalRef = 'ESTUDIANTE_RECARGA:estudiante456:1500';
      expect(esExternalReferenceValido(externalRef)).toBe(true);
    });

    it('debe rechazar formatos inválidos', () => {
      expect(esExternalReferenceValido('INVALID')).toBe(false);
      expect(
        esExternalReferenceValido('CLASE_INSCRIPCION:only-one-param'),
      ).toBe(false);
    });
  });

  describe('getTipoExternalReference', () => {
    it('debe extraer tipo CLASE_INSCRIPCION', () => {
      const externalRef = 'CLASE_INSCRIPCION:clase123:estudiante456:2025-03-15';
      expect(getTipoExternalReference(externalRef)).toBe(
        TipoExternalReference.CLASE_INSCRIPCION,
      );
    });

    it('debe extraer tipo CURSO_INSCRIPCION', () => {
      const externalRef = 'CURSO_INSCRIPCION:curso789:estudiante456';
      expect(getTipoExternalReference(externalRef)).toBe(
        TipoExternalReference.CURSO_INSCRIPCION,
      );
    });

    it('debe extraer tipo ESTUDIANTE_RECARGA', () => {
      const externalRef = 'ESTUDIANTE_RECARGA:estudiante456:1500';
      expect(getTipoExternalReference(externalRef)).toBe(
        TipoExternalReference.ESTUDIANTE_RECARGA,
      );
    });

    it('debe devolver null para tipo desconocido', () => {
      const externalRef = 'UNKNOWN:param1:param2';
      expect(getTipoExternalReference(externalRef)).toBeNull();
    });

    it('debe devolver null para formato inválido', () => {
      expect(getTipoExternalReference('invalid')).toBeNull();
    });
  });

  describe('Integración: generar y parsear external_reference', () => {
    it('debe generar y parsear CLASE_INSCRIPCION correctamente', () => {
      const claseId = 'clase123';
      const estudianteId = 'estudiante456';
      const fecha = '2025-03-15';

      const generated = EXTERNAL_REFERENCE_FORMATS.claseInscripcion(
        claseId,
        estudianteId,
        fecha,
      );
      const parsed = parseExternalReference(generated);

      expect(parsed).toEqual({
        tipo: TipoExternalReference.CLASE_INSCRIPCION,
        claseId,
        estudianteId,
        fecha,
      });
    });

    it('debe generar y parsear CURSO_INSCRIPCION correctamente', () => {
      const cursoId = 'curso789';
      const estudianteId = 'estudiante456';

      const generated = EXTERNAL_REFERENCE_FORMATS.cursoInscripcion(
        cursoId,
        estudianteId,
      );
      const parsed = parseExternalReference(generated);

      expect(parsed).toEqual({
        tipo: TipoExternalReference.CURSO_INSCRIPCION,
        cursoId,
        estudianteId,
      });
    });

    it('debe generar y parsear ESTUDIANTE_RECARGA correctamente', () => {
      const estudianteId = 'estudiante456';
      const monto = 1500;

      const generated = EXTERNAL_REFERENCE_FORMATS.estudianteRecarga(
        estudianteId,
        monto,
      );
      const parsed = parseExternalReference(generated);

      expect(parsed).toEqual({
        tipo: TipoExternalReference.ESTUDIANTE_RECARGA,
        estudianteId,
        monto,
      });
    });
  });
});
