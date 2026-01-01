/**
 * Admin Test Utilities
 *
 * Helpers reutilizables para tests de componentes del admin dashboard.
 * Estos helpers reducen la duplicación de código en los tests.
 */

import { vi, expect } from 'vitest';

/* ============================================================================
   MOCK FACTORIES
   ============================================================================ */

/**
 * Crea los mocks estándar para callbacks de modales
 */
export const createModalCallbacks = () => ({
  mockOnClose: vi.fn(),
  mockOnSelect: vi.fn(),
  mockOnSuccess: vi.fn(),
  mockOnSave: vi.fn(),
  mockOnRefresh: vi.fn(),
});

/**
 * Crea mock functions para toast
 * Nota: El vi.mock debe hacerse en el archivo de test, esto es solo para referencia
 */
export const createToastMock = () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
});

/* ============================================================================
   DOM HELPERS
   ============================================================================ */

/**
 * Encuentra el backdrop de un modal
 */
export const getBackdrop = (container: HTMLElement): Element | null =>
  container.querySelector('.bg-black\\/50');

/**
 * Encuentra el spinner de loading
 */
export const getLoadingSpinner = (container: HTMLElement): Element | null =>
  container.querySelector('.animate-spin');

/**
 * Encuentra un botón por su título (atributo title)
 */
export const getButtonByTitle = (container: HTMLElement, title: string): Element | null =>
  container.querySelector(`button[title="${title}"]`);

/**
 * Encuentra todos los botones con un título específico
 */
export const getAllButtonsByTitle = (container: HTMLElement, title: string): NodeListOf<Element> =>
  container.querySelectorAll(`button[title="${title}"]`);

/* ============================================================================
   ASYNC TESTING HELPERS
   ============================================================================ */

/**
 * Tipo para un resolver de Promise controlable
 */
export type PromiseResolver<T> = (value: T) => void;

/**
 * Crea un mock de API que permite controlar cuándo se resuelve
 * Útil para testing de race conditions
 *
 * @example
 * const { mockFn, resolvers } = createControllableApiMock<MyDataType>();
 * vi.mocked(apiCall).mockImplementation(mockFn);
 *
 * // En el test:
 * resolvers[0](myData); // Resolver la primera llamada
 */
export const createControllableApiMock = <T>() => {
  let callCount = 0;
  const resolvers: Array<PromiseResolver<T>> = [];

  const mockFn = () =>
    new Promise<T>((resolve) => {
      resolvers[callCount++] = resolve;
    });

  return {
    mockFn,
    resolvers,
    getCallCount: () => callCount,
  };
};

/**
 * Espera un tiempo específico (útil para tests de debounce)
 */
export const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/* ============================================================================
   MOCK DATA FACTORIES
   ============================================================================ */

/**
 * Crea un estudiante mock
 */
export const createMockEstudiante = (overrides: Record<string, unknown> = {}) => ({
  id: `estudiante-${Math.random().toString(36).substr(2, 9)}`,
  nombre: 'Test',
  apellido: 'Estudiante',
  edad: 10,
  tutor: {
    id: 'tutor-1',
    nombre: 'Test',
    apellido: 'Tutor',
  },
  ...overrides,
});

/**
 * Crea un docente mock
 */
export const createMockDocente = (overrides: Record<string, unknown> = {}) => ({
  id: `docente-${Math.random().toString(36).substr(2, 9)}`,
  nombre: 'Test',
  apellido: 'Docente',
  email: 'docente@test.com',
  titulo: 'Profesor',
  activo: true,
  ...overrides,
});

/**
 * Crea una comisión mock
 */
export const createMockComision = (overrides: Record<string, unknown> = {}) => ({
  id: `comision-${Math.random().toString(36).substr(2, 9)}`,
  nombre: 'Comisión Test',
  descripcion: 'Descripción de prueba',
  producto_id: 'producto-1',
  cupo_maximo: 20,
  horario: 'Lun-Vie 9:00-12:00',
  activo: true,
  total_inscriptos: 0,
  cupos_disponibles: 20,
  ...overrides,
});

/**
 * Crea un usuario mock con roles
 */
export const createMockUser = (overrides: Record<string, unknown> = {}) => ({
  id: `user-${Math.random().toString(36).substr(2, 9)}`,
  email: 'user@test.com',
  nombre: 'Test',
  apellido: 'User',
  roles: ['admin'],
  activo: true,
  ...overrides,
});

/* ============================================================================
   TEST SETUP HELPERS
   ============================================================================ */

/**
 * Setup estándar para beforeEach
 */
export const standardBeforeEach = () => {
  vi.clearAllMocks();
};

/**
 * Setup estándar para afterEach
 */
export const standardAfterEach = () => {
  vi.restoreAllMocks();
};

/* ============================================================================
   CONSOLE SPY HELPERS
   ============================================================================ */

/**
 * Crea un spy para console.error que puede verificar si hubo errores de unmounted
 */
export const createConsoleSpy = () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  return {
    spy: consoleSpy,
    expectNoUnmountedErrors: () => {
      expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('unmounted'));
    },
    restore: () => {
      consoleSpy.mockRestore();
    },
  };
};
