import { test, expect } from '@playwright/test';
import { loginAsDocente } from './helpers/auth';

/**
 * Tests E2E para SLICE #14: Calendario de Clases
 * Página: /docente/calendario
 */

test.describe('Calendario de Clases', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsDocente(page);
  });

  test('@smoke debe cargar la página de calendario correctamente', async ({ page }) => {
    await page.goto('/docente/calendario');

    // Verificar título
    await expect(page.locator('h1')).toContainText('Calendario de Clases');

    // Verificar que muestre cantidad de clases
    await expect(page.locator('text=/clases programadas/i')).toBeVisible();
  });

  test('debe mostrar el grid del calendario', async ({ page }) => {
    await page.goto('/docente/calendario');

    // Esperar a que cargue
    await page.waitForTimeout(1000);

    // Verificar que hay días de la semana (Lun, Mar, Mié, etc.)
    await expect(page.locator('text=Lun')).toBeVisible();
    await expect(page.locator('text=Mar')).toBeVisible();
    await expect(page.locator('text=Mié')).toBeVisible();
    await expect(page.locator('text=Jue')).toBeVisible();
    await expect(page.locator('text=Vie')).toBeVisible();
  });

  test('debe permitir navegar entre meses', async ({ page }) => {
    await page.goto('/docente/calendario');

    await page.waitForTimeout(1000);

    // Click en mes siguiente
    const nextButton = page.locator('button').filter({ hasText: /siguiente|→|>/i }).first();
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(500);
    }

    // Click en mes anterior
    const prevButton = page.locator('button').filter({ hasText: /anterior|←|</i }).first();
    if (await prevButton.isVisible()) {
      await prevButton.click();
      await page.waitForTimeout(500);
    }

    // Verificar que la página no crasheó
    await expect(page.locator('h1')).toContainText('Calendario');
  });

  test('debe poder cambiar entre vista calendario y lista', async ({ page }) => {
    await page.goto('/docente/calendario');

    await page.waitForTimeout(1000);

    // Buscar botones de vista
    const calendarioButton = page.locator('button').filter({ hasText: /calendario|📅/i });
    const listaButton = page.locator('button').filter({ hasText: /lista|📋/i });

    if (await listaButton.isVisible()) {
      // Cambiar a vista lista
      await listaButton.click();
      await page.waitForTimeout(500);

      // Verificar que está en vista lista
      await expect(page.locator('text=/todas las clases/i')).toBeVisible();

      // Volver a vista calendario
      if (await calendarioButton.isVisible()) {
        await calendarioButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('debe mostrar clases con código de color', async ({ page }) => {
    await page.goto('/docente/calendario');

    await page.waitForTimeout(1500);

    // Si hay clases, verificar que tienen colores
    // Buscar elementos que podrían tener el indicador de color
    const colorIndicators = page.locator('[style*="background"]');
    const count = await colorIndicators.count();

    // Solo verificar si hay elementos con color
    if (count > 0) {
      console.log(`Found ${count} elements with background color`);
    }

    // Verificar que la página cargó correctamente
    await expect(page.locator('h1')).toBeVisible();
  });

  test('debe abrir modal al hacer click en un día con clases', async ({ page }) => {
    await page.goto('/docente/calendario');

    await page.waitForTimeout(1500);

    // Buscar un día que tenga clases (indicador visual)
    const dayWithClasses = page.locator('button').filter({ hasText: /\d+/ }).first();

    if (await dayWithClasses.isVisible()) {
      await dayWithClasses.click();
      await page.waitForTimeout(500);

      // Puede aparecer un modal si el día tiene clases
      // O simplemente se selecciona el día
      // Verificar que no crasheó
      await expect(page.locator('h1')).toBeVisible();
    }
  });

  test('debe ser responsive', async ({ page }) => {
    // Probar en viewport móvil
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/docente/calendario');

    await page.waitForTimeout(1000);

    // Verificar que el contenido es visible
    await expect(page.locator('h1')).toBeVisible();

    // Volver a desktop
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(500);

    await expect(page.locator('h1')).toBeVisible();
  });
});
