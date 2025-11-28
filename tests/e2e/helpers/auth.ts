import { Page } from '@playwright/test';

/**
 * Helper para autenticación en tests E2E
 */

const API_URL = process.env.PLAYWRIGHT_API_URL || 'http://localhost:3001/api';

export interface AuthCredentials {
  email: string;
  password: string;
}

export const DOCENTE_CREDENTIALS: AuthCredentials = {
  email: 'docente.test@mateatletas.com',
  password: 'Docente123!',
};

/**
 * Login como docente usando la API y guardando el token en localStorage
 */
export async function loginAsDocente(page: Page): Promise<string> {
  // Hacer login via API
  const response = await page.request.post(`${API_URL}/auth/login`, {
    data: DOCENTE_CREDENTIALS,
  });

  if (!response.ok()) {
    throw new Error(`Login failed: ${response.status()}`);
  }

  const data = await response.json();
  const token = data.access_token;
  const user = data.user;

  if (!token) {
    throw new Error('No access token received');
  }

  if (!user) {
    throw new Error('No user data received');
  }

  // Navegar a la página para setear localStorage
  await page.goto('/');

  // Setear el token y el store de Zustand con los datos del usuario
  await page.evaluate(
    ({ tokenValue, userData }) => {
      // Token (ambas versiones por compatibilidad)
      localStorage.setItem('token', tokenValue);
      localStorage.setItem('auth-token', tokenValue);

      // Zustand store con el usuario completo
      // Esto evita que el layout tenga que hacer checkAuth()
      const authStore = JSON.stringify({
        state: {
          user: userData,
          token: tokenValue,
          isAuthenticated: true,
          isLoading: false,
        },
        version: 0,
      });

      localStorage.setItem('auth-storage', authStore);
    },
    { tokenValue: token, userData: user },
  );

  // Pequeña espera para asegurar que el localStorage se escribió
  await page.waitForTimeout(100);

  return token;
}

/**
 * Verificar que el usuario está autenticado
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const token = await page.evaluate(() => {
    return localStorage.getItem('token');
  });

  return !!token;
}

/**
 * Logout
 */
export async function logout(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.removeItem('token');
  });
}
