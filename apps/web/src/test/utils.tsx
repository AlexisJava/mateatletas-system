/**
 * Utilidades de testing reutilizables
 */

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';

/**
 * Wrapper para providers (ejemplo: React Query, Context, etc.)
 */
interface AllTheProvidersProps {
  children: ReactNode;
}

function AllTheProviders({ children }: AllTheProvidersProps) {
  // Aquí se pueden agregar providers globales como:
  // - QueryClientProvider
  // - ThemeProvider
  // - AuthProvider
  // etc.

  return <>{children}</>;
}

/**
 * Custom render que incluye providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

/**
 * Re-export de todo @testing-library/react
 */
export * from '@testing-library/react';

/**
 * Usa este render customizado por defecto
 */
export { renderWithProviders as render };
