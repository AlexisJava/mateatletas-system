import {
  parseHorario,
  horarioToMinutos,
  calcularDuracionMinutos,
} from './time.utils';

describe('time.utils', () => {
  describe('parseHorario', () => {
    describe('casos válidos', () => {
      it('should parse "00:00" correctly', () => {
        const result = parseHorario('00:00');
        expect(result).toEqual({ horas: 0, minutos: 0 });
      });

      it('should parse "23:59" correctly', () => {
        const result = parseHorario('23:59');
        expect(result).toEqual({ horas: 23, minutos: 59 });
      });

      it('should parse "14:30" correctly', () => {
        const result = parseHorario('14:30');
        expect(result).toEqual({ horas: 14, minutos: 30 });
      });

      it('should parse "09:05" correctly', () => {
        const result = parseHorario('09:05');
        expect(result).toEqual({ horas: 9, minutos: 5 });
      });

      it('should parse "9:05" (hora sin leading zero) correctly', () => {
        const result = parseHorario('9:05');
        expect(result).toEqual({ horas: 9, minutos: 5 });
      });

      it('should parse "12:00" (mediodía) correctly', () => {
        const result = parseHorario('12:00');
        expect(result).toEqual({ horas: 12, minutos: 0 });
      });
    });

    describe('casos inválidos - formato', () => {
      it('should throw for empty string', () => {
        expect(() => parseHorario('')).toThrow('Horario inválido');
      });

      it('should throw for "invalid" text', () => {
        expect(() => parseHorario('invalid')).toThrow('no tiene formato HH:MM');
      });

      it('should throw for "14" (solo hora)', () => {
        expect(() => parseHorario('14')).toThrow('no tiene formato HH:MM');
      });

      it('should throw for "14:30:00" (con segundos)', () => {
        expect(() => parseHorario('14:30:00')).toThrow(
          'no tiene formato HH:MM',
        );
      });

      it('should throw for "1430" (sin separador)', () => {
        expect(() => parseHorario('1430')).toThrow('no tiene formato HH:MM');
      });

      it('should throw for "14:3" (minuto de un dígito)', () => {
        expect(() => parseHorario('14:3')).toThrow('no tiene formato HH:MM');
      });

      it('should throw for null/undefined', () => {
        expect(() => parseHorario(null as unknown as string)).toThrow(
          'Horario inválido',
        );
        expect(() => parseHorario(undefined as unknown as string)).toThrow(
          'Horario inválido',
        );
      });
    });

    describe('casos inválidos - rango', () => {
      it('should throw for "25:00" (hora > 23)', () => {
        expect(() => parseHorario('25:00')).toThrow('horas 25 fuera de rango');
      });

      it('should throw for "14:60" (minutos > 59)', () => {
        expect(() => parseHorario('14:60')).toThrow(
          'minutos 60 fuera de rango',
        );
      });

      it('should throw for "24:00" (hora = 24)', () => {
        expect(() => parseHorario('24:00')).toThrow('horas 24 fuera de rango');
      });

      it('should throw for "99:99"', () => {
        expect(() => parseHorario('99:99')).toThrow('fuera de rango');
      });
    });
  });

  describe('horarioToMinutos', () => {
    it('should return 0 for "00:00"', () => {
      expect(horarioToMinutos('00:00')).toBe(0);
    });

    it('should return 90 for "01:30"', () => {
      expect(horarioToMinutos('01:30')).toBe(90);
    });

    it('should return 870 for "14:30"', () => {
      expect(horarioToMinutos('14:30')).toBe(870);
    });

    it('should return 1439 for "23:59"', () => {
      expect(horarioToMinutos('23:59')).toBe(1439);
    });

    it('should return 720 for "12:00" (mediodía)', () => {
      expect(horarioToMinutos('12:00')).toBe(720);
    });

    it('should throw for invalid horario', () => {
      expect(() => horarioToMinutos('invalid')).toThrow();
    });
  });

  describe('calcularDuracionMinutos', () => {
    it('should calculate 90 minutes from "09:00" to "10:30"', () => {
      expect(calcularDuracionMinutos('09:00', '10:30')).toBe(90);
    });

    it('should calculate 60 minutes from "14:00" to "15:00"', () => {
      expect(calcularDuracionMinutos('14:00', '15:00')).toBe(60);
    });

    it('should calculate 0 minutes for same time', () => {
      expect(calcularDuracionMinutos('10:00', '10:00')).toBe(0);
    });

    it('should calculate full day from "00:00" to "23:59"', () => {
      expect(calcularDuracionMinutos('00:00', '23:59')).toBe(1439);
    });

    it('should calculate 45 minutes from "09:15" to "10:00"', () => {
      expect(calcularDuracionMinutos('09:15', '10:00')).toBe(45);
    });

    it('should throw when horaFin < horaInicio', () => {
      expect(() => calcularDuracionMinutos('10:00', '09:00')).toThrow(
        'es anterior a hora inicio',
      );
    });

    it('should throw when horaFin is much earlier than horaInicio', () => {
      expect(() => calcularDuracionMinutos('23:00', '01:00')).toThrow(
        'no se soporta cruce de medianoche',
      );
    });

    it('should throw for invalid horaInicio', () => {
      expect(() => calcularDuracionMinutos('invalid', '10:00')).toThrow();
    });

    it('should throw for invalid horaFin', () => {
      expect(() => calcularDuracionMinutos('09:00', 'invalid')).toThrow();
    });
  });
});
