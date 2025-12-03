import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerPreview,
  getPreview,
  hasPreview,
  listPreviews,
  clearPreviewRegistry,
} from '../preview-registry';
import { PreviewComponentProps, PreviewDefinition } from '../types';

// Mock preview component
const MockPreviewComponent = ({ exampleData }: PreviewComponentProps): React.ReactElement => (
  <div data-testid="mock-preview">{JSON.stringify(exampleData)}</div>
);

const mockPreviewDefinition: PreviewDefinition = {
  component: MockPreviewComponent,
  exampleData: {
    pregunta: '¿Cuánto es 2+2?',
    opciones: ['3', '4', '5'],
    respuestaCorrecta: 1,
  },
  propsDocumentation: [
    {
      name: 'pregunta',
      type: 'string',
      description: 'El texto de la pregunta',
      required: true,
    },
    {
      name: 'opciones',
      type: 'array',
      description: 'Lista de opciones de respuesta',
      required: true,
    },
    {
      name: 'respuestaCorrecta',
      type: 'number',
      description: 'Índice de la opción correcta',
      required: true,
    },
  ],
};

describe('preview-registry', () => {
  beforeEach(() => {
    clearPreviewRegistry();
  });

  describe('registerPreview', () => {
    it('should_register_preview_for_tipo', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);

      expect(hasPreview('MultipleChoice')).toBe(true);
    });

    it('should_allow_overwriting_existing_preview', () => {
      const altDefinition: PreviewDefinition = {
        ...mockPreviewDefinition,
        exampleData: { diferente: true },
      };

      registerPreview('MultipleChoice', mockPreviewDefinition);
      registerPreview('MultipleChoice', altDefinition);

      const preview = getPreview('MultipleChoice');
      expect(preview?.exampleData).toEqual({ diferente: true });
    });

    it('should_register_multiple_previews', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);
      registerPreview('FillBlanks', mockPreviewDefinition);
      registerPreview('VideoPlayer', mockPreviewDefinition);

      expect(hasPreview('MultipleChoice')).toBe(true);
      expect(hasPreview('FillBlanks')).toBe(true);
      expect(hasPreview('VideoPlayer')).toBe(true);
    });
  });

  describe('getPreview', () => {
    it('should_return_registered_preview', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);

      const preview = getPreview('MultipleChoice');

      expect(preview).toBeDefined();
      expect(preview?.component).toBe(MockPreviewComponent);
      expect(preview?.exampleData).toEqual(mockPreviewDefinition.exampleData);
    });

    it('should_return_undefined_for_unregistered', () => {
      const preview = getPreview('NoExiste');

      expect(preview).toBeUndefined();
    });

    it('should_return_complete_definition', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);

      const preview = getPreview('MultipleChoice');

      expect(preview?.propsDocumentation).toHaveLength(3);
      expect(preview?.propsDocumentation[0].name).toBe('pregunta');
    });
  });

  describe('hasPreview', () => {
    it('should_return_true_for_registered', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);

      expect(hasPreview('MultipleChoice')).toBe(true);
    });

    it('should_return_false_for_unregistered', () => {
      expect(hasPreview('NoExiste')).toBe(false);
    });

    it('should_return_false_after_clear', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);
      clearPreviewRegistry();

      expect(hasPreview('MultipleChoice')).toBe(false);
    });
  });

  describe('listPreviews', () => {
    it('should_return_empty_array_when_empty', () => {
      expect(listPreviews()).toEqual([]);
    });

    it('should_return_all_registered_tipos', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);
      registerPreview('FillBlanks', mockPreviewDefinition);

      const tipos = listPreviews();

      expect(tipos).toContain('MultipleChoice');
      expect(tipos).toContain('FillBlanks');
      expect(tipos).toHaveLength(2);
    });

    it('should_return_sorted_list', () => {
      registerPreview('VideoPlayer', mockPreviewDefinition);
      registerPreview('FillBlanks', mockPreviewDefinition);
      registerPreview('MultipleChoice', mockPreviewDefinition);

      const tipos = listPreviews();

      expect(tipos).toEqual(['FillBlanks', 'MultipleChoice', 'VideoPlayer']);
    });
  });

  describe('clearPreviewRegistry', () => {
    it('should_clear_all_previews', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);
      registerPreview('FillBlanks', mockPreviewDefinition);

      clearPreviewRegistry();

      expect(listPreviews()).toEqual([]);
    });

    it('should_allow_re_registering_after_clear', () => {
      registerPreview('MultipleChoice', mockPreviewDefinition);
      clearPreviewRegistry();
      registerPreview('MultipleChoice', mockPreviewDefinition);

      expect(hasPreview('MultipleChoice')).toBe(true);
    });
  });

  describe('type safety', () => {
    it('should_preserve_example_data_types', () => {
      const typedDefinition: PreviewDefinition = {
        component: MockPreviewComponent,
        exampleData: {
          pregunta: 'Texto',
          numero: 42,
          booleano: true,
          array: [1, 2, 3],
          objeto: { nested: 'value' },
        },
        propsDocumentation: [],
      };

      registerPreview('TypedPreview', typedDefinition);
      const preview = getPreview('TypedPreview');

      expect(typeof preview?.exampleData.pregunta).toBe('string');
      expect(typeof preview?.exampleData.numero).toBe('number');
      expect(typeof preview?.exampleData.booleano).toBe('boolean');
      expect(Array.isArray(preview?.exampleData.array)).toBe(true);
      expect(typeof preview?.exampleData.objeto).toBe('object');
    });
  });
});
