/**
 * Tests para BentoEditor
 * TDD: Tests primero
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { act } from '@testing-library/react';
import { BentoEditor } from '../BentoEditor';
import { useHojaStore } from '../../stores/hoja.store';

describe('BentoEditor', () => {
  beforeEach(() => {
    act(() => {
      useHojaStore.getState().clear();
    });
  });

  it('should_render_all_three_panels', () => {
    render(<BentoEditor />);

    // Panel izquierdo (paleta)
    expect(screen.getByText('Componentes')).toBeInTheDocument();

    // Panel central (grilla)
    expect(screen.getByTestId('bento-grid')).toBeInTheDocument();

    // Panel derecho (propiedades)
    expect(screen.getByText('Propiedades')).toBeInTheDocument();
  });

  it('should_show_empty_state_initially', () => {
    render(<BentoEditor />);

    // El grid debería mostrar estado vacío
    expect(screen.getByText(/Canvas vacío/i)).toBeInTheDocument();

    // El panel de propiedades debería pedir seleccionar
    expect(screen.getByText(/Seleccioná un bloque/i)).toBeInTheDocument();
  });

  it('should_render_blocks_from_palette', () => {
    render(<BentoEditor />);

    // Debería tener bloques en la paleta
    expect(screen.getByTestId('palette-block-Quiz')).toBeInTheDocument();
    expect(screen.getByTestId('palette-block-Slider')).toBeInTheDocument();
  });

  it('should_have_header_with_title', () => {
    render(<BentoEditor />);

    expect(screen.getByText('Studio')).toBeInTheDocument();
  });
});
