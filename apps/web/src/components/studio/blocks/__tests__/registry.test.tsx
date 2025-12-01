/**
 * Tests para registry.ts
 */

import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registrarBloque,
  obtenerBloque,
  existeBloque,
  listarBloques,
  limpiarRegistry,
} from '../registry';
import { StudioBlockProps } from '../types';

// Componente mock para tests
const MockComponent = ({ id }: StudioBlockProps): React.ReactElement => <div data-testid={id} />;

describe('Registry', () => {
  beforeEach(() => {
    limpiarRegistry();
  });

  describe('registrarBloque', () => {
    it('should_register_component', () => {
      registrarBloque('Texto', MockComponent);
      expect(existeBloque('Texto')).toBe(true);
    });

    it('should_allow_overwriting', () => {
      registrarBloque('Texto', MockComponent);
      registrarBloque('Texto', MockComponent);
      expect(existeBloque('Texto')).toBe(true);
    });
  });

  describe('obtenerBloque', () => {
    it('should_return_registered_component', () => {
      registrarBloque('Texto', MockComponent);
      expect(obtenerBloque('Texto')).toBe(MockComponent);
    });

    it('should_return_undefined_if_not_exists', () => {
      expect(obtenerBloque('NoExiste')).toBeUndefined();
    });
  });

  describe('existeBloque', () => {
    it('should_return_true_for_registered', () => {
      registrarBloque('Texto', MockComponent);
      expect(existeBloque('Texto')).toBe(true);
    });

    it('should_return_false_for_unregistered', () => {
      expect(existeBloque('NoExiste')).toBe(false);
    });
  });

  describe('listarBloques', () => {
    it('should_return_all_registered_types', () => {
      registrarBloque('Texto', MockComponent);
      registrarBloque('Video', MockComponent);

      const tipos = listarBloques();

      expect(tipos).toContain('Texto');
      expect(tipos).toContain('Video');
      expect(tipos).toHaveLength(2);
    });

    it('should_return_empty_array_when_empty', () => {
      expect(listarBloques()).toEqual([]);
    });
  });

  describe('limpiarRegistry', () => {
    it('should_clear_all_registered', () => {
      registrarBloque('Texto', MockComponent);
      registrarBloque('Video', MockComponent);

      limpiarRegistry();

      expect(listarBloques()).toEqual([]);
    });
  });
});
