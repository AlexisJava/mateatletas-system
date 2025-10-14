import { test, expect } from '@playwright/test';
import {
  registerUser,
  loginUser,
  logoutUser,
  generateUniqueEmail,
  clearStorage,
} from './helpers/test-helpers';

/**
 * Tests E2E para el flujo de autenticación de Mateatletas
 *
 * Cubre:
 * - Registro de nuevos usuarios
 * - Login con credenciales válidas e inválidas
 * - Persistencia de sesión
 * - Logout
 * - Protección de rutas
 */

test.describe('Autenticación - Flujo Completo', () => {
  // Limpiar storage antes de cada test
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  /**
   * Test 1: Registro exitoso de un nuevo tutor
   */
  test('debería registrar un nuevo tutor exitosamente', async ({ page }) => {
    // Generar email único
    const email = generateUniqueEmail();

    // Ir a página de registro
    await page.goto('http://localhost:3000/register');

    // Llenar formulario
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', 'Test123!');
    await page.fill('input[name="confirmPassword"]', 'Test123!');
    await page.fill('input[name="nombre"]', 'Juan');
    await page.fill('input[name="apellido"]', 'Pérez');

    // Submit
    await page.click('button[type="submit"]');

    // Verificar redirección a dashboard
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Verificar que muestra el nombre del usuario en el saludo
    const greeting = page.locator('text=/Buenos (días|tardes|noches), Juan/');
    await expect(greeting).toBeVisible({ timeout: 5000 });

    // Verificar que está en el dashboard
    await expect(page).toHaveURL(/.*dashboard/);
  });

  /**
   * Test 2: Error de registro con email duplicado
   */
  test('debería mostrar error si el email ya existe', async ({ page }) => {
    const email = generateUniqueEmail();

    // Primer registro exitoso
    await registerUser(page, email, 'Test123!', 'Juan', 'Pérez');

    // Logout
    await logoutUser(page);

    // Intentar registrar mismo email
    await page.goto('http://localhost:3000/register');
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', 'Test123!');
    await page.fill('input[name="confirmPassword"]', 'Test123!');
    await page.fill('input[name="nombre"]', 'María');
    await page.fill('input[name="apellido"]', 'García');

    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    const errorMessage = page.locator('text=/email.*registrado/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Verificar que NO redirigió a dashboard
    await expect(page).toHaveURL(/.*register/);
  });

  /**
   * Test 3: Login exitoso con credenciales válidas
   */
  test('debería hacer login correctamente', async ({ page }) => {
    // Crear usuario nuevo
    const email = generateUniqueEmail();
    await registerUser(page, email, 'Test123!', 'Ana', 'López');

    // Logout
    await logoutUser(page);

    // Login con el usuario creado
    await loginUser(page, email, 'Test123!');

    // Verificar que está en dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Verificar que muestra el nombre correcto
    const greeting = page.locator('text=/Buenos (días|tardes|noches), Ana/');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  /**
   * Test 4: Error de login con credenciales inválidas
   */
  test('debería mostrar error con credenciales incorrectas', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    // Intentar login con credenciales que no existen
    await page.fill('input[type="email"]', 'noexiste@test.com');
    await page.fill('input[type="password"]', 'WrongPass123!');
    await page.click('button[type="submit"]');

    // Verificar mensaje de error
    const errorMessage = page.locator('text=/Email o contraseña incorrectos/i');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });

    // Verificar que NO redirigió a dashboard
    await expect(page).toHaveURL(/.*login/);

    // Verificar que el card tiembla (animación shake)
    // Esto es difícil de testear directamente, pero podemos verificar que el formulario sigue visible
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
  });

  /**
   * Test 5: Persistencia de sesión después de recargar
   */
  test('debería mantener la sesión después de recargar página', async ({
    page,
  }) => {
    // Registrar nuevo usuario
    const email = generateUniqueEmail();
    await registerUser(page, email, 'Test123!', 'Pedro', 'Martínez');

    // Verificar que está en dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Recargar página
    await page.reload();

    // Verificar que sigue autenticado (no redirige a login)
    await page.waitForURL('**/dashboard', { timeout: 5000 });

    // Verificar que sigue mostrando el nombre
    const greeting = page.locator('text=/Buenos (días|tardes|noches), Pedro/');
    await expect(greeting).toBeVisible({ timeout: 5000 });
  });

  /**
   * Test 6: Logout correcto y limpieza de sesión
   */
  test('debería cerrar sesión correctamente', async ({ page }) => {
    // Login
    const email = generateUniqueEmail();
    await registerUser(page, email, 'Test123!', 'Laura', 'Gómez');

    // Verificar que está autenticado
    await expect(page).toHaveURL(/.*dashboard/);

    // Logout
    await logoutUser(page);

    // Verificar redirección a login
    await expect(page).toHaveURL(/.*login/);

    // Intentar acceder a dashboard sin estar autenticado
    await page.goto('http://localhost:3000/dashboard');

    // Debería redirigir a login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/.*login/);
  });

  /**
   * Test 7: Protección de rutas - redirección a login sin autenticación
   */
  test('debería redirigir a login si intenta acceder a ruta protegida sin autenticación', async ({
    page,
  }) => {
    // Limpiar localStorage para asegurar que no hay sesión
    await clearStorage(page);

    // Intentar acceder directamente a dashboard
    await page.goto('http://localhost:3000/dashboard');

    // Verificar que redirige a login
    await page.waitForURL('**/login', { timeout: 10000 });
    await expect(page).toHaveURL(/.*login/);

    // Verificar que muestra el formulario de login
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });
});

