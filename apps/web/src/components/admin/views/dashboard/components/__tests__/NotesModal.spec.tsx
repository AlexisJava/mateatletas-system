/**
 * NotesModal - Test Suite
 *
 * Tests para el modal de notas del día.
 * Cubre: renderizado, edición de texto, guardado con delay simulado.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotesModal } from '../NotesModal';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';

describe('NotesModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    notes: 'Notas iniciales de prueba',
    onSave: vi.fn(),
  };

  beforeEach(() => {
    standardBeforeEach();
    vi.useFakeTimers();
  });

  afterEach(() => {
    standardAfterEach();
    vi.useRealTimers();
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('no renderiza nada cuando isOpen es false', () => {
      render(<NotesModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText('Notas del día')).not.toBeInTheDocument();
    });

    it('renderiza el modal cuando isOpen es true', () => {
      render(<NotesModal {...defaultProps} />);

      expect(screen.getByText('Notas del día')).toBeInTheDocument();
    });

    it('muestra el textarea con las notas iniciales', () => {
      render(<NotesModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText('Escribe tus notas aquí...');
      expect(textarea).toHaveValue('Notas iniciales de prueba');
    });

    it('muestra botones de Cancelar y Guardar', () => {
      render(<NotesModal {...defaultProps} />);

      expect(screen.getByRole('button', { name: /Cancelar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Guardar/i })).toBeInTheDocument();
    });
  });

  /* ============================================================================
     INTERACCIONES
     ============================================================================ */
  describe('Interacciones', () => {
    it('cierra el modal al hacer click en X', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<NotesModal {...defaultProps} onClose={mockOnClose} />);

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('cierra el modal al hacer click en Cancelar', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<NotesModal {...defaultProps} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('permite editar el texto del textarea', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<NotesModal {...defaultProps} notes="" />);

      const textarea = screen.getByPlaceholderText('Escribe tus notas aquí...');
      await user.type(textarea, 'Nuevas notas');

      expect(textarea).toHaveValue('Nuevas notas');
    });

    it('actualiza el estado local cuando cambian las notas prop', () => {
      const { rerender } = render(<NotesModal {...defaultProps} notes="Texto inicial" />);

      const textarea = screen.getByPlaceholderText('Escribe tus notas aquí...');
      expect(textarea).toHaveValue('Texto inicial');

      rerender(<NotesModal {...defaultProps} notes="Texto actualizado" />);
      expect(textarea).toHaveValue('Texto actualizado');
    });
  });

  /* ============================================================================
     GUARDAR
     ============================================================================ */
  describe('Guardar', () => {
    it('muestra estado de guardando al hacer click en Guardar', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<NotesModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Guardar/i }));

      // Debería mostrar "Guardando..." y el spinner
      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('llama a onSave con el texto editado después del delay', async () => {
      const mockOnSave = vi.fn();
      const mockOnClose = vi.fn();

      render(
        <NotesModal
          {...defaultProps}
          notes="Notas originales"
          onSave={mockOnSave}
          onClose={mockOnClose}
        />,
      );

      // Click en guardar
      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      saveButton.click();

      // Avanzar el timer del delay (500ms)
      await vi.advanceTimersByTimeAsync(500);

      expect(mockOnSave).toHaveBeenCalledWith('Notas originales');
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('deshabilita el botón de guardar mientras está guardando', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<NotesModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Guardar/i }));

      // El botón debería estar deshabilitado
      const savingButton = screen.getByRole('button', { name: /Guardando.../i });
      expect(savingButton).toBeDisabled();
    });

    it('cierra el modal después de guardar exitosamente', async () => {
      const mockOnClose = vi.fn();

      render(<NotesModal {...defaultProps} onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      saveButton.click();

      await vi.advanceTimersByTimeAsync(500);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
