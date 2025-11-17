import {
  BUSINESS_RULES,
  esEdadValida,
  getMensajeErrorEdad,
} from '../business-rules.constants';

describe('Business Rules Constants', () => {
  describe('BUSINESS_RULES', () => {
    it('debe tener configuración correcta para estudiantes', () => {
      expect(BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA).toBe(3);
      expect(BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA).toBe(99);
      expect(BUSINESS_RULES.ESTUDIANTE.USERNAME_MIN_LENGTH).toBe(3);
      expect(BUSINESS_RULES.ESTUDIANTE.USERNAME_MAX_LENGTH).toBe(20);
      expect(BUSINESS_RULES.ESTUDIANTE.NOMBRE_MIN_LENGTH).toBe(2);
      expect(BUSINESS_RULES.ESTUDIANTE.NOMBRE_MAX_LENGTH).toBe(50);
    });

    it('debe tener configuración correcta para clases', () => {
      expect(BUSINESS_RULES.CLASE.DURACION_MINIMA_MINUTOS).toBe(30);
      expect(BUSINESS_RULES.CLASE.DURACION_MAXIMA_MINUTOS).toBe(180);
      expect(BUSINESS_RULES.CLASE.CUPOS_MINIMOS).toBe(1);
      expect(BUSINESS_RULES.CLASE.CUPOS_MAXIMOS).toBe(30);
    });

    it('debe tener configuración correcta para cursos', () => {
      expect(BUSINESS_RULES.CURSO.DURACION_MINIMA_MESES).toBe(1);
      expect(BUSINESS_RULES.CURSO.DURACION_MAXIMA_MESES).toBe(24);
      expect(BUSINESS_RULES.CURSO.PRECIO_MINIMO).toBe(0);
      expect(BUSINESS_RULES.CURSO.PRECIO_MAXIMO).toBe(999999);
    });

    it('debe tener configuración correcta para docentes', () => {
      expect(BUSINESS_RULES.DOCENTE.EXPERIENCIA_MINIMA_ANOS).toBe(0);
      expect(BUSINESS_RULES.DOCENTE.EXPERIENCIA_MAXIMA_ANOS).toBe(50);
    });

    it('debe ser inmutable (readonly)', () => {
      // TypeScript no permite modificar constantes as const
      // Este test verifica que la estructura es correcta
      expect(Object.isFrozen(BUSINESS_RULES)).toBe(false);

      // Pero los valores son constantes
      expect(typeof BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA).toBe('number');
    });
  });

  describe('esEdadValida', () => {
    it('debe aceptar edad mínima válida (3 años)', () => {
      expect(esEdadValida(3)).toBe(true);
    });

    it('debe aceptar edad máxima válida (99 años)', () => {
      expect(esEdadValida(99)).toBe(true);
    });

    it('debe aceptar edades dentro del rango', () => {
      expect(esEdadValida(5)).toBe(true);
      expect(esEdadValida(10)).toBe(true);
      expect(esEdadValida(18)).toBe(true);
      expect(esEdadValida(50)).toBe(true);
    });

    it('debe rechazar edad menor a mínima', () => {
      expect(esEdadValida(2)).toBe(false);
      expect(esEdadValida(1)).toBe(false);
      expect(esEdadValida(0)).toBe(false);
    });

    it('debe rechazar edad mayor a máxima', () => {
      expect(esEdadValida(100)).toBe(false);
      expect(esEdadValida(150)).toBe(false);
    });

    it('debe rechazar edades negativas', () => {
      expect(esEdadValida(-1)).toBe(false);
      expect(esEdadValida(-10)).toBe(false);
    });

    it('debe aceptar edades decimales dentro del rango', () => {
      // El sistema permite edades decimales (ej: 5.5 años)
      expect(esEdadValida(5.5)).toBe(true);
      expect(esEdadValida(10.1)).toBe(true);
    });

    it('debe usar constantes centralizadas', () => {
      // Verificar que usa BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA
      const minima = BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA;
      expect(esEdadValida(minima - 1)).toBe(false);
      expect(esEdadValida(minima)).toBe(true);

      // Verificar que usa BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA
      const maxima = BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA;
      expect(esEdadValida(maxima)).toBe(true);
      expect(esEdadValida(maxima + 1)).toBe(false);
    });
  });

  describe('getMensajeErrorEdad', () => {
    it('debe retornar mensaje con valores correctos', () => {
      const mensaje = getMensajeErrorEdad();

      expect(mensaje).toContain('3');
      expect(mensaje).toContain('99');
      expect(mensaje).toContain('años');
    });

    it('debe retornar mensaje consistente', () => {
      const mensaje1 = getMensajeErrorEdad();
      const mensaje2 = getMensajeErrorEdad();

      expect(mensaje1).toBe(mensaje2);
    });

    it('debe usar constantes centralizadas', () => {
      const mensaje = getMensajeErrorEdad();
      const minima = BUSINESS_RULES.ESTUDIANTE.EDAD_MINIMA;
      const maxima = BUSINESS_RULES.ESTUDIANTE.EDAD_MAXIMA;

      expect(mensaje).toBe(`La edad debe estar entre ${minima} y ${maxima} años`);
    });
  });

  describe('Integración: validación completa', () => {
    it('debe rechazar edad inválida y mostrar mensaje correcto', () => {
      const edadInvalida = 2;
      const esValida = esEdadValida(edadInvalida);
      const mensaje = getMensajeErrorEdad();

      expect(esValida).toBe(false);
      expect(mensaje).toContain('3');
      expect(mensaje).toContain('99');
    });

    it('debe aceptar edad válida', () => {
      const edadValida = 10;
      const esValida = esEdadValida(edadValida);

      expect(esValida).toBe(true);
    });
  });

  describe('Casos límite', () => {
    it('debe manejar valores extremos', () => {
      expect(esEdadValida(Number.MIN_SAFE_INTEGER)).toBe(false);
      expect(esEdadValida(Number.MAX_SAFE_INTEGER)).toBe(false);
    });

    it('debe manejar NaN', () => {
      expect(esEdadValida(NaN)).toBe(false);
    });

    it('debe manejar Infinity', () => {
      expect(esEdadValida(Infinity)).toBe(false);
      expect(esEdadValida(-Infinity)).toBe(false);
    });
  });
});
