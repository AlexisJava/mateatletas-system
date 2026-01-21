/**
 * JoinClassButton - Test Suite (TDD)
 *
 * Tests para el botón de unirse a clase en vivo.
 * Escrito ANTES de la implementación.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { JoinClassButton } from '../JoinClassButton';

// Mock del router de Next.js
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock de la API de LiveKit
const mockGetTokenEstudiante = vi.fn();
vi.mock('@/lib/api/livekit.api', () => ({
  livekitApi: {
    getTokenEstudiante: (...args: unknown[]) => mockGetTokenEstudiante(...args),
  },
}));

// Mock de la API de estudiantes (para validar plan)
const mockGetMiPlan = vi.fn();
vi.mock('@/lib/api/estudiantes.api', () => ({
  estudiantesApi: {
    getMiPlan: () => mockGetMiPlan(),
  },
}));

describe('JoinClassButton', () => {
  const defaultProps = {
    claseGrupoId: 'clase-grupo-123',
    estadoClase: 'EnVivo' as const,
    nombreClase: 'Matemática Básico 1',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Por defecto, el plan permite clases en vivo
    mockGetMiPlan.mockResolvedValue({
      tienePlan: true,
      plan: { nombre: 'STEAM_SINCRONICO' },
      accesoClasesVivo: true,
      mensaje: 'Acceso completo a clases en vivo',
    });
  });

  /* ============================================================================
     RENDERIZADO SEGÚN ESTADO
     ============================================================================ */
  describe('Renderizado según estado de clase', () => {
    it('should_render_join_button_when_class_is_EnVivo', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      // Esperar a que cargue el plan
      await waitFor(() => {
        const button = screen.getByRole('button', { name: /unirse/i });
        expect(button).toBeInTheDocument();
        expect(button).toBeEnabled();
      });
    });

    it('should_render_disabled_button_when_class_is_Programada', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="Programada" />);

      await waitFor(() => {
        expect(screen.getByText(/próximamente/i)).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should_render_disabled_button_when_class_is_Finalizada', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="Finalizada" />);

      await waitFor(() => {
        expect(screen.getByText(/finalizada/i)).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });

    it('should_render_disabled_button_when_class_is_Cancelada', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="Cancelada" />);

      await waitFor(() => {
        expect(screen.getByText(/cancelada/i)).toBeInTheDocument();
      });

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  /* ============================================================================
     INTERACCIÓN - CLICK
     ============================================================================ */
  describe('Click y navegación', () => {
    it('should_show_loading_state_when_clicked', async () => {
      // Simular respuesta lenta
      mockGetTokenEstudiante.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ token: 'test', wsUrl: 'wss://test', roomName: 'room' }),
              100,
            ),
          ),
      );

      const user = userEvent.setup();
      render(<JoinClassButton {...defaultProps} />);

      // Esperar a que cargue el plan
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
      });

      const button = screen.getByRole('button', { name: /unirse/i });
      await user.click(button);

      // Debe mostrar estado de carga
      expect(screen.getByText(/conectando/i)).toBeInTheDocument();
    });

    it('should_navigate_to_clase_en_vivo_on_success', async () => {
      mockGetTokenEstudiante.mockResolvedValue({
        token: 'jwt-token-123',
        wsUrl: 'wss://livekit.example.com',
        roomName: 'clase-grupo-clase-grupo-123',
      });

      const user = userEvent.setup();
      render(<JoinClassButton {...defaultProps} />);

      // Esperar a que cargue el plan
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /unirse/i }));

      await waitFor(() => {
        expect(mockGetTokenEstudiante).toHaveBeenCalledWith({
          claseGrupoId: 'clase-grupo-123',
        });
      });

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/estudiante/clase-en-vivo'));
      });
    });

    it('should_pass_comisionId_when_provided_instead_of_claseGrupoId', async () => {
      mockGetTokenEstudiante.mockResolvedValue({
        token: 'jwt-token-123',
        wsUrl: 'wss://livekit.example.com',
        roomName: 'comision-comision-456',
      });

      const user = userEvent.setup();
      render(
        <JoinClassButton
          comisionId="comision-456"
          estadoClase="EnVivo"
          nombreClase="Colonia Turno Mañana"
        />,
      );

      // Esperar a que cargue el plan
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /unirse/i }));

      await waitFor(() => {
        expect(mockGetTokenEstudiante).toHaveBeenCalledWith({
          comisionId: 'comision-456',
        });
      });
    });
  });

  /* ============================================================================
     MANEJO DE ERRORES
     ============================================================================ */
  describe('Manejo de errores', () => {
    it('should_show_error_message_when_token_request_fails', async () => {
      mockGetTokenEstudiante.mockRejectedValue(new Error('No estás inscrito en esta clase'));

      const user = userEvent.setup();
      render(<JoinClassButton {...defaultProps} />);

      // Esperar a que cargue el plan
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /unirse/i }));

      await waitFor(() => {
        expect(screen.getByText(/no estás inscrito/i)).toBeInTheDocument();
      });

      // El botón debe volver a estar habilitado para reintentar
      expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
    });

    it('should_show_generic_error_for_network_failures', async () => {
      mockGetTokenEstudiante.mockRejectedValue(new Error('Network error'));

      const user = userEvent.setup();
      render(<JoinClassButton {...defaultProps} />);

      // Esperar a que cargue el plan
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /unirse/i })).toBeEnabled();
      });

      await user.click(screen.getByRole('button', { name: /unirse/i }));

      await waitFor(() => {
        expect(screen.getByText(/error al conectar/i)).toBeInTheDocument();
      });
    });
  });

  /* ============================================================================
     VARIANTES DE UI
     ============================================================================ */
  describe('Variantes de UI', () => {
    it('should_render_compact_variant_when_specified', async () => {
      render(<JoinClassButton {...defaultProps} variant="compact" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        // Compact solo muestra icono, no texto
        expect(button).toBeInTheDocument();
      });
      expect(screen.queryByText(/unirse a clase/i)).not.toBeInTheDocument();
    });

    it('should_render_full_variant_by_default', async () => {
      render(<JoinClassButton {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText(/unirse/i)).toBeInTheDocument();
      });
    });
  });

  /* ============================================================================
     INDICADOR EN VIVO
     ============================================================================ */
  describe('Indicador de clase en vivo', () => {
    it('should_show_live_indicator_pulse_when_EnVivo', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      // Esperar a que cargue el plan (el indicador solo aparece si el plan permite)
      await waitFor(() => {
        const indicator = screen.getByTestId('live-indicator');
        expect(indicator).toBeInTheDocument();
        expect(indicator).toHaveClass('animate-pulse');
      });
    });

    it('should_not_show_live_indicator_when_not_EnVivo', async () => {
      render(<JoinClassButton {...defaultProps} estadoClase="Programada" />);

      // Esperar a que se renderice y verificar que no hay indicador
      await waitFor(() => {
        expect(screen.getByRole('button')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('live-indicator')).not.toBeInTheDocument();
    });
  });

  /* ============================================================================
     VALIDACIÓN DE PLAN DE SUSCRIPCIÓN
     ============================================================================ */
  describe('Validación de plan de suscripción', () => {
    it('should_show_disabled_state_when_plan_is_LIBROS', async () => {
      mockGetMiPlan.mockResolvedValue({
        tienePlan: true,
        plan: { nombre: 'STEAM_LIBROS' },
        accesoClasesVivo: false,
        mensaje: 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
      });

      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });
    });

    it('should_show_disabled_state_when_plan_is_ASINCRONICO', async () => {
      mockGetMiPlan.mockResolvedValue({
        tienePlan: true,
        plan: { nombre: 'STEAM_ASINCRONICO' },
        accesoClasesVivo: false,
        mensaje: 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
      });

      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });
    });

    it('should_show_upgrade_message_when_plan_not_allowed', async () => {
      mockGetMiPlan.mockResolvedValue({
        tienePlan: true,
        plan: { nombre: 'STEAM_LIBROS' },
        accesoClasesVivo: false,
        mensaje: 'Tu plan no incluye clases en vivo. Actualiza a STEAM Sincrónico para acceder.',
      });

      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      await waitFor(() => {
        expect(screen.getByText(/actualiza.*sincrónico/i)).toBeInTheDocument();
      });
    });

    it('should_be_enabled_when_plan_is_SINCRONICO', async () => {
      mockGetMiPlan.mockResolvedValue({
        tienePlan: true,
        plan: { nombre: 'STEAM_SINCRONICO' },
        accesoClasesVivo: true,
        mensaje: 'Acceso completo a clases en vivo',
      });

      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /unirse/i });
        expect(button).toBeEnabled();
      });
    });

    it('should_show_no_subscription_message_when_plan_is_missing', async () => {
      mockGetMiPlan.mockResolvedValue({
        tienePlan: false,
        plan: null,
        accesoClasesVivo: false,
        mensaje: 'Sin suscripción activa',
      });

      render(<JoinClassButton {...defaultProps} estadoClase="EnVivo" />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
      });

      // Verificar que aparece el mensaje de "sin suscripción activa"
      expect(screen.getByText(/sin suscripción activa/i)).toBeInTheDocument();
    });
  });
});
