/**
 * RaiseHandButton - Test Suite (TDD)
 *
 * Tests para el botón de levantar la mano en clase en vivo.
 * Permite al estudiante señalar que tiene una pregunta.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// 1. Crear mocks con vi.hoisted para que estén disponibles durante el hoisting
const mocks = vi.hoisted(() => {
  return {
    publishData: vi.fn().mockResolvedValue(undefined),
  };
});

// 2. vi.mock retorna siempre el mismo objeto mock
vi.mock('@livekit/components-react', () => ({
  useLocalParticipant: vi.fn(() => ({
    localParticipant: {
      identity: 'estudiante-123',
      name: 'Juan Pérez',
    },
  })),
  useRoomContext: vi.fn(() => ({
    localParticipant: {
      identity: 'estudiante-123',
      name: 'Juan Pérez',
      publishData: mocks.publishData,
    },
  })),
}));

// 3. Importar el componente DESPUÉS del mock
import { RaiseHandButton } from '../RaiseHandButton';

// Helper para decodificar los datos enviados
function decodeLastSentData(): Record<string, unknown> | null {
  if (mocks.publishData.mock.calls.length === 0) {
    return null;
  }

  const lastCall = mocks.publishData.mock.calls[mocks.publishData.mock.calls.length - 1];
  const data = lastCall?.[0];

  // Usar ArrayBuffer.isView() en lugar de instanceof Uint8Array
  // porque JSDOM usa una instancia diferente de Uint8Array
  if (ArrayBuffer.isView(data)) {
    const decoder = new TextDecoder();
    return JSON.parse(decoder.decode(data as Uint8Array)) as Record<string, unknown>;
  }
  return null;
}

describe('RaiseHandButton', () => {
  beforeEach(() => {
    mocks.publishData.mockClear();
  });

  /* ============================================================================
     RENDERIZADO BÁSICO
     ============================================================================ */
  describe('Renderizado básico', () => {
    it('should_render_raise_hand_button', () => {
      render(<RaiseHandButton />);

      const button = screen.getByRole('button', { name: /levantar mano/i });
      expect(button).toBeInTheDocument();
    });

    it('should_show_hand_icon', () => {
      render(<RaiseHandButton />);

      // Debe mostrar el icono de mano
      expect(screen.getByTestId('hand-icon')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     TOGGLE DE ESTADO
     ============================================================================ */
  describe('Toggle de estado', () => {
    it('should_toggle_to_raised_state_when_clicked', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      const button = screen.getByRole('button', { name: /levantar mano/i });
      await user.click(button);

      // Después de click, debe mostrar "Bajar mano"
      expect(screen.getByRole('button', { name: /bajar mano/i })).toBeInTheDocument();
    });

    it('should_toggle_back_to_lowered_state_when_clicked_again', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      const button = screen.getByRole('button', { name: /levantar mano/i });

      // Levantar mano
      await user.click(button);
      expect(screen.getByRole('button', { name: /bajar mano/i })).toBeInTheDocument();

      // Bajar mano
      await user.click(screen.getByRole('button', { name: /bajar mano/i }));
      expect(screen.getByRole('button', { name: /levantar mano/i })).toBeInTheDocument();
    });

    it('should_show_raised_indicator_when_hand_is_raised', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      await user.click(screen.getByRole('button', { name: /levantar mano/i }));

      // Debe mostrar indicador visual de mano levantada
      expect(screen.getByTestId('raised-indicator')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     COMUNICACIÓN VIA DATA CHANNEL
     ============================================================================ */
  describe('Comunicación via publishData', () => {
    it('should_send_raise_hand_event_when_raising', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      await user.click(screen.getByRole('button', { name: /levantar mano/i }));

      await waitFor(() => {
        expect(mocks.publishData).toHaveBeenCalled();
      });

      const sentData = decodeLastSentData();
      expect(sentData).toMatchObject({
        type: 'hand_raised',
        raised: true,
        participantId: 'estudiante-123',
        participantName: 'Juan Pérez',
      });
      expect(sentData).toHaveProperty('timestamp');
    });

    it('should_send_lower_hand_event_when_lowering', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      // Levantar
      await user.click(screen.getByRole('button', { name: /levantar mano/i }));
      mocks.publishData.mockClear();

      // Bajar
      await user.click(screen.getByRole('button', { name: /bajar mano/i }));

      await waitFor(() => {
        expect(mocks.publishData).toHaveBeenCalled();
      });

      const sentData = decodeLastSentData();
      expect(sentData).toMatchObject({
        type: 'hand_raised',
        raised: false,
        participantId: 'estudiante-123',
      });
    });
  });

  /* ============================================================================
     VARIANTES VISUALES
     ============================================================================ */
  describe('Variantes visuales', () => {
    it('should_render_compact_variant', () => {
      render(<RaiseHandButton variant="compact" />);

      const button = screen.getByRole('button');
      expect(button).toBeInTheDocument();
      // En compact no muestra texto
      expect(screen.queryByText(/levantar mano/i)).not.toBeInTheDocument();
    });

    it('should_have_highlighted_style_when_raised', async () => {
      const user = userEvent.setup();
      render(<RaiseHandButton />);

      await user.click(screen.getByRole('button', { name: /levantar mano/i }));

      const button = screen.getByRole('button', { name: /bajar mano/i });
      // Debe tener clase de estado activo (amarillo/dorado)
      expect(button).toHaveClass('bg-amber-500');
    });
  });
});
