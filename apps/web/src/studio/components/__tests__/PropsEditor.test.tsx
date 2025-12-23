/**
 * Tests para PropsEditor
 * TDD: Tests primero
 *
 * IMPORTANTE: Este componente usa estado LOCAL para evitar
 * el bug de loop infinito del editor anterior.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from '@testing-library/react';
import { PropsEditor } from '../PropsEditor';
import { useHojaStore } from '../../stores/hoja.store';

describe('PropsEditor', () => {
  beforeEach(() => {
    act(() => {
      useHojaStore.getState().clear();
    });
  });

  it('should_show_empty_state_when_nothing_selected', () => {
    render(<PropsEditor />);

    expect(screen.getByText(/Seleccioná un bloque/i)).toBeInTheDocument();
  });

  it('should_show_block_info_when_selected', () => {
    // Agregar y seleccionar un bloque
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    render(<PropsEditor />);

    // Debería mostrar info del Quiz
    expect(screen.getByText('Quiz')).toBeInTheDocument();
    expect(screen.getByText('❓')).toBeInTheDocument();
  });

  it('should_show_position_inputs', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 3,
        colSpan: 6,
        rowStart: 2,
        rowSpan: 4,
      });
    });

    render(<PropsEditor />);

    // Verificar que los inputs de posición existen
    expect(screen.getByTestId('input-colStart')).toBeInTheDocument();
    expect(screen.getByTestId('input-colSpan')).toBeInTheDocument();
    expect(screen.getByTestId('input-rowStart')).toBeInTheDocument();
    expect(screen.getByTestId('input-rowSpan')).toBeInTheDocument();
  });

  it('should_not_update_store_immediately_on_input_change', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    render(<PropsEditor />);

    const colSpanInput = screen.getByTestId('input-colSpan');

    // Cambiar el valor localmente
    fireEvent.change(colSpanInput, { target: { value: '8' } });

    // El store NO debería haberse actualizado todavía
    const { bloques } = useHojaStore.getState();
    expect(bloques[0].position.colSpan).toBe(4); // Sigue siendo 4
  });

  it('should_update_store_only_when_apply_is_clicked', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    render(<PropsEditor />);

    const colSpanInput = screen.getByTestId('input-colSpan');
    fireEvent.change(colSpanInput, { target: { value: '8' } });

    // Click en Aplicar
    const applyButton = screen.getByText(/Aplicar/i);
    fireEvent.click(applyButton);

    // Ahora SÍ debería haberse actualizado
    const { bloques } = useHojaStore.getState();
    expect(bloques[0].position.colSpan).toBe(8);
  });

  it('should_reset_local_state_when_cancel_is_clicked', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    render(<PropsEditor />);

    const colSpanInput = screen.getByTestId('input-colSpan') as HTMLInputElement;
    fireEvent.change(colSpanInput, { target: { value: '8' } });

    // Click en Cancelar
    const cancelButton = screen.getByText(/Cancelar/i);
    fireEvent.click(cancelButton);

    // El input debería volver al valor original
    expect(colSpanInput.value).toBe('4');
  });

  it('should_show_delete_button', () => {
    act(() => {
      useHojaStore.getState().addBloque('Quiz', {
        colStart: 1,
        colSpan: 4,
        rowStart: 1,
        rowSpan: 2,
      });
    });

    render(<PropsEditor />);

    expect(screen.getByText(/Eliminar/i)).toBeInTheDocument();
  });
});
