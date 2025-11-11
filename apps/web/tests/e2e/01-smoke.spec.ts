import { test, expect } from '@playwright/test';

/**
 * 🔥 SMOKE TEST - Verificación básica de que la aplicación funciona
 */

test.describe('Smoke Tests - Aplicación Básica', () => {
  test('La página principal carga correctamente', async ({ page }) => {
    await page.goto('/');

    // Verificar que la página carga sin errores
    expect(page.url()).toContain('localhost:3000');

    // Verificar que el título existe
    await expect(page).toHaveTitle(/Mateatletas/i);
  });

  test('La página de colonia 2025 carga correctamente', async ({ page }) => {
    await page.goto('/colonia-verano-2025');

    // Verificar que llegamos a la página correcta
    expect(page.url()).toContain('colonia-verano-2025');

    // Verificar que el contenido principal está visible
    await expect(page.locator('text=COLONIA DE').first()).toBeVisible();
  });

  test('No hay errores críticos en la consola', async ({ page }) => {
    const errors: string[] = [];

    // Capturar errores de consola
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');

    // Filtrar errores conocidos/ignorables
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('manifest')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
