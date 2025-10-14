import { Page } from '@playwright/test';

/**
 * Registra un nuevo usuario en la aplicación
 * @param page - Página de Playwright
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 * @param nombre - Nombre del usuario
 * @param apellido - Apellido del usuario
 */
export async function registerUser(
  page: Page,
  email: string,
  password: string,
  nombre: string,
  apellido: string
) {
  await page.goto('http://localhost:3000/register');

  // Llenar formulario de registro
  await page.fill('input[type="email"]', email);
  await page.fill('input[name="password"]', password);
  await page.fill('input[name="confirmPassword"]', password);
  await page.fill('input[name="nombre"]', nombre);
  await page.fill('input[name="apellido"]', apellido);

  // Submit y esperar redirección
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Hace login con un usuario existente
 * @param page - Página de Playwright
 * @param email - Email del usuario
 * @param password - Contraseña del usuario
 */
export async function loginUser(page: Page, email: string, password: string) {
  await page.goto('http://localhost:3000/login');

  // Llenar formulario de login
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  // Submit y esperar redirección
  await page.click('button[type="submit"]');
  await page.waitForURL('**/dashboard', { timeout: 10000 });
}

/**
 * Cierra la sesión del usuario actual
 * @param page - Página de Playwright
 */
export async function logoutUser(page: Page) {
  // Buscar el botón de cerrar sesión (puede estar en desktop o mobile)
  const logoutButton = page.locator('text=Cerrar sesión').first();
  await logoutButton.click();
  await page.waitForURL('**/login', { timeout: 10000 });
}

/**
 * Genera un email único para testing
 * @returns Email único basado en timestamp
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  return `tutor${timestamp}@test.com`;
}

/**
 * Limpia el localStorage de la página
 * @param page - Página de Playwright
 */
export async function clearStorage(page: Page) {
  await page.goto('http://localhost:3000');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}
