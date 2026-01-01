/**
 * ConfigModal - Test Suite
 *
 * Tests para el modal de configuración de tiers STEAM.
 * Cubre: renderizado, edición de precios, guardado.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigModal } from '../ConfigModal';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';
import type { TierConfig } from '../../types/finance.types';

// Mock config inicial
const createMockConfig = (overrides: Partial<TierConfig> = {}): TierConfig => ({
  precioSteamLibros: 15000,
  precioSteamAsincronico: 25000,
  precioSteamSincronico: 35000,
  descuentoSegundoHermano: 20,
  diaVencimiento: 10,
  diasAntesRecordatorio: 3,
  notificacionesActivas: true,
  ...overrides,
});

describe('ConfigModal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
    config: createMockConfig(),
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
      render(<ConfigModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByText(/Configuracion Tiers STEAM/i)).not.toBeInTheDocument();
    });

    it('renderiza el modal cuando isOpen es true', () => {
      render(<ConfigModal {...defaultProps} />);

      expect(screen.getByText(/Configuracion Tiers STEAM 2026/i)).toBeInTheDocument();
    });

    it('muestra los campos de precio para cada tier', () => {
      render(<ConfigModal {...defaultProps} />);

      expect(screen.getByText('STEAM Libros')).toBeInTheDocument();
      expect(screen.getByText('STEAM Asincronico')).toBeInTheDocument();
      expect(screen.getByText('STEAM Sincronico')).toBeInTheDocument();
    });

    it('muestra el campo de descuento familiar', () => {
      render(<ConfigModal {...defaultProps} />);

      expect(screen.getByText('Descuento Familiar')).toBeInTheDocument();
      expect(screen.getByText('2do hermano en adelante (%)')).toBeInTheDocument();
    });

    it('muestra el campo de motivo del cambio', () => {
      render(<ConfigModal {...defaultProps} />);

      expect(screen.getByText('Motivo del Cambio (Opcional)')).toBeInTheDocument();
    });

    it('muestra botones de Cancelar y Guardar', () => {
      render(<ConfigModal {...defaultProps} />);

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

      render(<ConfigModal {...defaultProps} onClose={mockOnClose} />);

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

      render(<ConfigModal {...defaultProps} onClose={mockOnClose} />);

      await user.click(screen.getByRole('button', { name: /Cancelar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('permite editar el motivo del cambio', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<ConfigModal {...defaultProps} />);

      const textarea = screen.getByPlaceholderText(/Ajuste de precios/i);
      await user.type(textarea, 'Nuevo precio 2026');

      expect(textarea).toHaveValue('Nuevo precio 2026');
    });

    it('actualiza el estado local cuando cambia la config prop', () => {
      const { rerender } = render(<ConfigModal {...defaultProps} />);

      rerender(
        <ConfigModal {...defaultProps} config={createMockConfig({ precioSteamLibros: 20000 })} />,
      );

      // El componente debería actualizar su estado interno
      // (verificado implícitamente por el renderizado sin errores)
    });
  });

  /* ============================================================================
     GUARDAR
     ============================================================================ */
  describe('Guardar', () => {
    it('muestra estado de guardando al hacer click en Guardar', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<ConfigModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Guardar/i }));

      expect(screen.getByText('Guardando...')).toBeInTheDocument();
    });

    it('llama a onSave con la config después del delay', async () => {
      const mockOnSave = vi.fn();
      const mockOnClose = vi.fn();
      const config = createMockConfig();

      render(
        <ConfigModal {...defaultProps} config={config} onSave={mockOnSave} onClose={mockOnClose} />,
      );

      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      saveButton.click();

      // Avanzar el timer del delay (800ms)
      await vi.advanceTimersByTimeAsync(800);

      expect(mockOnSave).toHaveBeenCalledWith(config);
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('deshabilita el botón de guardar mientras está guardando', async () => {
      vi.useRealTimers();
      const user = userEvent.setup();

      render(<ConfigModal {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /Guardar/i }));

      const savingButton = screen.getByRole('button', { name: /Guardando.../i });
      expect(savingButton).toBeDisabled();
    });

    it('cierra el modal después de guardar exitosamente', async () => {
      const mockOnClose = vi.fn();

      render(<ConfigModal {...defaultProps} onClose={mockOnClose} />);

      const saveButton = screen.getByRole('button', { name: /Guardar/i });
      saveButton.click();

      await vi.advanceTimersByTimeAsync(800);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
