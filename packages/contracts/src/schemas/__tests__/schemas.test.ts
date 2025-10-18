import { describe, it, expect } from 'vitest';
import {
  loginSchema,
  estudianteSchema,
  equipoSchema,
  notificacionSchema,
  productoSchema,
  claseSchema,
} from '../..';

describe('Contracts Schemas', () => {
  describe('loginSchema', () => {
    it('valida login correcto', () => {
      const valid = {
        email: 'test@example.com',
        password: '123456',
      };
      expect(() => loginSchema.parse(valid)).not.toThrow();
    });

    it('rechaza email inválido', () => {
      const invalid = {
        email: 'not-an-email',
        password: '123456',
      };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });

    it('rechaza password corto', () => {
      const invalid = {
        email: 'test@example.com',
        password: '123',
      };
      expect(() => loginSchema.parse(invalid)).toThrow();
    });
  });

  describe('estudianteSchema', () => {
    it('valida estudiante correcto', () => {
      const valid = {
        id: 'cuid123',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivel_escolar: 'Primaria',
        tutor_id: 'tutor123',
        puntos_totales: 100,
        nivel_actual: 2,
        avatar_url: 'avataaars',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => estudianteSchema.parse(valid)).not.toThrow();
    });

    it('rechaza edad negativa', () => {
      const invalid = {
        id: 'cuid123',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: -5,
        nivel_escolar: 'Primaria',
        tutor_id: 'tutor123',
        puntos_totales: 100,
        nivel_actual: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => estudianteSchema.parse(invalid)).toThrow();
    });

    it('rechaza nivel escolar inválido', () => {
      const invalid = {
        id: 'cuid123',
        nombre: 'Juan',
        apellido: 'Pérez',
        edad: 10,
        nivel_escolar: 'Jardin', // No es válido
        tutor_id: 'tutor123',
        puntos_totales: 100,
        nivel_actual: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => estudianteSchema.parse(invalid)).toThrow();
    });
  });

  describe('equipoSchema', () => {
    it('valida equipo correcto', () => {
      const valid = {
        id: 'equipo123',
        nombre: 'Fénix',
        color_primario: '#FF5733',
        color_secundario: '#33FF57',
        puntos_totales: 500,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => equipoSchema.parse(valid)).not.toThrow();
    });
  });

  describe('notificacionSchema', () => {
    it('valida notificación correcta', () => {
      const valid = {
        id: 'notif123',
        usuario_id: 'user123',
        tipo: 'CLASE_PROGRAMADA',
        titulo: 'Nueva clase programada',
        mensaje: 'Se programó una clase para mañana',
        leida: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => notificacionSchema.parse(valid)).not.toThrow();
    });

    it('rechaza tipo de notificación inválido', () => {
      const invalid = {
        id: 'notif123',
        usuario_id: 'user123',
        tipo: 'TIPO_INVALIDO',
        titulo: 'Nueva clase programada',
        mensaje: 'Se programó una clase para mañana',
        leida: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => notificacionSchema.parse(invalid)).toThrow();
    });
  });

  describe('productoSchema', () => {
    it('valida producto tipo Curso', () => {
      const valid = {
        id: 'prod123',
        nombre: 'Curso de Álgebra',
        descripcion: 'Curso completo de álgebra',
        precio: 1500.50,
        tipo: 'Curso',
        activo: true,
        fecha_inicio: new Date().toISOString(),
        fecha_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cupo_maximo: 20,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => productoSchema.parse(valid)).not.toThrow();
    });

    it('rechaza precio negativo', () => {
      const invalid = {
        id: 'prod123',
        nombre: 'Curso de Álgebra',
        descripcion: 'Curso completo de álgebra',
        precio: -100,
        tipo: 'Curso',
        activo: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => productoSchema.parse(invalid)).toThrow();
    });
  });

  describe('claseSchema', () => {
    it('valida clase correcta', () => {
      const valid = {
        id: 'clase123',
        nombre: 'Godot Básico',
        docente_id: 'docente123',
        fecha_hora_inicio: new Date().toISOString(),
        duracion_minutos: 60,
        estado: 'Programada',
        cupos_maximo: 10,
        cupos_ocupados: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => claseSchema.parse(valid)).not.toThrow();
    });

    it('rechaza duración negativa', () => {
      const invalid = {
        id: 'clase123',
        nombre: 'Godot Básico',
        docente_id: 'docente123',
        fecha_hora_inicio: new Date().toISOString(),
        duracion_minutos: -30,
        estado: 'Programada',
        cupos_maximo: 10,
        cupos_ocupados: 5,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      expect(() => claseSchema.parse(invalid)).toThrow();
    });
  });
});
