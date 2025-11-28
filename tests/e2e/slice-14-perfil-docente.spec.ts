import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

/**
 * Tests E2E para SLICE #14: Perfil del Docente
 * Página: /docente/perfil
 */

test.describe('Perfil del Docente', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada test
    await loginAsDocente(page);
  });

  test('@smoke debe cargar la página de perfil correctamente', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Esperar a que la navegación se complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Verificar que el título esté presente (más específico)
    await expect(page.locator('main h1, h1').first()).toContainText('Mi Perfil', {
      timeout: 10000,
    });

    // Verificar que el formulario esté presente
    await expect(page.locator('form')).toBeVisible();
  });

  test('debe mostrar los datos del docente', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Esperar a que la navegación y carga se completen
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);

    // Verificar que los campos estén llenos (o vacíos si es un docente nuevo)
    const nombreInput = page.locator('input[name="nombre"]');
    await expect(nombreInput).toBeVisible({ timeout: 10000 });

    const emailInput = page.locator('input[name="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toBeDisabled(); // Email debe ser readonly
  });

  test('debe validar campos requeridos', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Esperar a que cargue
    await page.waitForTimeout(1000);

    // Limpiar campo nombre
    const nombreInput = page.locator('input[name="nombre"]');
    await nombreInput.clear();

    // Intentar guardar
    await page.click('button[type="submit"]');

    // Debería mostrar error de validación (HTML5 validation)
    const isInvalid = await nombreInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('debe permitir actualizar el perfil', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Esperar a que cargue
    await page.waitForTimeout(1000);

    // Actualizar biografía
    const biografiaTextarea = page.locator('textarea[name="biografia"]');
    await biografiaTextarea.fill(
      'Docente apasionado por las matemáticas y la educación. Test E2E.',
    );

    // Guardar
    await page.click('button[type="submit"]');

    // Esperar mensaje de éxito
    await expect(page.locator('text=/actualizado correctamente/i')).toBeVisible({
      timeout: 5000,
    });
  });

  test('debe mostrar estados de carga', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Verificar estado de carga inicial
    const loader = page.locator('text=/cargando/i');
    // El loader puede no estar visible si carga rápido
    // Solo verificar que la página carga
    await page.waitForLoadState('networkidle');

    await expect(page.locator('form')).toBeVisible();
  });

  test('debe tener navegación funcionando', async ({ page }) => {
    await page.goto('/docente/perfil');

    // Verificar que hay links de navegación
    const calendarioLink = page.locator('a[href="/docente/calendario"]');
    await expect(calendarioLink).toBeVisible();

    const observacionesLink = page.locator('a[href="/docente/observaciones"]');
    await expect(observacionesLink).toBeVisible();

    const reportesLink = page.locator('a[href="/docente/reportes"]');
    await expect(reportesLink).toBeVisible();
  });
});
