/**
 * FinanceView - Test Suite
 *
 * Tests para la vista de finanzas del admin.
 * Cubre: loading, renderizado, configuración, manejo de errores.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { standardBeforeEach, standardAfterEach } from '@/test/admin-test-utils';

// Crear mocks hoisted para poder modificarlos en beforeEach
const mockSaveConfig = vi.fn();
const mockHookReturn = vi.fn();

// Mock del hook
vi.mock('../hooks', () => ({
  useFinanceStats: () => mockHookReturn(),
}));

// Mock de los sub-componentes para aislar el test
vi.mock('../components', () => ({
  FinanceStatCard: ({ label, value }: { label: string; value: string }) => (
    <div data-testid="stat-card">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  ),
  ConfigModal: ({
    isOpen,
    onClose,
    onSave,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onSave: (config: unknown) => void;
  }) =>
    isOpen ? (
      <div data-testid="config-modal">
        <button onClick={onClose}>Cerrar Config</button>
        <button onClick={() => onSave({ tiers: [] })}>Guardar Config</button>
      </div>
    ) : null,
  TierConfigPanel: ({ onEdit }: { onEdit: () => void }) => (
    <div data-testid="tier-config-panel">
      <button onClick={onEdit}>Editar Tiers</button>
    </div>
  ),
  TransactionsList: () => <div data-testid="transactions-list">Transactions</div>,
  RevenueEvolutionChart: () => <div data-testid="revenue-chart">Revenue Chart</div>,
  PaymentStatusChart: () => <div data-testid="payment-chart">Payment Chart</div>,
  ReportsPanel: () => <div data-testid="reports-panel">Reports</div>,
  NotificationsPanel: () => <div data-testid="notifications-panel">Notifications</div>,
}));

// Import después de los mocks
import { FinanceView } from '../FinanceView';

// Mock data
const mockStats = {
  ingresosMes: 1500000,
  pagosPendientes: 250000,
  inscripcionesActivas: 150,
  tasaCobro: 85.5,
  cambios: {
    ingresos: 12.5,
    pendientes: -8.3,
    inscripciones: 15,
    tasaCobro: 2.1,
  },
};

const mockConfig = {
  tiers: [
    { id: 'basic', nombre: 'Básico', precio: 5000, caracteristicas: [] },
    { id: 'premium', nombre: 'Premium', precio: 8000, caracteristicas: [] },
  ],
};

describe('FinanceView', () => {
  beforeEach(() => {
    standardBeforeEach();
    mockSaveConfig.mockClear();
    mockSaveConfig.mockResolvedValue(undefined);

    // Default: datos cargados
    mockHookReturn.mockReturnValue({
      stats: mockStats,
      config: mockConfig,
      isLoading: false,
      error: null,
      saveConfig: mockSaveConfig,
    });
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     LOADING STATE
     ============================================================================ */
  describe('Loading State', () => {
    it('muestra spinner cuando está cargando', () => {
      mockHookReturn.mockReturnValue({
        stats: mockStats,
        config: mockConfig,
        isLoading: true,
        error: null,
        saveConfig: mockSaveConfig,
      });

      render(<FinanceView />);

      expect(screen.getByText('Cargando metricas...')).toBeInTheDocument();
    });

    it('muestra spinner animado cuando carga', () => {
      mockHookReturn.mockReturnValue({
        stats: mockStats,
        config: mockConfig,
        isLoading: true,
        error: null,
        saveConfig: mockSaveConfig,
      });

      const { container } = render(<FinanceView />);

      expect(container.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     RENDERIZADO PRINCIPAL
     ============================================================================ */
  describe('Renderizado Principal', () => {
    it('renderiza las 4 tarjetas de estadísticas', () => {
      render(<FinanceView />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);
    });

    it('muestra los labels de las estadísticas', () => {
      render(<FinanceView />);

      expect(screen.getByText('Ingresos del Mes')).toBeInTheDocument();
      expect(screen.getByText('Pagos Pendientes')).toBeInTheDocument();
      expect(screen.getByText('Inscripciones Activas')).toBeInTheDocument();
      expect(screen.getByText('Tasa de Cobro')).toBeInTheDocument();
    });

    it('renderiza los charts', () => {
      render(<FinanceView />);

      expect(screen.getByTestId('revenue-chart')).toBeInTheDocument();
      expect(screen.getByTestId('payment-chart')).toBeInTheDocument();
    });

    it('renderiza el panel de configuración de tiers', () => {
      render(<FinanceView />);

      expect(screen.getByTestId('tier-config-panel')).toBeInTheDocument();
    });

    it('renderiza la lista de transacciones', () => {
      render(<FinanceView />);

      expect(screen.getByTestId('transactions-list')).toBeInTheDocument();
    });

    it('renderiza el panel de reportes', () => {
      render(<FinanceView />);

      expect(screen.getByTestId('reports-panel')).toBeInTheDocument();
    });

    it('renderiza el panel de notificaciones', () => {
      render(<FinanceView />);

      expect(screen.getByTestId('notifications-panel')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     ERROR STATE
     ============================================================================ */
  describe('Error State', () => {
    it('muestra banner de error cuando hay error', () => {
      mockHookReturn.mockReturnValue({
        stats: mockStats,
        config: mockConfig,
        isLoading: false,
        error: new Error('Backend no disponible'),
        saveConfig: mockSaveConfig,
      });

      render(<FinanceView />);

      expect(screen.getByText(/datos de ejemplo/i)).toBeInTheDocument();
    });

    it('no muestra banner cuando no hay error', () => {
      render(<FinanceView />);

      expect(screen.queryByText(/datos de ejemplo/i)).not.toBeInTheDocument();
    });
  });

  /* ============================================================================
     MODAL DE CONFIGURACIÓN
     ============================================================================ */
  describe('Modal de Configuración', () => {
    it('abre el modal al hacer click en Editar Tiers', async () => {
      const user = userEvent.setup();

      render(<FinanceView />);

      await user.click(screen.getByRole('button', { name: /editar tiers/i }));

      expect(screen.getByTestId('config-modal')).toBeInTheDocument();
    });

    it('cierra el modal al hacer click en Cerrar', async () => {
      const user = userEvent.setup();

      render(<FinanceView />);

      // Abrir modal
      await user.click(screen.getByRole('button', { name: /editar tiers/i }));
      expect(screen.getByTestId('config-modal')).toBeInTheDocument();

      // Cerrar modal
      await user.click(screen.getByRole('button', { name: /cerrar config/i }));

      expect(screen.queryByTestId('config-modal')).not.toBeInTheDocument();
    });

    it('llama saveConfig al guardar', async () => {
      const user = userEvent.setup();

      render(<FinanceView />);

      // Abrir modal
      await user.click(screen.getByRole('button', { name: /editar tiers/i }));

      // Guardar
      await user.click(screen.getByRole('button', { name: /guardar config/i }));

      await waitFor(() => {
        expect(mockSaveConfig).toHaveBeenCalled();
      });
    });

    it('cierra modal después de guardar exitoso', async () => {
      const user = userEvent.setup();

      render(<FinanceView />);

      // Abrir modal
      await user.click(screen.getByRole('button', { name: /editar tiers/i }));
      expect(screen.getByTestId('config-modal')).toBeInTheDocument();

      // Guardar
      await user.click(screen.getByRole('button', { name: /guardar config/i }));

      // Esperar que se cierre
      await waitFor(() => {
        expect(screen.queryByTestId('config-modal')).not.toBeInTheDocument();
      });
    });
  });

  /* ============================================================================
     FORMATO DE DATOS
     ============================================================================ */
  describe('Formato de Datos', () => {
    it('renderiza todas las estadísticas', () => {
      render(<FinanceView />);

      const statCards = screen.getAllByTestId('stat-card');
      expect(statCards).toHaveLength(4);
    });
  });
});
