/**
 * GestionarEstudiantesModal - Test Suite
 *
 * Tests para el modal de gestión de estudiantes de una clase.
 * Cubre: renderizado, interacciones, race conditions, error handling.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GestionarEstudiantesModal from '../GestionarEstudiantesModal';
import {
  standardBeforeEach,
  standardAfterEach,
  createControllableApiMock,
  wait,
} from '@/test/admin-test-utils';

// Mocks
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const mockAxiosGet = vi.fn();
const mockAxiosPost = vi.fn();
vi.mock('@/lib/axios', () => ({
  default: {
    get: (...args: unknown[]) => mockAxiosGet(...args),
    post: (...args: unknown[]) => mockAxiosPost(...args),
  },
}));

// Helper para crear mock de datos de clase
const createMockClaseData = (overrides: Record<string, unknown> = {}) => ({
  claseId: 'clase-1',
  nombre: 'Matemáticas Avanzadas',
  cuposMaximo: 20,
  cuposOcupados: 2,
  cuposDisponibles: 18,
  docente: {
    id: 'docente-1',
    nombre: 'Prof',
    apellido: 'García',
    sector: {
      id: 'sector-1',
      nombre: 'Matemáticas',
      color: '#10B981',
      icono: 'calculator',
    },
  },
  estudiantes: [
    {
      id: 'est-inscrito-1',
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      nivelEscolar: 'Primaria',
      avatarUrl: null,
      inscripcionId: 'insc-1',
      fechaInscripcion: '2024-01-01',
      tutor: { id: 'tutor-1', nombre: 'María', apellido: 'Pérez', email: 'maria@test.com' },
    },
  ],
  ...overrides,
});

// Helper para crear estudiantes disponibles
const createMockEstudiantesDisponibles = () => [
  {
    id: 'est-disponible-1',
    nombre: 'Ana',
    apellido: 'López',
    email: 'ana@test.com',
    nivelEscolar: 'Primaria',
    avatarUrl: null,
    tutor: { id: 'tutor-2', nombre: 'Carlos', apellido: 'López', email: 'carlos@test.com' },
  },
  {
    id: 'est-disponible-2',
    nombre: 'Pedro',
    apellido: 'Martínez',
    email: 'pedro@test.com',
    nivelEscolar: 'Secundaria',
    avatarUrl: null,
    tutor: { id: 'tutor-3', nombre: 'Laura', apellido: 'Martínez', email: 'laura@test.com' },
  },
];

describe('GestionarEstudiantesModal', () => {
  const defaultProps = {
    claseId: 'clase-1',
    claseNombre: 'Matemáticas Avanzadas',
    onClose: vi.fn(),
    onSuccess: vi.fn(),
  };

  beforeEach(() => {
    standardBeforeEach();
    // Setup default mocks
    mockAxiosGet.mockImplementation((url: string) => {
      if (url.includes('/estudiantes')) {
        if (url.includes('/clases/')) {
          return Promise.resolve(createMockClaseData());
        }
        return Promise.resolve({ data: createMockEstudiantesDisponibles() });
      }
      return Promise.resolve({});
    });
    mockAxiosPost.mockResolvedValue({});
  });

  afterEach(() => {
    standardAfterEach();
  });

  /* ============================================================================
     RENDERIZADO
     ============================================================================ */
  describe('Renderizado', () => {
    it('muestra loading spinner mientras carga datos', async () => {
      mockAxiosGet.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<GestionarEstudiantesModal {...defaultProps} />);

      expect(screen.getByText('Cargando datos...')).toBeInTheDocument();
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });

    it('renderiza el modal con datos cargados correctamente', async () => {
      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      expect(screen.getByText('Matemáticas Avanzadas')).toBeInTheDocument();
      expect(screen.getByText('Estudiantes Inscritos')).toBeInTheDocument();
      expect(screen.getByText('Asignar Nuevos Estudiantes')).toBeInTheDocument();
    });

    it('muestra estudiantes inscritos en la lista', async () => {
      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
      });

      expect(screen.getByText('Tutor: María Pérez')).toBeInTheDocument();
    });

    it('muestra estudiantes disponibles para asignar', async () => {
      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      expect(screen.getByText('Pedro Martínez')).toBeInTheDocument();
    });

    it('muestra mensaje cuando no hay estudiantes inscritos', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url.includes('/clases/')) {
          return Promise.resolve(createMockClaseData({ estudiantes: [] }));
        }
        return Promise.resolve({ data: createMockEstudiantesDisponibles() });
      });

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('No hay estudiantes inscritos aún')).toBeInTheDocument();
      });
    });

    it('muestra mensaje cuando no hay cupos disponibles', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url.includes('/clases/')) {
          return Promise.resolve(createMockClaseData({ cuposDisponibles: 0, cuposOcupados: 20 }));
        }
        return Promise.resolve({ data: createMockEstudiantesDisponibles() });
      });

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('⚠️ No hay cupos disponibles')).toBeInTheDocument();
      });
    });

    it('muestra conteo de cupos correctamente', async () => {
      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
        expect(screen.getByText('/ 20 cupos')).toBeInTheDocument();
      });
    });
  });

  /* ============================================================================
     INTERACCIONES
     ============================================================================ */
  describe('Interacciones', () => {
    it('cierra el modal al hacer click en X', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<GestionarEstudiantesModal {...defaultProps} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      const closeButtons = screen.getAllByRole('button');
      const xButton = closeButtons.find((btn) => btn.querySelector('svg.lucide-x'));
      if (xButton) {
        await user.click(xButton);
        expect(mockOnClose).toHaveBeenCalled();
      }
    });

    it('cierra el modal al hacer click en botón Cerrar', async () => {
      const user = userEvent.setup();
      const mockOnClose = vi.fn();

      render(<GestionarEstudiantesModal {...defaultProps} onClose={mockOnClose} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /cerrar/i }));
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('selecciona estudiantes al hacer click', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      // Click en el estudiante disponible
      await user.click(screen.getByText('Ana López'));

      // Debería aparecer el botón de asignar
      await waitFor(() => {
        expect(screen.getByText(/Asignar 1 estudiante/i)).toBeInTheDocument();
      });
    });

    it('deselecciona estudiante al hacer click nuevamente', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      // Seleccionar
      await user.click(screen.getByText('Ana López'));
      await waitFor(() => {
        expect(screen.getByText(/Asignar 1 estudiante/i)).toBeInTheDocument();
      });

      // Deseleccionar
      await user.click(screen.getByText('Ana López'));
      await waitFor(() => {
        // El botón de asignar con número de estudiantes no debería estar visible
        expect(screen.queryByText(/Asignar \d+ estudiante/i)).not.toBeInTheDocument();
      });
    });

    it('filtra estudiantes por búsqueda', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar estudiante o tutor...');
      await user.type(searchInput, 'Pedro');

      await waitFor(() => {
        expect(screen.getByText('Pedro Martínez')).toBeInTheDocument();
        expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
      });
    });

    it('filtra por nombre del tutor', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Buscar estudiante o tutor...');
      await user.type(searchInput, 'Laura');

      await waitFor(() => {
        expect(screen.getByText('Pedro Martínez')).toBeInTheDocument();
        expect(screen.queryByText('Ana López')).not.toBeInTheDocument();
      });
    });
  });

  /* ============================================================================
     ASIGNAR ESTUDIANTES
     ============================================================================ */
  describe('Asignar estudiantes', () => {
    it('asigna estudiantes seleccionados correctamente', async () => {
      const user = userEvent.setup();
      const mockOnSuccess = vi.fn();

      render(<GestionarEstudiantesModal {...defaultProps} onSuccess={mockOnSuccess} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      // Seleccionar estudiante
      await user.click(screen.getByText('Ana López'));

      // Click en asignar
      const asignarBtn = await screen.findByText(/Asignar 1 estudiante/i);
      await user.click(asignarBtn);

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith('/clases/clase-1/asignar-estudiantes', {
          estudianteIds: ['est-disponible-1'],
        });
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('muestra error toast cuando falla la asignación', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      mockAxiosPost.mockRejectedValueOnce(new Error('Network error'));

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      await user.click(screen.getByText('Ana López'));
      const asignarBtn = await screen.findByText(/Asignar 1 estudiante/i);
      await user.click(asignarBtn);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al asignar estudiantes');
      });
    });

    it('deshabilita botón de asignar si no hay suficientes cupos', async () => {
      const user = userEvent.setup();
      mockAxiosGet.mockImplementation((url: string) => {
        if (url.includes('/clases/')) {
          return Promise.resolve(createMockClaseData({ cuposDisponibles: 1 }));
        }
        return Promise.resolve({ data: createMockEstudiantesDisponibles() });
      });

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Ana López')).toBeInTheDocument();
      });

      // Seleccionar 2 estudiantes
      await user.click(screen.getByText('Ana López'));
      await user.click(screen.getByText('Pedro Martínez'));

      const asignarBtn = await screen.findByText(/Asignar 2 estudiante/i);
      expect(asignarBtn).toBeDisabled();
    });
  });

  /* ============================================================================
     CREAR ESTUDIANTE
     ============================================================================ */
  describe('Crear estudiante', () => {
    it('muestra formulario de creación al hacer click en Crear Nuevo', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Crear Nuevo/i }));

      await waitFor(() => {
        // Verificar que el formulario se muestra
        expect(screen.getByText('Nombre *')).toBeInTheDocument();
        expect(screen.getByText('Apellido *')).toBeInTheDocument();
        expect(screen.getByText('Edad *')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Crear y Seleccionar/i })).toBeInTheDocument();
      });
    });

    it('oculta formulario al hacer click en Cancelar', async () => {
      const user = userEvent.setup();

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Crear Nuevo/i }));

      await waitFor(() => {
        expect(screen.getByText('Nombre *')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Cancelar/i }));

      await waitFor(() => {
        // El formulario ya no se muestra
        expect(screen.queryByText('Nombre *')).not.toBeInTheDocument();
      });
    });

    it('crea estudiante y lo auto-selecciona', async () => {
      const user = userEvent.setup();
      const nuevoEstudiante = {
        id: 'nuevo-est-1',
        nombre: 'Nuevo',
        apellido: 'Estudiante',
        email: null,
        nivelEscolar: 'Primaria',
        avatarUrl: null,
        tutor: { id: 'tutor-nuevo', nombre: 'Tutor', apellido: 'Nuevo', email: 'tutor@test.com' },
      };
      mockAxiosPost.mockResolvedValueOnce(nuevoEstudiante);

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Crear Nuevo/i }));

      await waitFor(() => {
        expect(screen.getByText('Nombre *')).toBeInTheDocument();
      });

      // Encontrar inputs por placeholder o por posición
      const inputs = screen.getAllByRole('textbox');
      const nombreInput = inputs[0]; // Primer input de texto es nombre
      const apellidoInput = inputs[1]; // Segundo es apellido

      await user.type(nombreInput, 'Nuevo');
      await user.type(apellidoInput, 'Estudiante');

      // El input de edad es type="number", usamos spinbutton
      const edadInput = screen.getByRole('spinbutton');
      await user.type(edadInput, '10');

      await user.click(screen.getByRole('button', { name: /Crear y Seleccionar/i }));

      await waitFor(() => {
        expect(mockAxiosPost).toHaveBeenCalledWith(
          '/admin/estudiantes',
          expect.objectContaining({
            nombre: 'Nuevo',
            apellido: 'Estudiante',
            edad: '10',
          }),
        );
      });
    });

    it('muestra error toast cuando falla la creación', async () => {
      const { toast } = await import('react-hot-toast');
      const user = userEvent.setup();
      mockAxiosPost.mockRejectedValueOnce(new Error('Error'));

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /Crear Nuevo/i }));

      await waitFor(() => {
        expect(screen.getByText('Nombre *')).toBeInTheDocument();
      });

      const inputs = screen.getAllByRole('textbox');
      await user.type(inputs[0], 'Nuevo');
      await user.type(inputs[1], 'Estudiante');
      await user.type(screen.getByRole('spinbutton'), '10');

      await user.click(screen.getByRole('button', { name: /Crear y Seleccionar/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Error al crear el estudiante');
      });
    });
  });

  /* ============================================================================
     ERROR HANDLING
     ============================================================================ */
  describe('Error handling', () => {
    it('muestra error visual cuando falla la carga de datos', async () => {
      const { toast } = await import('react-hot-toast');
      mockAxiosGet.mockRejectedValueOnce(new Error('Network error'));

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Error al cargar datos')).toBeInTheDocument();
      });

      expect(toast.error).toHaveBeenCalledWith('Error al cargar datos de la clase');
    });

    it('maneja respuesta vacía del servidor graciosamente', async () => {
      mockAxiosGet.mockImplementation((url: string) => {
        if (url.includes('/clases/')) {
          return Promise.resolve(createMockClaseData());
        }
        return Promise.resolve({}); // Sin data array
      });

      render(<GestionarEstudiantesModal {...defaultProps} />);

      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      // No debería crashear
      expect(screen.getByText('Estudiantes Inscritos')).toBeInTheDocument();
    });
  });

  /* ============================================================================
     RACE CONDITIONS
     ============================================================================ */
  describe('Race conditions', () => {
    it('ignora respuesta de request anterior cuando claseId cambia rápidamente', async () => {
      const { mockFn, resolvers } = createControllableApiMock<typeof createMockClaseData>();

      // Primera llamada
      mockAxiosGet.mockImplementationOnce(mockFn);
      mockAxiosGet.mockImplementationOnce(() =>
        Promise.resolve({ data: createMockEstudiantesDisponibles() }),
      );

      const { rerender } = render(
        <GestionarEstudiantesModal {...defaultProps} claseId="clase-1" />,
      );

      // Cambiar claseId antes de que el primer request complete
      mockAxiosGet.mockImplementation((url: string) => {
        if (url.includes('/clases/')) {
          return Promise.resolve(
            createMockClaseData({
              claseId: 'clase-2',
              nombre: 'Clase Nueva',
            }),
          );
        }
        return Promise.resolve({ data: createMockEstudiantesDisponibles() });
      });

      rerender(<GestionarEstudiantesModal {...defaultProps} claseId="clase-2" />);

      // Resolver el primer request (debería ser ignorado)
      resolvers[0](
        createMockClaseData({
          claseId: 'clase-1',
          nombre: 'Clase Vieja',
        }) as never,
      );

      // Esperar a que se carguen los datos de la clase nueva
      await waitFor(() => {
        expect(screen.getByText('Gestionar Estudiantes')).toBeInTheDocument();
      });

      // Debería mostrar los datos de clase-2, no clase-1
      expect(screen.queryByText('Clase Vieja')).not.toBeInTheDocument();
    });

    it('no actualiza estado después de unmount', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      let resolvePromise: (value: unknown) => void;

      mockAxiosGet.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolvePromise = resolve;
          }),
      );

      const { unmount } = render(<GestionarEstudiantesModal {...defaultProps} />);

      // Desmontar antes de que complete
      unmount();

      // Resolver después del unmount
      resolvePromise!(createMockClaseData());

      // Esperar un tick para asegurar que el setState no se ejecutó
      await wait(100);

      // No debería haber warnings de React sobre state update on unmounted component
      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining("Can't perform a React state update on an unmounted component"),
      );

      consoleSpy.mockRestore();
    });
  });
});