/**
 * Tests adicionales para casos edge
 */
test.describe('Autenticación - Casos Edge', () => {
  test.beforeEach(async ({ page }) => {
    await clearStorage(page);
  });

  /**
   * Test: Validación de contraseña débil
   */
  test('debería mostrar error con contraseña débil', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    const email = generateUniqueEmail();
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', 'weak');
    await page.fill('input[name="confirmPassword"]', 'weak');
    await page.fill('input[name="nombre"]', 'Test');
    await page.fill('input[name="apellido"]', 'User');

    // Hacer blur en el campo de contraseña para activar validación
    await page.locator('input[name="password"]').blur();

    // Verificar que muestra mensaje de error de validación
    const errorMessage = page.locator('text=/mínimo 8 caracteres/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  /**
   * Test: Validación de contraseñas no coinciden
   */
  test('debería mostrar error si las contraseñas no coinciden', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/register');

    const email = generateUniqueEmail();
    await page.fill('input[type="email"]', email);
    await page.fill('input[name="password"]', 'Test123!');
    await page.fill('input[name="confirmPassword"]', 'Different123!');
    await page.fill('input[name="nombre"]', 'Test');
    await page.fill('input[name="apellido"]', 'User');

    // Hacer blur en confirmPassword para activar validación
    await page.locator('input[name="confirmPassword"]').blur();

    // Verificar que muestra mensaje de error
    const errorMessage = page.locator('text=/contraseñas no coinciden/i');
    await expect(errorMessage).toBeVisible({ timeout: 3000 });
  });

  /**
   * Test: Toggle de visibilidad de contraseña en login
   */
  test('debería alternar visibilidad de contraseña', async ({ page }) => {
    await page.goto('http://localhost:3000/login');

    const passwordInput = page.locator('input[name="password"]');
    await passwordInput.fill('Test123!');

    // Verificar que el input es tipo password
    await expect(passwordInput).toHaveAttribute('type', 'password');

    // Click en el botón de toggle (ojo)
    const toggleButton = page.locator('button[aria-label*="contraseña"]').first();
    await toggleButton.click();

    // Verificar que ahora es tipo text
    await expect(passwordInput).toHaveAttribute('type', 'text');

    // Click de nuevo para ocultar
    await toggleButton.click();

    // Verificar que vuelve a ser tipo password
    await expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
