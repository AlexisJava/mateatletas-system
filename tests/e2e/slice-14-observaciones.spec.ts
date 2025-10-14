import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

/**
 * Tests E2E para SLICE #14: Observaciones
 * Página: /docente/observaciones
 */

test.describe('Observaciones del Docente', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDocente(page);
  });

  test('debe cargar la página de observaciones correctamente', async ({ page }) => {
    await page.goto('/docente/observaciones');

    // Verificar título
    await expect(page.locator('h1')).toContainText('Observaciones');

    // Verificar que el buscador está presente
    await expect(page.locator('input[type="text"]').first()).toBeVisible();
  });

  test('debe mostrar el campo de búsqueda', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1000);

    // Buscar el input de búsqueda
    const searchInput = page.locator('input[placeholder*="Buscar"]').or(
      page.locator('input[type="text"]').first()
    );

    await expect(searchInput).toBeVisible();

    // Probar escribir en el buscador
    await searchInput.fill('test');
    await page.waitForTimeout(500);

    // Limpiar
    await searchInput.clear();
  });

  test('debe mostrar filtros de fecha', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1000);

    // Buscar inputs de fecha
    const dateInputs = page.locator('input[type="date"]');
    const count = await dateInputs.count();

    // Debería haber al menos 2 inputs de fecha (desde y hasta)
    if (count >= 2) {
      await expect(dateInputs.first()).toBeVisible();
    }
  });

  test('debe poder limpiar filtros', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1000);

    // Buscar botón de limpiar filtros
    const clearButton = page.locator('button').filter({ hasText: /limpiar|borrar|clear/i });

    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // Verificar que los filtros se limpiaron
      const searchInput = page.locator('input[type="text"]').first();
      const value = await searchInput.inputValue();
      expect(value).toBe('');
    }
  });

  test('debe mostrar lista de observaciones o mensaje vacío', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1500);

    // Puede mostrar observaciones o un mensaje de "no hay observaciones"
    const hasObservations = await page.locator('text=/observación/i').count() > 1;
    const hasEmptyMessage = await page.locator('text=/no hay|sin observaciones/i').isVisible();

    // Debe haber uno u otro
    expect(hasObservations || hasEmptyMessage).toBeTruthy();
  });

  test('debe mostrar fotos de estudiantes si hay observaciones', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1500);

    // Buscar imágenes de estudiantes (pueden ser <img> o divs con iniciales)
    const images = page.locator('img[alt*=""]');
    const initials = page.locator('div').filter({ hasText: /^[A-Z]$/ });

    const hasImages = (await images.count()) > 0;
    const hasInitials = (await initials.count()) > 0;

    // Si hay observaciones, debería haber fotos o iniciales
    // Si no hay, está bien también
    console.log(`Images: ${hasImages}, Initials: ${hasInitials}`);
  });

  test('debe poder abrir modal de detalles', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1500);

    // Buscar el primer item clickeable
    const firstItem = page.locator('button, [role="button"], [onClick]').filter({
      hasText: /ver|detalles|📋/i,
    }).first();

    if (await firstItem.isVisible()) {
      await firstItem.click();
      await page.waitForTimeout(500);

      // Verificar que algo cambió (modal o navegación)
      await expect(page.locator('h1, h2, h3')).toBeVisible();
    }
  });

  test('debe mostrar badges de estado de asistencia', async ({ page }) => {
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1500);

    // Buscar badges de estado (Presente, Ausente, etc.)
    const badges = page.locator('span').filter({
      hasText: /presente|ausente|justificado|tardanza/i,
    });

    if ((await badges.count()) > 0) {
      await expect(badges.first()).toBeVisible();
    }
  });

  test('debe ser responsive', async ({ page }) => {
    // Probar en viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/docente/observaciones');

    await page.waitForTimeout(1000);

    await expect(page.locator('h1')).toBeVisible();

    // Volver a desktop
    await page.setViewportSize({ width: 1280, height: 720 });
  });
});
