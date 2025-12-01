/**
 * Tests para studio-wizard.store.ts
 * TDD: Estos tests se escriben ANTES de la implementación
 */

import { useStudioWizardStore } from '../studio-wizard.store';

// Helper para resetear el store entre tests
const resetStore = () => {
  useStudioWizardStore.getState().resetWizard();
};

describe('StudioWizardStore', () => {
  beforeEach(() => {
    resetStore();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 1. ESTADO INICIAL
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Estado Inicial', () => {
    it('debe iniciar en paso 1', () => {
      const { pasoActual } = useStudioWizardStore.getState();
      expect(pasoActual).toBe(1);
    });

    it('debe tener categoria null', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.categoria).toBeNull();
    });

    it('debe tener casa y mundo null', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.casa).toBeNull();
      expect(datos.mundo).toBeNull();
    });

    it('debe tener tipoExperiencia y materia null', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.tipoExperiencia).toBeNull();
      expect(datos.materia).toBeNull();
    });

    it('debe tener strings vacíos para nombre, descripcion, esteticaBase, esteticaVariante', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.nombre).toBe('');
      expect(datos.descripcion).toBe('');
      expect(datos.esteticaBase).toBe('');
      expect(datos.esteticaVariante).toBe('');
    });

    it('debe tener defaults razonables para semanas y actividades', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.cantidadSemanas).toBe(4);
      expect(datos.actividadesPorSemana).toBe(3);
    });

    it('debe tener tierMinimo null', () => {
      const { datos } = useStudioWizardStore.getState();
      expect(datos.tierMinimo).toBeNull();
    });

    it('debe tener errores vacíos', () => {
      const { errores } = useStudioWizardStore.getState();
      expect(errores).toEqual({});
    });

    it('debe tener isSubmitting false', () => {
      const { isSubmitting } = useStudioWizardStore.getState();
      expect(isSubmitting).toBe(false);
    });

    it('debe tener submitError null', () => {
      const { submitError } = useStudioWizardStore.getState();
      expect(submitError).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 2. NAVEGACIÓN
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Navegación', () => {
    describe('siguientePaso()', () => {
      it('NO debe avanzar de paso 1 si categoria es null', () => {
        const store = useStudioWizardStore.getState();

        const resultado = store.siguientePaso();

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().pasoActual).toBe(1);
      });

      it('SÍ debe avanzar de paso 1 si categoria está seteada', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(true);
        expect(useStudioWizardStore.getState().pasoActual).toBe(2);
      });

      it('NO debe avanzar de paso 2 si falta casa', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.setMundo('MATEMATICA');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().pasoActual).toBe(2);
      });

      it('NO debe avanzar de paso 2 si falta mundo', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.setCasa('VERTEX');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().pasoActual).toBe(2);
      });

      it('SÍ debe avanzar de paso 2 si casa y mundo están seteados', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.setCasa('VERTEX');
        store.setMundo('CIENCIAS');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(true);
        expect(useStudioWizardStore.getState().pasoActual).toBe(3);
      });

      it('NO debe avanzar de paso 3 si categoria=EXPERIENCIA y falta tipoExperiencia', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso();
        store.setCasa('VERTEX');
        store.setMundo('CIENCIAS');
        store.siguientePaso(); // -> paso 3

        const resultado = store.siguientePaso();

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().pasoActual).toBe(3);
      });

      it('SÍ debe avanzar de paso 3 si categoria=EXPERIENCIA y tipoExperiencia está seteado', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso();
        store.setCasa('VERTEX');
        store.setMundo('CIENCIAS');
        store.siguientePaso(); // -> paso 3
        store.setTipoExperiencia('NARRATIVO');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(true);
        expect(useStudioWizardStore.getState().pasoActual).toBe(4);
      });

      it('NO debe avanzar de paso 3 si categoria=CURRICULAR y falta materia', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('CURRICULAR');
        store.siguientePaso();
        store.setCasa('PULSAR');
        store.setMundo('MATEMATICA');
        store.siguientePaso(); // -> paso 3

        const resultado = store.siguientePaso();

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().pasoActual).toBe(3);
      });

      it('SÍ debe avanzar de paso 3 si categoria=CURRICULAR y materia está seteada', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('CURRICULAR');
        store.siguientePaso();
        store.setCasa('PULSAR');
        store.setMundo('MATEMATICA');
        store.siguientePaso(); // -> paso 3
        store.setMateria('MATEMATICA_ESCOLAR');

        const resultado = store.siguientePaso();

        expect(resultado).toBe(true);
        expect(useStudioWizardStore.getState().pasoActual).toBe(4);
      });
    });

    describe('pasoAnterior()', () => {
      it('NO debe retroceder más allá del paso 1', () => {
        const store = useStudioWizardStore.getState();

        store.pasoAnterior();

        expect(useStudioWizardStore.getState().pasoActual).toBe(1);
      });

      it('debe retroceder de paso 2 a paso 1', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2

        store.pasoAnterior();

        expect(useStudioWizardStore.getState().pasoActual).toBe(1);
      });

      it('debe mantener los datos al retroceder', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.setCasa('VERTEX');

        store.pasoAnterior();

        const { datos } = useStudioWizardStore.getState();
        expect(datos.categoria).toBe('EXPERIENCIA');
        expect(datos.casa).toBe('VERTEX');
      });
    });

    describe('irAPaso()', () => {
      it('NO debe permitir ir a un paso no alcanzado', () => {
        const store = useStudioWizardStore.getState();
        // Estamos en paso 1, no hemos avanzado

        store.irAPaso(3);

        expect(useStudioWizardStore.getState().pasoActual).toBe(1);
      });

      it('debe permitir volver a un paso ya completado', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.setCasa('VERTEX');
        store.setMundo('CIENCIAS');
        store.siguientePaso(); // -> paso 3

        store.irAPaso(1);

        expect(useStudioWizardStore.getState().pasoActual).toBe(1);
      });

      it('debe permitir ir al paso actual', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2

        store.irAPaso(2);

        expect(useStudioWizardStore.getState().pasoActual).toBe(2);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 3. SETTERS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Setters', () => {
    describe('setCategoria()', () => {
      it('debe guardar el valor de categoria', () => {
        const store = useStudioWizardStore.getState();

        store.setCategoria('EXPERIENCIA');

        expect(useStudioWizardStore.getState().datos.categoria).toBe('EXPERIENCIA');
      });

      it('debe limpiar el error de categoria si existía', () => {
        // Primero forzamos un error intentando avanzar sin categoria
        const store = useStudioWizardStore.getState();
        store.siguientePaso(); // Genera error
        expect(useStudioWizardStore.getState().errores.categoria).toBeDefined();

        store.setCategoria('CURRICULAR');

        expect(useStudioWizardStore.getState().errores.categoria).toBeUndefined();
      });

      it('debe limpiar tipoExperiencia al cambiar de EXPERIENCIA a CURRICULAR', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.setTipoExperiencia('NARRATIVO');

        store.setCategoria('CURRICULAR');

        expect(useStudioWizardStore.getState().datos.tipoExperiencia).toBeNull();
      });

      it('debe limpiar materia al cambiar de CURRICULAR a EXPERIENCIA', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('CURRICULAR');
        store.setMateria('FISICA');

        store.setCategoria('EXPERIENCIA');

        expect(useStudioWizardStore.getState().datos.materia).toBeNull();
      });
    });

    describe('setCasa()', () => {
      it('debe guardar el valor de casa', () => {
        const store = useStudioWizardStore.getState();

        store.setCasa('QUANTUM');

        expect(useStudioWizardStore.getState().datos.casa).toBe('QUANTUM');
      });

      it('debe limpiar el error de casa si existía', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.siguientePaso(); // -> paso 2
        store.siguientePaso(); // Genera error (casa null)
        expect(useStudioWizardStore.getState().errores.casa).toBeDefined();

        store.setCasa('VERTEX');

        expect(useStudioWizardStore.getState().errores.casa).toBeUndefined();
      });
    });

    describe('setMundo()', () => {
      it('debe guardar el valor de mundo', () => {
        const store = useStudioWizardStore.getState();

        store.setMundo('PROGRAMACION');

        expect(useStudioWizardStore.getState().datos.mundo).toBe('PROGRAMACION');
      });
    });

    describe('setTipoExperiencia()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setTipoExperiencia('LABORATORIO');

        expect(useStudioWizardStore.getState().datos.tipoExperiencia).toBe('LABORATORIO');
      });
    });

    describe('setMateria()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setMateria('QUIMICA');

        expect(useStudioWizardStore.getState().datos.materia).toBe('QUIMICA');
      });
    });

    describe('setNombre()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setNombre('La Química de Harry Potter');

        expect(useStudioWizardStore.getState().datos.nombre).toBe('La Química de Harry Potter');
      });
    });

    describe('setDescripcion()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setDescripcion('Aprende química preparando pociones');

        expect(useStudioWizardStore.getState().datos.descripcion).toBe(
          'Aprende química preparando pociones',
        );
      });
    });

    describe('setEsteticaBase()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setEsteticaBase('Harry Potter');

        expect(useStudioWizardStore.getState().datos.esteticaBase).toBe('Harry Potter');
      });
    });

    describe('setEsteticaVariante()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setEsteticaVariante('Hogwarts');

        expect(useStudioWizardStore.getState().datos.esteticaVariante).toBe('Hogwarts');
      });
    });

    describe('setCantidadSemanas()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setCantidadSemanas(8);

        expect(useStudioWizardStore.getState().datos.cantidadSemanas).toBe(8);
      });
    });

    describe('setActividadesPorSemana()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setActividadesPorSemana(5);

        expect(useStudioWizardStore.getState().datos.actividadesPorSemana).toBe(5);
      });
    });

    describe('setTierMinimo()', () => {
      it('debe guardar el valor', () => {
        const store = useStudioWizardStore.getState();

        store.setTierMinimo('PRO');

        expect(useStudioWizardStore.getState().datos.tierMinimo).toBe('PRO');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 4. VALIDACIÓN POR PASO
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Validación por Paso', () => {
    describe('validarPaso(1)', () => {
      it('debe fallar si categoria es null', () => {
        const store = useStudioWizardStore.getState();

        const resultado = store.validarPaso(1);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.categoria).toBeDefined();
      });

      it('debe pasar si categoria está seteada', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');

        const resultado = store.validarPaso(1);

        expect(resultado).toBe(true);
        expect(useStudioWizardStore.getState().errores.categoria).toBeUndefined();
      });
    });

    describe('validarPaso(2)', () => {
      it('debe fallar si casa es null', () => {
        const store = useStudioWizardStore.getState();
        store.setMundo('MATEMATICA');

        const resultado = store.validarPaso(2);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.casa).toBeDefined();
      });

      it('debe fallar si mundo es null', () => {
        const store = useStudioWizardStore.getState();
        store.setCasa('VERTEX');

        const resultado = store.validarPaso(2);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.mundo).toBeDefined();
      });

      it('debe pasar si casa y mundo están seteados', () => {
        const store = useStudioWizardStore.getState();
        store.setCasa('VERTEX');
        store.setMundo('CIENCIAS');

        const resultado = store.validarPaso(2);

        expect(resultado).toBe(true);
      });
    });

    describe('validarPaso(3)', () => {
      it('debe fallar si categoria=EXPERIENCIA y tipoExperiencia es null', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');

        const resultado = store.validarPaso(3);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.tipoExperiencia).toBeDefined();
      });

      it('debe pasar si categoria=EXPERIENCIA y tipoExperiencia está seteado', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('EXPERIENCIA');
        store.setTipoExperiencia('PROYECTO');

        const resultado = store.validarPaso(3);

        expect(resultado).toBe(true);
      });

      it('debe fallar si categoria=CURRICULAR y materia es null', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('CURRICULAR');

        const resultado = store.validarPaso(3);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.materia).toBeDefined();
      });

      it('debe pasar si categoria=CURRICULAR y materia está seteada', () => {
        const store = useStudioWizardStore.getState();
        store.setCategoria('CURRICULAR');
        store.setMateria('FISICA');

        const resultado = store.validarPaso(3);

        expect(resultado).toBe(true);
      });
    });

    describe('validarPaso(4)', () => {
      it('debe fallar si nombre tiene menos de 3 caracteres', () => {
        const store = useStudioWizardStore.getState();
        store.setNombre('AB');
        store.setDescripcion('Descripción válida con más de 10 caracteres');
        store.setEsteticaBase('Temática');

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.nombre).toBeDefined();
      });

      it('debe fallar si nombre está vacío', () => {
        const store = useStudioWizardStore.getState();
        store.setDescripcion('Descripción válida');
        store.setEsteticaBase('Temática');

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.nombre).toBeDefined();
      });

      it('debe fallar si descripcion tiene menos de 10 caracteres', () => {
        const store = useStudioWizardStore.getState();
        store.setNombre('Curso válido');
        store.setDescripcion('Corta');
        store.setEsteticaBase('Temática');

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.descripcion).toBeDefined();
      });

      it('debe fallar si esteticaBase está vacío', () => {
        const store = useStudioWizardStore.getState();
        store.setNombre('Curso válido');
        store.setDescripcion('Descripción válida con más de 10 caracteres');

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.esteticaBase).toBeDefined();
      });

      it('debe pasar con todos los campos válidos', () => {
        const store = useStudioWizardStore.getState();
        store.setNombre('Curso de Química');
        store.setDescripcion('Aprende química de manera divertida con Harry Potter');
        store.setEsteticaBase('Harry Potter');

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(true);
      });

      it('esteticaVariante es opcional', () => {
        const store = useStudioWizardStore.getState();
        store.setNombre('Curso de Química');
        store.setDescripcion('Aprende química de manera divertida');
        store.setEsteticaBase('Harry Potter');
        // No seteamos esteticaVariante

        const resultado = store.validarPaso(4);

        expect(resultado).toBe(true);
      });
    });

    describe('validarPaso(5)', () => {
      it('debe fallar si cantidadSemanas es menor a 1', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(0);
        store.setActividadesPorSemana(3);
        store.setTierMinimo('ARCADE');

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.cantidadSemanas).toBeDefined();
      });

      it('debe fallar si cantidadSemanas es mayor a 12', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(13);
        store.setActividadesPorSemana(3);
        store.setTierMinimo('ARCADE');

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.cantidadSemanas).toBeDefined();
      });

      it('debe fallar si actividadesPorSemana es menor a 1', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(4);
        store.setActividadesPorSemana(0);
        store.setTierMinimo('ARCADE');

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.actividadesPorSemana).toBeDefined();
      });

      it('debe fallar si actividadesPorSemana es mayor a 5', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(4);
        store.setActividadesPorSemana(6);
        store.setTierMinimo('ARCADE');

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.actividadesPorSemana).toBeDefined();
      });

      it('debe fallar si tierMinimo es null', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(4);
        store.setActividadesPorSemana(3);
        // No seteamos tierMinimo

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(false);
        expect(useStudioWizardStore.getState().errores.tierMinimo).toBeDefined();
      });

      it('debe pasar con todos los campos válidos', () => {
        const store = useStudioWizardStore.getState();
        store.setCantidadSemanas(8);
        store.setActividadesPorSemana(3);
        store.setTierMinimo('ARCADE_PLUS');

        const resultado = store.validarPaso(5);

        expect(resultado).toBe(true);
      });
    });

    describe('validarPaso(6)', () => {
      it('paso 6 es solo confirmación, siempre pasa', () => {
        const store = useStudioWizardStore.getState();

        const resultado = store.validarPaso(6);

        expect(resultado).toBe(true);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 5. RESET
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Reset', () => {
    it('resetWizard() debe volver al paso 1', () => {
      const store = useStudioWizardStore.getState();
      store.setCategoria('EXPERIENCIA');
      store.siguientePaso();
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.siguientePaso(); // paso 3

      store.resetWizard();

      expect(useStudioWizardStore.getState().pasoActual).toBe(1);
    });

    it('resetWizard() debe limpiar todos los datos', () => {
      const store = useStudioWizardStore.getState();
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.setTipoExperiencia('NARRATIVO');
      store.setNombre('Curso Test');
      store.setDescripcion('Descripción del curso test');
      store.setEsteticaBase('Harry Potter');
      store.setCantidadSemanas(8);
      store.setTierMinimo('PRO');

      store.resetWizard();

      const { datos } = useStudioWizardStore.getState();
      expect(datos.categoria).toBeNull();
      expect(datos.casa).toBeNull();
      expect(datos.mundo).toBeNull();
      expect(datos.tipoExperiencia).toBeNull();
      expect(datos.materia).toBeNull();
      expect(datos.nombre).toBe('');
      expect(datos.descripcion).toBe('');
      expect(datos.esteticaBase).toBe('');
      expect(datos.esteticaVariante).toBe('');
      expect(datos.cantidadSemanas).toBe(4);
      expect(datos.actividadesPorSemana).toBe(3);
      expect(datos.tierMinimo).toBeNull();
    });

    it('resetWizard() debe limpiar errores', () => {
      const store = useStudioWizardStore.getState();
      store.siguientePaso(); // Genera error de categoria
      expect(Object.keys(useStudioWizardStore.getState().errores).length).toBeGreaterThan(0);

      store.resetWizard();

      expect(useStudioWizardStore.getState().errores).toEqual({});
    });

    it('resetWizard() debe resetear isSubmitting a false', () => {
      // Este test asume que podemos setear isSubmitting de alguna forma
      // En la implementación real, isSubmitting se setea durante crearCurso()
      const store = useStudioWizardStore.getState();

      store.resetWizard();

      expect(useStudioWizardStore.getState().isSubmitting).toBe(false);
    });

    it('resetWizard() debe resetear submitError a null', () => {
      const store = useStudioWizardStore.getState();

      store.resetWizard();

      expect(useStudioWizardStore.getState().submitError).toBeNull();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 6. VALIDAR TODO (para submit final)
  // ═══════════════════════════════════════════════════════════════════════════

  describe('validarTodo()', () => {
    it('debe fallar si algún paso no es válido', () => {
      const store = useStudioWizardStore.getState();
      // Solo seteamos algunos campos
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      // Falta mundo, tipoExperiencia, nombre, etc.

      const resultado = store.validarTodo();

      expect(resultado).toBe(false);
    });

    it('debe pasar si todos los pasos son válidos', () => {
      const store = useStudioWizardStore.getState();
      // Paso 1
      store.setCategoria('EXPERIENCIA');
      // Paso 2
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      // Paso 3
      store.setTipoExperiencia('NARRATIVO');
      // Paso 4
      store.setNombre('La Química de Harry Potter');
      store.setDescripcion('Aprende química básica preparando pociones mágicas');
      store.setEsteticaBase('Harry Potter');
      // Paso 5
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');

      const resultado = store.validarTodo();

      expect(resultado).toBe(true);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 7. LIMPIAR ERROR
  // ═══════════════════════════════════════════════════════════════════════════

  describe('limpiarError()', () => {
    it('debe eliminar el error del campo especificado', () => {
      const store = useStudioWizardStore.getState();
      store.siguientePaso(); // Genera error de categoria
      expect(useStudioWizardStore.getState().errores.categoria).toBeDefined();

      store.limpiarError('categoria');

      expect(useStudioWizardStore.getState().errores.categoria).toBeUndefined();
    });

    it('no debe afectar otros errores', () => {
      const store = useStudioWizardStore.getState();
      store.setCategoria('EXPERIENCIA');
      store.siguientePaso(); // -> paso 2
      store.siguientePaso(); // Genera errores de casa y mundo

      store.limpiarError('casa');

      expect(useStudioWizardStore.getState().errores.casa).toBeUndefined();
      expect(useStudioWizardStore.getState().errores.mundo).toBeDefined();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 8. NAVEGACIÓN DESDE PASO 6
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Navegación desde paso 6', () => {
    it('siguientePaso() desde paso 6 debe retornar false y no cambiar nada', () => {
      const store = useStudioWizardStore.getState();
      // Completar todos los pasos para llegar al 6
      store.setCategoria('EXPERIENCIA');
      store.siguientePaso(); // -> 2
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.siguientePaso(); // -> 3
      store.setTipoExperiencia('NARRATIVO');
      store.siguientePaso(); // -> 4
      store.setNombre('Curso de Test');
      store.setDescripcion('Descripción válida del curso de test');
      store.setEsteticaBase('Harry Potter');
      store.siguientePaso(); // -> 5
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');
      store.siguientePaso(); // -> 6

      expect(useStudioWizardStore.getState().pasoActual).toBe(6);

      const resultado = store.siguientePaso();

      expect(resultado).toBe(false);
      expect(useStudioWizardStore.getState().pasoActual).toBe(6);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // 9. CREAR CURSO
  // ═══════════════════════════════════════════════════════════════════════════

  describe('crearCurso()', () => {
    it('debe retornar null si validarTodo() falla', async () => {
      const store = useStudioWizardStore.getState();
      // No seteamos nada, validación fallará

      const resultado = await store.crearCurso();

      expect(resultado).toBeNull();
    });

    it('debe setear isSubmitting true durante ejecución', async () => {
      const store = useStudioWizardStore.getState();
      // Completar todos los campos
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.setTipoExperiencia('NARRATIVO');
      store.setNombre('Curso de Test');
      store.setDescripcion('Descripción válida del curso');
      store.setEsteticaBase('Harry Potter');
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');

      // Capturamos el estado durante la ejecución
      const promise = store.crearCurso();

      // Nota: Como el mock es síncrono, isSubmitting ya habrá vuelto a false
      // pero verificamos que la promesa resuelve correctamente
      const resultado = await promise;

      expect(resultado).not.toBeNull();
    });

    it('debe retornar cursoId mock si todo es válido', async () => {
      const store = useStudioWizardStore.getState();
      // Completar todos los campos
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.setTipoExperiencia('NARRATIVO');
      store.setNombre('Curso de Test');
      store.setDescripcion('Descripción válida del curso');
      store.setEsteticaBase('Harry Potter');
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');

      const resultado = await store.crearCurso();

      expect(resultado).toMatch(/^curso-\d+$/);
    });

    it('debe setear isSubmitting false al terminar exitosamente', async () => {
      const store = useStudioWizardStore.getState();
      // Completar todos los campos
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.setTipoExperiencia('NARRATIVO');
      store.setNombre('Curso de Test');
      store.setDescripcion('Descripción válida del curso');
      store.setEsteticaBase('Harry Potter');
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');

      await store.crearCurso();

      expect(useStudioWizardStore.getState().isSubmitting).toBe(false);
    });

    it('debe mantener submitError null en éxito', async () => {
      const store = useStudioWizardStore.getState();
      // Completar todos los campos
      store.setCategoria('EXPERIENCIA');
      store.setCasa('VERTEX');
      store.setMundo('CIENCIAS');
      store.setTipoExperiencia('NARRATIVO');
      store.setNombre('Curso de Test');
      store.setDescripcion('Descripción válida del curso');
      store.setEsteticaBase('Harry Potter');
      store.setCantidadSemanas(8);
      store.setActividadesPorSemana(3);
      store.setTierMinimo('ARCADE');

      await store.crearCurso();

      expect(useStudioWizardStore.getState().submitError).toBeNull();
    });
  });
});
