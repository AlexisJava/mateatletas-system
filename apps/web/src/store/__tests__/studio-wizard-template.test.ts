/**
 * Tests para studio-wizard-template.ts
 * Verifica la generación correcta del JSON de plantilla
 */

import { describe, it, expect } from 'vitest';
import {
  generarPlantillaJSON,
  COMPONENTES_DISPONIBLES,
  TODOS_LOS_COMPONENTES,
} from '../studio-wizard-template';
import type { WizardDatos } from '../studio-wizard.store';

describe('studio-wizard-template', () => {
  const datosCompletos: WizardDatos = {
    categoria: 'EXPERIENCIA',
    casa: 'QUANTUM',
    mundo: 'CIENCIAS',
    tipoExperiencia: 'LABORATORIO',
    materia: null,
    nombre: 'Química Mágica de Harry Potter',
    descripcion: 'Aprende química preparando pociones mágicas en Hogwarts',
    esteticaBase: 'Harry Potter',
    esteticaVariante: 'Hogwarts',
    cantidadSemanas: 4,
    actividadesPorSemana: 3,
    tierMinimo: 'ARCADE',
  };

  describe('COMPONENTES_DISPONIBLES', () => {
    it('debe tener 8 categorías de componentes', () => {
      const categorias = Object.keys(COMPONENTES_DISPONIBLES);
      expect(categorias).toContain('interactivosBasicos');
      expect(categorias).toContain('motricidadFina');
      expect(categorias).toContain('simuladoresQuimica');
      expect(categorias).toContain('simuladoresFisica');
      expect(categorias).toContain('simuladoresBiologia');
      expect(categorias).toContain('simuladoresMatematica');
      expect(categorias).toContain('editoresCodigo');
      expect(categorias).toContain('creativos');
      expect(categorias).toContain('multimedia');
      expect(categorias).toContain('evaluacion');
      expect(categorias).toContain('multiplayer');
    });

    it('debe tener 15 interactivos básicos', () => {
      expect(COMPONENTES_DISPONIBLES.interactivosBasicos).toHaveLength(15);
      expect(COMPONENTES_DISPONIBLES.interactivosBasicos).toContain('DragDropZone');
      expect(COMPONENTES_DISPONIBLES.interactivosBasicos).toContain('MultipleChoice');
    });

    it('debe tener 10 componentes de motricidad fina', () => {
      expect(COMPONENTES_DISPONIBLES.motricidadFina).toHaveLength(10);
      expect(COMPONENTES_DISPONIBLES.motricidadFina).toContain('PinchZoom');
    });

    it('debe tener 25 simuladores científicos en total', () => {
      const totalSimuladores =
        COMPONENTES_DISPONIBLES.simuladoresQuimica.length +
        COMPONENTES_DISPONIBLES.simuladoresFisica.length +
        COMPONENTES_DISPONIBLES.simuladoresBiologia.length +
        COMPONENTES_DISPONIBLES.simuladoresMatematica.length;
      expect(totalSimuladores).toBe(25);
    });
  });

  describe('TODOS_LOS_COMPONENTES', () => {
    it('debe tener 95 componentes en total', () => {
      expect(TODOS_LOS_COMPONENTES.length).toBe(95);
    });

    it('debe incluir componentes de todas las categorías', () => {
      // Interactivos
      expect(TODOS_LOS_COMPONENTES).toContain('DragDropZone');
      // Motricidad
      expect(TODOS_LOS_COMPONENTES).toContain('PinchZoom');
      // Simuladores
      expect(TODOS_LOS_COMPONENTES).toContain('MoleculeBuilder3D');
      expect(TODOS_LOS_COMPONENTES).toContain('GravitySandbox');
      // Editores
      expect(TODOS_LOS_COMPONENTES).toContain('PythonEditor');
      // Creativos
      expect(TODOS_LOS_COMPONENTES).toContain('PixelArtEditor');
      // Multimedia
      expect(TODOS_LOS_COMPONENTES).toContain('VideoPlayer');
      expect(TODOS_LOS_COMPONENTES).toContain('InteractivePresentation');
      // Evaluación
      expect(TODOS_LOS_COMPONENTES).toContain('Quiz');
      // Multiplayer
      expect(TODOS_LOS_COMPONENTES).toContain('SharedWhiteboard');
    });
  });

  describe('generarPlantillaJSON', () => {
    it('debe generar estructura con _meta, curso, semanas y componentesDisponibles', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      expect(plantilla).toHaveProperty('_meta');
      expect(plantilla).toHaveProperty('curso');
      expect(plantilla).toHaveProperty('semanas');
      expect(plantilla).toHaveProperty('componentesDisponibles');
    });

    it('debe incluir instrucciones para Claude en _meta', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      expect(plantilla._meta.version).toBe('1.0.0');
      expect(plantilla._meta.generadoEn).toBeDefined();
      expect(plantilla._meta.instrucciones).toContain('INSTRUCCIONES PARA CLAUDE');
      expect(plantilla._meta.instrucciones).toContain('componente');
      expect(plantilla._meta.instrucciones).toContain('bloques');
    });

    it('debe incluir datos del curso correctamente', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      expect(plantilla.curso.id).toBe('curso-123');
      expect(plantilla.curso.nombre).toBe('Química Mágica de Harry Potter');
      expect(plantilla.curso.categoria).toBe('EXPERIENCIA');
      expect(plantilla.curso.casa).toBe('QUANTUM');
      expect(plantilla.curso.mundo).toBe('CIENCIAS');
      expect(plantilla.curso.tipoExperiencia).toBe('LABORATORIO');
      expect(plantilla.curso.esteticaBase).toBe('Harry Potter');
      expect(plantilla.curso.esteticaVariante).toBe('Hogwarts');
      expect(plantilla.curso.cantidadSemanas).toBe(4);
      expect(plantilla.curso.actividadesPorSemana).toBe(3);
      expect(plantilla.curso.tierMinimo).toBe('ARCADE');
    });

    it('debe generar la cantidad correcta de semanas', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      expect(plantilla.semanas).toHaveLength(4);
      expect(plantilla.semanas[0].numero).toBe(1);
      expect(plantilla.semanas[3].numero).toBe(4);
    });

    it('debe generar la cantidad correcta de actividades por semana', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      plantilla.semanas.forEach((semana) => {
        expect(semana.actividades).toHaveLength(3);
        expect(semana.actividades[0].numero).toBe(1);
        expect(semana.actividades[2].numero).toBe(3);
      });
    });

    it('cada actividad debe tener estructura de bloques vacíos para completar', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      const primeraActividad = plantilla.semanas[0].actividades[0];
      expect(primeraActividad.nombre).toBe('');
      expect(primeraActividad.duracionMinutos).toBe(30);
      expect(primeraActividad.bloques).toHaveLength(1);
      expect(primeraActividad.bloques[0].componente).toBe('');
    });

    it('debe incluir lista de componentes disponibles', () => {
      const plantilla = generarPlantillaJSON('curso-123', datosCompletos);

      expect(plantilla.componentesDisponibles.porCategoria).toEqual(COMPONENTES_DISPONIBLES);
      expect(plantilla.componentesDisponibles.listaCompleta).toHaveLength(95);
    });

    it('no debe incluir tipoExperiencia si es CURRICULAR', () => {
      const datosCurricular: WizardDatos = {
        ...datosCompletos,
        categoria: 'CURRICULAR',
        tipoExperiencia: null,
        materia: 'FISICA',
      };

      const plantilla = generarPlantillaJSON('curso-456', datosCurricular);

      expect(plantilla.curso.tipoExperiencia).toBeUndefined();
      expect(plantilla.curso.materia).toBe('FISICA');
    });

    it('no debe incluir esteticaVariante si está vacío', () => {
      const datosSinVariante: WizardDatos = {
        ...datosCompletos,
        esteticaVariante: '',
      };

      const plantilla = generarPlantillaJSON('curso-789', datosSinVariante);

      expect(plantilla.curso.esteticaVariante).toBeUndefined();
    });
  });
});
